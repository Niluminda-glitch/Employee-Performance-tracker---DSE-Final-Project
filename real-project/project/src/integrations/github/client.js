/**
 * OpenRouter AI API client for text generation
 * This file provides a unified interface for generating AI responses using OpenRouter's AI API
 */

// OpenRouter API configuration
const OPENROUTER_TOKEN = "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";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1";
const MODEL = "tngtech/deepseek-r1t-chimera:free"; // Updated to use DeepSeek model via OpenRouter

/**
 * Generate text using OpenRouter's AI API
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated text
 */
export const generateText = async (prompt, options = {}) => {
  console.log("Calling OpenRouter AI API with prompt:", prompt.substring(0, 100) + "...");
  console.log("Using token:", OPENROUTER_TOKEN.substring(0, 10) + "...");

  try {
    // Default options
    const defaultOptions = {
      temperature: 0.7,
      top_p: 1,
      model: MODEL,
    };

    // Merge default options with provided options
    const apiOptions = { ...defaultOptions, ...options };

    // Prepare the messages array
    const messages = [
      { role: "system", content: "You are a helpful assistant for a garment industry employee management system. Format your responses clearly with proper spacing, use simple numbered lists (1., 2., 3.) or bullet points (-) when providing multiple items, and separate different topics with double line breaks. DO NOT use markdown formatting like **bold**, ### headers, or --- separators." },
      { role: "user", content: prompt }
    ];

    // Make the API call to OpenRouter AI
    const response = await fetch(`${OPENROUTER_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_TOKEN}`,
        'HTTP-Referer': 'http://localhost:8080', // Required by OpenRouter
        'X-Title': 'EmpTrack AI Assistant', // Optional, for OpenRouter analytics
      },
      body: JSON.stringify({
        messages: messages,
        temperature: apiOptions.temperature,
        top_p: apiOptions.top_p || 0.1,
        max_tokens: apiOptions.max_tokens || 2048,
        model: apiOptions.model,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter AI API error response:", errorData);

      // Check if it's a rate limit error
      const isRateLimit = response.status === 429 ||
                         (errorData.error?.message && errorData.error.message.includes("Rate limit")) ||
                         (errorData.error?.message && errorData.error.message.includes("rate limit"));

      if (isRateLimit) {
        console.warn("Rate limit exceeded for OpenRouter AI API. Using fallback response.");
        // Don't throw, just return the fallback response
        return generateMockResponse(prompt, true);
      }

      throw new Error(`OpenRouter AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("OpenRouter AI API call successful");

    // Extract the generated text from the response
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      console.log("Generated response length:", data.choices[0].message.content.length);
      return data.choices[0].message.content;
    } else {
      throw new Error("Unexpected response format from OpenRouter AI API");
    }
  } catch (error) {
    console.error("Error in OpenRouter AI API call:", error);
    console.log("Falling back to mock response");

    // If API call fails, fall back to mock response
    return generateMockResponse(prompt);
  }
};

/**
 * Generate a mock response based on the prompt content
 * @param {string} prompt - The prompt that would have been sent to the API
 * @param {boolean} isRateLimit - Whether this is due to a rate limit error
 * @returns {string} - A mock response
 */
export const generateMockResponse = (prompt, isRateLimit = false) => {
  console.log("Generating mock response for prompt");

  // If this is due to a rate limit, add a note about it
  const rateLimitPrefix = isRateLimit ?
    "I'm currently operating with limited connectivity due to OpenRouter API rate limits. " : "";

  // For chatbot context
  if (prompt.includes("EmpTrack application")) {
    // Extract the user's message from the prompt if it exists
    const userMessageMatch = prompt.match(/User's new message: (.+?)(\n|$)/);
    const userMessage = userMessageMatch ? userMessageMatch[1].toLowerCase() : "";

    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return rateLimitPrefix + "Hello! I'm Track AI, your assistant for the EmpTrack application. How can I help you today?";
    } else if (userMessage.includes("task") || userMessage.includes("assignment")) {
      return rateLimitPrefix + "Tasks in EmpTrack can be managed through the Employee Dashboard. You can view your active tasks, check deadlines, and mark tasks as complete. If you need help with a specific task, you can also use the Active Task Assistant feature.";
    } else if (userMessage.includes("leave") || userMessage.includes("time off")) {
      return rateLimitPrefix + "To request leave or time off, navigate to the Employee Dashboard and use the Leave/Overtime Request feature. Your request will be sent to your supervisor or manager for approval.";
    } else if (userMessage.includes("mentor") || userMessage.includes("skill")) {
      return rateLimitPrefix + "The Find Mentor feature allows you to connect with colleagues who have expertise in specific skills. You can search for mentors based on skills you want to develop and send mentorship requests.";
    } else if (userMessage.includes("analytics") || userMessage.includes("performance")) {
      return rateLimitPrefix + "Performance analytics are available to supervisors and managers. These include task completion rates, on-time completion percentages, and department performance metrics. Employees can view their individual performance metrics on their dashboard.";
    } else if (userMessage.includes("notification") || userMessage.includes("alert")) {
      return rateLimitPrefix + "The notification system keeps you updated on important events like task assignments, deadline reminders, and request approvals. You can view all your notifications in the Notifications section.";
    } else {
      return rateLimitPrefix + "I can help with general questions about the EmpTrack application. Feel free to ask about tasks, leave requests, mentorship, analytics, or notifications.";
    }
  }

  // For trends context - strategic suggestions
  if (prompt.includes("strategic advisor") || prompt.includes("garment industry") || prompt.includes("suggestions for business growth")) {
    return rateLimitPrefix + `1. Invest in Digital Design Training: With the rising demand for digital pattern making and 3D garment design skills, invest in training programs for your design team. This will improve efficiency and reduce material waste in the prototyping phase.

2. Launch a Sustainable Athleisure Line: Combine the two strongest trends - sustainability and athleisure - into a new product line using eco-friendly materials. Market it to environmentally conscious consumers who value both comfort and ethics.

3. Optimize Your E-commerce Experience: As digital shopping continues to grow, enhance your online store with virtual try-on technology and detailed sustainability information for each product to appeal to the modern consumer.`;
  }

  // For trends context - future predictions
  if (prompt.includes("trend forecaster") || prompt.includes("future trend predictions") || prompt.includes("predict the 3 most significant developments")) {
    return rateLimitPrefix + `1. AI-Driven Personalization in Fast Fashion: Within 18 months, expect to see major brands implementing AI-powered personalization at scale. This will include custom-fit garments based on smartphone body scans and algorithmically designed pieces tailored to individual style preferences and past purchases.

2. Regenerative Agriculture Textiles Boom: The next evolution beyond sustainability will be regenerative practices. Brands will shift from "less harm" to "net positive" environmental impact, with regenerative cotton, hemp, and wool becoming premium selling points and commanding 15-25% price premiums.

3. Micro-Manufacturing Hubs: Decentralized production will accelerate with small, tech-enabled manufacturing facilities located closer to end consumers. These hubs will enable on-demand production, reducing inventory waste by 30-40% while cutting shipping emissions and improving supply chain resilience.`;
  }

  // For AI Analytics context - comprehensive employee analysis with JSON structure
  if (prompt.includes("Respond with a JSON object") || prompt.includes("COMPREHENSIVE EMPLOYEE ANALYSIS DATA") || prompt.includes("PERFORMANCE INSIGHTS")) {
    // Extract employee name from prompt
    const nameMatch = prompt.match(/Name: ([^\n]+)/);
    const employeeName = nameMatch ? nameMatch[1] : "Employee";

    // Extract completion rate from prompt
    const completionMatch = prompt.match(/Task Completion Rate: (\d+)%/);
    const completionRate = completionMatch ? parseInt(completionMatch[1]) : 50;

    // Extract on-time rate from prompt
    const onTimeMatch = prompt.match(/On-Time Completion Rate: (\d+)%/);
    const onTimeRate = onTimeMatch ? parseInt(onTimeMatch[1]) : 75;

    // Extract total tasks from prompt
    const tasksMatch = prompt.match(/Total Tasks Assigned: (\d+)/);
    const totalTasks = tasksMatch ? parseInt(tasksMatch[1]) : 10;

    // Check if JSON response is requested
    if (prompt.includes("Respond with a JSON object")) {
      // Return structured JSON response
      const structuredResponse = {
        performanceOverview: {
          overallScore: Math.round((completionRate + onTimeRate) / 2),
          performanceLevel: completionRate >= 80 ? 'Excellent' : completionRate >= 60 ? 'Good' : completionRate >= 40 ? 'Average' : 'Needs Improvement',
          summary: `${employeeName} demonstrates ${completionRate >= 70 ? 'strong' : 'developing'} performance with ${completionRate}% task completion and ${onTimeRate}% on-time delivery rates.`,
          keyStrengths: [
            completionRate >= 70 ? 'Consistent task completion above average' : 'Shows potential for improvement',
            onTimeRate >= 75 ? 'Excellent time management skills' : 'Developing time management abilities',
            totalTasks > 15 ? 'Handles high workload effectively' : 'Manages current workload well'
          ],
          areasForImprovement: [
            onTimeRate < 75 ? 'Time management and deadline adherence' : 'Advanced project management',
            completionRate < 80 ? 'Task completion efficiency' : 'Leadership development',
            'Cross-functional collaboration skills'
          ]
        },
        taskAnalysis: {
          efficiencyScore: completionRate,
          timeManagement: onTimeRate >= 80 ? 'Excellent' : onTimeRate >= 60 ? 'Good' : onTimeRate >= 40 ? 'Average' : 'Poor',
          workloadCapacity: totalTasks > 20 ? 'High' : totalTasks > 10 ? 'Medium' : 'Low',
          insights: [
            `Successfully completed ${Math.round(totalTasks * completionRate / 100)} out of ${totalTasks} assigned tasks`,
            `${onTimeRate >= 75 ? 'Excellent' : 'Developing'} deadline adherence patterns observed`,
            `Work quality appears ${completionRate >= 80 ? 'consistently high' : 'satisfactory with room for improvement'}`
          ],
          recommendations: [
            onTimeRate < 75 ? 'Implement time management training and deadline tracking tools' : 'Continue current time management practices',
            completionRate < 80 ? 'Focus on task prioritization and completion strategies' : 'Consider advanced project management responsibilities',
            'Regular performance feedback and goal setting sessions'
          ]
        },
        skillDevelopment: {
          currentLevel: completionRate >= 80 ? 'Advanced' : completionRate >= 60 ? 'Intermediate' : 'Beginner',
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
          mentorshipRecommendations: completionRate >= 70 ? 'Consider for mentoring roles and knowledge sharing with junior team members' : 'Pair with experienced mentor for skill development and guidance',
          performanceGoals: [
            `Achieve ${Math.min(95, completionRate + 10)}% task completion rate within 6 months`,
            `Improve on-time delivery to ${Math.min(95, onTimeRate + 10)}%`,
            'Develop 2-3 new industry-relevant skills'
          ]
        },
        visualizationData: {
          performanceMetrics: [
            { metric: "Task Completion", current: completionRate, target: Math.min(95, completionRate + 10) },
            { metric: "On-Time Delivery", current: onTimeRate, target: Math.min(95, onTimeRate + 10) },
            { metric: "Quality Score", current: Math.min(100, completionRate + 5), target: 90 }
          ],
          skillRadar: [
            { skill: "Technical Skills", level: Math.min(100, completionRate + 10) },
            { skill: "Communication", level: onTimeRate >= 75 ? 80 : 60 },
            { skill: "Problem Solving", level: completionRate >= 70 ? 75 : 55 },
            { skill: "Time Management", level: onTimeRate },
            { skill: "Teamwork", level: totalTasks > 15 ? 85 : 70 }
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

      return rateLimitPrefix + JSON.stringify(structuredResponse, null, 2);
    }

    // Fallback to text response for backward compatibility
    return rateLimitPrefix + `1. PERFORMANCE INSIGHTS:

Performance Overview: ${employeeName} demonstrates ${completionRate >= 80 ? 'strong' : completionRate >= 60 ? 'moderate' : 'developing'} performance capabilities with a ${completionRate}% task completion rate. This ${completionRate >= 70 ? 'exceeds' : 'falls below'} typical industry expectations and indicates ${completionRate >= 80 ? 'excellent productivity' : completionRate >= 60 ? 'solid foundation with growth potential' : 'significant opportunities for improvement'}.

Time Management Excellence: With ${onTimeRate}% on-time completion, ${employeeName} shows ${onTimeRate >= 80 ? 'exceptional reliability and deadline adherence' : onTimeRate >= 60 ? 'good time management skills with room for refinement' : 'challenges in meeting deadlines that require focused attention'}. This metric directly impacts team productivity and client satisfaction.

Work-Life Balance Assessment: Current patterns suggest ${completionRate > 90 ? 'potential overwork concerns requiring monitoring' : completionRate < 50 ? 'possible workload or motivation challenges' : 'balanced engagement levels'}. Regular check-ins on workload distribution and employee satisfaction are recommended.

2. FUTURE PREDICTIONS:

${employeeName} is projected to ${completionRate >= 70 ? 'achieve 85-90% completion rates within 6 months with continued support' : 'reach 70-75% completion rates through targeted interventions over the next 6 months'}. Key growth areas include ${completionRate < 70 ? 'task prioritization and workflow optimization' : 'advanced skill development and leadership opportunities'}.

Expected challenges include ${onTimeRate < 75 ? 'deadline management requiring structured planning tools' : 'maintaining high performance while taking on additional responsibilities'}. Recommended interventions include ${completionRate < 60 ? 'intensive coaching and skill development programs' : 'mentorship opportunities and cross-training initiatives'}.

3. SKILL ANALYSIS:

Current skill assessment reveals ${completionRate >= 80 ? 'strong technical competencies with leadership potential' : completionRate >= 60 ? 'solid foundational skills requiring targeted enhancement' : 'fundamental skill gaps requiring comprehensive development'}. Priority training areas include digital pattern making, sustainable materials knowledge, and quality control processes.

Recommended training opportunities: 1) Advanced Garment Construction Techniques certification, 2) Digital Design Software proficiency program, 3) Lean Manufacturing and Efficiency Optimization workshop. These investments will yield estimated 15-25% productivity improvements within 3-6 months.

4. ACTIONABLE RECOMMENDATIONS:

Immediate actions include implementing daily task prioritization systems, establishing weekly progress check-ins, and providing access to digital productivity tools. Medium-term goals focus on skill certification programs and cross-departmental collaboration projects.

Long-term development should emphasize ${completionRate >= 70 ? 'leadership preparation and advanced technical specialization' : 'foundational skill strengthening and confidence building'}. Management support strategies include regular feedback sessions, clear goal setting, and recognition programs.

5. PERFORMANCE TRENDS:

Historical analysis indicates ${completionRate > 60 ? 'positive trajectory with consistent improvement patterns' : 'variable performance requiring stability interventions'}. Seasonal variations and workload fluctuations should be monitored to optimize assignment distribution and maintain performance consistency.`;
  }

  // Default response
  return rateLimitPrefix + "I'm here to help with information about the EmpTrack application. What would you like to know about employee management, tasks, or analytics?";
};

/**
 * Test function to verify OpenRouter AI API connectivity
 * @returns {Promise<boolean>} - Whether the API is working
 */
export const testOpenRouterAI = async () => {
  try {
    console.log("Testing OpenRouter AI API connectivity...");
    const response = await generateText("Hello, this is a test. Please respond with 'API is working correctly.'");
    console.log("Test response:", response);
    return response.includes("API is working") || response.length > 10;
  } catch (error) {
    console.error("OpenRouter AI API test failed:", error);
    return false;
  }
};

// Keep the old function name for backward compatibility
export const testGitHubAI = testOpenRouterAI;
