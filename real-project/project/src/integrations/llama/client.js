/**
 * AI text generation client
 * This file provides a unified interface for generating AI responses using ChatGPT 4.0 Mini API
 */

// ChatGPT API token
const CHATGPT_API_TOKEN = "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";

/**
 * Generate text using ChatGPT 4.0 Mini API
 * @param {string} prompt - The prompt to send to the AI
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated text
 */
export const generateText = async (prompt, options = {}) => {
  console.log("Calling ChatGPT API with prompt:", prompt.substring(0, 100) + "...");

  try {
    // Default options
    const defaultOptions = {
      temperature: 0.7,
      max_tokens: 500,
      model: "gpt-4-mini", // Using ChatGPT 4.0 Mini model
    };

    // Merge default options with provided options
    const apiOptions = { ...defaultOptions, ...options };

    // Make the API call to ChatGPT
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATGPT_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: apiOptions.model,
        messages: [
          { role: "system", content: "You are a helpful assistant for a garment industry employee management system." },
          { role: "user", content: prompt }
        ],
        temperature: apiOptions.temperature,
        max_tokens: apiOptions.max_tokens,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("ChatGPT API error response:", errorData);
      throw new Error(`ChatGPT API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract the generated text from the response
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Unexpected response format from ChatGPT API");
    }
  } catch (error) {
    console.error("Error in ChatGPT API call:", error);
    console.log("Falling back to mock response");

    // If API call fails, fall back to mock response
    return generateMockResponse(prompt);
  }
};

/**
 * Generate a mock response based on the prompt content
 * @param {string} prompt - The prompt that would have been sent to the API
 * @returns {string} - A mock response
 */
export const generateMockResponse = (prompt) => {
  console.log("Generating mock response for prompt");

  // For chatbot context
  if (prompt.includes("EmpTrack application")) {
    // Extract the user's message from the prompt if it exists
    const userMessageMatch = prompt.match(/User's new message: (.+?)(\n|$)/);
    const userMessage = userMessageMatch ? userMessageMatch[1].toLowerCase() : "";

    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      return "Hello! I'm Track AI, your assistant for the EmpTrack application. How can I help you today?";
    } else if (userMessage.includes("task") || userMessage.includes("assignment")) {
      return "Tasks in EmpTrack can be managed through the Employee Dashboard. You can view your active tasks, check deadlines, and mark tasks as complete. If you need help with a specific task, you can also use the Active Task Assistant feature.";
    } else if (userMessage.includes("leave") || userMessage.includes("time off")) {
      return "To request leave or time off, navigate to the Employee Dashboard and use the Leave/Overtime Request feature. Your request will be sent to your supervisor or manager for approval.";
    } else if (userMessage.includes("mentor") || userMessage.includes("skill")) {
      return "The Find Mentor feature allows you to connect with colleagues who have expertise in specific skills. You can search for mentors based on skills you want to develop and send mentorship requests.";
    } else if (userMessage.includes("analytics") || userMessage.includes("performance")) {
      return "Performance analytics are available to supervisors and managers. These include task completion rates, on-time completion percentages, and department performance metrics. Employees can view their individual performance metrics on their dashboard.";
    } else if (userMessage.includes("notification") || userMessage.includes("alert")) {
      return "The notification system keeps you updated on important events like task assignments, deadline reminders, and request approvals. You can view all your notifications in the Notifications section.";
    } else {
      return "I'm currently operating in offline mode. I can still help with general questions about the EmpTrack application. Feel free to ask about tasks, leave requests, mentorship, analytics, or notifications.";
    }
  }

  // For trends context - strategic suggestions
  if (prompt.includes("strategic advisor") || prompt.includes("garment industry") || prompt.includes("suggestions for business growth")) {
    return `1. Invest in Digital Design Training: With the rising demand for digital pattern making and 3D garment design skills, invest in training programs for your design team. This will improve efficiency and reduce material waste in the prototyping phase.

2. Launch a Sustainable Athleisure Line: Combine the two strongest trends - sustainability and athleisure - into a new product line using eco-friendly materials. Market it to environmentally conscious consumers who value both comfort and ethics.

3. Optimize Your E-commerce Experience: As digital shopping continues to grow, enhance your online store with virtual try-on technology and detailed sustainability information for each product to appeal to the modern consumer.`;
  }

  // Default response
  return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
};
