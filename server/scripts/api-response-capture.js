#!/usr/bin/env node

/**
 * API Response Capture Tool
 * 
 * This script helps capture and save API responses for documentation purposes
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '../docs/api-responses');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Sample API calls with authentication
const sampleCalls = [
  {
    name: 'health-check',
    method: 'GET',
    url: '/health',
    description: 'Health check endpoint',
    requiresAuth: false
  },
  {
    name: 'login',
    method: 'POST',
    url: '/api/auth/login',
    description: 'User login',
    requiresAuth: false,
    data: {
      email: 'demo@example.com',
      password: 'demo123'
    }
  },
  {
    name: 'user-profile',
    method: 'GET',
    url: '/api/users/me',
    description: 'Get current user profile',
    requiresAuth: true
  },
  {
    name: 'departments',
    method: 'GET',
    url: '/api/departments',
    description: 'Get all departments',
    requiresAuth: true
  },
  {
    name: 'skills',
    method: 'GET',
    url: '/api/skills',
    description: 'Get all skills',
    requiresAuth: true
  },
  {
    name: 'my-tasks',
    method: 'GET',
    url: '/api/tasks/my',
    description: 'Get user tasks',
    requiresAuth: true
  },
  {
    name: 'notifications',
    method: 'GET',
    url: '/api/notifications',
    description: 'Get user notifications',
    requiresAuth: true
  }
];

async function makeApiCall(call, token = null) {
  try {
    const config = {
      method: call.method.toLowerCase(),
      url: `${BASE_URL}${call.url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication if required
    if (call.requiresAuth && token) {
      config.headers['x-auth-token'] = token;
    }

    // Add request data for POST requests
    if (call.data) {
      config.data = call.data;
    }

    log(`📡 Making ${call.method} request to ${call.url}...`, 'yellow');
    
    const response = await axios(config);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      call: call
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 'ERROR',
      statusText: error.response?.statusText || error.message,
      headers: error.response?.headers || {},
      data: error.response?.data || { error: error.message },
      call: call
    };
  }
}

function saveResponse(response, filename) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fullFilename = `${timestamp}_${filename}.json`;
  const filepath = path.join(OUTPUT_DIR, fullFilename);
  
  const responseData = {
    metadata: {
      timestamp: new Date().toISOString(),
      endpoint: response.call.url,
      method: response.call.method,
      description: response.call.description,
      status: response.status,
      statusText: response.statusText
    },
    request: {
      url: response.call.url,
      method: response.call.method,
      data: response.call.data || null,
      requiresAuth: response.call.requiresAuth
    },
    response: {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    }
  };
  
  fs.writeFileSync(filepath, JSON.stringify(responseData, null, 2));
  log(`💾 Response saved to: ${fullFilename}`, 'green');
  
  return filepath;
}

function generateMarkdownReport(responses) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_api-responses-report.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  let markdown = `# API Response Capture Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += `**Base URL:** ${BASE_URL}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- **Total Endpoints Tested:** ${responses.length}\n`;
  markdown += `- **Successful Responses:** ${responses.filter(r => r.success).length}\n`;
  markdown += `- **Failed Responses:** ${responses.filter(r => !r.success).length}\n\n`;
  
  markdown += `## Endpoint Details\n\n`;
  
  responses.forEach((response, index) => {
    const status = response.success ? '✅' : '❌';
    markdown += `### ${index + 1}. ${status} ${response.call.method} ${response.call.url}\n\n`;
    markdown += `**Description:** ${response.call.description}\n\n`;
    markdown += `**Status:** ${response.status} ${response.statusText}\n\n`;
    markdown += `**Requires Auth:** ${response.call.requiresAuth ? 'Yes' : 'No'}\n\n`;
    
    if (response.call.data) {
      markdown += `**Request Body:**\n\`\`\`json\n${JSON.stringify(response.call.data, null, 2)}\n\`\`\`\n\n`;
    }
    
    markdown += `**Response:**\n\`\`\`json\n${JSON.stringify(response.data, null, 2)}\n\`\`\`\n\n`;
    markdown += `---\n\n`;
  });
  
  fs.writeFileSync(filepath, markdown);
  log(`📄 Markdown report saved to: ${filename}`, 'green');
  
  return filepath;
}

async function captureAllResponses() {
  log('🚀 Starting API response capture...', 'cyan');
  log(`📁 Output directory: ${OUTPUT_DIR}`, 'blue');
  
  const responses = [];
  let authToken = null;
  
  // First, try to get an auth token
  log('\n🔐 Attempting to get authentication token...', 'cyan');
  const loginResponse = await makeApiCall(sampleCalls.find(c => c.name === 'login'));
  
  if (loginResponse.success && loginResponse.data.token) {
    authToken = loginResponse.data.token;
    log('✅ Authentication token obtained!', 'green');
  } else {
    log('⚠️  Could not obtain auth token. Some endpoints may fail.', 'yellow');
  }
  
  responses.push(loginResponse);
  saveResponse(loginResponse, loginResponse.call.name);
  
  // Test all other endpoints
  log('\n📡 Testing API endpoints...', 'cyan');
  
  for (const call of sampleCalls) {
    if (call.name === 'login') continue; // Already tested
    
    const response = await makeApiCall(call, authToken);
    responses.push(response);
    
    const status = response.success ? '✅' : '❌';
    log(`${status} ${call.method} ${call.url} - ${response.status}`, 
        response.success ? 'green' : 'red');
    
    saveResponse(response, call.name);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate summary report
  log('\n📄 Generating summary report...', 'cyan');
  generateMarkdownReport(responses);
  
  log('\n🎉 API response capture complete!', 'green');
  log(`📁 All files saved to: ${OUTPUT_DIR}`, 'blue');
  
  return responses;
}

async function captureSpecificEndpoint(method, url, data = null) {
  log(`🎯 Capturing specific endpoint: ${method} ${url}`, 'cyan');
  
  const call = {
    name: 'custom',
    method: method.toUpperCase(),
    url: url,
    description: `Custom ${method.toUpperCase()} request`,
    requiresAuth: !url.includes('/auth/') && !url.includes('/health'),
    data: data
  };
  
  // Try to get auth token if needed
  let authToken = null;
  if (call.requiresAuth) {
    const loginCall = sampleCalls.find(c => c.name === 'login');
    const loginResponse = await makeApiCall(loginCall);
    if (loginResponse.success && loginResponse.data.token) {
      authToken = loginResponse.data.token;
    }
  }
  
  const response = await makeApiCall(call, authToken);
  const filepath = saveResponse(response, `custom-${method.toLowerCase()}-${url.replace(/[^a-zA-Z0-9]/g, '-')}`);
  
  log(`✅ Response captured and saved!`, 'green');
  return { response, filepath };
}

function printUsage() {
  log('\n📚 API Response Capture Tool Usage:', 'cyan');
  log('', 'reset');
  log('🔧 Available Commands:', 'bright');
  log('  node scripts/api-response-capture.js                    # Capture all sample endpoints', 'bright');
  log('  node scripts/api-response-capture.js GET /api/users/me  # Capture specific endpoint', 'bright');
  log('  node scripts/api-response-capture.js POST /api/auth/login \'{"email":"test@example.com","password":"test123"}\'', 'bright');
  log('', 'reset');
  log('📁 Output Location:', 'cyan');
  log(`  ${OUTPUT_DIR}`, 'bright');
  log('', 'reset');
  log('📄 Generated Files:', 'cyan');
  log('  • Individual JSON response files', 'bright');
  log('  • Markdown summary report', 'bright');
  log('  • Timestamped for easy organization', 'bright');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Capture all sample endpoints
    await captureAllResponses();
  } else if (args[0] === 'help' || args[0] === '--help') {
    printUsage();
  } else if (args.length >= 2) {
    // Capture specific endpoint
    const method = args[0];
    const url = args[1];
    const data = args[2] ? JSON.parse(args[2]) : null;
    
    await captureSpecificEndpoint(method, url, data);
  } else {
    log('❌ Invalid arguments. Use --help for usage information.', 'red');
    printUsage();
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  captureAllResponses,
  captureSpecificEndpoint,
  makeApiCall,
  saveResponse
};
