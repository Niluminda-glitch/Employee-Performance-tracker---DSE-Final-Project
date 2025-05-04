const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Request = sequelize.define('Request', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('leave', 'overtime'),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hours: {
      type: DataTypes.INTEGER,
      allowNull: true, // Only required for overtime requests
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    approver_id: {
      type: DataTypes.UUID,
      allowNull: true, // Will be filled when approved/rejected
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    tableName: 'requests',
    timestamps: false, // We're handling timestamps manually
    underscored: true, // Use snake_case for column names
  });

  Request.associate = (models) => {
    Request.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    
    Request.belongsTo(models.User, {
      foreignKey: 'approver_id',
      as: 'approver',
    });
  };

  return Request;
};
