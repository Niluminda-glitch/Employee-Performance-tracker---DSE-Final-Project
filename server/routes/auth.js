// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Adjust path if models folder is elsewhere
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      console.log('[GoogleStrategy] Google profile:', profile.id, profile.emails[0].value);

      // Check if user exists by google_id or email
      let user = await User.findOne({
        where: {
          [User.sequelize.Op.or]: [
            { google_id: profile.id },
            { email: profile.emails[0].value }
          ]
        }
      });

      if (!user) {
        // Create new user if not exists
        console.log('[GoogleStrategy] Creating new user from Google profile');
        user = await User.create({
          email: profile.emails[0].value,
          full_name: profile.displayName,
          google_id: profile.id,
          avatar_url: profile.photos[0]?.value,
          status: 'active',
          role: 'employee' // Default role
        });
      } else if (!user.google_id) {
        // Update existing user with Google ID if they signed up with email/password
        console.log('[GoogleStrategy] Updating existing user with Google ID');
        user.google_id = profile.id;
        user.avatar_url = profile.photos[0]?.value || user.avatar_url;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      console.error('[GoogleStrategy] Error:', error);
      return done(error, null);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// --- Login Route ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // 1. Find user by email using Sequelize model
        const user = await User.findOne({
            where: { email: email }
            // Optionally include associated data if needed immediately after login
            // include: [{ model: db.Department, as: 'userDepartment' }]
        });

        // 2. Check if user exists
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' }); // Use 401 Unauthorized
        }

        // 3. Compare provided password with stored hash
        // Ensure user.password exists (should due to model definition & NOT NULL constraint)
        if (!user.password) {
             console.error(`Login error: User ${email} has no password hash stored.`);
             return res.status(500).json({ message: 'Server error: User account incomplete.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`Login failed: Password mismatch for email ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Check user status (optional but good)
        if (user.status !== 'active') {
             console.log(`Login failed: User ${email} is not active (status: ${user.status})`);
             let message = 'Account is inactive.';
             if (user.status === 'first_login') {
                 message = 'Account requires initial setup/password change.';
             }
             return res.status(403).json({ message: message }); // Use 403 Forbidden for inactive accounts
        }


        // 5. Create JWT Payload
        const payload = {
            user: {
                id: user.id, // User's UUID
                role: user.role // User's role from DB
            }
        };

        // 6. Sign the JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
             console.error("FATAL ERROR: JWT_SECRET is not defined.");
             // Don't leak specific config errors in production
             return res.status(500).json({ message: "Login failed due to server configuration." });
        }

        jwt.sign(
            payload,
            secret,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err);
                    return res.status(500).json({ message: 'Could not generate login session.' });
                }

                // 7. Send Token and User Info back to client
                console.log(`Login successful for user ID: ${user.id}, email: ${email}, role: ${user.role}`);
                res.json({
                    token: token,
                    user: { // Send needed profile info (EXCLUDE password)
                        id: user.id,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        avatar_url: user.avatar_url,
                        department_id: user.department_id, // Send IDs, frontend can fetch details if needed
                        supervisor_id: user.supervisor_id
                        // Include other relevant fields from your public.users model
                    }
                });
            }
        );

    } catch (error) {
        console.error('Login process error:', error);
        res.status(500).json({ message: 'Server error during login attempt' });
    }
});

// --- First-Time Password Setup Route ---
// POST /api/auth/first-time-setup
router.post('/first-time-setup', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    console.log(`First-time password setup attempt for email: ${email}`);

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Email, current password, and new password are required' });
    }

    try {
        // 1. Find user by email
        let user = await User.findOne({
            where: { email: email }
        });

        // 2. Check if user exists
        if (!user) {
            console.log(`First-time setup failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Verify current password
        if (!user.password) {
            console.error(`First-time setup error: User ${email} has no password hash stored.`);
            return res.status(500).json({ message: 'Server error: User account incomplete.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log(`First-time setup failed: Password mismatch for email ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Check if user status is 'first_login'
        if (user.status !== 'first_login') {
            console.log(`First-time setup failed: User ${email} is not in first_login status (status: ${user.status})`);
            return res.status(403).json({ message: 'Account is not in first-time login status' });
        }

        // 5. Update password and status
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Use direct SQL update to avoid Sequelize timestamp issues
            // This bypasses the trigger that's causing the problem
            await User.sequelize.query(
                `UPDATE users SET password = $1, status = $2, updated_at = NOW() WHERE id = $3`,
                {
                    bind: [hashedPassword, 'active', user.id],
                    type: User.sequelize.QueryTypes.UPDATE
                }
            );

            // Refresh user data
            user = await User.findOne({ where: { email: email } });

            console.log(`Password and status updated successfully for user ${email}`);
        } catch (updateError) {
            console.error('Error updating user password and status:', updateError);
            return res.status(500).json({ message: 'Failed to update password. Please try again.' });
        }

        // 6. Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // 7. Sign the JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("FATAL ERROR: JWT_SECRET is not defined.");
            return res.status(500).json({ message: "Setup failed due to server configuration." });
        }

        jwt.sign(
            payload,
            secret,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err);
                    return res.status(500).json({ message: 'Could not generate login session.' });
                }

                // 8. Send Token and User Info back to client
                console.log(`First-time setup successful for user ID: ${user.id}, email: ${email}, role: ${user.role}`);
                res.json({
                    token: token,
                    user: {
                        id: user.id,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                        avatar_url: user.avatar_url,
                        department_id: user.department_id,
                        supervisor_id: user.supervisor_id
                    }
                });
            }
        );

    } catch (error) {
        console.error('First-time setup process error:', error);
        res.status(500).json({ message: 'Server error during first-time setup attempt' });
    }
});

// --- Google OAuth Routes ---
// GET /api/auth/google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    try {
        // Generate JWT token
        const payload = {
            user: {
                id: req.user.id,
                role: req.user.role
            }
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("FATAL ERROR: JWT_SECRET is not defined.");
            return res.status(500).send("Server configuration error");
        }

        jwt.sign(
            payload,
            secret,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) {
                    console.error('Error signing JWT:', err);
                    return res.redirect('/auth?error=token_error');
                }

                // Redirect to frontend with token
                console.log(`Google login successful for user ID: ${req.user.id}, email: ${req.user.email}`);

                // Create a URL-safe base64 encoded token
                const encodedToken = Buffer.from(JSON.stringify({
                    token,
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        full_name: req.user.full_name,
                        role: req.user.role,
                        status: req.user.status,
                        avatar_url: req.user.avatar_url
                    }
                })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

                // Redirect to frontend auth callback page with the encoded data
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?data=${encodedToken}`);
            }
        );
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect('/auth?error=server_error');
    }
});

module.exports = router;
