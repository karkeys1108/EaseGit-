const mongoose = require('mongoose');

// Schema for user GitHub statistics
const userStatsSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: String,
  avatarUrl: String,
  stats: {
    totalRepos: {
      type: Number,
      default: 0
    },
    totalStars: {
      type: Number,
      default: 0
    },
    totalForks: {
      type: Number,
      default: 0
    },
    totalWatchers: {
      type: Number,
      default: 0
    },
    totalCommits: {
      type: Number,
      default: 0
    },
    totalContributions: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for efficient leaderboard queries
userStatsSchema.index({ 'stats.totalStars': -1 });
userStatsSchema.index({ 'stats.totalCommits': -1 });
userStatsSchema.index({ 'stats.totalContributions': -1 });

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
