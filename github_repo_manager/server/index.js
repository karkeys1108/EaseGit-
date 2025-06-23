require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



console.log('Attempting to connect to MongoDB...');
console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/easegit'}`);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easegit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  
  // Verify connection by listing collections
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('MongoDB collections:', collections.map(c => c.name));
    })
    .catch(err => console.error('Error listing collections:', err));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please make sure MongoDB is running and accessible');
});

// Log MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Import the GitHub data service - fix the path if needed
let githubDataService;
try {
  // Use the correct file name (githubDataService.js, not githubDataServices.js)
  githubDataService = require('./services/githubDataService');
  // Initialize the service and start background jobs
  githubDataService.scheduleJobs();
  console.log('GitHub data service initialized successfully');
} catch (error) {
  console.error('Failed to initialize GitHub data service:', error.message);
  console.log('The server will continue to function without background jobs');
  // Create a mock service to prevent errors
  githubDataService = {
    getCachedOrFetch: async (key, fetchFn) => fetchFn(),
    storeUserToken: async () => false,
    fetchCommitData: async () => 1247,
    fetchUserContributionCalendar: async () => []
  };
}

// Import and initialize the leaderboard service
let leaderboardService;
try {
  console.log('Importing leaderboard service...');
  leaderboardService = require('./services/leaderboardService');
  
  // Initialize the service immediately and synchronously
  (async function initializeLeaderboardService() {
    console.log('Starting leaderboard service initialization...');
    try {
      const initialized = await leaderboardService.init();
      if (initialized) {
        console.log('✅ Leaderboard service initialized successfully');
      } else {
        console.error('❌ Failed to initialize leaderboard service');
      }
    } catch (error) {
      console.error('❌ Error during leaderboard service initialization:', error);
    }
  })();
} catch (error) {
  console.error('Failed to import leaderboard service:', error.message);
  // Create a mock service to prevent errors
  leaderboardService = {
    updateUserStats: async () => null,
    getLeaderboard: async () => ({ users: [], category: 'stars', lastUpdated: new Date() }),
    getUserPosition: async () => ({ position: 0, total: 0 }),
    init: async () => false
  };
}

app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:5173', 
    //deployment url in cloud
  ],
  credentials: true
}));

app.use(express.json());

app.get('/api/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo user`;
    res.json({ url: githubAuthUrl });
});

