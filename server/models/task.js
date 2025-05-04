'use strict';
const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("tasks", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    assignee_id: { // Foreign key
      type: Sequelize.UUID,
      field: 'assignee_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL', // Matches schema
      allowNull: true // Matches schema (REFERENCES allows NULL)
    },
    supervisor_id: { // Foreign key
      type: Sequelize.UUID,
      field: 'supervisor_id',
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE', // Matches schema
      allowNull: false // Matches schema
    },
    status: {
      type: Sequelize.ENUM('pending', 'in-progress', 'completed'), // Matches ENUM type
      allowNull: false,
      defaultValue: 'pending',
    },
    priority: {
      type: Sequelize.ENUM('low', 'medium', 'high'), // Matches ENUM type
      allowNull: false,
      defaultValue: 'medium',
    },
    due_date: {
      type: Sequelize.DATEONLY, // Matches schema
      field: 'due_date',
    },
    completed_at: {
      type: Sequelize.DATE, // Sequelize uses DATE for TIMESTAMPTZ
      field: 'completed_at',
      allowNull: true // It can be null if not completed
    }
  }, {
    timestamps: true, // Enable Sequelize timestamps
    createdAt: 'created_at', // Map to correct column names
    updatedAt: 'updated_at',
    underscored: true, // Use snake_case mapping
    tableName: 'tasks',
    modelName: 'Task'
  });

  // Associations will be defined in index.js

  return Task;
};
