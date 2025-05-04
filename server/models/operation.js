'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Operation extends Model {
    static associate(models) {
      // Define associations here if needed
      // For example, operations might be associated with departments or product types
    }
  }
  
  Operation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    number: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    quality_checkpoints: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    smv_target: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    sop_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Operation',
    tableName: 'operations',
    timestamps: false, // We're handling timestamps manually
    underscored: true // Use snake_case for column names
  });
  
  return Operation;
};