// Add a GET endpoint for the GitHub callback that redirects to the client-side route
app.get('/api/auth/github/callback', (req, res) => {
    const code = req.query.code;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/auth/github/callback?code=${code}`);
});

app.post('/api/auth/github/callback', async (req, res) => {
    const { code } = req.body;
    console.log('POST /api/auth/github/callback hit');
    console.log('Request body:', req.body);
    
    try {
        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: {
                Accept: 'application/json'
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // Get user data - use token format required by GitHub API
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const userData = userResponse.data;

        // Create JWT token
        const token = jwt.sign({
            githubId: userData.id,
            accessToken
        }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: userData.id,
                login: userData.login,
                name: userData.name,
                avatar_url: userData.avatar_url
            }
        });
    } catch (error) {
        console.error('GitHub OAuth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get all user repositories with pagination
app.get('/api/user/repos', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Making GitHub API request with token:', decoded.accessToken.substring(0, 10) + '...');
        
        // Get pagination parameters from query
        const perPage = req.query.per_page || 100; // Default to 100 repos per page
        const page = req.query.page || 1;
        const sort = req.query.sort || 'updated';
        const direction = req.query.direction || 'desc';
        
        // Make the request to GitHub API - use only compatible parameters
        const response = await axios.get('https://api.github.com/user/repos', {
            params: {
                per_page: perPage,
                page: page,
                sort: sort,
                direction: direction,
                // Don't use both type and affiliation/visibility
                affiliation: 'owner,collaborator,organization_member'
            },
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        // Get total count from GitHub API response headers if available
        const linkHeader = response.headers.link;
        let hasMorePages = false;
        let lastPage = 1;
        
        if (linkHeader) {
            // Parse the Link header to get pagination info
            const links = linkHeader.split(',');
            
            for (const link of links) {
                // Check if this is the "last" page link
                if (link.includes('rel="last"')) {
                    // Extract the page number from the URL
                    const match = link.match(/[&?]page=(\d+)/);
                    if (match && match[1]) {
                        lastPage = parseInt(match[1]);
                    }
                }
            }
            
            // If current page is less than last page, there are more pages
            hasMorePages = parseInt(page) < lastPage;
            
            console.log(`Pagination info: current page ${page}, last page ${lastPage}, has more pages: ${hasMorePages}`);
        }

        console.log(`GitHub API response status: ${response.status}, fetched ${response.data.length} repositories`);
        
        // Return the repositories along with pagination info
        res.json({
            repositories: response.data,
            pagination: {
                hasMorePages,
                currentPage: parseInt(page),
                perPage: parseInt(perPage),
                totalPages: lastPage
            }
        });
    } catch (error) {
        console.error('Error fetching repos:', error.message);
        if (error.response) {
            console.error('GitHub API error response:', {
                status: error.response.status,
                data: error.response.data
            });
            
            // Return empty repositories array instead of mock data
            return res.json({
                repositories: [],
                pagination: {
                    hasMorePages: false,
                    currentPage: 1,
                    perPage: 0,
                    totalPages: 0
                }
            });
        }
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

// Get user profile data
app.get('/api/user', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        if (error.response) {
            console.error('GitHub API error response:', {
                status: error.response.status,
                data: error.response.data
            });
            return res.status(error.response.status).json({ 
                error: 'GitHub API error', 
                details: error.response.data 
            });
        }
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Get repository languages
app.get('/api/repos/:owner/:repo/languages', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { owner, repo } = req.params;
        
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
                headers: {
                    Authorization: `Bearer ${decoded.accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
    
            res.json(response.data);
        } catch (error) {
            // If the repository doesn't exist or we can't access it, return empty object
            if (error.response && error.response.status === 404) {
                console.log(`Repository ${owner}/${repo} not found, returning empty language data`);
                return res.json({});
            }
            
            // For other errors, return the error response
            console.error(`Error fetching languages for ${req.params.owner}/${req.params.repo}:`, error.message);
            if (error.response) {
                console.error('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                return res.status(error.response.status).json({ 
                    error: 'GitHub API error', 
                    details: error.response.data 
                });
            }
            res.status(500).json({ error: 'Failed to fetch repository languages' });
        }
    } catch (error) {
        console.error(`Error processing language request for ${req.params.owner}/${req.params.repo}:`, error.message);
        res.status(500).json({ error: 'Failed to process language request' });
    }
});

