export const getUserProfile = (role) => {
    switch (role) {
      case 'employee':
        return {
          email: localStorage.getItem('email') || 'employee@test.com',
          role: 'Employee',
          tasksCompleted: 45,
          tasksPending: 5,
          overtimeHours: 12,
        };
      case 'supervisor':
        return {
          email: localStorage.getItem('email') || 'supervisor@test.com',
          role: 'Supervisor',
          teamSize: 8,
          tasksAssigned: 30,
          requestsApproved: 15,
        };
      case 'manager':
        return {
          email: localStorage.getItem('email') || 'manager@test.com',
          role: 'Manager',
          reportsGenerated: 10,
          employeesManaged: 50,
          overtimeApproved: 25,
        };
      default:
        return { email: 'unknown@test.com', role: 'Unknown' };
    }
  };