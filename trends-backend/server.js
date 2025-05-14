const express = require('express');
let googleTrends;
try {
  googleTrends = require('google-trends-api');
} catch (error) {
  console.error('Error loading google-trends-api module:', error.message);
  console.log('Using mock data instead of real Google Trends API');
  // Create a mock googleTrends object with the same interface
  googleTrends = {
    interestOverTime: async () => {
      return JSON.stringify({
        default: {
          timelineData: Array(52).fill().map((_, i) => ({
            time: new Date(Date.now() - (52 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
            value: [Math.floor(Math.random() * 50) + 50], // Random value between 50-100
            formattedTime: `Week ${i + 1}`
          }))
        }
      });
    },
    relatedQueries: async ({ keyword }) => {
      if (keyword.includes('style')) {
        return JSON.stringify({
          default: {
            rankedList: [{
              rankedKeyword: [
                { query: 'Sustainable fashion', value: 100 },
                { query: 'Athleisure trends', value: 85 },
                { query: 'Minimalist clothing', value: 70 },
                { query: 'Vintage revival', value: 65 },
                { query: 'Gender-neutral fashion', value: 60 }
              ]
            }]
          }
        });
      } else if (keyword.includes('skill')) {
        return JSON.stringify({
          default: {
            rankedList: [{
              rankedKeyword: [
                { query: 'Digital pattern making', value: 100 },
                { query: '3D garment design', value: 90 },
                { query: 'Sustainable materials knowledge', value: 80 },
                { query: 'Supply chain management', value: 75 },
                { query: 'E-commerce optimization', value: 70 }
              ]
            }]
          }
        });
      }
      return JSON.stringify({ default: { rankedList: [{ rankedKeyword: [] }] } });
    }
  };
}
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Simple in-memory cache
const cache = {
  industry: { data: null, timestamp: 0 },
  styles: { data: null, timestamp: 0 },
  skills: { data: null, timestamp: 0 }
};

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// Helper function to check if cache is valid
const isCacheValid = (cacheKey) => {
  return cache[cacheKey].data &&
         (Date.now() - cache[cacheKey].timestamp) < CACHE_DURATION;
};

// Endpoint for industry trends
app.get('/api/trends/industry', async (req, res) => {
  try {
    // Check cache first
    if (isCacheValid('industry')) {
      console.log('Returning cached industry trends data');
      return res.json(cache.industry.data);
    }

    console.log('Fetching fresh industry trends data');
    // Example: Interest over time for "sustainable fashion" in the garment industry
    const results = await googleTrends.interestOverTime({
      keyword: 'sustainable fashion garment industry',
      startTime: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // Last year
      endTime: new Date(),
      geo: 'US'
    });

    const parsedResults = JSON.parse(results);

    // Update cache
    cache.industry.data = parsedResults.default.timelineData;
    cache.industry.timestamp = Date.now();

    res.json(parsedResults.default.timelineData);
  } catch (err) {
    console.error('Error fetching industry trends:', err.message);
    res.status(500).json({
      error: 'Failed to fetch industry trends',
      details: err.message
    });
  }
});

// Endpoint for style trends (related queries)
app.get('/api/trends/styles', async (req, res) => {
  try {
    // Check cache first
    if (isCacheValid('styles')) {
      console.log('Returning cached style trends data');
      return res.json(cache.styles.data);
    }

    console.log('Fetching fresh style trends data');
    const results = await googleTrends.relatedQueries({
      keyword: 'trending clothing styles 2025',
      geo: 'US'
    });

    const parsedResults = JSON.parse(results);
    let styleData = [];

    // Extract top related queries if available
    if (parsedResults.default &&
        parsedResults.default.rankedList &&
        parsedResults.default.rankedList.length > 0 &&
        parsedResults.default.rankedList[0].rankedKeyword) {
      styleData = parsedResults.default.rankedList[0].rankedKeyword;
    }

    // Update cache
    cache.styles.data = styleData;
    cache.styles.timestamp = Date.now();

    res.json(styleData);
  } catch (err) {
    console.error('Error fetching style trends:', err.message);
    res.status(500).json({
      error: 'Failed to fetch style trends',
      details: err.message
    });
  }
});

// Endpoint for skill trends (related queries)
app.get('/api/trends/skills', async (req, res) => {
  try {
    // Check cache first
    if (isCacheValid('skills')) {
      console.log('Returning cached skill trends data');
      return res.json(cache.skills.data);
    }

    console.log('Fetching fresh skill trends data');
    const results = await googleTrends.relatedQueries({
      keyword: 'garment industry skills demand',
      geo: 'US'
    });

    const parsedResults = JSON.parse(results);
    let skillData = [];

    // Extract top related queries if available
    if (parsedResults.default &&
        parsedResults.default.rankedList &&
        parsedResults.default.rankedList.length > 0 &&
        parsedResults.default.rankedList[0].rankedKeyword) {
      skillData = parsedResults.default.rankedList[0].rankedKeyword;
    }

    // Update cache
    cache.skills.data = skillData;
    cache.skills.timestamp = Date.now();

    res.json(skillData);
  } catch (err) {
    console.error('Error fetching skill trends:', err.message);
    res.status(500).json({
      error: 'Failed to fetch skill trends',
      details: err.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Trends API is running' });
});

// Start the server
app.listen(port, () => {
  console.log(`Trends API backend listening at http://localhost:${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
});