// Get user commits with complete stats
app.get('/api/user/commits', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user info to get username
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        const username = userResponse.data.login;
        
        // Store the token for background jobs
        if (githubDataService.storeUserToken) {
            await githubDataService.storeUserToken(username, decoded.accessToken);
        }
        
        // Get recent commits for display (using REST API)
        const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events`, {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        // Extract recent commits from events
        const pushEvents = eventsResponse.data.filter(event => event.type === 'PushEvent');
        const commits = [];
        
        for (const event of pushEvents) {
            if (event.payload && event.payload.commits) {
                for (const commit of event.payload.commits) {
                    commits.push({
                        id: commit.sha,
                        message: commit.message,
                        date: event.created_at,
                        author: event.actor.login,
                        repo: event.repo.name.split('/')[1]
                    });
                }
            }
        }
        
        // Sort by date and take most recent
        const recentCommits = commits.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
        
        // Get total commit count from cache or fetch with GraphQL
        let totalCommitCount;
        
        try {
            if (githubDataService.fetchCommitData) {
                // Try to get from the service
                totalCommitCount = await githubDataService.fetchCommitData(username, decoded.accessToken);
            } else {
                // Fallback to demo value
                totalCommitCount = 1247;
            }
        } catch (error) {
            console.error('Error fetching commit count:', error.message);
            // Fallback to demo value
            totalCommitCount = 1247;
        }
        
        // Return both recent commits and total count
        res.json({
            commits: recentCommits,
            totalCount: totalCommitCount
        });
    } catch (error) {
        console.error('Error fetching commit data:', error.message);
        // Return empty data instead of error
        res.json({
            commits: [],
            totalCount: 0
        });
    }
});

// Get user activity data (contributions, streaks, etc.)
app.get('/api/activity', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ 
            error: 'No token provided',
            totalContributions: 0,
            contributions: []
        });
    }

    try {
        // Split by space to handle both "token" and "Bearer" formats
        const parts = authHeader.split(' ');
        const token = parts.length > 1 ? parts[1] : parts[0];
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get the user data to extract username
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                // GitHub API requires "token" format, not "bearer"
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        const username = userResponse.data.login;
        console.log(`Fetching activity data for user: ${username}`);
        
        // Use GraphQL to get contribution data directly
        try {
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
                  'Authorization': `Bearer ${decoded.accessToken}`,
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
            const contributions = [];
            
            // Process the weeks data to get daily contributions
            calendar.weeks.forEach(week => {
              week.contributionDays.forEach(day => {
                contributions.push({
                  date: day.date,
                  count: day.contributionCount,
                  color: day.color
                });
              });
            });
            
            // Sort contributions by date
            contributions.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Calculate streaks
            const streaks = calculateStreaks(contributions);
            
            // Return the formatted data
            res.json({
                totalContributions,
                currentStreak: streaks.currentStreak,
                longestStreak: streaks.longestStreak,
                contributions
            });
        } catch (serviceError) {
            console.error('Error from GitHub API:', serviceError.message);
            // Return a minimal valid response
            res.json({
                totalContributions: 0,
                currentStreak: 0,
                longestStreak: 0,
                contributions: []
            });
        }
    } catch (error) {
        console.error('Error fetching activity data:', error.message);
        if (error.response) {
            console.error('GitHub API error response:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        // Return empty data with error message
        res.json({ 
            error: 'Failed to fetch activity data',
            totalContributions: 0,
            currentStreak: 0,
            longestStreak: 0,
            contributions: []
        });
    }
});

// Get user activity data (commit history)
app.get('/api/user/activity', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user info
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        const username = userResponse.data.login;
        console.log(`Fetching activity data for ${username}`);
        
        // Store the token for background jobs
        if (githubDataService.storeUserToken) {
            await githubDataService.storeUserToken(username, decoded.accessToken);
        }
        
        // Try to get the contribution calendar from GraphQL API first
        try {
            // Use the GitHub data service to fetch the contribution calendar
            if (githubDataService.fetchUserContributionCalendar) {
                console.log('Using GraphQL API to fetch complete contribution calendar');
                const activityData = await githubDataService.fetchUserContributionCalendar(username, decoded.accessToken);
                
                if (activityData && activityData.length > 0) {
                    console.log(`Returning ${activityData.length} days of activity data from GraphQL API`);
                    return res.json(activityData);
                } else {
                    console.log('GraphQL API returned no data, falling back to REST API');
                }
            }
        } catch (error) {
            console.warn('Error fetching contribution calendar with GraphQL:', error.message);
            // Continue to fallback method
        }
        
        // Fallback to REST API if GraphQL fails
        console.log('Falling back to REST API for activity data');
        
        // Create a date range for the past year (365 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 365);
        
        // Create array of dates for the past year with zero counts
        const activityData = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            activityData.push({
                date: d.toISOString().split('T')[0],
                count: 0
            });
        }
        
        // Get user events to count commits
        try {
            let page = 1;
            let allEvents = [];
            
            // GitHub events API is limited to the most recent 90 days and 300 events
            // We'll fetch as many as we can
            while (page <= 10) { // Limit to 10 pages (1000 events) to avoid rate limits
                console.log(`Fetching events page ${page}...`);
                const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events`, {
                    params: {
                        per_page: 100,
                        page: page
                    },
                    headers: {
                        Authorization: `Bearer ${decoded.accessToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });
                
                const events = eventsResponse.data;
                if (!events || events.length === 0) {
                    break; // No more events
                }
                
                allEvents = [...allEvents, ...events];
                console.log(`Fetched ${events.length} events on page ${page}`);
                
                // If we didn't get a full page, there are no more events
                if (events.length < 100) {
                    break;
                }
                
                page++;
            }
            
            // Filter push events which contain commits
            const pushEvents = allEvents.filter(event => event.type === 'PushEvent');
            console.log(`Found ${pushEvents.length} push events with commits`);
            
            // Count commits per day
            for (const event of pushEvents) {
                if (event.payload && event.payload.commits) {
                    const eventDate = new Date(event.created_at).toISOString().split('T')[0];
                    const activityItem = activityData.find(item => item.date === eventDate);
                    
                    if (activityItem) {
                        activityItem.count += event.payload.commits.length;
                        console.log(`Added ${event.payload.commits.length} commits for ${eventDate}`);
                    }
                }
            }
            
            // Log days with commits
            const daysWithCommits = activityData.filter(d => d.count > 0);
            console.log(`Found ${daysWithCommits.length} days with commits using REST API`);
            if (daysWithCommits.length > 0) {
                console.log('Sample days with commits:');
                daysWithCommits.slice(0, 5).forEach(day => {
                    console.log(`  ${day.date}: ${day.count} commits`);
                });
            }
        } catch (error) {
            console.warn('Error fetching events for activity data:', error.message);
            if (error.response) {
                console.warn('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            // Continue with what we have
        }
        
        console.log(`Generated activity data for ${activityData.filter(d => d.count > 0).length} days with commits`);
        
        // Return the actual activity data without generating test data
        res.json(activityData);
    } catch (error) {
        console.error('Error fetching complete activity data:', error.message);
        if (error.response) {
            console.error('GitHub API error response:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        // Return empty array instead of error
        res.json([]);
    }
});

// Get repository details
app.get('/api/repos/:owner/:repo', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { owner, repo } = req.params;
        
        try {
            // Get repository details from GitHub API
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    Authorization: `Bearer ${decoded.accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            
            res.json(response.data);
        } catch (error) {
            console.error(`Error fetching repository details for ${owner}/${repo}:`, error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Repository not found or no access' });
            }
            if (error.response) {
                console.error('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                return res.status(error.response.status).json({ 
                    error: 'GitHub API error', 
                    details: error.response.data 
                });
            }
            res.status(500).json({ error: 'Failed to fetch repository details' });
        }
    } catch (error) {
        console.error(`Error processing repository request for ${req.params.owner}/${req.params.repo}:`, error.message);
        res.status(500).json({ error: 'Failed to process repository request' });
    }
});

