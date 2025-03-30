export const mockTasks = [
  {
    id: 1,
    title: "Complete Production Batch #123",
    assignee: "employee@test.com",
    deadline: "2023-11-10",
    status: "In Progress",
    description: "Finish sewing 500 units",
    priority: "High",
    comments: [
      { id: 1, text: "Need extra thread for this batch", user: "employee@test.com", date: "2025-03-05" },
    ],
    tags: ["Sewing", "Urgent"],
    dependencies: [],
    history: [
      { id: 1, action: "Status changed to In Progress", user: "employee@test.com", date: "2025-03-04" },
      { id: 2, action: "Tag 'Urgent' added", user: "supervisor@test.com", date: "2025-03-04" },
    ],
  },
  {
    id: 2,
    title: "Quality Check Apparel",
    assignee: "employee@test.com",
    deadline: "2023-11-12",
    status: "Pending",
    description: "Inspect garments",
    priority: "Medium",
    comments: [],
    tags: ["QC"],
    dependencies: [1],
    history: [
      { id: 1, action: "Task created", user: "supervisor@test.com", date: "2025-03-03" },
    ],
  },
  {
    id: 3,
    title: "Pack Shipment Order #456",
    assignee: "employee@test.com",
    deadline: "2023-11-15",
    status: "Completed",
    description: "Prepare 200 boxes",
    priority: "Low",
    comments: [
      { id: 1, text: "Shipment ready for pickup", user: "employee@test.com", date: "2025-03-04" },
    ],
    tags: ["Packing"],
    dependencies: [2],
    history: [
      { id: 1, action: "Status changed to Completed", user: "employee@test.com", date: "2025-03-04" },
    ],
  },
];