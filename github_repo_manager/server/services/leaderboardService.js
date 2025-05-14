const UserStats = require('../models/UserStats');
const axios = require('axios');
const schedule = require('node-schedule');

// GitHub GraphQL API endpoint
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

// GraphQL query as a plain string
const userStatsQuery = `
  query getUserStats($username: String!) {
    user(login: $username) {
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          name
          stargazerCount
          forkCount
          watchers {
            totalCount
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

// Initialize variables
let initialized = false;

// Function to make a GraphQL request using axios instead of graphql-request
async function makeGraphQLRequest(endpoint, query, variables, headers) {
  try {
    const response = await axios.post(
      endpoint,
      {
        query,
        variables
      },
      { headers }
    );
    
    if (response.data.errors) {
      throw new Error(response.data.errors.map(e => e.message).join(', '));
    }
    
    return response.data.data;
  } catch (error) {
    console.error('GraphQL request failed:', error.message);
    throw error;
  }
}

const updateUserStats = async (userData, token) => {
  console.log(`Attempting to update stats for user: ${userData.login}`);
  
  if (!initialized) {
    console.log('Leaderboard service not initialized yet, initializing now...');
    const success = await init();
    if (!success) {
      console.error('Failed to initialize leaderboard service during updateUserStats');
      return null;
    }
    console.log('Leaderboard service initialized successfully during updateUserStats');
  }

  try {
    const { id, login, name, avatar_url } = userData;
    
    console.log(`Processing user: ${login} (${id})`);
    
    // Check if user already exists in database
    let userStats = await UserStats.findOne({ githubId: id });
    console.log(`User exists in database: ${!!userStats}`);
    
    // If user doesn't exist, create new record
    if (!userStats) {
      console.log(`Creating new user stats record for ${login}`);
      userStats = new UserStats({
        githubId: id,
        username: login,
        name: name || login,
        avatarUrl: avatar_url
      });
    }
    
    // Fetch user stats from GitHub API
    const headers = {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log(`Fetching GitHub stats for ${login}...`);
    
    // Use axios to make the GraphQL request
    const data = await makeGraphQLRequest(
      GITHUB_GRAPHQL_ENDPOINT,
      userStatsQuery,
      { username: login },
      headers
    );
    
    if (!data.user) {
      console.error(`No user data found for ${login}`);
      return null;
    }
    
    console.log(`Successfully fetched GitHub stats for ${login}`);
    
    // Calculate total stars, forks, and watchers
    const repos = data.user.repositories.nodes;
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forkCount, 0);
    const totalWatchers = repos.reduce((sum, repo) => sum + (repo.watchers?.totalCount || 0), 0);
    
    // Get contribution data
    const contributions = data.user.contributionsCollection;
    const totalCommits = contributions.totalCommitContributions + contributions.restrictedContributionsCount;
    const totalContributions = contributions.contributionCalendar.totalContributions;
    
    console.log(`Stats calculated for ${login}: ${totalStars} stars, ${totalCommits} commits, ${totalContributions} contributions`);
    
    // Calculate streaks
    const contributionDays = [];
    contributions.contributionCalendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        contributionDays.push({
          date: day.date,
          count: day.contributionCount
        });
      });
    });
    
    // Sort by date (newest first)
    contributionDays.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if there's a contribution today or yesterday (to account for timezone differences)
    let hasRecentContribution = false;
    for (const day of contributionDays) {
      if (day.date === today || day.date === yesterdayStr) {
        if (day.count > 0) {
          hasRecentContribution = true;
          break;
        }
      }
    }
    
    if (hasRecentContribution) {
      // Count consecutive days with contributions
      for (let i = 0; i < contributionDays.length; i++) {
        if (contributionDays[i].count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let currentLongestStreak = 0;
    
    // Sort by date (oldest first) for longest streak calculation
    contributionDays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (const day of contributionDays) {
      if (day.count > 0) {
        currentLongestStreak++;
        if (currentLongestStreak > longestStreak) {
          longestStreak = currentLongestStreak;
        }
      } else {
        currentLongestStreak = 0;
      }
    }
    
    // Update user stats
    userStats.totalRepos = data.user.repositories.totalCount;
    
    // Create the stats object
    const statsObject = {
      totalStars,
      totalForks,
      totalWatchers,
      totalCommits,
      totalContributions,
      currentStreak,
      longestStreak,
      lastUpdated: new Date()
    };
    
    console.log('Stats object to save:', JSON.stringify(statsObject, null, 2));
    
    // Assign the stats object to the userStats document
    userStats.stats = statsObject;
    
    console.log(`Saving stats to database for ${login}...`);
    await userStats.save();
    
    // Verify the saved data
    const savedUser = await UserStats.findOne({ githubId: id });
    console.log(`Verification - Saved user stats:`, JSON.stringify(savedUser, null, 2));
    
    console.log(`Successfully saved stats for ${login}`);
    
    return userStats;
  } catch (error) {
    console.error(`Error updating stats for user: ${error.message}`);
    console.error(error.stack);
    return null;
  }
};

const getLeaderboard = async (category = 'stars', limit = 10) => {
  console.log(`Getting leaderboard for category: ${category}, limit: ${limit}`);
  
  try {
    let sortField;
    
    switch (category) {
      case 'commits':
        sortField = 'stats.totalCommits';
        break;
      case 'contributions':
        sortField = 'stats.totalContributions';
        break;
      case 'streak':
        sortField = 'stats.currentStreak';
        break;
      case 'stars':
      default:
        sortField = 'stats.totalStars';
        break;
    }
    
    console.log(`Querying database for leaderboard with sort field: ${sortField}`);
    
    // Debug: Log all users in the database
    const allUsers = await UserStats.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('Sample user:', JSON.stringify(allUsers[0], null, 2));
    }
    
    // Modified query to find all users with stats
    const users = await UserStats.find({})
      .sort({ [sortField]: -1 })
      .limit(limit);
    
    console.log(`Found ${users.length} users for leaderboard`);
    
    return {
      users,
      category,
      lastUpdated: users.length > 0 && users[0].stats && users[0].stats.lastUpdated 
        ? users[0].stats.lastUpdated 
        : new Date()
    };
  } catch (error) {
    console.error(`Error getting leaderboard: ${error.message}`);
    console.error(error.stack);
    return { users: [], category, lastUpdated: new Date() };
  }
};

const getUserPosition = async (username, category = 'stars') => {
  console.log(`Getting user position for ${username} in category: ${category}`);
  
  try {
    let sortField;
    
    switch (category) {
      case 'commits':
        sortField = 'stats.totalCommits';
        break;
      case 'contributions':
        sortField = 'stats.totalContributions';
        break;
      case 'streak':
        sortField = 'stats.currentStreak';
        break;
      case 'stars':
      default:
        sortField = 'stats.totalStars';
        break;
    }
    
    // Get user's stats
    const user = await UserStats.findOne({ username });
    
    if (!user || !user.stats) {
      console.log(`User ${username} not found in database or has no stats`);
      return { position: 0, total: 0, value: 0 };
    }
    
    // Get user's value for the category
    let userValue;
    switch (category) {
      case 'commits':
        userValue = user.stats.totalCommits;
        break;
      case 'contributions':
        userValue = user.stats.totalContributions;
        break;
      case 'streak':
        userValue = user.stats.currentStreak;
        break;
      case 'stars':
      default:
        userValue = user.stats.totalStars;
        break;
    }
    
    // Count users with higher values
    const higherCount = await UserStats.countDocuments({
      [sortField]: { $gt: userValue }
    });
    
    // Count total users
    const totalUsers = await UserStats.countDocuments();
    
    console.log(`User ${username} position: ${higherCount + 1}, total users: ${totalUsers}`);
    
    // Return the value as well for the frontend to display
    return {
      position: higherCount + 1,
      total: totalUsers,
      value: userValue
    };
  } catch (error) {
    console.error(`Error getting user position: ${error.message}`);
    console.error(error.stack);
    return { position: 0, total: 0, value: 0 };
  }
};

// Update all user stats - used for scheduled updates
const updateAllUserStats = async () => {
  console.log('Starting update for all user stats');
  
  try {
    // Get all users
    const users = await UserStats.find().select('username');
    
    console.log(`Found ${users.length} users to update`);
    
    // In a real implementation, you would need a way to get tokens for each user
    // or use a GitHub App with its own authentication
    console.log('Skipping updates - no tokens available for background jobs');
    
    return true;
  } catch (error) {
    console.error(`Error updating all user stats: ${error.message}`);
    console.error(error.stack);
    return false;
  }
};

// Initialize the service
const init = async () => {
  if (initialized) {
    console.log('Leaderboard service already initialized');
    return true;
  }
  
  console.log('Initializing leaderboard service...');
  
  try {
    // Schedule daily updates
    console.log('Setting up scheduled leaderboard updates');
    schedule.scheduleJob('0 0 * * *', async () => {
      console.log('Running scheduled leaderboard update...');
      await updateAllUserStats();
    });
    
    initialized = true;
    console.log('Leaderboard service initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing leaderboard service:', error);
    console.error(error.stack);
    return false;
  }
};

// Initialize the service immediately when this module is loaded
(async function immediateInit() {
  console.log('Attempting immediate initialization of leaderboard service...');
  try {
    const success = await init();
    if (success) {
      console.log('✅ Immediate initialization successful');
    } else {
      console.error('❌ Immediate initialization failed');
    }
  } catch (error) {
    console.error('❌ Error during immediate initialization:', error);
  }
})();

module.exports = {
  updateUserStats,
  getLeaderboard,
  getUserPosition,
  init
};