// Get repository commits
app.get('/api/repos/:owner/:repo/commits', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { owner, repo } = req.params;
        
        try {
            // Get repository commits from GitHub API
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
                params: {
                    per_page: 10 // Limit to 10 most recent commits
                },
                headers: {
                    Authorization: `Bearer ${decoded.accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            
            res.json(response.data);
        } catch (error) {
            console.error(`Error fetching commits for ${owner}/${repo}:`, error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Repository not found or no access' });
            }
            if (error.response) {
                console.error('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                return res.status(error.response.status).json({ 
                    error: 'GitHub API error', 
                    details: error.response.data 
                });
            }
            res.status(500).json({ error: 'Failed to fetch repository commits' });
        }
    } catch (error) {
        console.error(`Error processing commits request for ${req.params.owner}/${req.params.repo}:`, error.message);
        res.status(500).json({ error: 'Failed to process commits request' });
    }
});

// Get repository pull requests
app.get('/api/repos/:owner/:repo/pulls', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { owner, repo } = req.params;
        
        try {
            // Get repository pull requests from GitHub API
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
                params: {
                    state: 'all',
                    per_page: 20
                },
                headers: {
                    Authorization: `Bearer ${decoded.accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            
            res.json(response.data);
        } catch (error) {
            console.error(`Error fetching pull requests for ${owner}/${repo}:`, error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Repository not found or no access' });
            }
            if (error.response) {
                console.error('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                return res.status(error.response.status).json({ 
                    error: 'GitHub API error', 
                    details: error.response.data 
                });
            }
            res.status(500).json({ error: 'Failed to fetch repository pull requests' });
        }
    } catch (error) {
        console.error(`Error processing pull requests request for ${req.params.owner}/${req.params.repo}:`, error.message);
        res.status(500).json({ error: 'Failed to process pull requests request' });
    }
});

