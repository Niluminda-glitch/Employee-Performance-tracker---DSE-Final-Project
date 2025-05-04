
// This file contains utility functions for authentication

export type UserWithRole = {
  id: string;
  email: string;
  role: "employee" | "supervisor" | "manager";
  full_name?: string;
};

export const getDashboardPathForRole = (role: string) => {
  switch (role) {
    case 'employee':
      return '/employee-dashboard';
    case 'supervisor':
      return '/supervisor-dashboard';
    case 'manager':
      return '/manager-dashboard';
    default:
      return '/';
  }
};
