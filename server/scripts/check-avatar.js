// Script to check a user's avatar URL in the database
const db = require('../models');

async function checkUserAvatar(userId) {
  try {
    console.log(`Checking avatar for user ${userId}`);
    
    // Fetch the user using Sequelize
    const user = await db.User.findByPk(userId);
    
    if (user) {
      console.log(`User found: ${user.full_name} (${user.email})`);
      console.log(`Current avatar URL: ${user.avatar_url}`);
      return { success: true, user };
    } else {
      console.error(`User with ID ${userId} not found`);
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error checking avatar:', error);
    return { success: false, error: error.message };
  }
}

// Get command line arguments
const userId = process.argv[2] || 'd51f962a-c172-4eba-b65e-d2ba90571d21';

// Run the function
checkUserAvatar(userId)
  .then(result => {
    console.log('Result:', result.success ? 'Success' : 'Failed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
