# Trends Backend

This is a backend server for fetching trend data from various sources and serving it to the frontend.

## Setup

### Quick Setup with No Dependencies

For a quick start with no external dependencies, use the simple server:

```
node simple-server.js
```

This server provides mock data and requires no additional setup or dependencies.

### Standard Setup

The easiest way to set up and run the full server is to use the provided batch file:

```
setup-and-run.bat
```

This will install the necessary dependencies and start the server.

### Manual Setup

1. Install dependencies:
   ```
   npm install axios cors dotenv express node-cache
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3001
   ```

3. Start the server:
   ```
   node server-new.js
   ```

## API Endpoints

- `GET /health`: Health check endpoint
- `GET /api/trends/industry`: Get industry trends data
- `GET /api/trends/styles`: Get style trends data
- `GET /api/trends/skills`: Get skill trends data

## Data Sources

The server currently simulates API calls to the following data sources:

1. **Exploding Topics API**: For trending topics in the garment industry, fashion styles, and skills
2. **Google Trends API**: For time series data and related queries

In a production environment, you would replace the mock functions with real API calls.

## Response Format

Each endpoint returns data in the following format:

```json
{
  "explodingTopics": {
    "data": [
      { "topic": "Topic Name", "growth": 85, "volume": 12500 },
      ...
    ],
    "meta": {
      "category": "Category Name",
      "timeframe": "Last 12 months",
      "source": "Exploding Topics API"
    }
  },
  "googleTrends": {
    "keyword": "search keyword",
    "timeSeriesData": [
      { "date": "2023-01-01", "value": 75, "formattedDate": "2023-01-01" },
      ...
    ],
    "relatedQueries": [
      { "query": "related query 1", "value": 100 },
      ...
    ]
  },
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## Caching

The server implements caching using node-cache to reduce the number of API calls. The cache duration is set to 1 hour by default.

## Error Handling

The server includes error handling for all API calls and returns appropriate error messages to the frontend.

## Customization

You can customize the data sources and keywords by modifying the `server-new.js` file:

- For industry trends: Update the `fetchExplodingTopicsData('industry')` and `fetchGoogleTrendsData('sustainable fashion')` calls
- For style trends: Update the `fetchExplodingTopicsData('styles')` and `fetchGoogleTrendsData('athleisure fashion')` calls
- For skill trends: Update the `fetchExplodingTopicsData('skills')` and `fetchGoogleTrendsData('digital pattern making')` calls
