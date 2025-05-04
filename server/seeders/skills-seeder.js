const db = require('../models');
const { Skill, User, UserSkill } = db;

// List of skills to seed
const skillsToSeed = [
  { name: "Button Attachment", description: "Techniques for attaching buttons to garments", category: "Sewing" },
  { name: "Collar Assembly", description: "Methods for assembling and attaching collars", category: "Sewing" },
  { name: "Cutting Machine Operation", description: "Operating cutting machines safely and efficiently", category: "Cutting" },
  { name: "Embroidery", description: "Decorative needlework techniques", category: "Finishing" },
  { name: "Fabric Quality Control", description: "Inspecting fabrics for defects and quality issues", category: "Quality" },
  { name: "Fabric Spreading", description: "Techniques for spreading fabric for cutting", category: "Cutting" },
  { name: "Garment Dyeing", description: "Methods for dyeing completed garments", category: "Finishing" },
  { name: "Garment Finishing", description: "Final touches and finishing processes for garments", category: "Finishing" },
  { name: "Lockstitch Machine Operation", description: "Operating lockstitch sewing machines", category: "Sewing" },
  { name: "Pattern Making", description: "Creating and modifying garment patterns", category: "Design" },
  { name: "Sleeve Attachment", description: "Techniques for attaching sleeves to garments", category: "Sewing" },
  { name: "Stitch Quality Inspection", description: "Inspecting stitches for quality and consistency", category: "Quality" }
];

// Function to seed skills
async function seedSkills() {
  try {
    console.log('Starting skills seeding...');
    
    // Create skills
    for (const skillData of skillsToSeed) {
      const [skill, created] = await Skill.findOrCreate({
        where: { name: skillData.name },
        defaults: skillData
      });
      
      if (created) {
        console.log(`Created skill: ${skill.name}`);
      } else {
        console.log(`Skill already exists: ${skill.name}`);
      }
    }
    
    console.log('Skills seeding completed successfully!');
    
    // Optionally assign some skills to users
    await assignSkillsToUsers();
    
  } catch (error) {
    console.error('Error seeding skills:', error);
  }
}

// Function to assign skills to users
async function assignSkillsToUsers() {
  try {
    console.log('Assigning skills to users...');
    
    // Get all users and skills
    const users = await User.findAll();
    const skills = await Skill.findAll();
    
    if (users.length === 0) {
      console.log('No users found to assign skills to.');
      return;
    }
    
    if (skills.length === 0) {
      console.log('No skills found to assign to users.');
      return;
    }
    
    // For each user, assign 2-4 random skills
    for (const user of users) {
      // Shuffle skills and take a random number
      const shuffledSkills = skills.sort(() => 0.5 - Math.random());
      const numSkills = Math.floor(Math.random() * 3) + 2; // 2-4 skills
      const selectedSkills = shuffledSkills.slice(0, numSkills);
      
      for (const skill of selectedSkills) {
        // Randomly determine if user can mentor this skill
        const canMentor = Math.random() > 0.6; // 40% chance of being a mentor
        const proficiencyLevel = canMentor ? 
          ['advanced', 'expert'][Math.floor(Math.random() * 2)] : 
          ['beginner', 'intermediate'][Math.floor(Math.random() * 2)];
        
        const [userSkill, created] = await UserSkill.findOrCreate({
          where: {
            userId: user.id,
            skillId: skill.id
          },
          defaults: {
            proficiencyLevel,
            canMentor,
            isCertified: Math.random() > 0.5,
            certificationDate: canMentor ? new Date() : null,
            experience: `${Math.floor(Math.random() * 5) + 1} years`,
            availability: ['Weekdays', 'Weekends', 'Evenings', 'Mornings', 'Flexible'][Math.floor(Math.random() * 5)]
          }
        });
        
        if (created) {
          console.log(`Assigned skill "${skill.name}" to user ${user.full_name || user.email} (Can mentor: ${canMentor})`);
        } else {
          console.log(`User ${user.full_name || user.email} already has skill "${skill.name}"`);
        }
      }
    }
    
    console.log('Skill assignment completed successfully!');
  } catch (error) {
    console.error('Error assigning skills to users:', error);
  }
}

// Run the seeder
seedSkills()
  .then(() => {
    console.log('Skills seeding process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in skills seeding process:', error);
    process.exit(1);
  });
