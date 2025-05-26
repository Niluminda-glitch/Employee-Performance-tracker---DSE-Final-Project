import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  X,
  ArrowLeft,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Radar,
  AlertTriangle,
  Loader
} from 'lucide-react';
import TopNavigation from "../components/TopNavigation";
import { useNavigate } from "react-router-dom";
import { getAIEmployeeAnalysis } from '../services/aiAnalyticsService';
import {
  BarChart, Bar,
  LineChart, Line,
  RadarChart, Radar as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Progress } from "../components/ui/progress";
import jsPDF from 'jspdf';

const AIAnalytics = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [taskStats, setTaskStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [userSkills, setUserSkills] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // AI Analytics state
  const [aiReport, setAIReport] = useState(null);
  const [isGeneratingAIReport, setIsGeneratingAIReport] = useState(false);
  const [aiReportError, setAIReportError] = useState('');

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        console.log("Fetching team members for AI analytics");
        if (user.role === 'employee') {
          setSelectedUserId(user.id);
          setTeamMembers([user]);
          return;
        }

        let response;
        if (user.role === 'manager') {
          response = await api.get('/manager/users');
        } else {
          response = await api.get('/supervisor/team');
        }

        console.log("Team members response:", response.data);
        setTeamMembers(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedUserId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error("Failed to load team members");
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, [user, api]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUserStats = async (userId) => {
    setLoading(true);
    try {
      console.log("Fetching stats for user:", userId);

      // Fetch task stats
      const taskResponse = await api.get(`/analytics/user/${userId}/task-stats`);
      setTaskStats(taskResponse.data);

      // Fetch leave/overtime stats
      const leaveResponse = await api.get(`/analytics/user/${userId}/leave-overtime`);
      setLeaveStats(leaveResponse.data);

      // Fetch user skills
      const userSkillsResponse = await api.get(`/analytics/user/${userId}/user-skills`);
      setUserSkills(userSkillsResponse.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error(`Failed to fetch stats for user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUserName = () => {
    if (!selectedUserId) return "Employee";
    if (selectedUserId === user.id) return user.full_name || "You";
    const selectedUser = teamMembers.find(member => member.id === selectedUserId);
    return selectedUser ? selectedUser.full_name : "Employee";
  };

  const handleGenerateAIReport = async () => {
    if (!selectedUserId) {
      toast.error("Please select an employee to analyze.");
      return;
    }

    const selectedEmployee = teamMembers.find(member => member.id === selectedUserId);
    if (!selectedEmployee) {
      toast.error("Selected employee data not found.");
      return;
    }

    const employeeDataForAI = {
      id: selectedEmployee.id,
      name: selectedEmployee.full_name,
      email: selectedEmployee.email,
      role: selectedEmployee.role,
      jobTitle: selectedEmployee.job_title,
      taskStats: taskStats,
      leaveStats: leaveStats,
      userSkills: userSkills
    };

    if (!employeeDataForAI.taskStats) {
      toast.warn("Task statistics are not yet loaded for this employee. AI analysis might be limited.");
    }

    setIsGeneratingAIReport(true);
    setAIReport(null);
    setAIReportError('');

    try {
      const report = await getAIEmployeeAnalysis(employeeDataForAI);
      setAIReport(report);
      setActiveTab("overview"); // Switch to overview tab to show the report
    } catch (error) {
      console.error("Failed to generate AI report:", error);
      setAIReportError(error.message || "An error occurred while generating the AI report.");
      toast.error("Failed to generate AI report.");
    } finally {
      setIsGeneratingAIReport(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!aiReport) {
      toast.error("No AI report available to download");
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add header
      pdf.setFillColor(100, 58, 237);
      pdf.rect(0, 0, pageWidth, 35, 'F');

      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`AI Performance Analysis for ${getSelectedUserName()}`, pageWidth / 2, 20, { align: 'center' });

      // Add report metadata
      pdf.setFontSize(10);
      pdf.setTextColor(220, 220, 220);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

      // Add content sections
      let yPos = 50;
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);

      // Performance Overview
      if (aiReport.performanceOverview) {
        pdf.setFontSize(14);
        pdf.setTextColor(100, 58, 237);
        pdf.text("Performance Overview", 14, yPos);
        yPos += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(`Overall Score: ${aiReport.performanceOverview.overallScore}%`, 14, yPos);
        yPos += 6;
        pdf.text(`Performance Level: ${aiReport.performanceOverview.performanceLevel}`, 14, yPos);
        yPos += 6;

        const summaryLines = pdf.splitTextToSize(aiReport.performanceOverview.summary, pageWidth - 28);
        pdf.text(summaryLines, 14, yPos);
        yPos += summaryLines.length * 4 + 10;
      }

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`EmpTrack AI Analytics - Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`AI_Analysis_${getSelectedUserName().replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleBackToAnalytics = () => {
    navigate('/analytics');
  };

  if (!user || (user.role !== 'supervisor' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
        <TopNavigation userRole={user?.role} />
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the AI Analytics page.</p>
            <Button onClick={() => navigate(user?.role === 'employee' ? '/employee-dashboard' : '/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleBackToAnalytics}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Analytics</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="mr-3 h-8 w-8 text-purple-600" />
                AI Performance Analytics
              </h1>
              <p className="text-gray-600 mt-1">Advanced AI-powered employee performance analysis</p>
            </div>
          </div>
        </div>

        {/* Employee Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Employee Selection
            </CardTitle>
            <CardDescription>Select an employee to generate AI-powered performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerateAIReport}
                disabled={!selectedUserId || isGeneratingAIReport}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGeneratingAIReport ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate AI Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-h-[75vh] overflow-hidden">
          {/* Loading State */}
          {isGeneratingAIReport && (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <Loader className="animate-spin text-4xl mb-4 text-purple-500" />
              <p className="text-lg">Generating AI insights, please wait...</p>
              <p className="text-sm mt-1">This may take a moment.</p>
            </div>
          )}

          {/* Error State */}
          {aiReportError && !isGeneratingAIReport && (
            <div className="p-6">
              <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
                <AlertTriangle className="mr-2 w-5 h-5" />
                {aiReportError}
              </div>
            </div>
          )}

          {/* AI Report Content */}
          {!isGeneratingAIReport && !aiReportError && aiReport && (
            <div className="flex flex-col h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                {/* Tab Navigation */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200 flex-shrink-0">
                  <TabsList className="flex w-full h-12 bg-gray-100 rounded-lg p-1 space-x-1">
                    <TabsTrigger
                      value="overview"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm font-medium text-sm rounded-md transition-all"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="analysis"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm font-medium text-sm rounded-md transition-all"
                    >
                      Task Analysis
                    </TabsTrigger>
                    <TabsTrigger
                      value="visualizations"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm font-medium text-sm rounded-md transition-all"
                    >
                      Charts
                    </TabsTrigger>
                    <TabsTrigger
                      value="predictions"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm font-medium text-sm rounded-md transition-all"
                    >
                      Predictions
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Content Area with Scroll */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <TabsContent value="overview" className="mt-0 space-y-4">
                    {renderPerformanceOverview()}
                  </TabsContent>

                  <TabsContent value="analysis" className="mt-0 space-y-4">
                    {renderTaskAnalysis()}
                  </TabsContent>

                  <TabsContent value="visualizations" className="mt-0 space-y-4">
                    {renderVisualizations()}
                  </TabsContent>

                  <TabsContent value="predictions" className="mt-0 space-y-4">
                    {renderPredictionsAndDevelopment()}
                  </TabsContent>
                </div>

                {/* Footer with Actions */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={handleBackToAnalytics}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </Tabs>
            </div>
          )}

          {/* Empty State */}
          {!isGeneratingAIReport && !aiReportError && !aiReport && (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <Brain className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No AI Analysis Generated</h3>
              <p className="text-gray-500 text-center max-w-md">
                Select an employee and click "Generate AI Analysis" to create a comprehensive performance report.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render functions for different sections
  const renderPerformanceOverview = () => {
    if (!aiReport?.performanceOverview) return null;

    const { overallScore, performanceLevel, summary, keyStrengths, areasForImprovement } = aiReport.performanceOverview;

    return (
      <div className="space-y-6">
        {/* Performance Score Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800">Overall Performance Score</CardTitle>
            <div className="text-4xl font-bold text-purple-600">{overallScore}%</div>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              performanceLevel === 'Excellent' ? 'bg-green-100 text-green-800' :
              performanceLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
              performanceLevel === 'Average' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {performanceLevel}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-center">{summary}</p>
          </CardContent>
        </Card>

        {/* Strengths and Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Key Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {keyStrengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTaskAnalysis = () => {
    if (!aiReport?.taskAnalysis) return null;

    const { efficiencyScore, timeManagement, workloadCapacity, insights, recommendations } = aiReport.taskAnalysis;

    return (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Efficiency Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{efficiencyScore}%</div>
              <Progress value={efficiencyScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Time Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-semibold ${
                timeManagement === 'Excellent' ? 'text-green-600' :
                timeManagement === 'Good' ? 'text-blue-600' :
                timeManagement === 'Average' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {timeManagement}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Workload Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-semibold ${
                workloadCapacity === 'High' ? 'text-green-600' :
                workloadCapacity === 'Medium' ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {workloadCapacity}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderVisualizations = () => {
    if (!aiReport?.visualizationData) return null;

    const { performanceMetrics, skillRadar, trendData } = aiReport.visualizationData;

    return (
      <div className="space-y-6">
        {/* Performance Metrics Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Current vs Target Performance</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceMetrics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, '']} />
                  <Legend />
                  <Bar dataKey="current" fill="#4ade80" name="Current" />
                  <Bar dataKey="target" fill="#60a5fa" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Radar Chart */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Radar className="mr-2 h-5 w-5" />
                Skills Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillRadar} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <RechartsRadar
                      name="Skill Level"
                      dataKey="level"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      stroke="#4ade80"
                      strokeWidth={3}
                      dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderPredictionsAndDevelopment = () => {
    if (!aiReport?.futurePredictions || !aiReport?.skillDevelopment || !aiReport?.managementInsights) return null;

    const { performanceTrend, expectedGrowth, potentialChallenges, opportunities, sixMonthForecast } = aiReport.futurePredictions;
    const { currentLevel, skillGaps, learningPriorities, developmentPlan } = aiReport.skillDevelopment;
    const { supportNeeded, interventions, mentorshipRecommendations, performanceGoals } = aiReport.managementInsights;

    return (
      <div className="space-y-6">
        {/* Future Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Future Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Performance Outlook</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend:</span>
                    <span className={`font-medium ${
                      performanceTrend === 'Improving' ? 'text-green-600' :
                      performanceTrend === 'Stable' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {performanceTrend}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Growth:</span>
                    <span className={`font-medium ${
                      expectedGrowth === 'High' ? 'text-green-600' :
                      expectedGrowth === 'Medium' ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {expectedGrowth}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">6-Month Forecast</h5>
                  <p className="text-sm text-gray-600">{sixMonthForecast}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Challenges & Opportunities</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-1">Potential Challenges</h5>
                    <ul className="text-sm space-y-1">
                      {potentialChallenges.map((challenge, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Opportunities</h5>
                    <ul className="text-sm space-y-1">
                      {opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          <span className="text-gray-600">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Development */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Skill Development Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Current Level</h4>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  currentLevel === 'Expert' ? 'bg-green-100 text-green-800' :
                  currentLevel === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                  currentLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentLevel}
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Skill Gaps</h5>
                  <ul className="text-sm space-y-1">
                    {skillGaps.map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Learning Priorities</h4>
                <ul className="space-y-2">
                  {learningPriorities.map((priority, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Development Plan</h4>
                <ul className="space-y-2">
                  {developmentPlan.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-indigo-700 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Management Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Support Needed</h4>
                  <ul className="space-y-1">
                    {supportNeeded.map((support, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{support}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommended Interventions</h4>
                  <ul className="space-y-1">
                    {interventions.map((intervention, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{intervention}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Mentorship Recommendations</h4>
                  <p className="text-gray-700">{mentorshipRecommendations}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Performance Goals</h4>
                  <ul className="space-y-1">
                    {performanceGoals.map((goal, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
};

export default AIAnalytics;