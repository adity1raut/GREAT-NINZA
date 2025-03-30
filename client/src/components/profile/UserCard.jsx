import React from "react";
import { Mail, Calendar } from "lucide-react";

const UserCard = ({ user }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-gray-800/50 mb-8 transform hover:scale-[1.01] transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
        <div className="relative mb-4 md:mb-0">
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-r from-blue-600 to-purple-600">
            <img
              src={user.photo}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border-2 border-gray-900"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-bold text-white mb-2">{user.name}</h2>
          <div className="flex flex-col md:flex-row md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex items-center justify-center md:justify-start text-gray-300">
              <Mail className="mr-2 text-blue-400" size={16} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start text-gray-300">
              <Calendar className="mr-2 text-blue-400" size={16} />
              <span>Member since {user.memberSince}</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
export default UserCard;