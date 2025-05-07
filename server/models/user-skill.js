module.exports = (sequelize, Sequelize) => {
  const UserSkill = sequelize.define("user_skill", {
    // Remove the id field since it doesn't exist in the database
    // Instead, use userId and skillId as a composite primary key
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true, // Part of composite primary key
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    skillId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true, // Part of composite primary key
      references: {
        model: 'skills',
        key: 'id'
      },
      field: 'skill_id'
    },
    proficiencyLevel: {
      type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      allowNull: false,
      defaultValue: 'beginner',
      field: 'proficiency_level'
    },
    canMentor: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'willing_to_mentor' // This maps the JavaScript property canMentor to the database column willing_to_mentor
    },
    isCertified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_certified'
    },
    certificationDate: {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'certification_date'
    },
    experience: {
      type: Sequelize.STRING,
      allowNull: true
    },
    availability: {
      type: Sequelize.STRING,
      allowNull: true
    },
    isTraining: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_training'
    }
  }, {
    timestamps: true,
    tableName: 'user_skills',
    // Don't specify createdAt/updatedAt mappings - use Sequelize defaults
    underscored: true, // This will map camelCase attributes to snake_case column names
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'skill_id']
      }
    ]
  });

  return UserSkill;
};
