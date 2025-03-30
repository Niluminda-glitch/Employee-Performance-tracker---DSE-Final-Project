// src/services/taskService.js
import { mockTasks } from './mockTasks';
import { mockRequests } from './mockRequests';

// Get all tasks (for Managers/Supervisors)
export const getAllTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockTasks), 1000); // Simulate API delay
  });
};

// Get tasks assigned to the logged-in user (for Employees)
export const getUserTasks = (email) => {
  return new Promise((resolve) => {
    const filteredTasks = mockTasks.filter((task) => task.assignee === email);
    setTimeout(() => resolve(filteredTasks), 1000);
  });
};

// Update task status (for Employees)
export const updateTaskStatus = (taskId, newStatus) => {
  return new Promise((resolve) => {
    const task = mockTasks.find((t) => t.id === taskId);
    if (task) task.status = newStatus;
    setTimeout(() => resolve(task), 500);
  });
};

// Create a new task (for Managers/Supervisors)
let nextTaskId = 2; // Start after existing mock tasks

export const createTask = (newTask) => {
  return new Promise((resolve) => {
    const task = {
      id: nextTaskId++,
      ...newTask,
      status: "Pending",
      supervisor: "supervisor@test.com", // Replace with logged-in user later
    };
    mockTasks.push(task);
    setTimeout(() => resolve(task), 500);
  });
};

export const getPendingRequests = () => {
    return new Promise((resolve) => {
      const pendingRequests = mockRequests.filter(req => req.status === 'pending');
      setTimeout(() => resolve(pendingRequests), 500);
    });
  };
  
  export const updateRequestStatus = (requestId, newStatus) => {
    return new Promise((resolve) => {
      const request = mockRequests.find(req => req.id === requestId);
      if (request) request.status = newStatus;
      setTimeout(() => resolve(request), 500);
    });
  };

  export const getEmployeeRequests = (employeeEmail) => {
    return new Promise((resolve) => {
      const employeeRequests = mockRequests.filter(
        (req) => req.employeeEmail === employeeEmail
      );
      setTimeout(() => resolve(employeeRequests), 500);
    });
  };

  export const createRequest = (request) => {
    return new Promise((resolve) => {
      const newRequest = {
        id: mockRequests.length + 1,
        ...request,
        status: "pending",
      };
      mockRequests.push(newRequest);
      setTimeout(() => resolve(newRequest), 500);
    });
  };

  export const getTaskProgress = (status) => {
    const progressMap = {
      'Pending': 0,
      'In Progress': 50,
      'Completed': 100
    };
    return progressMap[status] || 0;
  };