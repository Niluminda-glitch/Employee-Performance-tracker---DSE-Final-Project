// Mock data for testing the app without a backend

// Mock tasks
export const mockTasks = [
  {
    id: '1',
    title: 'Complete Project Proposal',
    description: 'Finalize the project proposal document for client review.',
    status: 'completed',
    assignee_id: '1',
    assignee_name: 'John Doe',
    due_date: '2023-05-15',
    quality_checkpoints: [
      { icon: 'check-circle', text: 'Document formatting verified' },
      { icon: 'check-circle', text: 'Content reviewed by team lead' },
      { icon: 'check-circle', text: 'Budget calculations double-checked' }
    ]
  },
  {
    id: '2',
    title: 'Design UI Mockups',
    description: 'Create UI mockups for the new mobile application.',
    status: 'in_progress',
    assignee_id: '2',
    assignee_name: 'Jane Smith',
    due_date: '2023-05-20',
    quality_checkpoints: [
      { icon: 'check-circle', text: 'Design system guidelines followed' },
      { icon: 'clock', text: 'Accessibility review pending' },
      { icon: 'clock', text: 'Responsive design verification pending' }
    ]
  },
  {
    id: '3',
    title: 'Code Review',
    description: 'Review the code for the backend API implementation.',
    status: 'pending',
    assignee_id: '3',
    assignee_name: 'Bob Johnson',
    due_date: '2023-05-25',
    quality_checkpoints: [
      { icon: 'clock', text: 'Code style verification pending' },
      { icon: 'clock', text: 'Unit test coverage check pending' },
      { icon: 'clock', text: 'Security review pending' }
    ]
  },
  {
    id: '4',
    title: 'Testing',
    description: 'Perform testing on the new features.',
    status: 'pending',
    assignee_id: '4',
    assignee_name: 'Alice Williams',
    due_date: '2023-05-30',
    quality_checkpoints: [
      { icon: 'clock', text: 'Functional testing pending' },
      { icon: 'clock', text: 'Performance testing pending' },
      { icon: 'clock', text: 'User acceptance testing pending' }
    ]
  },
];

// Mock users
export const mockUsers = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'employee',
    job_title: 'Software Developer',
    status: 'active',
    department_id: '1',
    supervisor_id: '3',
    avatar_url: null
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'employee',
    job_title: 'UI/UX Designer',
    status: 'active',
    department_id: '2',
    supervisor_id: '3',
    avatar_url: null
  },
  {
    id: '3',
    full_name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'supervisor',
    job_title: 'Team Lead',
    status: 'active',
    department_id: '1',
    supervisor_id: null,
    avatar_url: null
  },
  {
    id: '4',
    full_name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'employee',
    job_title: 'QA Engineer',
    status: 'active',
    department_id: '1',
    supervisor_id: '3',
    avatar_url: null
  },
  {
    id: '5',
    full_name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    role: 'employee',
    job_title: 'Frontend Developer',
    status: 'active',
    department_id: '1',
    supervisor_id: '3',
    avatar_url: null
  },
];

// Mock notifications
export const mockNotifications = [
  {
    id: 1,
    type: 'task',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: "Complete quarterly report"',
    sender: 'John Manager',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false,
  },
  {
    id: 2,
    type: 'message',
    title: 'Message from Supervisor',
    message: 'Please review the latest project updates and provide feedback.',
    sender: 'Sarah Supervisor',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: 3,
    type: 'alert',
    title: 'Deadline Approaching',
    message: 'The deadline for project X is tomorrow. Please ensure all deliverables are submitted.',
    sender: 'System',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    read: false,
  },
  {
    id: 4,
    type: 'info',
    title: 'Office Closure',
    message: 'The office will be closed on Friday for maintenance. Please work remotely.',
    sender: 'Admin',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    read: true,
  },
];

// Mock departments
export const mockDepartments = [
  { id: '1', name: 'Engineering', headcount: 25, performanceScore: 87, openRequests: 5 },
  { id: '2', name: 'Marketing', headcount: 12, performanceScore: 82, openRequests: 3 },
  { id: '3', name: 'Customer Support', headcount: 18, performanceScore: 90, openRequests: 2 },
];

// Mock team members
export const mockTeamMembers = [
  {
    id: '1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    job_title: 'Software Developer',
    status: 'active',
    performance: 85,
    tasks_completed: 12,
    tasks_in_progress: 3,
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    job_title: 'UI/UX Designer',
    status: 'active',
    performance: 92,
    tasks_completed: 15,
    tasks_in_progress: 1,
  },
  {
    id: '3',
    full_name: 'Alice Williams',
    email: 'alice.williams@example.com',
    job_title: 'QA Engineer',
    status: 'active',
    performance: 78,
    tasks_completed: 8,
    tasks_in_progress: 4,
  },
  {
    id: '4',
    full_name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    job_title: 'Frontend Developer',
    status: 'active',
    performance: 80,
    tasks_completed: 10,
    tasks_in_progress: 2,
  },
];
