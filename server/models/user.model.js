const bcrypt = require('bcryptjs');

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: true // Null for Google OAuth users
    },
    full_name: {
      type: Sequelize.STRING,
      field: 'full_name',
      allowNull: false
    },
    role: {
      type: Sequelize.ENUM('employee', 'supervisor', 'manager'),
      defaultValue: 'employee'
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive', 'first_login'),
      defaultValue: 'active'
    },
    job_title: {
      type: Sequelize.TEXT,
      field: 'job_title',
      allowNull: true
    },
    department_id: {
      type: Sequelize.UUID,
      field: 'department_id',
      references: {
        model: 'departments',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      allowNull: true
    },
    supervisor_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    google_id: {
      type: Sequelize.TEXT,
      field: 'google_id',
      allowNull: true,
      unique: true
    },
    avatar_url: {
      type: Sequelize.TEXT,
      field: 'avatar_url',
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    tableName: 'users',
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        // Only hash password if it exists (not for Google OAuth users)
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        // Only hash password if it's changed
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      // Add a hook to manually handle the timestamp update
      beforeSave: (user) => {
        // Set the updated_at field manually to avoid trigger conflicts
        user.updated_at = new Date();
        // If the database has an updatedAt column too, set it as well
        if (user.dataValues.hasOwnProperty('updatedAt')) {
          user.updatedAt = new Date();
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // Associations will be defined in index.js

  return User;
};
