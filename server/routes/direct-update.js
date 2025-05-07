// Direct update route for avatar URL
const express = require('express');
const router = express.Router();
const db = require('../models');
const authMiddleware = require('../middleware/auth');

// Direct SQL update for avatar URL
router.post('/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    console.log(`[Direct Update] Updating avatar for user ID: ${userId} with URL: ${avatarUrl}`);

    // Update the avatar URL using raw SQL
    const [result, metadata] = await db.sequelize.query(`
      UPDATE users 
      SET avatar_url = :avatarUrl, updated_at = NOW() 
      WHERE id = :userId
    `, {
      replacements: { userId, avatarUrl },
      type: db.sequelize.QueryTypes.UPDATE
    });

    console.log(`[Direct Update] SQL update result:`, result);
    console.log(`[Direct Update] Rows affected: ${metadata}`);

    // Verify the update by fetching the user
    const [user] = await db.sequelize.query(`
      SELECT * FROM users WHERE id = :userId
    `, {
      replacements: { userId },
      type: db.sequelize.QueryTypes.SELECT
    });

    if (user) {
      console.log(`[Direct Update] Verified avatar URL: ${user.avatar_url}`);
      res.json({ success: true, message: 'Avatar updated successfully', avatar_url: user.avatar_url });
    } else {
      res.status(404).json({ success: false, message: 'User not found after update' });
    }
  } catch (error) {
    console.error('[Direct Update] Error updating user avatar with SQL:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
