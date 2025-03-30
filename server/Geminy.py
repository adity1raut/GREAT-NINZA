from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.docstore.document import Document
import os
import fitz
from dotenv import load_dotenv
import logging
from langchain_community.vectorstores import FAISS
import firebase_admin
from firebase_admin import credentials, firestore
from functools import lru_cache
import asyncio
from typing import List
import concurrent.futures

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase only once at startup
cred_path = os.getenv("FIREBASE_CRED_PATH", "firebase-credentials.json")
if not os.path.exists(cred_path):
    raise FileNotFoundError(f"Firebase credentials file not found at {cred_path}")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://chatbot-9ae54.firebaseio.com/'
})

db = firestore.client()

# Cache embedding model to avoid reloading
@lru_cache(maxsize=1)
def get_embedding_model():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Cache text splitter
@lru_cache(maxsize=1)
def get_text_splitter():
    return RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

# Cache LLM to avoid recreating it for each request
@lru_cache(maxsize=1)
def get_gemini_llm():
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("Missing Gemini API Key")
    return ChatGoogleGenerativeAI(
        google_api_key=gemini_api_key,
        model="gemini-1.5-pro-latest"
    )

# Cache the vector store
vector_store = None

# Dependency to get required components
def get_components():
    return {
        "embedding_fn": get_embedding_model(),
        "text_splitter": get_text_splitter()
    }

async def extract_text_from_pdf(file_path: str) -> str:
    try:
        # Run PDF processing in a separate thread pool to avoid blocking the main event loop
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            text = await loop.run_in_executor(pool, _extract_text_from_pdf, file_path)
        return text
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")

def _extract_text_from_pdf(file_path: str) -> str:
    with fitz.open(file_path) as doc:
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()

logging.basicConfig(level=logging.INFO)  # Changed from DEBUG to INFO to reduce log verbosity
logger = logging.getLogger(__name__)

@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    components: dict = Depends(get_components)
):
    global vector_store
    
    try:
        logger.info(f"Processing file: {file.filename}")
        file_path = f"./{file.filename}"
        
        # Write the file
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # Extract text asynchronously
        text = await extract_text_from_pdf(file_path)
        if not text:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail="No extractable text found in PDF. Try OCR.")

        # Split text into chunks
        chunks = components["text_splitter"].split_text(text)
        
        # Batch write to Firestore
        doc_ref = db.collection('pdf_documents').document(file.filename)
        doc_ref.set({
            'filename': file.filename,
            'text': text,
            'chunks': chunks,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        # Clean up the file
        os.remove(file_path)
        
        # Invalidate vector store cache when new documents are added
        vector_store = None
        
        return JSONResponse(content={"message": "PDF uploaded successfully"})

    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete-all-data")
async def delete_all_data():
    global vector_store
    try:
        # Use a batch delete for better performance
        batch = db.batch()
        docs = db.collection('pdf_documents').limit(500).stream()  # Process in batches of 500
        
        for doc in docs:
            batch.delete(doc.reference)
        
        # Commit the batch
        batch.commit()
        
        # Invalidate the vector store cache
        vector_store = None
        
        return JSONResponse(content={"message": "All data deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_firestore_data(components: dict) -> List[Document]:
    try:
        # Run Firestore query in a separate thread to not block the main event loop
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            documents = await loop.run_in_executor(pool, _get_firestore_data, components)
        return documents
    except Exception as e:
        raise ValueError(f"Error retrieving documents from Firestore: {str(e)}")

def _get_firestore_data(components: dict) -> List[Document]:
    docs = db.collection('pdf_documents').stream()
    documents = []
    
    for doc in docs:
        doc_data = doc.to_dict()
        if 'chunks' in doc_data:
            for chunk in doc_data.get('chunks', []):
                documents.append(Document(page_content=chunk))
        elif 'extracted_text' in doc_data:
            full_text = doc_data['extracted_text']
            chunks = components["text_splitter"].split_text(full_text)
            for chunk in chunks:
                documents.append(Document(page_content=chunk))
    
    return documents

@app.post("/chat")
async def chat(
    query: str = Form(...),
    components: dict = Depends(get_components)
):
    global vector_store
    
    try:
        # Get or create vector store (caching it globally)
        if vector_store is None:
            documents = await get_firestore_data(components)
            if not documents:
                return JSONResponse(content={"error": "No documents found in Firestore"}, status_code=404)
            
            # Create vector store in a separate thread
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as pool:
                vector_store = await loop.run_in_executor(
                    pool, 
                    lambda: FAISS.from_documents(documents, components["embedding_fn"])
                )
        
        # Get retriever
        retriever = vector_store.as_retriever()
        
        # Create QA chain
        chain = RetrievalQA.from_chain_type(
            llm=get_gemini_llm(),
            chain_type="stuff",
            retriever=retriever
        )

        # Run query in a separate thread
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            result = await loop.run_in_executor(
                pool,
                lambda: chain({"query": query})
            )
        
        return JSONResponse(content={"response": result["result"]})

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)