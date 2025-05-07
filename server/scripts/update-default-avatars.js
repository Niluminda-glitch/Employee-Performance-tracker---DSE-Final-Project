// Script to update all users with a default avatar URL if they don't have one
const db = require('../models');

async function updateDefaultAvatars() {
  try {
    console.log('Starting to update default avatars for users...');
    
    // Default avatar URL
    const defaultAvatarUrl = "https://i.pinimg.com/originals/7c/e9/e3/7ce9e34927261d3b035090cac779fec5.gif";
    
    // Find all users without an avatar_url
    const users = await db.User.findAll({
      where: {
        avatar_url: null
      }
    });
    
    console.log(`Found ${users.length} users without an avatar URL`);
    
    // Update each user with the default avatar URL
    for (const user of users) {
      user.avatar_url = defaultAvatarUrl;
      await user.save();
      console.log(`Updated user ${user.id} (${user.email}) with default avatar URL`);
    }
    
    console.log('Finished updating default avatars for users');
  } catch (error) {
    console.error('Error updating default avatars:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the function
updateDefaultAvatars();
