// Script to debug the authentication middleware
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Create a JWT token for testing
const createToken = (userId) => {
  const payload = {
    user: {
      id: userId,
      role: 'supervisor'
    }
  };
  
  return jwt.sign(payload, 'emptrack_jwt_secret_key_for_development_only_change_in_production', { expiresIn: '1h' });
};

// Function to test the authentication middleware
async function testAuth(userId) {
  try {
    console.log(`Testing authentication for user ${userId}`);
    
    // Create a token for the user
    const token = createToken(userId);
    
    // Make a request to the API endpoint
    const response = await axios.get(`http://localhost:5000/api/users/me`, {
      headers: { 'x-auth-token': token }
    });
    
    console.log('API response:', response.data);
    console.log('Authentication test completed successfully');
    
    return response.data;
  } catch (error) {
    console.error('Error testing authentication:', error.response?.data || error.message);
    return null;
  }
}

// Function to test updating the avatar
async function testUpdateAvatar(userId, avatarUrl) {
  try {
    console.log(`Testing avatar update for user ${userId} with URL: ${avatarUrl}`);
    
    // First, authenticate to get the user data
    const userData = await testAuth(userId);
    
    if (!userData) {
      console.error('Authentication failed, cannot update avatar');
      return;
    }
    
    // Create a token for the user
    const token = createToken(userId);
    
    // Make a request to update the avatar
    const response = await axios.put(`http://localhost:5000/api/users/${userId}`, 
      { avatar_url: avatarUrl },
      { headers: { 'x-auth-token': token } }
    );
    
    console.log('Avatar update response:', response.data);
    console.log('Avatar update test completed successfully');
  } catch (error) {
    console.error('Error updating avatar:', error.response?.data || error.message);
  }
}

// Get command line arguments
const userId = process.argv[2];
const avatarUrl = process.argv[3];

if (!userId) {
  console.error('Usage: node debug-auth.js <userId> [<avatarUrl>]');
  process.exit(1);
}

// If avatarUrl is provided, test updating the avatar
if (avatarUrl) {
  testUpdateAvatar(userId, avatarUrl);
} else {
  // Otherwise, just test authentication
  testAuth(userId);
}
