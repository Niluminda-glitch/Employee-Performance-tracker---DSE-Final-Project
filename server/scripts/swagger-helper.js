#!/usr/bin/env node

/**
 * Swagger Documentation Helper Script
 * 
 * This script provides utilities for managing Swagger documentation
 * for the EmpTrack API.
 */

const fs = require('fs');
const path = require('path');
const { specs } = require('../swagger');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader() {
  log('', 'cyan');
  log('╔══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    📚 Swagger Helper Tool                    ║', 'cyan');
  log('║                  EmpTrack API Documentation                  ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════╝', 'cyan');
  log('', 'reset');
}

function validateSwaggerSpec() {
  log('🔍 Validating Swagger specification...', 'yellow');
  
  try {
    // Check if specs object is valid
    if (!specs || typeof specs !== 'object') {
      throw new Error('Invalid Swagger specification object');
    }
    
    // Check required OpenAPI fields
    const required = ['openapi', 'info', 'paths'];
    for (const field of required) {
      if (!specs[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Count endpoints
    const pathCount = Object.keys(specs.paths || {}).length;
    const schemaCount = Object.keys(specs.components?.schemas || {}).length;
    
    log('✅ Swagger specification is valid!', 'green');
    log(`   📊 Found ${pathCount} API endpoints`, 'green');
    log(`   📋 Found ${schemaCount} data schemas`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Validation failed: ${error.message}`, 'red');
    return false;
  }
}

function generateSpecFile() {
  log('📄 Generating OpenAPI specification file...', 'yellow');
  
  try {
    const outputPath = path.join(__dirname, '../docs/openapi.json');
    const specJson = JSON.stringify(specs, null, 2);
    
    fs.writeFileSync(outputPath, specJson);
    
    log(`✅ Specification saved to: ${outputPath}`, 'green');
    log(`   📏 File size: ${(specJson.length / 1024).toFixed(2)} KB`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Failed to generate spec file: ${error.message}`, 'red');
    return false;
  }
}

function analyzeEndpoints() {
  log('🔍 Analyzing API endpoints...', 'yellow');
  
  const paths = specs.paths || {};
  const analysis = {
    total: 0,
    byMethod: {},
    byTag: {},
    authenticated: 0,
    public: 0
  };
  
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, spec] of Object.entries(methods)) {
      if (typeof spec === 'object' && spec.summary) {
        analysis.total++;
        
        // Count by method
        const upperMethod = method.toUpperCase();
        analysis.byMethod[upperMethod] = (analysis.byMethod[upperMethod] || 0) + 1;
        
        // Count by tag
        const tags = spec.tags || ['Untagged'];
        for (const tag of tags) {
          analysis.byTag[tag] = (analysis.byTag[tag] || 0) + 1;
        }
        
        // Count authentication
        if (spec.security && spec.security.length > 0) {
          analysis.authenticated++;
        } else {
          analysis.public++;
        }
      }
    }
  }
  
  log('📊 Endpoint Analysis:', 'cyan');
  log(`   Total endpoints: ${analysis.total}`, 'bright');
  log(`   🔒 Authenticated: ${analysis.authenticated}`, 'green');
  log(`   🌐 Public: ${analysis.public}`, 'blue');
  
  log('\n📈 By HTTP Method:', 'cyan');
  for (const [method, count] of Object.entries(analysis.byMethod)) {
    log(`   ${method}: ${count}`, 'bright');
  }
  
  log('\n🏷️  By Category:', 'cyan');
  for (const [tag, count] of Object.entries(analysis.byTag)) {
    log(`   ${tag}: ${count}`, 'bright');
  }
}

function checkDocumentationCoverage() {
  log('📋 Checking documentation coverage...', 'yellow');
  
  const paths = specs.paths || {};
  const issues = [];
  
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, spec] of Object.entries(methods)) {
      if (typeof spec === 'object') {
        const endpoint = `${method.toUpperCase()} ${path}`;
        
        // Check for required documentation fields
        if (!spec.summary) {
          issues.push(`${endpoint}: Missing summary`);
        }
        if (!spec.description) {
          issues.push(`${endpoint}: Missing description`);
        }
        if (!spec.responses) {
          issues.push(`${endpoint}: Missing responses`);
        }
        if (!spec.tags || spec.tags.length === 0) {
          issues.push(`${endpoint}: Missing tags`);
        }
        
        // Check for examples in request bodies
        if (spec.requestBody && spec.requestBody.content) {
          const content = spec.requestBody.content;
          for (const [mediaType, mediaSpec] of Object.entries(content)) {
            if (!mediaSpec.example && !mediaSpec.examples) {
              issues.push(`${endpoint}: Missing request example for ${mediaType}`);
            }
          }
        }
      }
    }
  }
  
  if (issues.length === 0) {
    log('✅ Documentation coverage is excellent!', 'green');
  } else {
    log(`⚠️  Found ${issues.length} documentation issues:`, 'yellow');
    issues.slice(0, 10).forEach(issue => {
      log(`   • ${issue}`, 'yellow');
    });
    if (issues.length > 10) {
      log(`   ... and ${issues.length - 10} more`, 'yellow');
    }
  }
}

function printUsageInfo() {
  log('🚀 Quick Start Guide:', 'cyan');
  log('   1. Start the server: npm start', 'bright');
  log('   2. Open Swagger UI: http://localhost:5000/api-docs', 'bright');
  log('   3. Get JSON spec: http://localhost:5000/api-docs.json', 'bright');
  log('', 'reset');
  
  log('📁 Documentation Files:', 'cyan');
  log('   • server/swagger.js - Main configuration', 'bright');
  log('   • server/docs/swagger.yaml - Endpoint definitions', 'bright');
  log('   • server/docs/README.md - Documentation guide', 'bright');
  log('   • server/docs/openapi.json - Generated spec (if created)', 'bright');
  log('', 'reset');
  
  log('🔧 Available Commands:', 'cyan');
  log('   node scripts/swagger-helper.js validate', 'bright');
  log('   node scripts/swagger-helper.js generate', 'bright');
  log('   node scripts/swagger-helper.js analyze', 'bright');
  log('   node scripts/swagger-helper.js coverage', 'bright');
  log('   node scripts/swagger-helper.js help', 'bright');
}

function main() {
  const command = process.argv[2];
  
  printHeader();
  
  switch (command) {
    case 'validate':
      validateSwaggerSpec();
      break;
      
    case 'generate':
      if (validateSwaggerSpec()) {
        generateSpecFile();
      }
      break;
      
    case 'analyze':
      analyzeEndpoints();
      break;
      
    case 'coverage':
      checkDocumentationCoverage();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      printUsageInfo();
      break;
      
    default:
      log('🎯 Running full documentation check...', 'cyan');
      log('', 'reset');
      
      validateSwaggerSpec();
      log('', 'reset');
      
      analyzeEndpoints();
      log('', 'reset');
      
      checkDocumentationCoverage();
      log('', 'reset');
      
      printUsageInfo();
      break;
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  validateSwaggerSpec,
  generateSpecFile,
  analyzeEndpoints,
  checkDocumentationCoverage
};
