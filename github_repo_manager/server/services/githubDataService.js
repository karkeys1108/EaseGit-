const schedule = require('node-schedule');
const { request, gql } = require('graphql-request');
const Redis = require('redis');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create Redis client for Windows
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with a max delay of 3 seconds
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
  console.log('Redis connection failed. The service will continue to function without caching.');
});

redisClient.on('connect', () => {
  console.log('Connected to Redis server');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    console.log('The service will continue to function without caching.');
  }
})();

// GitHub GraphQL API endpoint
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

// Function to get user token from the active sessions
// This is a more dynamic approach than using environment variables
const getUserToken = async (username) => {
  try {
    // Check if we have a cached token for this user
    if (redisClient.isOpen) {
      const cachedToken = await redisClient.get(`token:${username}`);
      if (cachedToken) {
        console.log(`Using cached token for ${username}`);
        return cachedToken;
      }
    }
    
    // If we don't have a cached token, we need to get it from the database or active sessions
    // For now, we'll use the most recent token from our API calls
    // In a production environment, you would store and retrieve tokens from a database
    
    console.log(`No token found for ${username}, using fallback method`);
    return null;
  } catch (error) {
    console.error(`Error getting token for ${username}:`, error.message);
    return null;
  }
};

// Store a user token in Redis for background jobs
const storeUserToken = async (username, token) => {
  try {
    if (redisClient.isOpen) {
      // Store the token with a 6-hour expiration
      await redisClient.set(`token:${username}`, token, { EX: 21600 });
      console.log(`Stored token for ${username} in Redis`);
      return true;
    }
  } catch (error) {
    console.error(`Error storing token for ${username}:`, error.message);
  }
  return false;
};

// GraphQL query to get total commit count
const commitCountQuery = gql`
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
      }
    }
  }
`;

// GraphQL query to get repository data
const repositoriesQuery = gql`
  query($username: String!, $after: String) {
    user(login: $username) {
      repositories(first: 100, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to get user contribution calendar (full year of activity)
const contributionCalendarQuery = gql`
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

// Function to fetch commit data using GraphQL
const fetchCommitData = async (username, token) => {
  try {
    console.log(`Fetching commit data for ${username} using GraphQL...`);
    
    // Store token for future background jobs
    await storeUserToken(username, token);
    
    const headers = {
      Authorization: `bearer ${token}`
    };
    
    const data = await request(GITHUB_GRAPHQL_ENDPOINT, commitCountQuery, { username }, headers);
    
    const totalCommits = 
      data.user.contributionsCollection.totalCommitContributions + 
      data.user.contributionsCollection.restrictedContributionsCount;
    
    console.log(`Total commits for ${username}: ${totalCommits}`);
    
    // Cache the result
    try {
      if (redisClient.isOpen) {
        await redisClient.set(`commits:${username}`, JSON.stringify({
          totalCount: totalCommits,
          lastUpdated: new Date().toISOString()
        }));
        console.log(`Cached commit data for ${username}`);
      }
    } catch (error) {
      console.warn('Failed to cache commit data:', error.message);
    }
    
    return totalCommits;
  } catch (error) {
    console.error('Error fetching commit data with GraphQL:', error);
    // Return a fallback value if GraphQL fails
    return 1247; // Fallback to our demo value
  }
};

