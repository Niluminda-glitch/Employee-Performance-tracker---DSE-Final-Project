// Script to update a specific user's avatar URL
const db = require('../models');

async function updateUserAvatar(userId, avatarUrl) {
  try {
    console.log(`Starting to update avatar for user ${userId} with URL: ${avatarUrl}`);
    
    // Find the user by ID
    const user = await db.User.findByPk(userId);
    
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.email} (${user.full_name})`);
    console.log(`Current avatar URL: ${user.avatar_url}`);
    
    // Update the avatar URL
    user.avatar_url = avatarUrl;
    await user.save();
    
    console.log(`Updated avatar URL for user ${userId} to: ${avatarUrl}`);
    
    // Verify the update
    const updatedUser = await db.User.findByPk(userId);
    console.log(`Verified avatar URL: ${updatedUser.avatar_url}`);
    
    console.log('Avatar update completed successfully');
  } catch (error) {
    console.error('Error updating avatar:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Get command line arguments
const userId = process.argv[2];
const avatarUrl = process.argv[3];

if (!userId || !avatarUrl) {
  console.error('Usage: node update-avatar.js <userId> <avatarUrl>');
  process.exit(1);
}

// Run the function
updateUserAvatar(userId, avatarUrl);
