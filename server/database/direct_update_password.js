// Script to directly update the password in the database
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Function to generate SQL script
async function generateSqlScript() {
  try {
    // Generate a new hash
    const plainPassword = 'kavishka';
    console.log('Generating a new hash for password:', plainPassword);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('New hash:', hashedPassword);

    // Create SQL script
    const sql = `-- SQL script to update password for kavishka@emptrack.test
UPDATE public.users
SET password = '${hashedPassword}'
WHERE email = 'kavishka@emptrack.test';
`;

    // Write SQL script to file
    const sqlFilePath = path.join(__dirname, 'update_password_manual.sql');
    fs.writeFileSync(sqlFilePath, sql);
    console.log(`SQL script written to ${sqlFilePath}`);
    console.log('');
    console.log('To update the password, run the following command in psql:');
    console.log('');
    console.log(`psql -U postgres -d emptrack_db -f ${sqlFilePath}`);
    console.log('');
    console.log('Or copy and paste the following SQL into your database management tool:');
    console.log('');
    console.log(sql);
  } catch (error) {
    console.error('Error generating SQL script:', error);
  }
}

// This function is not used anymore
async function directUpdatePassword() {
  // We're not connecting to the database directly anymore
  // Instead, we're generating a SQL script that can be run manually

  // This function is not used anymore
}

// Call the new function instead
generateSqlScript();