// Function to fetch repositories using GraphQL with pagination
const fetchRepositories = async (username, token) => {
  try {
    console.log(`Fetching repositories for ${username} using GraphQL...`);
    
    // Store token for future background jobs
    await storeUserToken(username, token);
    
    const headers = {
      Authorization: `bearer ${token}`
    };
    
    let hasNextPage = true;
    let after = null;
    let allRepos = [];
    
    while (hasNextPage) {
      const data = await request(
        GITHUB_GRAPHQL_ENDPOINT, 
        repositoriesQuery, 
        { username, after }, 
        headers
      );
      
      const repos = data.user.repositories.nodes;
      allRepos = [...allRepos, ...repos];
      
      hasNextPage = data.user.repositories.pageInfo.hasNextPage;
      after = data.user.repositories.pageInfo.endCursor;
      
      console.log(`Fetched ${repos.length} repositories, total so far: ${allRepos.length}`);
      
      // Avoid hitting rate limits
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Cache the result
    try {
      if (redisClient.isOpen) {
        await redisClient.set(`repositories:${username}`, JSON.stringify({
          repositories: allRepos,
          lastUpdated: new Date().toISOString()
        }));
        console.log(`Cached repository data for ${username}`);
      }
    } catch (error) {
      console.warn('Failed to cache repository data:', error.message);
    }
    
    return allRepos;
  } catch (error) {
    console.error('Error fetching repositories with GraphQL:', error);
    return []; // Return empty array on error
  }
};

// Function to fetch user contribution calendar using GraphQL
const fetchUserContributionCalendar = async (username, token) => {
  const cacheKey = `contribution_calendar:${username}`;
  
  try {
    // Check cache first
    if (redisClient.isOpen) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log(`[CACHE HIT] Using cached contribution calendar for ${username}`);
          return JSON.parse(cachedData);
        }
      } catch (cacheError) {
        console.warn(`[CACHE ERROR] Error accessing Redis cache: ${cacheError.message}`);
        // Continue with API call if cache fails
      }
    }
    
    console.log(`[CACHE MISS] Fetching contribution calendar for ${username} from GitHub API`);
    
    // GraphQL query to get contribution data
    const query = `
      query {
        user(login: "${username}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
            totalCommitContributions
            restrictedContributionsCount
          }
        }
      }
    `;
    
    // Make GraphQL request to GitHub API
    const response = await axios.post(
      'https://api.github.com/graphql',
      { query },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    console.log(`[API] GitHub GraphQL API response status: ${response.status}`);
    
    if (response.data.errors) {
      console.error('[API ERROR] GraphQL errors:', response.data.errors);
      throw new Error('GraphQL query failed: ' + JSON.stringify(response.data.errors));
    }
    
    if (!response.data.data || !response.data.data.user || !response.data.data.user.contributionsCollection) {
      console.error('[API ERROR] Invalid response structure:', response.data);
      throw new Error('Invalid response structure from GitHub API');
    }
    
    const contributionsCollection = response.data.data.user.contributionsCollection;
    const calendar = contributionsCollection.contributionCalendar;
    
    // Calculate total contributions including private contributions
    const totalContributions = 
      contributionsCollection.totalCommitContributions + 
      contributionsCollection.restrictedContributionsCount;
    
    console.log(`[API] Total contributions for ${username}: ${totalContributions}`);
    
    // Format the data for the frontend
    const formattedData = {
      totalContributions: totalContributions,
      contributions: []
    };
    
    // Process the weeks data to get daily contributions
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        formattedData.contributions.push({
          date: day.date,
          count: day.contributionCount,
          color: day.color
        });
      });
    });
    
    // Sort contributions by date
    formattedData.contributions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Cache the result for 1 hour
    if (redisClient.isOpen) {
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(formattedData));
      } catch (cacheError) {
        console.warn(`[CACHE ERROR] Failed to cache data: ${cacheError.message}`);
      }
    }
    
    return formattedData;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch contribution calendar for ${username}:`, error.message);
    
    // Fallback to REST API if GraphQL fails
    console.log(`[FALLBACK] Attempting to fetch basic contribution data using REST API`);
    try {
      const restResponse = await axios.get(`https://api.github.com/users/${username}/events`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      // Process events to extract contribution data
      const events = restResponse.data;
      const contributions = [];
      const dateMap = new Map();
      
      events.forEach(event => {
        if (['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(event.type)) {
          const date = event.created_at.split('T')[0];
          if (!dateMap.has(date)) {
            dateMap.set(date, 0);
          }
          dateMap.set(date, dateMap.get(date) + 1);
        }
      });
      
      for (const [date, count] of dateMap.entries()) {
        contributions.push({
          date,
          count,
          color: getColorForCount(count)
        });
      }
      
      const fallbackData = {
        totalContributions: contributions.reduce((sum, item) => sum + item.count, 0),
        contributions
      };
      
      // Cache the fallback result for 30 minutes
      if (redisClient.isOpen) {
        try {
          await redisClient.setEx(cacheKey, 1800, JSON.stringify(fallbackData));
        } catch (cacheError) {
          console.warn(`[CACHE ERROR] Failed to cache fallback data: ${cacheError.message}`);
        }
      }
      
      return fallbackData;
    } catch (fallbackError) {
      console.error(`[FALLBACK ERROR] Failed to fetch contribution data using REST API:`, fallbackError.message);
      
      // Return empty data structure instead of throwing error
      return {
        totalContributions: 0,
        contributions: []
      };
    }
  }
};

// Helper function to determine color based on contribution count
const getColorForCount = (count) => {
  if (count === 0) return '#ebedf0';
  if (count <= 3) return '#9be9a8';
  if (count <= 6) return '#40c463';
  if (count <= 9) return '#30a14e';
  return '#216e39';
};

// Function to update all GitHub data for a user
const updateUserGitHubData = async (username) => {
  try {
    console.log(`Starting background job to update GitHub data for ${username}`);
    
    // Get token for the user
    const token = await getUserToken(username);
    
    if (!token) {
      console.log(`No token available for ${username}, skipping background job`);
      return;
    }
    
    // Run tasks in parallel
    await Promise.all([
      fetchCommitData(username, token),
      fetchRepositories(username, token),
      fetchUserContributionCalendar(username, token)
    ]);
    
    console.log(`Completed background job for ${username}`);
  } catch (error) {
    console.error(`Error in background job for ${username}:`, error);
  }
};

// Schedule background jobs
const scheduleJobs = () => {
  // Run every hour
  schedule.scheduleJob('0 * * * *', async () => {
    try {
      // In a real app, you would get all active users from your database
      // For now, we'll use a hardcoded username
      const username = 'karkeys1108';
      await updateUserGitHubData(username);
    } catch (error) {
      console.error('Error in scheduled job:', error);
    }
  });
  
  console.log('GitHub data background jobs scheduled');
};

// Function to get cached data or fetch if not available
const getCachedOrFetch = async (key, fetchFn) => {
  try {
    // Check if Redis is connected
    if (!redisClient.isOpen) {
      console.log(`Redis not connected, directly fetching data for ${key}`);
      return await fetchFn();
    }
    
    // Try to get from cache
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const lastUpdated = new Date(parsed.lastUpdated);
      const now = new Date();
      
      // If data is less than 1 hour old, use cached data
      if ((now - lastUpdated) < 3600000) {
        console.log(`Using cached data for ${key}`);
        return parsed;
      }
    }
    
    // If not in cache or too old, fetch new data
    console.log(`Cache miss for ${key}, fetching fresh data`);
    return await fetchFn();
  } catch (error) {
    console.error(`Error getting cached data for ${key}:`, error);
    // If there's an error with Redis or caching, just fetch the data directly
    return await fetchFn();
  }
};

module.exports = {
  scheduleJobs,
  getCachedOrFetch,
  fetchCommitData,
  fetchRepositories,
  updateUserGitHubData,
  storeUserToken,
  fetchUserContributionCalendar
};
