import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import TopNavigation from "@/components/TopNavigation";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Briefcase, Cpu, Activity, AlertTriangle, Loader, BarChart3, LineChart } from "lucide-react";
import TypewriterEffect from "@/components/TypewriterEffect";
import "../styles/dashboard-float.css";
import "../styles/trends-page.css";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Function to fetch real trend data from our backend
const fetchTrendData = async (trendType) => {
  console.log(`Fetching ${trendType} trend data from backend`);

  try {
    const backendBaseUrl = 'http://localhost:3001/api/trends';
    const response = await fetch(`${backendBaseUrl}/${trendType}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${trendType} trends: ${response.statusText}`);
    }

    const data = await response.json();

    // Process the data based on trend type
    if (trendType === 'industry') {
      // Extract the top trends from Exploding Topics
      const topTrends = data.explodingTopics.data
        .slice(0, 3)
        .map(item => `${item.topic} (${item.growth}% growth)`)
        .join(', ');

      // Calculate the average interest from Google Trends
      const timeSeriesData = data.googleTrends.timeSeriesData;
      const recentData = timeSeriesData.slice(-12); // Last 12 weeks
      const avgInterest = recentData.reduce((sum, point) => sum + point.value, 0) / recentData.length;

      // Create chart data from the time series data
      const chartData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Get the top 3 trends for the chart
      const topThreeTrends = data.explodingTopics.data.slice(0, 3);

      // Create chart data points for each month
      for (let i = 0; i < 12; i++) {
        const dataPoint = { name: months[i] };

        // Add data for each trend
        topThreeTrends.forEach((trend, index) => {
          // Create a key without spaces for the chart
          const key = trend.topic.replace(/\s+/g, '');
          // Generate a growth curve based on the trend's growth percentage
          const growthFactor = trend.growth / 100;
          const baseValue = 30 + (index * 5); // Different starting points for each trend
          const value = baseValue + (baseValue * growthFactor * (i / 11)); // Increase over time
          dataPoint[key] = Math.round(value);
        });

        chartData.push(dataPoint);
      }

      // Create chart colors for each trend
      const chartColors = {};
      const colorPalette = ["#10b981", "#059669", "#047857"]; // green shades

      topThreeTrends.forEach((trend, index) => {
        const key = trend.topic.replace(/\s+/g, '');
        chartColors[key] = colorPalette[index % colorPalette.length];
      });

      return {
        title: "Sustainability Focus in Garment Industry",
        details: `Current interest score: ${avgInterest.toFixed(1)}. Top industry trends: ${topTrends}`,
        rawData: data,
        chartData: chartData,
        chartColors: chartColors
      };
    }

    if (trendType === 'styles') {
      // Extract the top style trends
      const topTrends = data.explodingTopics.data
        .slice(0, 3)
        .map(item => `${item.topic} (${item.growth}% growth)`)
        .join(', ');

      // Get related queries from Google Trends
      const relatedQueries = data.googleTrends.relatedQueries
        .slice(0, 3)
        .map(item => item.query)
        .join(', ');

      // Create chart data from the time series data
      const chartData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Get the top 3 trends for the chart
      const topThreeTrends = data.explodingTopics.data.slice(0, 3);

      // Create chart data points for each month
      for (let i = 0; i < 12; i++) {
        const dataPoint = { name: months[i] };

        // Add data for each trend
        topThreeTrends.forEach((trend, index) => {
          // Create a key without spaces for the chart
          const key = trend.topic.replace(/\s+/g, '');
          // Generate a growth curve based on the trend's growth percentage
          const growthFactor = trend.growth / 100;
          const baseValue = 35 + (index * 5); // Different starting points for each trend
          const value = baseValue + (baseValue * growthFactor * (i / 11)); // Increase over time
          dataPoint[key] = Math.round(value);
        });

        chartData.push(dataPoint);
      }

      // Create chart colors for each trend
      const chartColors = {};
      const colorPalette = ["#8b5cf6", "#7c3aed", "#6d28d9"]; // purple shades

      topThreeTrends.forEach((trend, index) => {
        const key = trend.topic.replace(/\s+/g, '');
        chartColors[key] = colorPalette[index % colorPalette.length];
      });

      return {
        title: "Emerging Style Trends",
        details: `Top style trends: ${topTrends}. Related searches: ${relatedQueries}`,
        rawData: data,
        chartData: chartData,
        chartColors: chartColors
      };
    }

    if (trendType === 'skills') {
      // Extract the top skill trends
      const topTrends = data.explodingTopics.data
        .slice(0, 3)
        .map(item => `${item.topic} (${item.growth}% growth)`)
        .join(', ');

      // Get related queries from Google Trends
      const relatedQueries = data.googleTrends.relatedQueries
        .slice(0, 3)
        .map(item => item.query)
        .join(', ');

      // Create chart data from the time series data
      const chartData = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Get the top 3 trends for the chart
      const topThreeTrends = data.explodingTopics.data.slice(0, 3);

      // Create chart data points for each month
      for (let i = 0; i < 12; i++) {
        const dataPoint = { name: months[i] };

        // Add data for each trend
        topThreeTrends.forEach((trend, index) => {
          // Create a key without spaces for the chart
          const key = trend.topic.replace(/\s+/g, '');
          // Generate a growth curve based on the trend's growth percentage
          const growthFactor = trend.growth / 100;
          const baseValue = 40 + (index * 5); // Different starting points for each trend
          const value = baseValue + (baseValue * growthFactor * (i / 11)); // Increase over time
          dataPoint[key] = Math.round(value);
        });

        chartData.push(dataPoint);
      }

      // Create chart colors for each trend
      const chartColors = {};
      const colorPalette = ["#f59e0b", "#d97706", "#b45309"]; // amber shades

      topThreeTrends.forEach((trend, index) => {
        const key = trend.topic.replace(/\s+/g, '');
        chartColors[key] = colorPalette[index % colorPalette.length];
      });

      return {
        title: "Skills in High Demand",
        details: `Top skill trends: ${topTrends}. Related searches: ${relatedQueries}`,
        rawData: data,
        chartData: chartData,
        chartColors: chartColors
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${trendType} trend data:`, error);

    // Fallback to mock data if the backend is not available
    console.log(`Falling back to mock data for ${trendType}`);

    // Generate mock data based on trend type
    if (trendType === 'industry') {
      return {
        title: "Sustainability Focus in Garment Industry",
        details: "Current interest score: 75.5. Top industry trends: Sustainable Fashion (85% growth), Circular Economy (72% growth), Ethical Manufacturing (68% growth)",
        chartData: generateMockChartData('industry'),
        chartColors: {
          Sustainability: "#10b981", // green-500
          CircularEconomy: "#059669", // green-600
          EthicalManufacturing: "#047857" // green-700
        },
        error: error.message,
        isMockData: true
      };
    }

    if (trendType === 'styles') {
      return {
        title: "Emerging Style Trends",
        details: "Top style trends: Athleisure (92% growth), Minimalist Clothing (78% growth), Vintage Revival (75% growth)",
        chartData: generateMockChartData('styles'),
        chartColors: {
          Athleisure: "#8b5cf6", // purple-500
          MinimalistClothing: "#7c3aed", // purple-600
          VintageRevival: "#6d28d9" // purple-700
        },
        error: error.message,
        isMockData: true
      };
    }

    if (trendType === 'skills') {
      return {
        title: "Skills in High Demand",
        details: "Top skill trends: Digital Pattern Making (88% growth), 3D Garment Design (85% growth), Sustainable Materials Knowledge (80% growth)",
        chartData: generateMockChartData('skills'),
        chartColors: {
          DigitalPatternMaking: "#f59e0b", // amber-500
          ThreeDGarmentDesign: "#d97706", // amber-600
          SustainableMaterials: "#b45309" // amber-700
        },
        error: error.message,
        isMockData: true
      };
    }

    return {
      title: `${trendType.charAt(0).toUpperCase() + trendType.slice(1)} Trends`,
      details: `Unable to fetch ${trendType} trends. Please try again later.`,
      chartData: generateMockChartData(),
      error: error.message,
      isMockData: true
    };
  }
};

// Generate mock chart data for trends
const generateMockChartData = (trendType) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (trendType === 'industry') {
    return [
      { name: 'Jan', Sustainability: 40, CircularEconomy: 24, EthicalManufacturing: 35 },
      { name: 'Feb', Sustainability: 43, CircularEconomy: 26, EthicalManufacturing: 38 },
      { name: 'Mar', Sustainability: 45, CircularEconomy: 28, EthicalManufacturing: 40 },
      { name: 'Apr', Sustainability: 47, CircularEconomy: 30, EthicalManufacturing: 42 },
      { name: 'May', Sustainability: 52, CircularEconomy: 34, EthicalManufacturing: 45 },
      { name: 'Jun', Sustainability: 55, CircularEconomy: 37, EthicalManufacturing: 48 },
      { name: 'Jul', Sustainability: 59, CircularEconomy: 42, EthicalManufacturing: 52 },
      { name: 'Aug', Sustainability: 63, CircularEconomy: 46, EthicalManufacturing: 55 },
      { name: 'Sep', Sustainability: 67, CircularEconomy: 52, EthicalManufacturing: 58 },
      { name: 'Oct', Sustainability: 72, CircularEconomy: 58, EthicalManufacturing: 62 },
      { name: 'Nov', Sustainability: 78, CircularEconomy: 65, EthicalManufacturing: 65 },
      { name: 'Dec', Sustainability: 85, CircularEconomy: 72, EthicalManufacturing: 68 }
    ];
  }

  if (trendType === 'styles') {
    return [
      { name: 'Jan', Athleisure: 50, MinimalistClothing: 35, VintageRevival: 40 },
      { name: 'Feb', Athleisure: 53, MinimalistClothing: 38, VintageRevival: 42 },
      { name: 'Mar', Athleisure: 57, MinimalistClothing: 40, VintageRevival: 45 },
      { name: 'Apr', Athleisure: 60, MinimalistClothing: 43, VintageRevival: 48 },
      { name: 'May', Athleisure: 65, MinimalistClothing: 47, VintageRevival: 50 },
      { name: 'Jun', Athleisure: 70, MinimalistClothing: 52, VintageRevival: 53 },
      { name: 'Jul', Athleisure: 75, MinimalistClothing: 58, VintageRevival: 57 },
      { name: 'Aug', Athleisure: 78, MinimalistClothing: 62, VintageRevival: 60 },
      { name: 'Sep', Athleisure: 82, MinimalistClothing: 67, VintageRevival: 64 },
      { name: 'Oct', Athleisure: 85, MinimalistClothing: 70, VintageRevival: 68 },
      { name: 'Nov', Athleisure: 88, MinimalistClothing: 74, VintageRevival: 72 },
      { name: 'Dec', Athleisure: 92, MinimalistClothing: 78, VintageRevival: 75 }
    ];
  }

  if (trendType === 'skills') {
    return [
      { name: 'Jan', DigitalPatternMaking: 45, ThreeDGarmentDesign: 40, SustainableMaterials: 35 },
      { name: 'Feb', DigitalPatternMaking: 48, ThreeDGarmentDesign: 43, SustainableMaterials: 38 },
      { name: 'Mar', DigitalPatternMaking: 52, ThreeDGarmentDesign: 47, SustainableMaterials: 42 },
      { name: 'Apr', DigitalPatternMaking: 55, ThreeDGarmentDesign: 50, SustainableMaterials: 45 },
      { name: 'May', DigitalPatternMaking: 60, ThreeDGarmentDesign: 54, SustainableMaterials: 50 },
      { name: 'Jun', DigitalPatternMaking: 65, ThreeDGarmentDesign: 58, SustainableMaterials: 55 },
      { name: 'Jul', DigitalPatternMaking: 70, ThreeDGarmentDesign: 63, SustainableMaterials: 60 },
      { name: 'Aug', DigitalPatternMaking: 75, ThreeDGarmentDesign: 68, SustainableMaterials: 65 },
      { name: 'Sep', DigitalPatternMaking: 78, ThreeDGarmentDesign: 72, SustainableMaterials: 68 },
      { name: 'Oct', DigitalPatternMaking: 82, ThreeDGarmentDesign: 76, SustainableMaterials: 72 },
      { name: 'Nov', DigitalPatternMaking: 85, ThreeDGarmentDesign: 80, SustainableMaterials: 76 },
      { name: 'Dec', DigitalPatternMaking: 88, ThreeDGarmentDesign: 85, SustainableMaterials: 80 }
    ];
  }

  // Default data if trend type is not recognized
  return months.map((month) => ({
    name: month,
    value: 30 + Math.floor(Math.random() * 50)
  }));
};

// Import the GitHub AI API client
import { generateText, generateMockResponse } from '../integrations/github/client';

// Implementation of AI suggestions with GitHub AI API and fallback to mock data
const fetchAISuggestions = async (industry, styles, skills) => {
  try {
    console.log("Preparing to call GitHub AI API with trend data");

    // Prepare the prompt with the trend data
    const prompt = `
      You are a strategic advisor for a company in the garment and apparel manufacturing industry.
      Based on the following observed trends, provide 3 concise and actionable suggestions for business growth.
      Format each suggestion as a separate numbered point.
      Each suggestion should be clear, specific, and directly actionable.
      Focus on practical steps the company can take.

      Observed Trends:
      1. Overall Industry Direction: ${industry.details || "No specific industry direction data."}
      2. Trending Garment Styles: ${styles.details || "No specific style trend data."}
      3. Skills in Demand for the Future: ${skills.details || "No specific skill trend data."}

      Actionable Suggestions for Growth:
    `;

    try {
      // Make the API call to GitHub AI
      const rawText = await generateText(prompt, {
        temperature: 0.7,
        max_tokens: 500,
        model: "openai/gpt-4.1"
      });

      // Process the text to ensure it's properly formatted as a list
      const processedText = formatSuggestionsAsList(rawText);
      return processedText;
    } catch (apiError) {
      console.error("Error calling GitHub AI API, falling back to mock data:", apiError);

      // Simulate network delay for mock data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use the mock response generator
      return generateMockResponse(prompt);
    }
  } catch (error) {
    console.error("Error in AI suggestions function:", error);

    // Simulate network delay for mock data
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Use the mock response generator
    return generateMockResponse(prompt);
  }
};

// Implementation of AI trend predictions with GitHub AI API
const fetchAIPredictions = async (industry, styles, skills) => {
  try {
    console.log("Preparing to call GitHub AI API for trend predictions");

    // Prepare the prompt with the trend data
    const prompt = `
      You are a trend forecaster for the garment and apparel manufacturing industry with expertise in predicting future market movements.
      Based on the following current trends, predict the 3 most significant developments we can expect to see in the next 12-24 months.
      Format each prediction as a separate numbered point.
      Each prediction should be specific, insightful, and include a brief explanation of the driving factors.
      Focus on concrete trends rather than general observations.

      Current Trends:
      1. Overall Industry Direction: ${industry.details || "No specific industry direction data."}
      2. Trending Garment Styles: ${styles.details || "No specific style trend data."}
      3. Skills in Demand for the Future: ${skills.details || "No specific skill trend data."}

      Future Trend Predictions (12-24 months):
    `;

    try {
      // Make the API call to GitHub AI
      const rawText = await generateText(prompt, {
        temperature: 0.75, // Slightly higher temperature for more creative predictions
        max_tokens: 600,
        model: "openai/gpt-4.1"
      });

      // Process the text to ensure it's properly formatted as a list
      const processedText = formatSuggestionsAsList(rawText);
      return processedText;
    } catch (apiError) {
      console.error("Error calling GitHub AI API for predictions, falling back to mock data:", apiError);

      // Simulate network delay for mock data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock predictions if the API call fails
      return `1. AI-Driven Personalization in Fast Fashion: Within 18 months, expect to see major brands implementing AI-powered personalization at scale. This will include custom-fit garments based on smartphone body scans and algorithmically designed pieces tailored to individual style preferences and past purchases.

2. Regenerative Agriculture Textiles Boom: The next evolution beyond sustainability will be regenerative practices. Brands will shift from "less harm" to "net positive" environmental impact, with regenerative cotton, hemp, and wool becoming premium selling points and commanding 15-25% price premiums.

3. Micro-Manufacturing Hubs: Decentralized production will accelerate with small, tech-enabled manufacturing facilities located closer to end consumers. These hubs will enable on-demand production, reducing inventory waste by 30-40% while cutting shipping emissions and improving supply chain resilience.`;
    }
  } catch (error) {
    console.error("Error in AI predictions function:", error);

    // Simulate network delay for mock data
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock predictions if there's an error
    return `1. AI-Driven Personalization in Fast Fashion: Within 18 months, expect to see major brands implementing AI-powered personalization at scale. This will include custom-fit garments based on smartphone body scans and algorithmically designed pieces tailored to individual style preferences and past purchases.

2. Regenerative Agriculture Textiles Boom: The next evolution beyond sustainability will be regenerative practices. Brands will shift from "less harm" to "net positive" environmental impact, with regenerative cotton, hemp, and wool becoming premium selling points and commanding 15-25% price premiums.

3. Micro-Manufacturing Hubs: Decentralized production will accelerate with small, tech-enabled manufacturing facilities located closer to end consumers. These hubs will enable on-demand production, reducing inventory waste by 30-40% while cutting shipping emissions and improving supply chain resilience.`;
  }
};

// Helper function to format suggestions as a clean list
const formatSuggestionsAsList = (text) => {
  // Split the text into lines
  const lines = text.split('\n').filter(line => line.trim());

  // Find where the numbered suggestions start
  const suggestionLines = [];
  let foundSuggestions = false;

  for (const line of lines) {
    // Check if this line starts with a number or contains a suggestion marker
    if (/^\d+[\.\)]/.test(line.trim()) || line.includes('**') || foundSuggestions) {
      // Once we find the first suggestion, set the flag to true
      foundSuggestions = true;

      // Clean up the line - remove markdown formatting and numbering
      let cleanLine = line.replace(/^\d+[\.\)]/, '').trim();
      cleanLine = cleanLine.replace(/\*\*/g, '');

      if (cleanLine) {
        suggestionLines.push(cleanLine);
      }
    }
  }

  // If we couldn't find any suggestions in the expected format,
  // just return the original text split by double newlines
  if (suggestionLines.length === 0) {
    return text.split('\n\n')
      .filter(para => para.trim() && !para.toLowerCase().includes('based on'))
      .join('\n\n');
  }

  // Join the suggestions with newlines for the typewriter effect
  return suggestionLines.join('\n\n');
};

function TrendsPage() {
  const { user } = useAuth();
  const [industryData, setIndustryData] = useState(null);
  const [styleData, setStyleData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [aiSuggestions, setAISuggestions] = useState('');
  const [aiPredictions, setAIPredictions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAllData = async () => {
    setIsLoading(true);
    setError('');
    setIndustryData(null);
    setStyleData(null);
    setSkillData(null);
    setAISuggestions('');
    setAIPredictions('');

    try {
      // Fetch all trend data in parallel for better performance
      const [industry, styles, skills] = await Promise.all([
        fetchTrendData('industry'),
        fetchTrendData('styles'),
        fetchTrendData('skills')
      ]);

      setIndustryData(industry);
      setStyleData(styles);
      setSkillData(skills);

      // Check if any of the fetches returned an error
      const hasErrors = [industry, styles, skills].some(data => data.error);

      if (hasErrors) {
        console.warn("Some trend data could not be fetched. Using available data for AI analysis.");
      }

      // Prepare data for AI and get suggestions and predictions in parallel
      if (industry && styles && skills) {
        try {
          // Run both AI calls in parallel for better performance
          const [suggestions, predictions] = await Promise.all([
            fetchAISuggestions(industry, styles, skills),
            fetchAIPredictions(industry, styles, skills)
          ]);

          setAISuggestions(suggestions);
          setAIPredictions(predictions);
        } catch (aiError) {
          console.error("Error getting AI analysis:", aiError);
          setAISuggestions("Unable to generate AI suggestions at this time. Please try again later.");
          setAIPredictions("Unable to generate AI predictions at this time. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Error in loadAllData:", err);
      setError('Failed to load trend data. Please try again.');
      toast.error('Error loading trends.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []); // Load data when the component mounts

  // Helper component to display each trend card
  const TrendCard = ({ icon: Icon, title, data, bgColorClass = "bg-white", iconColorClass = "text-indigo-500" }) => {
    // Debug logging to check if chartData is being passed correctly
    console.log(`TrendCard ${title} data:`, data);
    if (data && data.chartData) {
      console.log(`${title} chartData:`, data.chartData);
      console.log(`${title} chartColors:`, data.chartColors);
    }

    return (
    <Card className={`${bgColorClass} shadow-lg border border-gray-200/80 dark:border-gray-700/80 trends-card`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-white">
            <Icon className={`w-6 h-6 mr-3 ${iconColorClass}`} />
            {title}
          </div>
          {data && data.isMockData && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
              Mock Data
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !data ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse mt-4"></div>
          </div>
        ) : data ? (
          <div>
            <h3 className="font-medium text-lg mb-2">{data.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{data.details}</p>

            {/* Display error message if there was an error fetching data */}
            {data.error && !data.isMockData && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded-md">
                <AlertTriangle className="inline-block w-3 h-3 mr-1" />
                Error: {data.error}
              </div>
            )}

            {/* Display line chart for trend data */}
            {data.chartData && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium mb-2">Trend Growth (Last 12 Months)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={data.chartData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />

                      {data.chartColors ? (
                        Object.keys(data.chartColors).map((key) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={data.chartColors[key]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))
                      ) : (
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      )}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* If we have raw data and no errors, we could display additional visualizations here */}
            {data.rawData && !data.error && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {data.rawData.explodingTopics ?
                    `${data.rawData.explodingTopics.data.length} trending topics available` :
                    'Data available for visualization'}
                </p>
                {data.rawData.googleTrends && (
                  <p className="text-xs text-gray-500 mt-1">
                    {data.rawData.googleTrends.timeSeriesData.length} time series data points
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No data available.</p>
        )}
      </CardContent>
    </Card>
    );
  };

  // Check if user has permission to access this page
  if (user && user.role !== 'supervisor' && user.role !== 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
        <TopNavigation userRole={user?.role} />
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the Trends page.</p>
            <Button onClick={() => navigate(user?.role === 'employee' ? '/employee-dashboard' : '/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-purple-50 to-amber-50 pb-24 overflow-x-hidden">
      {/* Floating background shapes */}
      <div className="floating-bg">
        <div className="floating-shape shape1 animate-float" />
        <div className="floating-shape shape2 animate-float" />
        <div className="floating-shape shape3 animate-float" />
        <div className="floating-shape shape4 animate-float" />
      </div>

      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto p-4 max-w-6xl pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="mr-3 text-teal-600" /> Industry Trends
          </h1>
          <Button
            onClick={loadAllData}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isLoading ? <Loader className="animate-spin -ml-1 mr-2 h-5 w-5"/> : <Activity className="-ml-1 mr-2 h-5 w-5"/>}
            {isLoading ? 'Loading Insights...' : 'Refresh Insights'}
          </Button>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg flex items-center" role="alert">
            <AlertTriangle className="w-5 h-5 mr-2"/> {error}
          </div>
        )}

        {/* Main content area for trends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <TrendCard
            icon={Activity}
            title="Key Industry Focus"
            data={industryData}
            bgColorClass="bg-green-50/80"
            iconColorClass="text-green-600"
          />
          <TrendCard
            icon={ShoppingBag}
            title="Emerging Style Trends"
            data={styleData}
            bgColorClass="bg-purple-50/80"
            iconColorClass="text-purple-600"
          />
          <TrendCard
            icon={Briefcase}
            title="Future Skills in Demand"
            data={skillData}
            bgColorClass="bg-yellow-50/80"
            iconColorClass="text-yellow-600"
          />
        </div>

        {/* AI Suggestions Section */}
        <Card className="mb-8 shadow-lg border border-gray-200/80 trends-card">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
              <Cpu className="mr-3 text-indigo-500" />
              {isLoading && !aiSuggestions
                ? "Generating AI-Powered Suggestions..."
                : "AI-Powered Strategic Suggestions"}
            </CardTitle>
            <CardDescription>
              <span className="flex items-center">
                <span className="mr-2">Powered by GitHub AI (GPT-4.1)</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  AI Enabled
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 ${isLoading && !aiSuggestions ? 'min-h-[200px] flex items-center justify-center' : ''}`}>
              <TypewriterEffect
                text={aiSuggestions}
                formatAsList={true}
                typingSpeed={20}
                startDelay={500}
                isLoading={isLoading && !aiSuggestions}
                className="text-gray-700 leading-relaxed"
              />

              {aiSuggestions && !isLoading && (
                <div className="mt-4 text-xs text-gray-500 flex items-center">
                  <Cpu className="w-3 h-3 mr-1" /> Generated based on current trend analysis
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Trend Predictions Section */}
        <Card className="mb-8 shadow-lg border border-gray-200/80 trends-card bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
              <TrendingUp className="mr-3 text-orange-500" />
              {isLoading && !aiPredictions
                ? "Generating Future Trend Predictions..."
                : "AI-Powered Future Trend Predictions"}
            </CardTitle>
            <CardDescription>
              <span className="flex items-center">
                <span className="mr-2">12-24 Month Industry Forecast</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  AI Forecast
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`bg-orange-50/50 p-4 rounded-lg border border-orange-100 ${isLoading && !aiPredictions ? 'min-h-[200px] flex items-center justify-center' : ''}`}>
              <TypewriterEffect
                text={aiPredictions}
                formatAsList={true}
                typingSpeed={25}
                startDelay={1000}
                isLoading={isLoading && !aiPredictions}
                className="text-gray-700 leading-relaxed"
              />

              {aiPredictions && !isLoading && (
                <div className="mt-4 text-xs text-gray-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> AI-generated predictions based on current market trends
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default TrendsPage;
