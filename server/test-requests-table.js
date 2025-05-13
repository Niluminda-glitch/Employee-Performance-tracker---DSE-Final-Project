const db = require('./models');
const Request = db.Request;
const User = db.User;

async function testRequestsTable() {
  try {
    console.log('Testing requests table...');
    
    // Check if the Request model is defined
    if (!Request) {
      console.error('Request model is not defined!');
      return;
    }
    
    console.log('Request model is defined.');
    
    // Try to query the table
    try {
      const count = await Request.count();
      console.log(`Found ${count} requests in the database.`);
    } catch (error) {
      console.error('Error querying requests table:', error);
    }
    
    // Check the table structure
    try {
      const tableInfo = await db.sequelize.query(
        "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'requests'",
        { type: db.sequelize.QueryTypes.SELECT }
      );
      
      console.log('Requests table structure:');
      tableInfo.forEach(column => {
        console.log(`- ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    } catch (error) {
      console.error('Error getting table structure:', error);
    }
    
    // Check if the request_type enum exists
    try {
      const enumTypes = await db.sequelize.query(
        "SELECT typname FROM pg_type WHERE typname = 'request_type'",
        { type: db.sequelize.QueryTypes.SELECT }
      );
      
      if (enumTypes.length > 0) {
        console.log('request_type enum exists');
        
        // Check enum values
        const enumValues = await db.sequelize.query(
          "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'request_type')",
          { type: db.sequelize.QueryTypes.SELECT }
        );
        
        console.log('request_type enum values:');
        enumValues.forEach(value => {
          console.log(`- ${value.enumlabel}`);
        });
      } else {
        console.error('request_type enum does not exist!');
      }
    } catch (error) {
      console.error('Error checking request_type enum:', error);
    }
    
    // Check if the notification_type enum exists and its values
    try {
      const enumTypes = await db.sequelize.query(
        "SELECT typname FROM pg_type WHERE typname = 'notification_type'",
        { type: db.sequelize.QueryTypes.SELECT }
      );
      
      if (enumTypes.length > 0) {
        console.log('notification_type enum exists');
        
        // Check enum values
        const enumValues = await db.sequelize.query(
          "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')",
          { type: db.sequelize.QueryTypes.SELECT }
        );
        
        console.log('notification_type enum values:');
        enumValues.forEach(value => {
          console.log(`- ${value.enumlabel}`);
        });
      } else {
        console.error('notification_type enum does not exist!');
      }
    } catch (error) {
      console.error('Error checking notification_type enum:', error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the database connection
    await db.sequelize.close();
  }
}

testRequestsTable();