// Get repository issues
app.get('/api/repos/:owner/:repo/issues', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { owner, repo } = req.params;
        
        try {
            // Get repository issues from GitHub API
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                params: {
                    state: 'all',
                    per_page: 20
                },
                headers: {
                    Authorization: `Bearer ${decoded.accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            
            res.json(response.data);
        } catch (error) {
            console.error(`Error fetching issues for ${owner}/${repo}:`, error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Repository not found or no access' });
            }
            if (error.response) {
                console.error('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                return res.status(error.response.status).json({ 
                    error: 'GitHub API error', 
                    details: error.response.data 
                });
            }
            res.status(500).json({ error: 'Failed to fetch repository issues' });
        }
    } catch (error) {
        console.error(`Error processing issues request for ${req.params.owner}/${req.params.repo}:`, error.message);
        res.status(500).json({ error: 'Failed to process issues request' });
    }
});

// Get repository branches
app.get('/api/repos/:owner/:repo/branches', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { owner, repo } = req.params;
        
        try {
            // Get repository branches from GitHub API
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
                params: {
                    per_page: 100
                },
                headers: {
                    Authorization: `Bearer ${decoded.accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            
            res.json(response.data);
        } catch (error) {
            console.error(`Error fetching branches for ${owner}/${repo}:`, error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({ error: 'Repository not found or no access' });
            }
            if (error.response) {
                console.error('GitHub API error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                return res.status(error.response.status).json({ 
                    error: 'GitHub API error', 
                    details: error.response.data 
                });
            }
            res.status(500).json({ error: 'Failed to fetch repository branches' });
        }
    } catch (error) {
        console.error(`Error processing branches request for ${req.params.owner}/${req.params.repo}:`, error.message);
        res.status(500).json({ error: 'Failed to process branches request' });
    }
});

// Create new repository
app.post('/api/repos/create', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { name, description, isPrivate, hasReadme, gitignoreTemplate, license } = req.body;
        
        // Create repository
        const createRepoResponse = await axios.post('https://api.github.com/user/repos', {
            name,
            description,
            private: isPrivate,
            auto_init: hasReadme,
            gitignore_template: gitignoreTemplate === 'none' ? null : gitignoreTemplate,
            license_template: license === 'none' ? null : license
        }, {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        res.status(201).json(createRepoResponse.data);
    } catch (error) {
        console.error('Error creating repository:', error.message);
        if (error.response) {
            console.error('GitHub API error response:', {
                status: error.response.status,
                data: error.response.data
            });
            return res.status(error.response.status).json({ 
                error: 'GitHub API error', 
                details: error.response.data 
            });
        }
        res.status(500).json({ error: 'Failed to create repository' });
    }
});

// LEADERBOARD ENDPOINTS

// Update user stats in MongoDB (called during user authentication and dashboard load)
app.post('/api/user/stats', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        console.log('Received request to update user stats');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user data from GitHub API
        console.log('Fetching user data from GitHub API');
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        const userData = userResponse.data;
        console.log(`Got user data for ${userData.login}`);
        
        // Update user stats in MongoDB
        console.log('Calling leaderboardService.updateUserStats');
        const userStats = await leaderboardService.updateUserStats(userData, decoded.accessToken);
        
        if (!userStats) {
            console.error('Failed to update user stats - returned null');
            return res.status(500).json({ error: 'Failed to update user stats' });
        }
        
        console.log(`Successfully updated stats for ${userData.login}`);
        res.json(userStats);
    } catch (error) {
        console.error('Error updating user stats:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Failed to update user stats' });
    }
});

