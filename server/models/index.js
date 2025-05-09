const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

// Determine which configuration to use (Supabase or traditional PostgreSQL)
const useSupabase = process.env.USE_SUPABASE === 'true';
const dbConfig = useSupabase
  ? require('../config/supabase.config.js')
  : require('../config/db.config.js');

console.log(`Using ${useSupabase ? 'Supabase' : 'PostgreSQL'} database configuration`);

// Check if we have a connection string for Supabase
const connectionString = useSupabase ? process.env.SUPABASE_CONNECTION_STRING : null;

// Create Sequelize instance
const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: 'postgres',
      pool: dbConfig.pool,
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      dialectOptions: {
        ...(dbConfig.dialectOptions || {}),
        // Disable prepared statements for Supavisor transaction mode
        // This is required when using port 6543
        prepare: false
      }
    })
  : new Sequelize(
      dbConfig.DB_NAME || dbConfig.DB,
      dbConfig.DB_USER || dbConfig.USER,
      dbConfig.DB_PASSWORD || dbConfig.PASSWORD,
      {
        host: dbConfig.DB_HOST || dbConfig.HOST,
        port: dbConfig.DB_PORT || dbConfig.PORT,
        dialect: dbConfig.dialect || 'postgres',
        pool: dbConfig.pool,
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        dialectOptions: {
          ...(dbConfig.dialectOptions || {}),
          // Disable prepared statements for Supavisor transaction mode
          // This is required when using port 6543
          prepare: false
        }
      }
    );

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model.js')(sequelize, Sequelize);
db.department = require('./department.model.js')(sequelize, Sequelize);
db.task = require('./task.js')(sequelize, Sequelize);
db.operation = require('./operation.js')(sequelize, Sequelize);
db.skill = require('./skill.js')(sequelize, Sequelize);
db.userSkill = require('./user-skill.js')(sequelize, Sequelize);
db.notification = require('./notification.js')(sequelize, Sequelize);
db.request = require('./request.js')(sequelize, Sequelize);

// For compatibility with both approaches (db.user and destructuring { User })
db.User = db.user;
db.Department = db.department;
db.Task = db.task;
db.Operation = db.operation;
db.Skill = db.skill;
db.UserSkill = db.userSkill;
db.Notification = db.notification;
db.Request = db.request;

// Define all associations

// Department - User associations
db.Department.hasMany(db.User, { foreignKey: 'department_id', as: 'employees' });
db.User.belongsTo(db.Department, { foreignKey: 'department_id', as: 'userDepartment' });

// User - User (supervisor) associations
db.User.belongsTo(db.User, { foreignKey: 'supervisor_id', as: 'supervisor' });
db.User.hasMany(db.User, { foreignKey: 'supervisor_id', as: 'subordinates' });

// User - Task associations (as assignee)
db.User.hasMany(db.Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });
db.Task.belongsTo(db.User, { foreignKey: 'assignee_id', as: 'assignee' });

// User - Task associations (as supervisor)
db.User.hasMany(db.Task, { foreignKey: 'supervisor_id', as: 'createdTasks' });
db.Task.belongsTo(db.User, { foreignKey: 'supervisor_id', as: 'supervisor' });

// User - Skill associations (through UserSkill)
db.User.belongsToMany(db.Skill, {
  through: db.UserSkill,
  foreignKey: 'userId',
  otherKey: 'skillId',
  as: 'skills'
});
db.Skill.belongsToMany(db.User, {
  through: db.UserSkill,
  foreignKey: 'skillId',
  otherKey: 'userId',
  as: 'users'
});

// Direct associations for UserSkill
db.UserSkill.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.UserSkill.belongsTo(db.Skill, { foreignKey: 'skillId', as: 'skill' });

// Notification associations
db.Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Notification.belongsTo(db.User, { foreignKey: 'related_user_id', as: 'relatedUser' });
db.Notification.belongsTo(db.Task, { foreignKey: 'related_task_id', as: 'relatedTask' });
db.User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications' });

// Request associations
db.Request.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Request.belongsTo(db.User, { foreignKey: 'approver_id', as: 'approver' });
db.User.hasMany(db.Request, { foreignKey: 'user_id', as: 'requests' });

module.exports = db;
