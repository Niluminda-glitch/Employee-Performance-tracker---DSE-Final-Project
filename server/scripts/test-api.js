// Script to test the API endpoint for updating a user's avatar URL
const axios = require('axios');
const jwt = require('jsonwebtoken');

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

async function testUpdateAvatar(userId, avatarUrl) {
  try {
    console.log(`Testing API endpoint for updating avatar for user ${userId} with URL: ${avatarUrl}`);

    // Create a token for the user
    const token = createToken(userId);

    // Make a request to the API endpoint
    const response = await axios.put(`http://localhost:5000/api/users/${userId}`,
      { avatar_url: avatarUrl },
      { headers: { 'x-auth-token': token } }
    );

    console.log('API response:', response.data);
    console.log('Avatar update test completed successfully');
  } catch (error) {
    console.error('Error testing API endpoint:', error.response?.data || error.message);
  }
}

// Get command line arguments
const userId = process.argv[2];
const avatarUrl = process.argv[3];

if (!userId || !avatarUrl) {
  console.error('Usage: node test-api.js <userId> <avatarUrl>');
  process.exit(1);
}

// Run the function
testUpdateAvatar(userId, avatarUrl);
