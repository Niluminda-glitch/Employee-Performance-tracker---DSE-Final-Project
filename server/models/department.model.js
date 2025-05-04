module.exports = (sequelize, Sequelize) => {
  const Department = sequelize.define("departments", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    tableName: 'departments',
    modelName: 'Department'
  });

  // Associations will be defined in index.js

  return Department;
};
