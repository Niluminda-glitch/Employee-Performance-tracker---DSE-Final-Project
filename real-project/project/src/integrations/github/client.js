/**
 * GitHub AI API client for text generation
 * This file provides a unified interface for generating AI responses using GitHub's AI API
 */

// GitHub API token
const GITHUB_TOKEN = "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";
const GITHUB_AI_ENDPOINT = "https://models.github.ai/inference";
const MODEL = "deepseek/DeepSeek-V3-0324"; // Updated to use DeepSeek model

/**
 * Generate text using GitHub's AI API
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated text
 */
export const generateText = async (prompt, options = {}) => {
  console.log("Calling GitHub AI API with prompt:", prompt.substring(0, 100) + "...");

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
      { role: "system", content: "You are a helpful assistant for a garment industry employee management system." },
      { role: "user", content: prompt }
    ];

    // Make the API call to GitHub AI
    const response = await fetch(`${GITHUB_AI_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/json',
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
      console.error("GitHub AI API error response:", errorData);

      // Check if it's a rate limit error
      const isRateLimit = response.status === 429 ||
                         (errorData.error?.message && errorData.error.message.includes("Rate limit"));

      if (isRateLimit) {
        console.warn("Rate limit exceeded for GitHub AI API. Using fallback response.");
        // Don't throw, just return the fallback response
        return generateMockResponse(prompt, true);
      }

      throw new Error(`GitHub AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract the generated text from the response
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Unexpected response format from GitHub AI API");
    }
  } catch (error) {
    console.error("Error in GitHub AI API call:", error);
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
    "I'm currently operating with limited connectivity due to API rate limits. " : "";

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

  // Default response
  return rateLimitPrefix + "I'm here to help with information about the EmpTrack application. What would you like to know about employee management, tasks, or analytics?";
};
