
// This file contains seed data for the database
// It can be run from the browser console or from a Node.js script

const seedDatabase = async (supabase) => {
  console.log("Starting database seeding...");

  try {
    // Create tables if they don't exist (Supabase might have these already)
    // This is a safety check to ensure tables exist before inserting data
    
    // 1. Create test users in auth
    const createTestUser = async (email, password, roleType) => {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabase
          .from('users')
          .select('*')
          .eq('email', email);
          
        if (existingUsers && existingUsers.length > 0) {
          console.log(`User ${email} already exists, skipping creation`);
          return existingUsers[0].id;
        }
        
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          console.error(`Error creating auth user ${email}:`, authError);
          return null;
        }

        console.log(`Created auth user for ${email}:`, authData);
        
        const userId = authData.user.id;
        
        // 2. Create profile in users table
        const { data: userData, error: profileError } = await supabase.from('users').insert([
          {
            id: userId,
            email,
            role: roleType,
            first_name: email.split('@')[0].split('.')[0],
            last_name: email.split('@')[0].split('.')[1] || 'User',
            job_title: roleType === 'employee' ? 'Staff Member' : 
                      roleType === 'supervisor' ? 'Team Lead' : 'Department Head',
            department: roleType === 'employee' ? 'Operations' : 
                        roleType === 'supervisor' ? 'Production' : 'Management',
          }
        ]).select();

        if (profileError) {
          console.error(`Error creating profile for ${email}:`, profileError);
          return null;
        }

        console.log(`Created user profile for ${email}:`, userData);
        return userId;
      } catch (error) {
        console.error(`Error in createTestUser for ${email}:`, error);
        return null;
      }
    };

    // Create sample users
    const employeeId = await createTestUser('employee@emptrack.com', 'employee123', 'employee');
    const supervisorId = await createTestUser('supervisor@emptrack.com', 'supervisor123', 'supervisor');
    const managerId = await createTestUser('manager@emptrack.com', 'manager123', 'manager');

    console.log("User IDs:", { employeeId, supervisorId, managerId });

    // Update supervisor relationship
    if (employeeId && supervisorId) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ supervisor_id: supervisorId })
        .eq('id', employeeId);
        
      if (updateError) {
        console.error("Error updating supervisor relationship:", updateError);
      } else {
        console.log(`Set supervisor ${supervisorId} for employee ${employeeId}`);
      }
    }

    // 2. Create skills
    // First check if skills already exist
    const { data: existingSkills } = await supabase
      .from('skills')
      .select('*');
      
    if (existingSkills && existingSkills.length > 0) {
      console.log("Skills already exist, skipping creation");
    } else {
      const skills = [
        { name: 'JavaScript', description: 'Programming language' },
        { name: 'React', description: 'Frontend framework' },
        { name: 'SQL', description: 'Database querying language' },
        { name: 'Machine Operation', description: 'Operating production machinery' },
        { name: 'Quality Inspection', description: 'Ensuring product quality' },
      ];

      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .insert(skills)
        .select();

      if (skillsError) {
        console.error("Error creating skills:", skillsError);
      } else {
        console.log("Created skills:", skillsData);

        // 3. Assign skills to users
        if (employeeId && supervisorId && managerId && skillsData) {
          const userSkills = [
            { 
              user_id: employeeId, 
              skill_id: skillsData[0].id, 
              proficiency_level: 'proficient',
              is_certified: true,
              last_certified_date: new Date().toISOString()
            },
            { 
              user_id: employeeId, 
              skill_id: skillsData[1].id, 
              proficiency_level: 'learning'
            },
            { 
              user_id: supervisorId, 
              skill_id: skillsData[0].id, 
              proficiency_level: 'expert',
              is_certified: true,
              last_certified_date: new Date().toISOString()
            },
            { 
              user_id: supervisorId, 
              skill_id: skillsData[2].id, 
              proficiency_level: 'proficient'
            },
            { 
              user_id: managerId, 
              skill_id: skillsData[3].id, 
              proficiency_level: 'expert',
              is_certified: true
            },
          ];

          const { data: userSkillsData, error: userSkillsError } = await supabase
            .from('user_skills')
            .insert(userSkills)
            .select();

          if (userSkillsError) {
            console.error("Error assigning skills to users:", userSkillsError);
          } else {
            console.log("Assigned skills to users:", userSkillsData);
          }
        }
      }
    }

    // 4. Create tasks
    if (employeeId && supervisorId) {
      // Check if tasks already exist
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('*');
        
      if (existingTasks && existingTasks.length > 0) {
        console.log("Tasks already exist, skipping creation");
      } else {
        const tasks = [
          {
            title: 'Complete project documentation',
            description: 'Finalize all documentation for the current project',
            status: 'pending',
            priority: 'high',
            creator_id: supervisorId,
            assignee_id: employeeId,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          },
          {
            title: 'Weekly report',
            description: 'Prepare the weekly status report',
            status: 'in-progress',
            priority: 'medium',
            creator_id: supervisorId,
            assignee_id: employeeId,
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
          },
          {
            title: 'Team meeting',
            description: 'Prepare agenda for the team meeting',
            status: 'completed',
            priority: 'low',
            creator_id: supervisorId,
            assignee_id: supervisorId,
            due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          }
        ];

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .insert(tasks)
          .select();

        if (tasksError) {
          console.error("Error creating tasks:", tasksError);
        } else {
          console.log("Created tasks:", tasksData);
        }
      }
    }

    // 5. Create departments
    // Check if departments already exist
    const { data: existingDepartments } = await supabase
      .from('departments')
      .select('*');
      
    if (existingDepartments && existingDepartments.length > 0) {
      console.log("Departments already exist, skipping creation");
    } else if (managerId) {
      const departments = [
        { name: 'Engineering', description: 'Software development and technical operations', manager_id: managerId },
        { name: 'Operations', description: 'Day-to-day business operations', manager_id: managerId },
        { name: 'Production', description: 'Product manufacturing and assembly', manager_id: managerId }
      ];

      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .insert(departments)
        .select();

      if (departmentsError) {
        console.error("Error creating departments:", departmentsError);
      } else {
        console.log("Created departments:", departmentsData);
      }
    }

    console.log("Database seeding completed!");
    return true;
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
};

// Export the function to be used elsewhere
export { seedDatabase };
