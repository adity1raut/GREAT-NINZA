import express from 'express';
import SearchHistory from '../../models/SearchHistory.model.js';

const router = express.Router();

// POST route for chat query (unchanged from your example)
router.post('/api/chat', async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    // Validate query
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Valid query string is required'
      });
    }
    
    // Make sure userId exists
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Save to search history
    const searchHistory = new SearchHistory({
      userId: userId,
      query: query.trim().substring(0, 500), // Limit query length to 500 chars
      timestamp: new Date()
    });
    
    await searchHistory.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Query saved successfully'
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete all search history for a user
router.delete('/api/search-history', async (req, res) => {
  try {
    // Get userId from auth middleware or query params
    const userId = req.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Use Mongoose for consistency instead of direct SQL queries
    const result = await SearchHistory.deleteMany({ userId: userId });

    // Log the operation
    console.log(`Deleted ${result.deletedCount} search history entries for user ${userId}`);

    return res.status(200).json({ 
      success: true, 
      message: 'Search history deleted successfully',
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting search history:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete search history',
      error: error.message 
    });
  }
});

// Delete a specific search history item
router.delete('/api/search-history/:id', async (req, res) => {
  try {
    // Get userId from auth middleware or query params
    const userId = req.userId || req.query.userId;
    const itemId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Search history item ID is required'
      });
    }

    // Use Mongoose for consistency instead of direct SQL queries
    const result = await SearchHistory.findOneAndDelete({ 
      _id: itemId, 
      userId: userId 
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Search history item not found or does not belong to this user'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Search history item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting search history item:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete search history item',
      error: error.message 
    });
  }
});

export default router;