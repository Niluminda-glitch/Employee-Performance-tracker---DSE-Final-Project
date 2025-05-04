module.exports = (sequelize, Sequelize) => {
  const Skill = sequelize.define("skill", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
    // Removed category field as it doesn't exist in the database
  }, {
    timestamps: true,
    tableName: 'skills',
    // Don't map column names - use the default Sequelize naming (createdAt, updatedAt)
    // The database seems to be using camelCase column names
  });

  return Skill;
};
