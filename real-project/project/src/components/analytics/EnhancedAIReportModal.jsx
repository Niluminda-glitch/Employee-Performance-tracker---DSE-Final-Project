// src/components/analytics/EnhancedAIReportModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, AlertTriangle, Download, TrendingUp, Users, Target, Brain, BarChart3, Radar } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#8b5cf6', '#ef4444'];

const EnhancedAIReportModal = ({ isOpen, onClose, report, isLoading, error, employeeName }) => {
    const [activeTab, setActiveTab] = useState("overview");

    if (!isOpen) return null;

    const handleDownloadPDF = async () => {
        if (!report) return;

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // Add header with gradient background
            pdf.setFillColor(100, 58, 237); // Purple
            pdf.rect(0, 0, pageWidth, 35, 'F');

            // Add title
            pdf.setFontSize(18);
            pdf.setTextColor(255, 255, 255); // White
            pdf.text(`AI Performance Analysis: ${employeeName}`, pageWidth / 2, 20, { align: 'center' });

            // Add report metadata
            pdf.setFontSize(10);
            pdf.setTextColor(220, 220, 220); // Light gray
            pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });

            let yPos = 50;

            // Add performance overview
            if (report.performanceOverview) {
                pdf.setFontSize(14);
                pdf.setTextColor(0, 0, 0);
                pdf.text('Performance Overview', margin, yPos);
                yPos += 10;

                pdf.setFontSize(10);
                pdf.text(`Overall Score: ${report.performanceOverview.overallScore}%`, margin, yPos);
                yPos += 6;
                pdf.text(`Performance Level: ${report.performanceOverview.performanceLevel}`, margin, yPos);
                yPos += 6;
                pdf.text(`Summary: ${report.performanceOverview.summary}`, margin, yPos, { maxWidth: pageWidth - margin * 2 });
                yPos += 15;
            }

            // Add key insights
            if (report.taskAnalysis) {
                pdf.setFontSize(14);
                pdf.text('Task Analysis', margin, yPos);
                yPos += 10;

                pdf.setFontSize(10);
                report.taskAnalysis.insights.forEach(insight => {
                    pdf.text(`• ${insight}`, margin + 5, yPos, { maxWidth: pageWidth - margin * 2 - 5 });
                    yPos += 6;
                });
                yPos += 10;
            }

            // Add footer
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`EmpTrack AI Analytics - Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            pdf.save(`AI_Analysis_${employeeName.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const renderPerformanceOverview = () => {
        if (!report?.performanceOverview) return null;

        const { overallScore, performanceLevel, summary, keyStrengths, areasForImprovement } = report.performanceOverview;

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
        if (!report?.taskAnalysis) return null;

        const { efficiencyScore, timeManagement, workloadCapacity, insights, recommendations } = report.taskAnalysis;

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

    const renderPredictionsAndDevelopment = () => {
        if (!report?.futurePredictions || !report?.skillDevelopment || !report?.managementInsights) return null;

        const { performanceTrend, expectedGrowth, potentialChallenges, opportunities, sixMonthForecast } = report.futurePredictions;
        const { currentLevel, skillGaps, learningPriorities, developmentPlan } = report.skillDevelopment;
        const { supportNeeded, interventions, mentorshipRecommendations, performanceGoals } = report.managementInsights;

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

    const renderVisualizations = () => {
        if (!report?.visualizationData) return null;

        const { performanceMetrics, skillRadar, trendData } = report.visualizationData;

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
                        <div className="h-56">
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
                            <div className="h-56">
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
                            <div className="h-56">
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl flex-shrink-0">
                            <h3 className="text-xl font-semibold">
                                AI Performance Analysis for {employeeName}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-hidden">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                                    <Loader className="animate-spin text-4xl mb-4 text-indigo-500" />
                                    <p className="text-lg">Generating AI insights, please wait...</p>
                                    <p className="text-sm mt-1">This may take a moment.</p>
                                </div>
                            )}

                            {error && !isLoading && (
                                <div className="p-6">
                                    <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 flex items-center">
                                        <AlertTriangle className="mr-2 w-5 h-5" />
                                        {error}
                                    </div>
                                </div>
                            )}

                            {!isLoading && !error && report && (
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                    <div className="px-6 pt-4 pb-2">
                                        <TabsList className="flex w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 space-x-1">
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

                                    <div className="flex-grow overflow-y-auto px-6 pb-6">
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
                                </Tabs>
                            )}

                            {!isLoading && !error && !report && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                                    No AI report generated yet.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {!isLoading && !error && report && (
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl flex-shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Close
                                </Button>
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EnhancedAIReportModal;
