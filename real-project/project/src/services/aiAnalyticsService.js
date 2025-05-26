// src/services/aiAnalyticsService.js
import { generateText } from '../integrations/github/client';

// OpenRouter AI configuration
const modelId = "tngtech/deepseek-r1t-chimera:free";

/**
 * Generate AI-powered employee analysis using OpenRouter AI API
 * @param {Object} employeeData - Comprehensive employee data
 * @returns {Promise<Object>} - Structured AI-generated analysis report
 */
export async function getAIEmployeeAnalysis(employeeData) {

  // Construct a detailed prompt based on employeeData requesting structured JSON response
  const promptContent = `
    You are an advanced AI analytics assistant for a garment industry employee management system.
    Analyze the following employee data and provide a comprehensive structured analysis.

    IMPORTANT: Respond with a valid JSON object only. Do not include any text before or after the JSON.

    Employee Details:
    - Name: ${employeeData.name || 'N/A'}
    - Role/Title: ${employeeData.jobTitle || employeeData.role || 'N/A'}
    - Email: ${employeeData.email || 'N/A'}

    Task Performance:
    - Total Tasks Assigned: ${employeeData.taskStats?.totalTasksAssigned || 0}
    - Tasks Completed: ${employeeData.taskStats?.tasksCompleted || 0}
    - Task Completion Rate: ${employeeData.taskStats?.taskCompletionRate || 0}%
    - On-Time Completion Rate: ${employeeData.taskStats?.onTimeCompletionRate || 0}%
    - Tasks Overdue: ${employeeData.taskStats?.tasksOverdue || 0}
    - Tasks In Progress: ${employeeData.taskStats?.tasksInProgress || 0}
    - Tasks Pending: ${employeeData.taskStats?.tasksPending || 0}

    Leave & Overtime:
    - Total Leave Days: ${employeeData.leaveStats?.totalLeaveDays || 0}
    - Total Overtime Hours: ${employeeData.leaveStats?.totalOvertimeHours || 0}
    - Approved Leave Requests: ${employeeData.leaveStats?.approvedLeaveRequests || 0}
    - Approved Overtime Requests: ${employeeData.leaveStats?.approvedOvertimeRequests || 0}

    Skills:
    ${employeeData.userSkills?.skills?.length > 0
      ? employeeData.userSkills.skills.map(skill => `- ${skill.skillName} (Proficiency: ${skill.proficiencyLevel})`).join('\n    ')
      : '- No skills data available.'
    }

    Respond with a JSON object in this exact structure:
    {
      "performanceOverview": {
        "overallScore": number (0-100),
        "performanceLevel": "Excellent" | "Good" | "Average" | "Needs Improvement",
        "summary": "Brief overall assessment",
        "keyStrengths": ["strength1", "strength2", "strength3"],
        "areasForImprovement": ["area1", "area2", "area3"]
      },
      "taskAnalysis": {
        "efficiencyScore": number (0-100),
        "timeManagement": "Excellent" | "Good" | "Average" | "Poor",
        "workloadCapacity": "High" | "Medium" | "Low",
        "insights": ["insight1", "insight2", "insight3"],
        "recommendations": ["rec1", "rec2", "rec3"]
      },
      "skillDevelopment": {
        "currentLevel": "Expert" | "Advanced" | "Intermediate" | "Beginner",
        "skillGaps": ["gap1", "gap2", "gap3"],
        "learningPriorities": ["priority1", "priority2", "priority3"],
        "developmentPlan": ["step1", "step2", "step3"]
      },
      "futurePredictions": {
        "performanceTrend": "Improving" | "Stable" | "Declining",
        "expectedGrowth": "High" | "Medium" | "Low",
        "potentialChallenges": ["challenge1", "challenge2"],
        "opportunities": ["opportunity1", "opportunity2"],
        "sixMonthForecast": "Detailed prediction for next 6 months"
      },
      "managementInsights": {
        "supportNeeded": ["support1", "support2", "support3"],
        "interventions": ["intervention1", "intervention2"],
        "mentorshipRecommendations": "Mentorship guidance",
        "performanceGoals": ["goal1", "goal2", "goal3"]
      },
      "visualizationData": {
        "performanceMetrics": [
          {"metric": "Task Completion", "current": number, "target": number},
          {"metric": "On-Time Delivery", "current": number, "target": number},
          {"metric": "Quality Score", "current": number, "target": number}
        ],
        "skillRadar": [
          {"skill": "Technical Skills", "level": number},
          {"skill": "Communication", "level": number},
          {"skill": "Problem Solving", "level": number},
          {"skill": "Time Management", "level": number},
          {"skill": "Teamwork", "level": number}
        ],
        "trendData": [
          {"month": "Jan", "performance": number},
          {"month": "Feb", "performance": number},
          {"month": "Mar", "performance": number},
          {"month": "Apr", "performance": number},
          {"month": "May", "performance": number},
          {"month": "Jun", "performance": number}
        ]
      }
    }

    Ensure all data is relevant to the garment industry context and provides actionable insights.
  `;

  try {
    // Use the existing OpenRouter AI client
    const response = await generateText(promptContent, {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2048,
      model: modelId
    });

    // Try to parse JSON response
    try {
      const jsonResponse = JSON.parse(response);
      return jsonResponse;
    } catch (parseError) {
      console.warn("Failed to parse AI response as JSON, using fallback:", parseError);
      return generateStructuredFallbackAnalysis(employeeData);
    }

  } catch (error) {
    console.error("Error calling AI analysis service:", error);

    // Fallback to a structured mock response if API fails
    return generateStructuredFallbackAnalysis(employeeData);
  }
}

