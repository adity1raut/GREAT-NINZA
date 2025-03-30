import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for faster queries by userId
  },
  query: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500 // Limit query length
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting by timestamp
  },
  // Optional fields that might be useful
  resultCount: {
    type: Number,
    default: 0
  },
  successfulQuery: {
    type: Boolean,
    default: true
  },
  responseTime: {
    type: Number // Could store response time in ms
  },
  // You could add tags or categories if needed
  tags: [{
    type: String,
    trim: true
  }]
});

// Add a compound index for faster lookups
searchHistorySchema.index({ userId: 1, timestamp: -1 });

// Add a method to get recent history
searchHistorySchema.statics.getRecentByUser = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

// Add a method to get popular queries
searchHistorySchema.statics.getPopularQueries = function(limit = 10) {
  return this.aggregate([
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;