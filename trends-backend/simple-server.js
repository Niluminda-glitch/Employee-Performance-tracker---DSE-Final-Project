const http = require('http');

// Mock data for industry trends
const industryTrendsData = {
  explodingTopics: {
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
  },
  googleTrends: {
    keyword: 'sustainable fashion',
    timeSeriesData: Array(52).fill().map((_, i) => ({
      date: new Date(Date.now() - (52 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 50, // Random value between 50-100
      formattedDate: `Week ${i + 1}`
    })),
    relatedQueries: [
      { query: 'sustainable fashion brands', value: 100 },
      { query: 'sustainable fashion definition', value: 85 },
      { query: 'sustainable fashion market', value: 70 },
      { query: 'sustainable fashion growth', value: 65 },
      { query: 'sustainable fashion forecast', value: 60 }
    ]
  },
  timestamp: new Date().toISOString()
};

// Mock data for style trends
const styleTrendsData = {
  explodingTopics: {
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
  },
  googleTrends: {
    keyword: 'athleisure fashion',
    timeSeriesData: Array(52).fill().map((_, i) => ({
      date: new Date(Date.now() - (52 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 50, // Random value between 50-100
      formattedDate: `Week ${i + 1}`
    })),
    relatedQueries: [
      { query: 'athleisure fashion trends', value: 100 },
      { query: 'athleisure fashion brands', value: 85 },
      { query: 'athleisure fashion market', value: 70 },
      { query: 'athleisure fashion growth', value: 65 },
      { query: 'athleisure fashion forecast', value: 60 }
    ]
  },
  timestamp: new Date().toISOString()
};

// Mock data for skill trends
const skillTrendsData = {
  explodingTopics: {
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
  },
  googleTrends: {
    keyword: 'digital pattern making',
    timeSeriesData: Array(52).fill().map((_, i) => ({
      date: new Date(Date.now() - (52 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 50, // Random value between 50-100
      formattedDate: `Week ${i + 1}`
    })),
    relatedQueries: [
      { query: 'digital pattern making software', value: 100 },
      { query: 'digital pattern making courses', value: 85 },
      { query: 'digital pattern making tools', value: 70 },
      { query: 'digital pattern making skills', value: 65 },
      { query: 'digital pattern making jobs', value: 60 }
    ]
  },
  timestamp: new Date().toISOString()
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (for CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');

  // Handle different endpoints
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', message: 'Trends API is running' }));
  } else if (req.url === '/api/trends/industry') {
    res.writeHead(200);
    res.end(JSON.stringify(industryTrendsData));
  } else if (req.url === '/api/trends/styles') {
    res.writeHead(200);
    res.end(JSON.stringify(styleTrendsData));
  } else if (req.url === '/api/trends/skills') {
    res.writeHead(200);
    res.end(JSON.stringify(skillTrendsData));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Trends API backend listening at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Industry trends available at http://localhost:${PORT}/api/trends/industry`);
  console.log(`Style trends available at http://localhost:${PORT}/api/trends/styles`);
  console.log(`Skill trends available at http://localhost:${PORT}/api/trends/skills`);
});
