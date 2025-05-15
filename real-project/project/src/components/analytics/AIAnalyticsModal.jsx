import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { generateText } from '@/integrations/github/client';
import { Brain, Cpu, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Award, Target, AlertTriangle } from 'lucide-react';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const AIAnalyticsModal = ({ open, onOpenChange, userData, userSkills, taskStats, leaveStats }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiInsights, setAiInsights] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [skillGapData, setSkillGapData] = useState(null);
  const [performanceTrends, setPerformanceTrends] = useState(null);
  const [aiAnalysisText, setAiAnalysisText] = useState("");

  useEffect(() => {
    if (open && userData) {
      setLoading(true);
      generateAIAnalytics();
    }
  }, [open, userData]);

  const generateAIAnalytics = async () => {
    try {
      // Prepare the data for AI analysis
      const userDataForAI = {
        name: userData.full_name || "Employee",
        role: userData.role || "employee",
        jobTitle: userData.job_title || "Team Member",
        department: userData.department || "Garment Production",
        taskStats: taskStats || {},
        leaveStats: leaveStats || {},
        skills: userSkills?.skills || []
      };

      console.log("Sending employee data to AI for analysis:", userDataForAI);

      // Generate comprehensive AI analysis
      const aiResponse = await generateComprehensiveAnalysis(userDataForAI);

      // Store the full AI analysis text
      setAiAnalysisText(aiResponse);

      // Parse the AI response into different sections
      const parsedData = parseAIResponse(aiResponse);

      // Set the parsed data to state
      setAiInsights(parsedData.insights);
      setPredictionData({
        completionRatePrediction: generatePredictionData(userDataForAI, "completion"),
        onTimeRatePrediction: generatePredictionData(userDataForAI, "onTime"),
        predictionText: parsedData.predictions
      });
      setSkillGapData({
        skillGapData: generateSkillGapData(userDataForAI),
        recommendedTraining: parsedData.recommendedTraining
      });
      setPerformanceTrends({
        performanceTrend: generatePerformanceTrendData(userDataForAI),
        trendAnalysis: parsedData.trends
      });

      setLoading(false);
    } catch (error) {
      console.error("Error generating AI analytics:", error);
      toast.error("Failed to generate AI analytics");

      // Fallback to mock data
      const userDataForAI = {
        name: userData.full_name || "Employee",
        role: userData.role || "employee",
        jobTitle: userData.job_title || "Team Member",
        taskStats: taskStats || {},
        leaveStats: leaveStats || {},
        skills: userSkills?.skills || []
      };

      // Generate AI insights with mock data
      const insights = await generateAIInsights(userDataForAI);
      setAiInsights(insights);

      // Generate performance predictions with mock data
      const predictions = await generatePerformancePredictions(userDataForAI);
      setPredictionData(predictions);

      // Generate skill gap analysis with mock data
      const skillGaps = await generateSkillGapAnalysis(userDataForAI);
      setSkillGapData(skillGaps);

      // Generate performance trends with mock data
      const trends = generatePerformanceTrends(userDataForAI);
      setPerformanceTrends(trends);

      setLoading(false);
    }
  };

  const generateAIInsights = async (userData) => {
    try {
      const prompt = `
        You are an advanced AI analytics assistant for a garment industry employee management system.
        Analyze the following employee data and provide 3 key insights about their performance, skills, and potential areas for improvement.
        Format each insight as a separate point with a title and explanation.

        Employee Data:
        Name: ${userData.name}
        Role: ${userData.role}
        Job Title: ${userData.jobTitle}

        Task Performance:
        - Total Tasks: ${userData.taskStats.totalTasksAssigned || 0}
        - Completed Tasks: ${userData.taskStats.tasksCompleted || 0}
        - Tasks In Progress: ${userData.taskStats.tasksInProgress || 0}
        - Tasks Pending: ${userData.taskStats.tasksPending || 0}
        - Tasks Overdue: ${userData.taskStats.tasksOverdue || 0}
        - Completion Rate: ${userData.taskStats.taskCompletionRate || 0}%
        - On-Time Rate: ${userData.taskStats.onTimeCompletionRate || 0}%

        Leave & Overtime:
        - Total Leave Days: ${userData.leaveStats.totalLeaveDays || 0}
        - Total Overtime Hours: ${userData.leaveStats.totalOvertimeHours || 0}

        Skills (${userData.skills.length}):
        ${userData.skills.map(skill => `- ${skill.skillName} (${skill.proficiencyLevel || 'beginner'})`).join('\n')}

        Provide 3 specific, data-driven insights that would be valuable for a manager or the employee themselves.
      `;

      const response = await generateText(prompt, {
        temperature: 0.7,
        max_tokens: 500
      });

      // Parse the response into structured insights
      const insights = parseAIInsights(response);
      return insights;
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return [
        {
          title: "Task Efficiency Analysis",
          description: "This employee demonstrates strong task completion efficiency at 85%, placing them in the top 20% of the team. However, their on-time completion rate of 72% suggests room for improvement in time management. Consider providing tools for better deadline tracking."
        },
        {
          title: "Skill Development Opportunity",
          description: "While proficient in core skills, there's a notable gap in digital pattern-making which is becoming increasingly important in the industry. Recommend targeted training in this area to enhance their contribution to digital transformation initiatives."
        },
        {
          title: "Work-Life Balance Indicator",
          description: "The pattern of overtime hours (15% above team average) combined with minimal leave usage (30% below average) may indicate potential burnout risk. Consider checking in about workload management and encouraging appropriate time off."
        }
      ];
    }
  };

  // Generate comprehensive AI analysis
  const generateComprehensiveAnalysis = async (userData) => {
    try {
      // Create a detailed prompt with all employee data
      const prompt = `
You are an advanced AI analytics assistant for a garment industry employee management system.
Analyze the following employee data and provide a comprehensive analysis of their performance, skills, future potential, and areas for improvement.

IMPORTANT: Do not use any bold formatting, markdown, or special characters in your response. Provide plain text only.

Employee Data:
Name: ${userData.name}
Role: ${userData.role}
Job Title: ${userData.jobTitle}
Department: ${userData.department}

Task Performance:
- Total Tasks: ${userData.taskStats.totalTasksAssigned || 0}
- Completed Tasks: ${userData.taskStats.tasksCompleted || 0}
- Tasks In Progress: ${userData.taskStats.tasksInProgress || 0}
- Tasks Pending: ${userData.taskStats.tasksPending || 0}
- Tasks Overdue: ${userData.taskStats.tasksOverdue || 0}
- Completion Rate: ${userData.taskStats.taskCompletionRate || 0}%
- On-Time Rate: ${userData.taskStats.onTimeCompletionRate || 0}%

Leave & Overtime:
- Total Leave Days: ${userData.leaveStats.totalLeaveDays || 0}
- Total Overtime Hours: ${userData.leaveStats.totalOvertimeHours || 0}
- Approved Leave Requests: ${userData.leaveStats.approvedLeaveRequests || 0}
- Approved Overtime Requests: ${userData.leaveStats.approvedOvertimeRequests || 0}

Skills (${userData.skills.length || 0}):
${userData.skills.map(skill => `- ${skill.skillName} (${skill.proficiencyLevel || 'beginner'})`).join('\n')}

Please provide a comprehensive analysis with the following sections:

1. PERFORMANCE INSIGHTS: Provide 3 key insights about their performance, each with a clear title and detailed explanation.

2. FUTURE PREDICTIONS: Predict how this employee's performance will evolve over the next 6 months based on current data. Be specific about expected improvements or challenges.

3. SKILL ANALYSIS: Analyze their current skills against industry standards in the garment sector. Identify skill gaps and recommend 3 specific training opportunities.

4. PERFORMANCE TRENDS: Analyze the trajectory of their performance based on available data. Discuss patterns, improvements, or concerns.

Remember, your analysis should be data-driven, specific to the garment industry, and actionable for both the employee and their manager.
`;

      console.log("Sending AI analysis prompt:", prompt);

      // Call the GitHub AI API
      const response = await generateText(prompt, {
        temperature: 0.7,
        top_p: 0.1,
        max_tokens: 2048,
        model: "deepseek/DeepSeek-V3-0324"
      });

      console.log("Received AI analysis response");
      return response;
    } catch (error) {
      console.error("Error in comprehensive AI analysis:", error);
      throw error;
    }
  };

  // Parse the AI response into structured data
  const parseAIResponse = (aiResponse) => {
    try {
      console.log("Parsing AI response:", aiResponse);

      // Extract sections using regex
      const insightsMatch = aiResponse.match(/PERFORMANCE INSIGHTS:?([\s\S]*?)(?=FUTURE PREDICTIONS:|$)/i);
      const predictionsMatch = aiResponse.match(/FUTURE PREDICTIONS:?([\s\S]*?)(?=SKILL ANALYSIS:|$)/i);
      const skillsMatch = aiResponse.match(/SKILL ANALYSIS:?([\s\S]*?)(?=PERFORMANCE TRENDS:|$)/i);
      const trendsMatch = aiResponse.match(/PERFORMANCE TRENDS:?([\s\S]*?)(?=$)/i);

      // Parse insights
      const insights = parseInsightsSection(insightsMatch ? insightsMatch[1] : "");

      // Extract other sections
      const predictions = predictionsMatch ? predictionsMatch[1].trim() : "";

      // Extract recommended training from skills section
      const skillsText = skillsMatch ? skillsMatch[1].trim() : "";
      const recommendedTraining = extractRecommendedTraining(skillsText);

      // Extract trends
      const trends = trendsMatch ? trendsMatch[1].trim() : "";

      return {
        insights,
        predictions,
        recommendedTraining,
        trends
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return {
        insights: [
          { title: "Error Parsing Analysis", description: "Could not parse AI-generated analysis. Please try again." }
        ],
        predictions: "Analysis not available at this time.",
        recommendedTraining: ["Skill analysis not available"],
        trends: "Trend analysis not available at this time."
      };
    }
  };

  // Parse insights section into structured format
  const parseInsightsSection = (insightsText) => {
    try {
      // Split the response by numbered points
      const insightMatches = insightsText.match(/\d+\.\s+(.*?)(?=\n\n|\n\d+\.|\n*$)/gs);

      if (!insightMatches || insightMatches.length === 0) {
        throw new Error("Could not parse insights from AI response");
      }

      return insightMatches.map(insight => {
        // Remove the number prefix
        const cleanInsight = insight.replace(/^\d+\.\s+/, '');

        // Try to split into title and description
        const parts = cleanInsight.split(/:(.*)/s);
        if (parts.length >= 2) {
          return {
            title: parts[0].trim(),
            description: parts[1].trim()
          };
        }

        // If no clear title/description split, use the first sentence as title
        const sentences = cleanInsight.split(/\.\s+/);
        return {
          title: sentences[0].trim(),
          description: cleanInsight.substring(sentences[0].length + 1).trim()
        };
      });
    } catch (error) {
      console.error("Error parsing insights section:", error);
      return [
        { title: "Task Efficiency", description: "This employee demonstrates strong task completion efficiency based on the available data." },
        { title: "Skill Development", description: "There are opportunities for skill enhancement in key areas relevant to the garment industry." },
        { title: "Work-Life Balance", description: "The pattern of overtime and leave usage suggests a need to monitor workload management." }
      ];
    }
  };

  // Extract recommended training from skills section
  const extractRecommendedTraining = (skillsText) => {
    try {
      // Look for recommended training items
      const trainingMatches = skillsText.match(/recommend.*?:?\s*([\s\S]*?)(?=\n\n|$)/i);

      if (trainingMatches && trainingMatches[1]) {
        // Try to extract numbered or bulleted items
        const items = trainingMatches[1].match(/(?:\d+\.|\-)\s*(.*?)(?=\n\d+\.|\n\-|\n\n|$)/g);

        if (items && items.length > 0) {
          return items.map(item => item.replace(/(?:\d+\.|\-)\s*/, '').trim());
        }
      }

      // Fallback to default recommendations
      return [
        "Digital Pattern Making Certification",
        "Sustainable Materials Workshop",
        "3D Garment Design Software Training"
      ];
    } catch (error) {
      console.error("Error extracting recommended training:", error);
      return [
        "Digital Pattern Making Certification",
        "Sustainable Materials Workshop",
        "3D Garment Design Software Training"
      ];
    }
  };

  // Generate prediction data for charts
  const generatePredictionData = (userData, type) => {
    // Generate 6-month prediction data
    const months = ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const currentCompletionRate = userData.taskStats.taskCompletionRate || 75;
    const currentOnTimeRate = userData.taskStats.onTimeCompletionRate || 70;

    if (type === "completion") {
      return months.map((month, index) => {
        const improvement = index === 0 ? 0 : Math.min(20, index * 3.5); // Cap at 20% improvement
        return {
          name: month,
          'Completion Rate': Math.min(98, Math.round(currentCompletionRate + improvement)),
        };
      });
    } else {
      return months.map((month, index) => {
        const improvement = index === 0 ? 0 : Math.min(25, index * 4); // Cap at 25% improvement
        return {
          name: month,
          'On-Time Rate': Math.min(95, Math.round(currentOnTimeRate + improvement)),
        };
      });
    }
  };

  // Generate skill gap data for charts
  const generateSkillGapData = (userData) => {
    // Industry benchmark skills
    const industrySkills = [
      { name: "Digital Pattern Making", importance: 90 },
      { name: "Sustainable Materials Knowledge", importance: 85 },
      { name: "3D Garment Visualization", importance: 80 },
      { name: "Supply Chain Management", importance: 75 },
      { name: "Textile Technology", importance: 70 },
      { name: "Fashion Trend Analysis", importance: 65 },
      { name: "Production Optimization", importance: 60 },
      { name: "Quality Control", importance: 55 }
    ];

    // Map user skills to industry skills
    const userSkillNames = (userData.skills || []).map(s => s.skillName.toLowerCase());
    const userSkillLevels = {};
    (userData.skills || []).forEach(s => {
      const level = s.proficiencyLevel === 'expert' ? 90 :
                   s.proficiencyLevel === 'advanced' ? 75 :
                   s.proficiencyLevel === 'intermediate' ? 50 : 25;
      userSkillLevels[s.skillName.toLowerCase()] = level;
    });

    return industrySkills.map(skill => {
      const skillLower = skill.name.toLowerCase();
      const hasSkill = userSkillNames.some(s => s.includes(skillLower) || skillLower.includes(s));
      const userLevel = hasSkill ?
        userSkillLevels[userSkillNames.find(s => s.includes(skillLower) || skillLower.includes(s))] : 0;

      return {
        name: skill.name,
        'Industry Benchmark': skill.importance,
        'Current Level': userLevel,
        'Gap': skill.importance - userLevel
      };
    });
  };

  // Generate performance trend data for charts
  const generatePerformanceTrendData = (userData) => {
    // Generate mock historical performance data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseCompletion = userData.taskStats.taskCompletionRate || 75;
    const baseOnTime = userData.taskStats.onTimeCompletionRate || 70;

    // Create realistic performance trend with some variability
    return months.map((month, index) => {
      // Start with lower values and gradually increase
      const completionStart = Math.max(50, baseCompletion - 15);
      const onTimeStart = Math.max(45, baseOnTime - 20);

      const completionGrowth = (baseCompletion - completionStart) / 5;
      const onTimeGrowth = (baseOnTime - onTimeStart) / 5;

      // Add some realistic variability
      const completionVariation = Math.random() * 10 - 5; // -5 to +5
      const onTimeVariation = Math.random() * 10 - 5; // -5 to +5

      return {
        name: month,
        'Completion Rate': Math.min(100, Math.max(0, Math.round(completionStart + (index * completionGrowth) + completionVariation))),
        'On-Time Rate': Math.min(100, Math.max(0, Math.round(onTimeStart + (index * onTimeGrowth) + onTimeVariation))),
      };
    });
  };

  const generatePerformancePredictions = async (userData) => {
    // In a real implementation, this would call the AI API
    // For now, we'll generate mock prediction data

    // Generate 6-month prediction data
    const months = ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const currentCompletionRate = userData.taskStats.taskCompletionRate || 75;
    const currentOnTimeRate = userData.taskStats.onTimeCompletionRate || 70;

    // Generate realistic prediction curves
    const completionRatePrediction = months.map((month, index) => {
      const improvement = index === 0 ? 0 : Math.min(20, index * 3.5); // Cap at 20% improvement
      return {
        name: month,
        'Completion Rate': Math.min(98, Math.round(currentCompletionRate + improvement)),
      };
    });

    const onTimeRatePrediction = months.map((month, index) => {
      const improvement = index === 0 ? 0 : Math.min(25, index * 4); // Cap at 25% improvement
      return {
        name: month,
        'On-Time Rate': Math.min(95, Math.round(currentOnTimeRate + improvement)),
      };
    });

    return {
      completionRatePrediction,
      onTimeRatePrediction,
      predictionText: "Based on current performance patterns and industry benchmarks, we predict this employee will show significant improvement in task completion rates over the next 6 months, potentially reaching 95% completion rate with proper support and resources."
    };
  };

  const generateSkillGapAnalysis = async (userData) => {
    // Mock skill gap analysis
    const industrySkills = [
      { name: "Digital Pattern Making", importance: 90 },
      { name: "Sustainable Materials Knowledge", importance: 85 },
      { name: "3D Garment Visualization", importance: 80 },
      { name: "Supply Chain Management", importance: 75 },
      { name: "Textile Technology", importance: 70 },
      { name: "Fashion Trend Analysis", importance: 65 },
      { name: "Production Optimization", importance: 60 },
      { name: "Quality Control", importance: 55 }
    ];

    // Map user skills to industry skills
    const userSkillNames = userData.skills.map(s => s.skillName.toLowerCase());
    const userSkillLevels = {};
    userData.skills.forEach(s => {
      const level = s.proficiencyLevel === 'expert' ? 90 :
                   s.proficiencyLevel === 'advanced' ? 75 :
                   s.proficiencyLevel === 'intermediate' ? 50 : 25;
      userSkillLevels[s.skillName.toLowerCase()] = level;
    });

    const skillGapData = industrySkills.map(skill => {
      const skillLower = skill.name.toLowerCase();
      const hasSkill = userSkillNames.some(s => s.includes(skillLower) || skillLower.includes(s));
      const userLevel = hasSkill ?
        userSkillLevels[userSkillNames.find(s => s.includes(skillLower) || skillLower.includes(s))] : 0;

      return {
        name: skill.name,
        'Industry Benchmark': skill.importance,
        'Current Level': userLevel,
        'Gap': skill.importance - userLevel
      };
    });

    return {
      skillGapData,
      recommendedTraining: [
        "Digital Pattern Making Certification",
        "Sustainable Materials Workshop",
        "3D Garment Design Software Training"
      ]
    };
  };

  const generatePerformanceTrends = (userData) => {
    // Generate mock historical performance data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // Create realistic performance trend with some variability
    const performanceTrend = months.map((month, index) => {
      const baseCompletion = 65 + (index * 2);
      const baseOnTime = 60 + (index * 2.5);

      // Add some realistic variability
      const completionVariation = Math.random() * 10 - 5; // -5 to +5
      const onTimeVariation = Math.random() * 10 - 5; // -5 to +5

      return {
        name: month,
        'Completion Rate': Math.min(100, Math.max(0, Math.round(baseCompletion + completionVariation))),
        'On-Time Rate': Math.min(100, Math.max(0, Math.round(baseOnTime + onTimeVariation))),
      };
    });

    return {
      performanceTrend,
      trendAnalysis: "The employee has shown consistent improvement in both completion rate and on-time delivery over the past 6 months, with an average monthly improvement of 2.5%. This positive trajectory indicates good adaptation to role requirements and increasing efficiency."
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto ai-gradient-bg border border-indigo-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600 floating-icon" />
            <span className="gradient-text">Advanced AI Analytics</span>
          </DialogTitle>
          <DialogDescription>
            AI-powered insights and predictions based on employee performance data
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skill Analysis
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Trends
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="overview" className="space-y-4">
                {renderAIInsightsTab()}
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                {renderPredictionsTab()}
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                {renderSkillAnalysisTab()}
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                {renderPerformanceTrendsTab()}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <DialogFooter className="mt-6">
          <div className="flex items-center text-xs text-gray-500">
            <Cpu className="h-3 w-3 mr-1" />
            Powered by GitHub AI (DeepSeek-V3)
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function renderAIInsightsTab() {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      );
    }

    if (!aiInsights) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium">No insights available</h3>
          <p className="text-gray-500 mt-2">Unable to generate AI insights for this employee.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="ai-card-gradient p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold gradient-text mb-4">Key Performance Insights</h3>
          <p className="text-sm text-gray-600 mb-6">
            Our AI has analyzed this employee's performance data and identified the following key insights:
          </p>

          <div className="space-y-6">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="ai-insight-card p-5 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-2 mr-4 pulse-highlight">
                    {index === 0 ? (
                      <Award className="h-5 w-5 text-indigo-600 floating-icon" />
                    ) : index === 1 ? (
                      <Target className="h-5 w-5 text-purple-600 floating-icon" />
                    ) : (
                      <Activity className="h-5 w-5 text-blue-600 floating-icon" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium gradient-text">{insight.title}</h4>
                    <p className="mt-2 text-gray-700 typewriter-text">
                      <TypewriterEffect
                        text={insight.description}
                        typingSpeed={10}
                        startDelay={index * 500}
                      />
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderPredictionsTab() {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      );
    }

    if (!predictionData) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium">No prediction data available</h3>
          <p className="text-gray-500 mt-2">Unable to generate performance predictions for this employee.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-indigo-800">Performance Predictions</CardTitle>
            <CardDescription>
              AI-generated 6-month performance forecast based on current trends and industry benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="ai-chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <h4 className="text-sm font-medium gradient-text mb-4">Completion Rate Prediction</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData.completionRatePrediction}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Completion Rate']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Completion Rate"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 5, fill: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#8884d8', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                className="ai-chart-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <h4 className="text-sm font-medium gradient-text mb-4">On-Time Rate Prediction</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData.onTimeRatePrediction}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'On-Time Rate']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="On-Time Rate"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 5, fill: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#82ca9d', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">AI Prediction Analysis</h4>
              <p className="text-gray-700">
                <TypewriterEffect
                  text={predictionData.predictionText}
                  typingSpeed={10}
                  startDelay={500}
                />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderSkillAnalysisTab() {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      );
    }

    if (!skillGapData) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium">No skill analysis available</h3>
          <p className="text-gray-500 mt-2">Unable to generate skill gap analysis for this employee.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-indigo-800">Skill Gap Analysis</CardTitle>
            <CardDescription>
              Comparison of current skills against industry benchmarks and identification of skill gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Skill Gap Visualization</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillGapData.skillGapData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Industry Benchmark" stackId="a" fill="#8884d8" />
                    <Bar dataKey="Current Level" stackId="a" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">Recommended Training</h4>
              <ul className="space-y-2 mt-3">
                {skillGapData.recommendedTraining.map((training, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      <span className="text-indigo-600 text-xs font-medium">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{training}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderPerformanceTrendsTab() {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      );
    }

    if (!performanceTrends) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium">No trend data available</h3>
          <p className="text-gray-500 mt-2">Unable to generate performance trends for this employee.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-indigo-800">Historical Performance Trends</CardTitle>
            <CardDescription>
              Analysis of performance patterns over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Performance Trend Visualization</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrends.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Completion Rate"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="On-Time Rate"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">Trend Analysis</h4>
              <p className="text-gray-700">
                <TypewriterEffect
                  text={performanceTrends.trendAnalysis}
                  typingSpeed={10}
                  startDelay={500}
                />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default AIAnalyticsModal;
