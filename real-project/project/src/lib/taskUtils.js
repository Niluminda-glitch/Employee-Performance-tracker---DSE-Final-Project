/**
 * Utility functions for task management and display
 */

/**
 * Determines the timeliness status and styling for a task based on its status, due date, and completion date
 * 
 * @param {Object} task - The task object containing status, due_date, and completed_at
 * @returns {Object} An object with text and color properties for displaying timeliness information
 */
export const getTimelinessInfo = (task) => {
  if (!task || !task.status) return { text: '', color: 'text-gray-500' };

  const status = task.status.toLowerCase();
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const completedAt = task.completed_at ? new Date(task.completed_at) : null;
  const now = new Date();

  // Adjust dueDate to end of day for fair comparison
  if (dueDate) {
    dueDate.setHours(23, 59, 59, 999);
  }

  if (status === 'completed') {
    if (!completedAt) {
      return { text: 'Completed (Date Missing)', color: 'text-gray-500' };
    }
    if (!dueDate) {
      return { text: 'Completed', color: 'text-green-600' };
    }
    if (completedAt <= dueDate) {
      return { text: 'Completed On Time', color: 'text-green-600' };
    } else {
      return { text: 'Completed Late', color: 'text-orange-600' };
    }
  } else if (dueDate && dueDate < now) {
    return { text: 'Overdue', color: 'text-red-600 font-semibold' };
  } else if (dueDate) {
    // Calculate days remaining
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 3 && diffDays >= 0) {
      return { text: `Due in ${diffDays} day(s)`, color: 'text-yellow-600'};
    }
    return { text: '', color: 'text-gray-500'}; // Not overdue yet
  }

  return { text: '', color: 'text-gray-500' }; // No due date, not completed
};

/**
 * Formats a date string to a localized date format
 * 
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
};
