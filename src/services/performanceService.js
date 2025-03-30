import { mockTasks } from './mockTasks';

// Calculate metrics for a specific employee
export const getEmployeePerformance = (email) => {
  const tasks = mockTasks.filter((task) => task.assignee === email);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return {
    completionRate: completionRate.toFixed(1),
    avgTime: "2.5 days", // Mock data (replace later)
    productivityScore: Math.min(completionRate + 20, 100), // Mock formula
  };
};

// src/services/performanceService.js
export const getAllPerformanceData = () => {
    return new Promise((resolve) => {
      const employees = [...new Set(mockTasks.map((task) => task.assignee))];
      const data = employees.map((email) => ({
        email,
        ...getEmployeePerformance(email),
      }));
      setTimeout(() => resolve(data), 500); // Simulate async API call
    });
  };