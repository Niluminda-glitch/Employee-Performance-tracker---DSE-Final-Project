// Script to update a user's avatar URL using raw SQL
const db = require('../models');

async function updateUserAvatarWithSQL(userId, avatarUrl) {
  try {
    console.log(`Starting to update avatar for user ${userId} with URL: ${avatarUrl}`);
    
    // Update the avatar URL using raw SQL
    const [result, metadata] = await db.sequelize.query(`
      UPDATE users 
      SET avatar_url = :avatarUrl, updated_at = NOW() 
      WHERE id = :userId
    `, {
      replacements: { userId, avatarUrl },
      type: db.sequelize.QueryTypes.UPDATE
    });
    
    console.log(`SQL update result:`, result);
    console.log(`Rows affected: ${metadata}`);
    
    // Verify the update by fetching the user
    const [user] = await db.sequelize.query(`
      SELECT * FROM users WHERE id = :userId
    `, {
      replacements: { userId },
      type: db.sequelize.QueryTypes.SELECT
    });
    
    if (user) {
      console.log(`Verified avatar URL: ${user.avatar_url}`);
      console.log('Avatar update completed successfully');
    } else {
      console.error(`User with ID ${userId} not found after update`);
    }
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
  console.error('Usage: node update-avatar-sql.js <userId> <avatarUrl>');
  process.exit(1);
}

// Run the function
updateUserAvatarWithSQL(userId, avatarUrl);
