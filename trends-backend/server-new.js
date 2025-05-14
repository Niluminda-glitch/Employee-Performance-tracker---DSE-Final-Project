const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Create a cache with TTL of 1 hour (in seconds)
const cache = new NodeCache({ stdTTL: 3600 });

// Helper function to fetch data from Exploding Topics API
async function fetchExplodingTopicsData(category) {
  try {
    // For demo purposes, we'll use a mock API call
    // In a real implementation, you would use a real API key and endpoint
    console.log(`Fetching ${category} data from Exploding Topics API`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data based on category
    if (category === 'industry') {
      return {
        data: [
          { topic: 'Sustainable Fashion', growth: 85, volume: 12500 },
          { topic: 'Circular Economy', growth: 72, volume: 8900 },
          { topic: 'Ethical Manufacturing', growth: 68, volume: 7500 },
          { topic: 'Supply Chain Transparency', growth: 65, volume: 6200 },
          { topic: 'Carbon Neutral Production', growth: 58, volume: 5100 }
        ],
        meta: {
          category: 'Fashion Industry',
          timeframe: 'Last 12 months',
          source: 'Exploding Topics API'
        }
      };
    } else if (category === 'styles') {
      return {
        data: [
          { topic: 'Athleisure', growth: 92, volume: 18500 },
          { topic: 'Minimalist Clothing', growth: 78, volume: 14200 },
          { topic: 'Vintage Revival', growth: 75, volume: 12800 },
          { topic: 'Gender-Neutral Fashion', growth: 70, volume: 9500 },
          { topic: 'Sustainable Loungewear', growth: 65, volume: 8200 }
        ],
        meta: {
          category: 'Fashion Styles',
          timeframe: 'Last 12 months',
          source: 'Exploding Topics API'
        }
      };
    } else if (category === 'skills') {
      return {
        data: [
          { topic: 'Digital Pattern Making', growth: 88, volume: 9200 },
          { topic: '3D Garment Design', growth: 85, volume: 8500 },
          { topic: 'Sustainable Materials Knowledge', growth: 80, volume: 7800 },
          { topic: 'Supply Chain Management', growth: 75, volume: 7200 },
          { topic: 'E-commerce Optimization', growth: 72, volume: 6800 }
        ],
        meta: {
          category: 'Fashion Industry Skills',
          timeframe: 'Last 12 months',
          source: 'Exploding Topics API'
        }
      };
    }
    
    throw new Error(`Unknown category: ${category}`);
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error.message);
    throw error;
  }
}

// Helper function to fetch data from Google Trends API (simulated)
async function fetchGoogleTrendsData(keyword) {
  try {
    console.log(`Fetching Google Trends data for: ${keyword}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock time series data for the past year
    const timeSeriesData = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    // Generate weekly data points
    for (let i = 0; i < 52; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (i * 7));
      
      // Generate a value with an upward trend and some randomness
      const baseValue = 50 + (i * 0.5); // Gradual increase
      const randomFactor = Math.random() * 20 - 10; // Random fluctuation between -10 and +10
      const value = Math.max(0, Math.min(100, baseValue + randomFactor));
      
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value),
        formattedDate: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      });
    }
    
    return {
      keyword,
      timeSeriesData,
      relatedQueries: [
        { query: `${keyword} industry`, value: 100 },
        { query: `${keyword} trends`, value: 85 },
        { query: `${keyword} market`, value: 70 },
        { query: `${keyword} growth`, value: 65 },
        { query: `${keyword} forecast`, value: 60 }
      ]
    };
  } catch (error) {
    console.error(`Error fetching Google Trends data for ${keyword}:`, error.message);
    throw error;
  }
}

// Endpoint for industry trends
app.get('/api/trends/industry', async (req, res) => {
  try {
    const cacheKey = 'industry_trends';
    
    // Check if data is in cache
    if (cache.has(cacheKey)) {
      console.log('Returning cached industry trends data');
      return res.json(cache.get(cacheKey));
    }
    
    // Fetch data from Exploding Topics API
    const explodingTopicsData = await fetchExplodingTopicsData('industry');
    
    // Fetch Google Trends data for the top trend
    const googleTrendsData = await fetchGoogleTrendsData('sustainable fashion');
    
    // Combine the data
    const result = {
      explodingTopics: explodingTopicsData,
      googleTrends: googleTrendsData,
      timestamp: new Date().toISOString()
    };
    
    // Store in cache
    cache.set(cacheKey, result);
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching industry trends:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch industry trends', 
      details: err.message 
    });
  }
});

// Endpoint for style trends
app.get('/api/trends/styles', async (req, res) => {
  try {
    const cacheKey = 'style_trends';
    
    // Check if data is in cache
    if (cache.has(cacheKey)) {
      console.log('Returning cached style trends data');
      return res.json(cache.get(cacheKey));
    }
    
    // Fetch data from Exploding Topics API
    const explodingTopicsData = await fetchExplodingTopicsData('styles');
    
    // Fetch Google Trends data for the top trend
    const googleTrendsData = await fetchGoogleTrendsData('athleisure fashion');
    
    // Combine the data
    const result = {
      explodingTopics: explodingTopicsData,
      googleTrends: googleTrendsData,
      timestamp: new Date().toISOString()
    };
    
    // Store in cache
    cache.set(cacheKey, result);
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching style trends:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch style trends', 
      details: err.message 
    });
  }
});

// Endpoint for skill trends
app.get('/api/trends/skills', async (req, res) => {
  try {
    const cacheKey = 'skill_trends';
    
    // Check if data is in cache
    if (cache.has(cacheKey)) {
      console.log('Returning cached skill trends data');
      return res.json(cache.get(cacheKey));
    }
    
    // Fetch data from Exploding Topics API
    const explodingTopicsData = await fetchExplodingTopicsData('skills');
    
    // Fetch Google Trends data for the top trend
    const googleTrendsData = await fetchGoogleTrendsData('digital pattern making');
    
    // Combine the data
    const result = {
      explodingTopics: explodingTopicsData,
      googleTrends: googleTrendsData,
      timestamp: new Date().toISOString()
    };
    
    // Store in cache
    cache.set(cacheKey, result);
    
    res.json(result);
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
