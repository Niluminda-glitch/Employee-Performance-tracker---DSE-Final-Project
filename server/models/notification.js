const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
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
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'system',
        'task_assigned',
        'task_completed',
        'deadline_reminder',
        'mentorship_request',
        'request_approved',
        'request_rejected',
        'announcement'
      ),
      allowNull: false,
    },
    related_task_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id',
      },
    },
    related_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    
    Notification.belongsTo(models.User, {
      foreignKey: 'related_user_id',
      as: 'relatedUser',
    });
    
    Notification.belongsTo(models.Task, {
      foreignKey: 'related_task_id',
      as: 'relatedTask',
    });
  };

  return Notification;
};
