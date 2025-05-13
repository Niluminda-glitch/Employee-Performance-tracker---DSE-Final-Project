import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import TopNavigation from "@/components/TopNavigation";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Briefcase, Cpu, Activity, AlertTriangle, Loader } from "lucide-react";
import "../styles/dashboard-float.css";
import "../styles/trends-page.css";

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
      // For industry trends, we get timeline data
      // Let's calculate the average interest over the last month
      const recentData = data.slice(-30); // Last 30 data points
      const avgInterest = recentData.reduce((sum, point) => sum + point.value[0], 0) / recentData.length;

      return {
        title: "Sustainability Focus in Garment Industry",
        details: `Current interest score: ${avgInterest.toFixed(1)}. Data shows ${data.length > 0 ? 'increasing' : 'stable'} interest in sustainable fashion over the past year.`,
        rawData: data
      };
    }

    if (trendType === 'styles') {
      // For style trends, we get related queries
      const topQueries = data.slice(0, 5).map(item => item.query).join(', ');

      return {
        title: "Emerging Style Trends",
        details: `Top trending style queries: ${topQueries || 'No specific style trends found.'}`,
        rawData: data
      };
    }

    if (trendType === 'skills') {
      // For skill trends, we also get related queries
      const topQueries = data.slice(0, 5).map(item => item.query).join(', ');

      return {
        title: "Skills in High Demand",
        details: `Top trending skill queries in the garment industry: ${topQueries || 'No specific skill trends found.'}`,
        rawData: data
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${trendType} trend data:`, error);
    // Return a fallback object with error information
    return {
      title: `${trendType.charAt(0).toUpperCase() + trendType.slice(1)} Trends`,
      details: `Unable to fetch current ${trendType} trends. Please try again later.`,
      error: error.message
    };
  }
};

// Real implementation of Gemini API
const fetchGeminiSuggestions = async (industry, styles, skills) => {
  try {
    const API_KEY = "AIzaSyAdSsqADZu0sXL2XN9aPfz58tGWIz-0Fcw";

    if (!API_KEY) {
      throw new Error("Gemini API key is missing");
    }

    console.log("Calling Gemini API with trend data");

    // Prepare the prompt with the trend data
    const prompt = `
      You are a strategic advisor for a company in the garment and apparel manufacturing industry.
      Based on the following observed trends, provide 2-3 concise and actionable suggestions for business growth.
      Focus on practical steps the company can take.

      Observed Trends:
      1. Overall Industry Direction: ${industry.details || "No specific industry direction data."}
      2. Trending Garment Styles: ${styles.details || "No specific style trend data."}
      3. Skills in Demand for the Future: ${skills.details || "No specific skill trend data."}

      Actionable Suggestions for Growth:
    `;

    // Make the API call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract the generated text from the response
    if (data.candidates && data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Provide more specific error feedback
    if (error.message && error.message.includes('API key not valid')) {
      return "Could not generate AI suggestions: Invalid API Key.";
    }

    return "Could not generate AI suggestions at this time. Please check console for details.";
  }
};

function TrendsPage() {
  const { user } = useAuth();
  const [industryData, setIndustryData] = useState(null);
  const [styleData, setStyleData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [geminiSuggestions, setGeminiSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAllData = async () => {
    setIsLoading(true);
    setError('');
    setIndustryData(null);
    setStyleData(null);
    setSkillData(null);
    setGeminiSuggestions('');

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
        console.warn("Some trend data could not be fetched. Using available data for Gemini suggestions.");
      }

      // Prepare data for Gemini and get suggestions
      if (industry && styles && skills) {
        try {
          const suggestions = await fetchGeminiSuggestions(industry, styles, skills);
          setGeminiSuggestions(suggestions);
        } catch (geminiError) {
          console.error("Error getting Gemini suggestions:", geminiError);
          setGeminiSuggestions("Unable to generate AI suggestions at this time. Please try again later.");
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
  const TrendCard = ({ icon: Icon, title, data, bgColorClass = "bg-white", iconColorClass = "text-indigo-500" }) => (
    <Card className={`${bgColorClass} shadow-lg border border-gray-200/80 dark:border-gray-700/80 trends-card`}>
      <CardHeader className="pb-3">
        <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-white">
          <Icon className={`w-6 h-6 mr-3 ${iconColorClass}`} />
          {title}
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
            {data.error && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded-md">
                <AlertTriangle className="inline-block w-3 h-3 mr-1" />
                Error: {data.error}
              </div>
            )}

            {/* If we have raw data and no errors, we could display additional visualizations here */}
            {data.rawData && !data.error && data.rawData.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {data.rawData.length} data points available
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No data available.</p>
        )}
      </CardContent>
    </Card>
  );

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
        {isLoading && !geminiSuggestions ? (
          <Card className="mb-8 shadow-lg border border-gray-200/80 pulse-border">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                <Cpu className="mr-3 text-indigo-500" /> Generating AI-Powered Suggestions...
              </CardTitle>
              <CardDescription>
                Analyzing trend data with Google Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ) : geminiSuggestions && (
          <Card className="mb-8 shadow-lg border border-gray-200/80 trends-card">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                <Cpu className="mr-3 text-indigo-500" /> AI-Powered Strategic Suggestions
              </CardTitle>
              <CardDescription>
                Powered by Google Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {geminiSuggestions}
                </p>
                <div className="mt-4 text-xs text-gray-500 flex items-center">
                  <Cpu className="w-3 h-3 mr-1" /> Generated based on current trend analysis
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default TrendsPage;