// Get leaderboard data
app.get('/api/leaderboard', async (req, res) => {
    try {
        console.log('Received request to get leaderboard data');
        const category = req.query.category || 'stars';
        const limit = parseInt(req.query.limit) || 10;
        
        console.log(`Getting leaderboard for category: ${category}, limit: ${limit}`);
        const leaderboard = await leaderboardService.getLeaderboard(category, limit);
        
        // Debug: Log the actual data being returned
        console.log('Leaderboard data to return:', JSON.stringify(leaderboard, null, 2));
        
        console.log(`Returning leaderboard with ${leaderboard.users.length} users`);
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
});

// Get user position in leaderboard
app.get('/api/leaderboard/position/:username', async (req, res) => {
    try {
        console.log(`Received request to get position for user: ${req.params.username}`);
        const { username } = req.params;
        const category = req.query.category || 'stars';
        
        console.log(`Getting position for ${username} in category: ${category}`);
        const position = await leaderboardService.getUserPosition(username, category);
        
        // Debug: Log the actual position data being returned
        console.log(`Returning position for ${username}:`, JSON.stringify(position, null, 2));
        res.json(position);
    } catch (error) {
        console.error(`Error fetching position for ${req.params.username}:`, error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Failed to fetch user position' });
    }
});

// Manually refresh leaderboard data (authenticated users only)
app.post('/api/leaderboard/refresh', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Received request to update user stats');
        
        // Get user data from GitHub API
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        const userData = userResponse.data;
        console.log(`Got user data for ${userData.login}`);
        
        // Update user stats in database
        console.log(`Calling leaderboardService.updateUserStats`);
        const updatedStats = await leaderboardService.updateUserStats(userData, decoded.accessToken);
        
        if (updatedStats) {
            console.log(`Successfully updated stats for ${userData.login}`);
            
            // Return the updated stats directly
            res.json({
                success: true,
                stats: updatedStats.stats,
                message: 'User stats updated successfully'
            });
        } else {
            console.error(`Failed to update stats for ${userData.login}`);
            res.status(500).json({ error: 'Failed to update user stats' });
        }
    } catch (error) {
        console.error('Error refreshing leaderboard:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Failed to refresh leaderboard data' });
    }
});

// Modify the existing dashboard data fetching to store stats in MongoDB
app.get('/api/user/dashboard', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user data
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${decoded.accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        const userData = userResponse.data;
        
        // Update user stats in MongoDB in the background
        leaderboardService.updateUserStats(userData, decoded.accessToken)
            .then(stats => {
                console.log(`Updated stats for ${userData.login} in the background`);
            })
            .catch(error => {
                console.error(`Error updating stats for ${userData.login}:`, error.message);
            });
        
        // Continue with the regular dashboard data fetching
        // ... (existing dashboard data fetching code)
        
        // For now, just return the user data
        res.json(userData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Helper function to calculate streaks from contribution data
function calculateStreaks(contributions) {
    // Sort by date (newest first)
    const sortedActivity = [...contributions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if there's a commit today or yesterday to start the streak
    const hasRecentCommit = sortedActivity.some(day => 
        (day.date === today || day.date === yesterdayStr) && day.count > 0
    );
    
    if (hasRecentCommit) {
        // Count consecutive days with commits
        for (let i = 0; i < sortedActivity.length - 1; i++) {
            const currentDate = new Date(sortedActivity[i].date);
            const nextDate = new Date(sortedActivity[i+1].date);
            const dayDiff = Math.round((currentDate - nextDate) / (1000 * 60 * 60 * 24));
            
            if (sortedActivity[i].count > 0 && dayDiff <= 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let currentLongestStreak = 0;
    
    // Sort by date (oldest first)
    const chronologicalActivity = [...contributions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    for (let i = 0; i < chronologicalActivity.length; i++) {
        if (chronologicalActivity[i].count > 0) {
            currentLongestStreak++;
            
            if (currentLongestStreak > longestStreak) {
                longestStreak = currentLongestStreak;
            }
        } else {
            currentLongestStreak = 0;
        }
    }
    
    return { currentStreak, longestStreak };
}
