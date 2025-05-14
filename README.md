# EmpTrack Project with Trends Feature

This project includes a Trends feature that uses real trend data from a backend API and Google Gemini AI to provide industry insights and strategic suggestions.

## Project Structure

- `real-project/project`: The main React frontend application
- `trends-backend`: A Node.js backend server for fetching trend data

## Setup and Running

### Backend Setup

1. Navigate to the trends-backend directory:
   ```
   cd trends-backend
   ```

2. Run the setup and start script:
   ```
   setup-and-run.bat
   ```

   This will install the necessary dependencies and start the backend server on http://localhost:3001.

   Note: The backend uses simulated API calls to fetch trend data, but the architecture is set up to easily integrate with real APIs in the future.

### Frontend Setup

1. Navigate to the project directory:
   ```
   cd real-project/project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project directory with the following content:
   ```
   REACT_APP_GEMINI_API_KEY=AIzaSyAdSsqADZu0sXL2XN9aPfz58tGWIz-0Fcw
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

   The application will run on http://localhost:8080

## Using the Trends Feature

1. Log in as a Manager or Supervisor
2. Click on the "View Industry Trends" button on the dashboard
3. The Trends page will display:
   - Industry trends based on Google Trends data
   - Style trends based on Google Trends data
   - Skills trends based on Google Trends data
   - AI-powered strategic suggestions based on the trend data

## Customization

### Backend Customization

You can customize the keywords used for fetching trend data by modifying the `trends-backend/server.js` file:

- For industry trends: Update the `keyword` parameter in the `googleTrends.interestOverTime` call
- For style trends: Update the `keyword` parameter in the `googleTrends.relatedQueries` call
- For skill trends: Update the `keyword` parameter in the `googleTrends.relatedQueries` call

### Frontend Customization

You can customize the UI and behavior of the Trends page by modifying the `real-project/project/src/pages/TrendsPage.jsx` file.

## API Keys

- Google Gemini API: The API key is stored in the `.env` file in the frontend project directory.

## Troubleshooting

- If you encounter CORS issues, make sure the backend server is running and the frontend is configured to use the correct backend URL.
- If you encounter issues with the Google Gemini API, check that the API key is correctly set in the `.env` file.
- If the trend data is not loading, check the browser console for error messages and make sure the backend server is running.