/**
 * Generate a structured fallback analysis when AI API is unavailable
 * @param {Object} employeeData - Employee data
 * @returns {Object} - Structured fallback analysis
 */
function generateStructuredFallbackAnalysis(employeeData) {
  const completionRate = employeeData.taskStats?.taskCompletionRate || 0;
  const onTimeRate = employeeData.taskStats?.onTimeCompletionRate || 0;
  const totalTasks = employeeData.taskStats?.totalTasksAssigned || 0;
  const skillsCount = employeeData.userSkills?.skills?.length || 0;

  // Determine performance level
  const performanceLevel = completionRate >= 80 ? 'Excellent' :
                          completionRate >= 60 ? 'Good' :
                          completionRate >= 40 ? 'Average' : 'Needs Improvement';

  const overallScore = Math.min(100, Math.round((completionRate + onTimeRate) / 2));

  return {
    performanceOverview: {
      overallScore: overallScore,
      performanceLevel: performanceLevel,
      summary: `${employeeData.name} demonstrates ${performanceLevel.toLowerCase()} performance with a ${completionRate}% task completion rate and ${onTimeRate}% on-time delivery rate.`,
      keyStrengths: [
        completionRate >= 70 ? 'Consistent task completion above average' : 'Shows potential for improvement',
        skillsCount > 3 ? `Diverse skill set with ${skillsCount} documented skills` : 'Developing skill portfolio',
        employeeData.leaveStats?.totalOvertimeHours > 0 ? 'Demonstrates commitment through overtime work' : 'Maintains good work-life balance'
      ],
      areasForImprovement: [
        onTimeRate < 75 ? 'Time management and deadline adherence' : 'Advanced project management',
        completionRate < 80 ? 'Task completion efficiency' : 'Leadership development',
        skillsCount < 5 ? 'Skill portfolio expansion' : 'Knowledge sharing and mentoring'
      ]
    },
    taskAnalysis: {
      efficiencyScore: completionRate,
      timeManagement: onTimeRate >= 80 ? 'Excellent' : onTimeRate >= 60 ? 'Good' : onTimeRate >= 40 ? 'Average' : 'Poor',
      workloadCapacity: totalTasks > 20 ? 'High' : totalTasks > 10 ? 'Medium' : 'Low',
      insights: [
        `Handled ${totalTasks} tasks with ${completionRate}% completion rate`,
        `${onTimeRate >= 75 ? 'Excellent' : 'Developing'} deadline adherence patterns`,
        `Work quality appears ${completionRate >= 80 ? 'consistently high' : 'satisfactory with room for improvement'}`
      ],
      recommendations: [
        onTimeRate < 75 ? 'Implement time management training and deadline tracking tools' : 'Continue current time management practices',
        completionRate < 80 ? 'Focus on task prioritization and completion strategies' : 'Consider advanced project management responsibilities',
        'Regular performance feedback and goal setting sessions'
      ]
    },
    skillDevelopment: {
      currentLevel: skillsCount > 8 ? 'Expert' : skillsCount > 5 ? 'Advanced' : skillsCount > 2 ? 'Intermediate' : 'Beginner',
      skillGaps: [
        'Advanced garment construction techniques',
        'Digital design and pattern making',
        'Quality control and inspection methods'
      ],
      learningPriorities: [
        'Industry-specific technical skills',
        onTimeRate < 75 ? 'Time management and productivity' : 'Leadership and team coordination',
        'Cross-functional collaboration and communication'
      ],
      developmentPlan: [
        'Enroll in specialized garment industry training programs',
        'Participate in mentorship or coaching sessions',
        'Attend workshops on emerging industry technologies and trends'
      ]
    },
    futurePredictions: {
      performanceTrend: completionRate >= 70 ? 'Improving' : 'Stable',
      expectedGrowth: completionRate >= 70 ? 'High' : completionRate >= 50 ? 'Medium' : 'Low',
      potentialChallenges: [
        onTimeRate < 75 ? 'Meeting tight deadlines consistently' : 'Managing increased responsibilities',
        'Adapting to new technologies and processes'
      ],
      opportunities: [
        completionRate >= 70 ? 'Leadership and mentoring roles' : 'Skill development and training',
        'Cross-departmental collaboration projects'
      ],
      sixMonthForecast: `Expected to ${completionRate >= 70 ? 'achieve 85-90% completion rates with continued support' : 'reach 70-75% completion rates through targeted interventions'}. Key focus areas include ${completionRate < 70 ? 'task prioritization and workflow optimization' : 'advanced skill development and leadership opportunities'}.`
    },
    managementInsights: {
      supportNeeded: [
        completionRate < 70 ? 'Additional training and development resources' : 'Opportunities for advanced responsibilities',
        onTimeRate < 75 ? 'Deadline management support and tools' : 'Autonomy and challenging projects',
        'Regular performance feedback and recognition'
      ],
      interventions: [
        completionRate < 60 ? 'Intensive coaching and skill development programs' : 'Mentorship opportunities and cross-training',
        'Structured goal setting and progress tracking'
      ],
      mentorshipRecommendations: skillsCount > 5 ? 'Consider for mentoring roles and knowledge sharing with junior team members' : 'Pair with experienced mentor for skill development and guidance',
      performanceGoals: [
        `Achieve ${Math.min(95, completionRate + 10)}% task completion rate within 6 months`,
        `Improve on-time delivery to ${Math.min(95, onTimeRate + 10)}%`,
        `Develop ${Math.max(1, 3 - skillsCount)} new industry-relevant skills`
      ]
    },
    visualizationData: {
      performanceMetrics: [
        { metric: "Task Completion", current: completionRate, target: Math.min(95, completionRate + 10) },
        { metric: "On-Time Delivery", current: onTimeRate, target: Math.min(95, onTimeRate + 10) },
        { metric: "Quality Score", current: Math.min(100, completionRate + 5), target: 90 }
      ],
      skillRadar: [
        { skill: "Technical Skills", level: Math.min(100, skillsCount * 15) },
        { skill: "Communication", level: onTimeRate >= 75 ? 80 : 60 },
        { skill: "Problem Solving", level: completionRate >= 70 ? 75 : 55 },
        { skill: "Time Management", level: onTimeRate },
        { skill: "Teamwork", level: employeeData.leaveStats?.totalOvertimeHours > 0 ? 85 : 70 }
      ],
      trendData: [
        { month: "Jan", performance: Math.max(0, completionRate - 15) },
        { month: "Feb", performance: Math.max(0, completionRate - 10) },
        { month: "Mar", performance: Math.max(0, completionRate - 5) },
        { month: "Apr", performance: completionRate },
        { month: "May", performance: Math.min(100, completionRate + 2) },
        { month: "Jun", performance: Math.min(100, completionRate + 5) }
      ]
    }
  };
}
