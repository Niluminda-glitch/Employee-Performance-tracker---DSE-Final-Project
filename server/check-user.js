// server/check-user.js
require('dotenv').config();
const db = require('./models');
const User = db.User;

async function checkUser() {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Find the user by email
    const user = await User.findOne({
      where: { email: 'lal2@gmail.com' },
      attributes: ['id', 'email', 'full_name', 'role', 'status', 'password']
    });

    if (user) {
      console.log('User found:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Name: ${user.full_name}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Status: ${user.status}`);
      console.log(`- Password hash exists: ${!!user.password}`);
    } else {
      console.log('No user found with email lal2@gmail.com');
    }

    console.log('User check completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking user:', error);
    process.exit(1);
  }
}

checkUser();
