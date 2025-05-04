import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TopNavigation from "@/components/TopNavigation";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollAnimationSection, initializeAOS, refreshAOS, fadeInVariants, slideUpVariants, staggerContainerVariants, cardItemVariants, progressBarVariants } from "@/components/AnimationWrapper";
import "aos/dist/aos.css";
import "@/styles/animations.css"; // Import our custom animations

const Analytics = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [taskStats, setTaskStats] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [activeTab, setActiveTab] = useState("individual");
  const [taskCompletionRate, setTaskCompletionRate] = useState(null);
  const [userSkills, setUserSkills] = useState(null);

  // Initialize AOS once when component mounts
  useEffect(() => {
    // Use our new initialization function
    const cleanup = initializeAOS();
    
    // Clean up event listeners on unmount
    return cleanup;
  }, []);
  
  // Refresh AOS when data changes
  useEffect(() => {
    if (taskStats || teamStats || leaveStats || userSkills) {
      refreshAOS();
    }
  }, [taskStats, teamStats, leaveStats, userSkills]);
  
  // Force refresh AOS whenever the tab changes
  useEffect(() => {
    refreshAOS();
  }, [activeTab]);

  // Colors for charts
  const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#8b5cf6'];

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  // Handle user selection change
  const handleUserChange = (value) => {
    setSelectedUserId(value);
  };

  // Get the name of the selected user
  const getSelectedUserName = () => {
    if (!selectedUserId) return "Employee";

    if (selectedUserId === user.id) return "Your";

    const selectedUser = teamMembers.find(member => member.id === selectedUserId);
    return selectedUser ? `${selectedUser.full_name}'s` : "Employee";
  };

  // Fetch team members on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        // For employees, they can only see their own stats
        if (user.role === 'employee') {
          setSelectedUserId(user.id);
          setTeamMembers([user]);
          return;
        }

        // For supervisors and managers, fetch their team members
        const response = await api.get('/supervisor/team');
        setTeamMembers(response.data || []);

        // Set the first team member as selected by default
        if (response.data && response.data.length > 0) {
          setSelectedUserId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [user, api]);

  // Log raw API response immediately when received
  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUserStats = async (userId) => {
    setLoading(true);
    try {
      console.log("Fetching stats for user:", userId);

      // Fetch task stats
      const taskResponse = await api.get(`/analytics/user/${userId}/task-stats`);
      console.log("Raw task stats response:", taskResponse.data);
      setTaskStats(taskResponse.data);

      // Fetch leave stats
      const leaveResponse = await api.get(`/analytics/user/${userId}/leave-overtime`);
      console.log("Raw leave stats response:", leaveResponse.data);
      setLeaveStats(leaveResponse.data);

      // Fetch task completion rate
      const completionRateResponse = await api.get(`/analytics/user/${userId}/task-completion-rate`);
      console.log("Raw task completion rate response:", completionRateResponse.data);
      setTaskCompletionRate(completionRateResponse.data);

      // Fetch user skills
      const userSkillsResponse = await api.get(`/analytics/user/${userId}/user-skills`);
      console.log("Raw user skills response:", userSkillsResponse.data);
      setUserSkills(userSkillsResponse.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error(`Failed to fetch stats for user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team stats when activeTab changes to 'team'
  useEffect(() => {
    if (activeTab === 'team' && (user.role === 'supervisor' || user.role === 'manager')) {
      fetchTeamStats();
    }
  }, [activeTab, user.role]);

  // Add debug logs when data changes
  useEffect(() => {
    console.log("Task stats updated:", taskStats);
    console.log("Task completion rate updated:", taskCompletionRate);
    console.log("User skills updated:", userSkills);
  }, [taskStats, taskCompletionRate, userSkills]);

  // Checking what's in the teamStats object to debug
  useEffect(() => {
    if (teamStats) {
      console.log("Team stats in state:", teamStats);
      console.log("Member stats:", teamStats.memberStats);
    }
  }, [teamStats]);

  const fetchTeamStats = async () => {
    setLoading(true);
    try {
      console.log("Fetching team stats for supervisor ID:", user.id);

      // Get the supervisor's ID (for supervisors, it's their own ID; for managers, we could fetch all teams)
      const supervisorId = user.id;

      // TEMPORARY: Use mock data for testing UI
      // Comment this line out when backend is working properly
      setTeamStats(getMockedTeamData());
      setLoading(false);
      return;

      // Log the exact URL we're calling
      const url = `/analytics/team/${supervisorId}/stats`;
      console.log("Calling API:", url);

      // Use the new comprehensive team stats endpoint
      const response = await api.get(url);
      console.log("Team stats API response:", response);
      console.log("Team stats response data:", response.data);

      // Check if the response data has the expected structure
      if (response.data && (response.data.memberStats === undefined || response.data.memberStats === null)) {
        console.error("Warning: API response does not contain memberStats array");
        // Create a default structure if missing
        const fixedData = {
          ...response.data,
          supervisorId: supervisorId,
          totalTeamMembers: 0,
          avgCompletionRate: 0,
          avgOnTimeRate: 0,
          memberStats: []
        };
        setTeamStats(fixedData);
      } else {
        setTeamStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching team stats:", error);
      toast.error("Failed to load team statistics");
      // Set default empty state to avoid undefined errors
      setTeamStats({
        supervisorId: user.id,
        totalTeamMembers: 0,
        avgCompletionRate: 0,
        avgOnTimeRate: 0,
        memberStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Using this to mock team data for testing
  const getMockedTeamData = () => {
    return {
      supervisorId: user.id,
      totalTeamMembers: 3,
      avgCompletionRate: 72,
      avgOnTimeRate: 65,
      memberStats: [
        {
          userId: "1",
          userName: "Jane Smith",
          email: "jane.smith@example.com",
          role: "employee",
          jobTitle: "Frontend Developer",
          totalTasks: 24,
          completedTasks: 18,
          completedOnTimeTasks: 15,
          completionRate: 75,
          onTimeRate: 83,
          approvedLeaveRequests: 2,
          totalLeaveDays: 5,
          approvedOvertimeRequests: 1,
          totalOvertimeHours: 4,
          skillCount: 4
        },
        {
          userId: "2",
          userName: "John Doe",
          email: "john.doe@example.com",
          role: "employee",
          jobTitle: "Backend Developer",
          totalTasks: 30,
          completedTasks: 20,
          completedOnTimeTasks: 12,
          completionRate: 67,
          onTimeRate: 60,
          approvedLeaveRequests: 1,
          totalLeaveDays: 2,
          approvedOvertimeRequests: 2,
          totalOvertimeHours: 8,
          skillCount: 6
        },
        {
          userId: "3",
          userName: "Alex Johnson",
          email: "alex.johnson@example.com",
          role: "employee",
          jobTitle: "UI/UX Designer",
          totalTasks: 18,
          completedTasks: 14,
          completedOnTimeTasks: 10,
          completionRate: 78,
          onTimeRate: 71,
          approvedLeaveRequests: 0,
          totalLeaveDays: 0,
          approvedOvertimeRequests: 0,
          totalOvertimeHours: 0,
          skillCount: 5
        }
      ]
    };
  };

  // Function to prepare data for task status pie chart
  const getTaskStatusData = () => {
    if (!taskStats) return [];

    console.log("Raw task status data:", taskStats);

    const result = [];

    // Using consistent naming with the other charts
    if (taskStats.tasksCompleted > 0) {
      result.push({ name: 'Completed', value: taskStats.tasksCompleted });
    }

    if (taskStats.tasksInProgress > 0) {
      result.push({ name: 'In Progress', value: taskStats.tasksInProgress });
    }

    if (taskStats.tasksPending > 0) {
      result.push({ name: 'Pending', value: taskStats.tasksPending });
    }

    // Add any additional status types if needed
    if (taskStats.tasksOverdue > 0) {
      result.push({ name: 'Overdue', value: taskStats.tasksOverdue });
    }

    // If all values are zero, show placeholder
    if (result.length === 0) {
      if (taskStats.totalTasksAssigned && taskStats.totalTasksAssigned > 0) {
        // We have tasks but they're in some other status
        result.push({ name: 'Other', value: taskStats.totalTasksAssigned });
      } else {
        // No tasks at all
        result.push({ name: 'No Tasks', value: 1 });
      }
    }

    console.log("Final task status data:", result);
    return result;
  };

  // Prepare data for task completion bar chart
  const getTaskCompletionData = () => {
    if (!taskStats) return [];

    return [
      { name: 'Task Metrics', 'Completion Rate': taskStats.taskCompletionRate, 'On-Time Rate': taskStats.onTimeCompletionRate }
    ];
  };

  // Prepare data for leave/overtime bar chart
  const getLeaveOvertimeData = () => {
    if (!leaveStats) return [];

    return [
      { name: 'Leave Days', value: leaveStats.totalLeaveDays },
      { name: 'Overtime Hours', value: leaveStats.totalOvertimeHours }
    ];
  };

  // Prepare data for team comparison chart
  const getTeamComparisonData = () => {
    console.log("Preparing team comparison data. teamStats:", teamStats);

    if (!teamStats || !teamStats.memberStats || !Array.isArray(teamStats.memberStats)) {
      return [];
    }

    return teamStats.memberStats.map(member => {
      // Safely extract the first name from the full name if possible
      let displayName = 'Unknown';
      if (member.userName && typeof member.userName === 'string') {
        const nameParts = member.userName.split(' ');
        displayName = nameParts[0] || 'Unknown';
      }

      return {
        name: displayName,
        'Completion Rate': member.completionRate || 0,
        'On-Time Rate': member.onTimeRate || 0
      };
    });
  };

  // Function to prepare data for the task completion rate pie chart
  const getTaskCompletionRateData = () => {
    console.log("Raw task completion rate data:", taskCompletionRate);

    if (!taskCompletionRate) {
      return [{ name: 'No Tasks', value: 100 }];
    }

    // Create an array with the data from direct properties
    const result = [];

    // Try the direct properties first (our new API format)
    if (taskCompletionRate.completed !== undefined) {
      const completed = Number(taskCompletionRate.completed);
      const inProgress = Number(taskCompletionRate.inProgress);
      const pending = Number(taskCompletionRate.pending);

      if (completed > 0) result.push({ name: 'Completed', value: completed });
      if (inProgress > 0) result.push({ name: 'In Progress', value: inProgress });
      if (pending > 0) result.push({ name: 'Pending', value: pending });
    }
    // Fallback to using the tasksByStatus object if available
    else if (taskCompletionRate.tasksByStatus) {
      const { tasksByStatus } = taskCompletionRate;

      // Extract and format values
      const completed = Number(tasksByStatus.completed || 0);
      const inProgress = Number(tasksByStatus['in-progress'] || 0);
      const pending = Number(tasksByStatus.pending || 0);

      if (completed > 0) result.push({ name: 'Completed', value: completed });
      if (inProgress > 0) result.push({ name: 'In Progress', value: inProgress });
      if (pending > 0) result.push({ name: 'Pending', value: pending });
    }

    // If we have no data, return a placeholder
    if (result.length === 0) {
      result.push({ name: 'No Tasks', value: 100 });
    }

    console.log("Final chart data:", result);
    return result;
  };

  // Handle report generation
  const handleGenerateReport = () => {
    toast.info("Report generation feature coming soon");
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    window.print();
    toast.success("PDF export initiated");
  };

  // Check if user has the correct role to access this page
  if (!user || (user.role !== 'supervisor' && user.role !== 'manager')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
        <TopNavigation userRole={user?.role} />
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the Analytics page.</p>
            <Button onClick={() => navigate(user?.role === 'employee' ? '/employee-dashboard' : '/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Define the countUpVariants animation (not imported from AnimationWrapper)
  const countUpVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.3
      }
    }
  };

  const renderTeamStats = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (!teamStats || !teamStats.memberStats || teamStats.memberStats.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8"
        >
          <p className="text-xl text-gray-500">No team data available</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        {/* Team Overview Card */}
        <ScrollAnimationSection className="mb-6">
          <motion.div
            variants={cardItemVariants}
            whileHover="hover"
            whileTap="tap"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Card className="shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Overall team performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={staggerContainerVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <motion.div
                    variants={cardItemVariants}
                    className="p-4 bg-blue-50 rounded-lg"
                    data-aos="zoom-in"
                    data-aos-delay="150"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm font-medium text-blue-500">Team Members</p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-3xl font-bold"
                    >
                      {teamStats.totalTeamMembers}
                    </motion.p>
                  </motion.div>
                  <motion.div
                    variants={cardItemVariants}
                    className="p-4 bg-green-50 rounded-lg"
                    data-aos="zoom-in"
                    data-aos-delay="200"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm font-medium text-green-500">Avg. Completion</p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-3xl font-bold"
                    >
                      {teamStats.avgCompletionRate}%
                    </motion.p>
                  </motion.div>
                  <motion.div
                    variants={cardItemVariants}
                    className="p-4 bg-purple-50 rounded-lg"
                    data-aos="zoom-in"
                    data-aos-delay="250"
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <p className="text-sm font-medium text-purple-500">Avg. On-Time</p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-3xl font-bold"
                    >
                      {teamStats.avgOnTimeRate}%
                    </motion.p>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </ScrollAnimationSection>

        {/* Team Members Performance Card */}
        <ScrollAnimationSection className="mb-6">
          <motion.div
            variants={cardItemVariants}
            whileHover="hover"
            whileTap="tap"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Card className="shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>Team Member Performance</CardTitle>
                <CardDescription>Individual metrics for each team member</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {teamStats.memberStats.map((member, index) => (
                    <motion.div
                      key={member.userId || index}
                      variants={cardItemVariants}
                      className="border p-4 rounded-lg"
                      data-aos="fade-up"
                      data-aos-delay={300 + (index * 50)}
                      whileHover="hover"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{member.userName}</h4>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>{member.completedTasks} / {member.totalTasks} tasks</span>
                            <span>{member.skillCount} skills</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + (0.1 * index), duration: 0.3, type: "spring" }}
                            className="font-bold"
                          >
                            {member.completionRate}%
                          </motion.span>
                        </div>
                      </div>

                      {/* Progress bar for completion rate */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-2 rounded-full bg-green-500"
                          initial="hidden"
                          animate="visible"
                          variants={progressBarVariants}
                          custom={member.completionRate}
                        />
                      </div>

                      {/* On-time rate */}
                      <div className="flex justify-between text-xs mt-2">
                        <span>On-time: {member.onTimeRate}%</span>
                        <span>Leave: {member.totalLeaveDays} days</span>
                        <span>Overtime: {member.totalOvertimeHours} hrs</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </ScrollAnimationSection>

        {/* Export/Print Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-end mt-6 gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleDownloadPDF}>
              Export PDF
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  // Setup scroll-based animations
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerY = useTransform(scrollY, [0, 100], [0, -10]);
  const headerSpring = useSpring(headerY, { stiffness: 100, damping: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="container mx-auto p-4"
      >
        <motion.div
          style={{
            opacity: headerOpacity,
            scale: headerScale,
            y: headerSpring
          }}
          className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm"
        >
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            Performance Analytics
          </motion.h1>
        </motion.div>

        {/* Tabs for analytics views - only for supervisors and managers */}
        {(user.role === 'supervisor' || user.role === 'manager') ? (
          <Tabs defaultValue="individual" value={activeTab} onValueChange={handleTabChange}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex justify-end mb-4"
            >
              <TabsList className="grid w-[400px] grid-cols-2">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                </motion.div>
                {(user.role === 'supervisor' || user.role === 'manager') && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <TabsTrigger value="team">Team</TabsTrigger>
                  </motion.div>
                )}
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="individual">
                  {/* User Selection (only for supervisors and managers) */}
                  {(user.role === 'supervisor' || user.role === 'manager') && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle>Select Employee</CardTitle>
                        <CardDescription>View performance metrics for a specific employee</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Select value={selectedUserId} onValueChange={handleUserChange} disabled={loading}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  )}

                  {/* Task Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
                    {/* Task Status */}
                    <Card className="shadow-md" data-aos="fade-up" data-aos-delay="100">
                      <CardHeader>
                        <CardTitle>{getSelectedUserName()}'s Task Status</CardTitle>
                        <CardDescription>Distribution of completed vs pending tasks</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px] flex items-center justify-center">
                        {loading ? (
                          <Skeleton className="h-[250px] w-full" />
                        ) : taskStats ? (
                          <div className="w-full h-full">
                            {console.log("Rendering task status with data:", getTaskStatusData())}
                            {getTaskStatusData().length === 1 && getTaskStatusData()[0].name === 'No Tasks' ? (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-center text-gray-500">No task data available</p>
                              </div>
                            ) : (
                              <div className="grid gap-4 p-4">
                                {getTaskStatusData().map((item, index) => {
                                  // Calculate the total for percentages
                                  const total = taskStats.totalTasksAssigned ||
                                            getTaskStatusData().reduce((sum, i) => sum + i.value, 0);

                                  // Calculate percentage (avoid division by zero)
                                  const percentage = total ? Math.round((item.value / total) * 100) : 0;

                                  return (
                                    <div key={index} className="flex items-center mb-3">
                                      <div
                                        className="w-4 h-4 mr-2 rounded-full"
                                        style={{
                                          backgroundColor: item.name === 'Completed' ? '#4ade80' :
                                                           item.name === 'In Progress' ? '#60a5fa' :
                                                           item.name === 'Pending' ? '#f59e0b' :
                                                           item.name === 'Overdue' ? '#ef4444' : '#9ca3af'
                                        }}
                                      />
                                      <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                          <span className="font-medium">{item.name}</span>
                                          <span className="font-medium">{item.value} tasks ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                          <div
                                            className="h-2.5 rounded-full"
                                            style={{
                                              width: `${percentage}%`,
                                              backgroundColor: item.name === 'Completed' ? '#4ade80' :
                                                              item.name === 'In Progress' ? '#60a5fa' :
                                                              item.name === 'Pending' ? '#f59e0b' :
                                                              item.name === 'Overdue' ? '#ef4444' : '#9ca3af'
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">No task data available</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Completion Rates */}
                    <Card className="shadow-md" data-aos="fade-up" data-aos-delay="200">
                      <CardHeader>
                        <CardTitle>{getSelectedUserName()}'s Completion Rates</CardTitle>
                        <CardDescription>Task completion and on-time performance</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[300px] py-6">
                        {loading ? (
                          <Skeleton className="h-[250px] w-full" />
                        ) : taskStats ? (
                          <div className="space-y-8">
                            {/* Overall Completion Rate */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-medium">Overall Completion Rate</h4>
                                  <p className="text-xs text-gray-500">{taskStats.tasksCompleted || 0} of {taskStats.totalTasksAssigned || 0} tasks completed</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold">{taskStats.taskCompletionRate || 0}%</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="h-2 rounded-full bg-green-500"
                                  initial="hidden"
                                  animate="visible"
                                  variants={progressBarVariants}
                                  custom={taskStats.taskCompletionRate || 0}
                                />
                              </div>
                            </div>

                            {/* On-Time Completion Rate */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <div>
                                  <h4 className="text-sm font-medium">On-Time Completion Rate</h4>
                                  <p className="text-xs text-gray-500">{taskStats.tasksCompletedOnTime || 0} of {taskStats.tasksCompleted || 0} tasks completed on time</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold">{taskStats.onTimeCompletionRate || 0}%</p>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="h-2 rounded-full bg-blue-500"
                                  initial="hidden"
                                  animate="visible"
                                  variants={progressBarVariants}
                                  custom={taskStats.onTimeCompletionRate || 0}
                                />
                              </div>
                            </div>

                            {/* Average Completion Time */}
                            {taskStats.avgCompletionTime && (
                              <div>
                                <div className="flex justify-between mb-2">
                                  <div>
                                    <h4 className="text-sm font-medium">Average Completion Time</h4>
                                    <p className="text-xs text-gray-500">Average time to complete tasks</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-bold">{taskStats.avgCompletionTime || '--'} days</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">No completion data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Leave & Overtime */}
                  <Card className="shadow-md" data-aos="fade-up" data-aos-delay="300">
                    <CardHeader>
                      <CardTitle>{getSelectedUserName()}'s Leave & Overtime</CardTitle>
                      <CardDescription>Total leave days and overtime hours in the last 3 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : leaveStats ? (
                        <div className="space-y-8">
                          {/* Leave Days */}
                          <div>
                            <div className="flex justify-between mb-2">
                              <div>
                                <h4 className="text-sm font-medium">Leave Days</h4>
                                <p className="text-xs text-gray-500">Total approved leave in last 3 months</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{leaveStats.totalLeaveDays || 0} days</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="h-2 rounded-full bg-purple-500"
                                initial="hidden"
                                animate="visible"
                                variants={progressBarVariants}
                                custom={Math.min(100, (leaveStats.totalLeaveDays || 0) / 0.3)}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">0 days</span>
                              <span className="text-xs text-gray-500">30 days</span>
                            </div>
                          </div>

                          {/* Overtime Hours */}
                          <div>
                            <div className="flex justify-between mb-2">
                              <div>
                                <h4 className="text-sm font-medium">Overtime Hours</h4>
                                <p className="text-xs text-gray-500">Total approved overtime in last 3 months</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{leaveStats.totalOvertimeHours || 0} hours</p>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className="h-2 rounded-full bg-amber-500"
                                initial="hidden"
                                animate="visible"
                                variants={progressBarVariants}
                                custom={Math.min(100, (leaveStats.totalOvertimeHours || 0) / 0.6)}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500">0 hours</span>
                              <span className="text-xs text-gray-500">60 hours</span>
                            </div>
                          </div>

                          {/* Approved Requests */}
                          <motion.div
                            variants={staggerContainerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 gap-4 mt-4"
                          >
                            <motion.div
                              variants={cardItemVariants}
                              whileHover="hover"
                              whileTap="tap"
                              className="bg-gray-50 p-3 rounded-lg text-center shadow-sm"
                              data-aos="flip-left"
                              data-aos-delay="400"
                            >
                              <p className="text-xs text-gray-500 mb-1">Approved Leave Requests</p>
                              <motion.p
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                                className="text-xl font-bold"
                              >
                                {leaveStats.approvedLeaveRequests || 0}
                              </motion.p>
                            </motion.div>
                            <motion.div
                              variants={cardItemVariants}
                              whileHover="hover"
                              whileTap="tap"
                              className="bg-gray-50 p-3 rounded-lg text-center shadow-sm"
                              data-aos="flip-left"
                              data-aos-delay="500"
                            >
                              <p className="text-xs text-gray-500 mb-1">Approved Overtime Requests</p>
                              <motion.p
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                                className="text-xl font-bold"
                              >
                                {leaveStats.approvedOvertimeRequests || 0}
                              </motion.p>
                            </motion.div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-6">No leave or overtime data available</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Task Completion Rate */}
                  <Card className="shadow-md" data-aos="fade-up" data-aos-delay="400">
                    <CardHeader>
                      <CardTitle>{getSelectedUserName()} Task Completion Rate</CardTitle>
                      <CardDescription>Distribution of tasks by status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                      {loading ? (
                        <Skeleton className="h-[250px] w-full" />
                      ) : taskCompletionRate ? (
                        <div className="w-full h-full">
                          {console.log("Rendering chart with data:", getTaskCompletionRateData())}
                          {getTaskCompletionRateData().length === 1 && getTaskCompletionRateData()[0].name === 'No Tasks' ? (
                            <div className="flex h-full items-center justify-center">
                              <p className="text-center text-gray-500">No task data available</p>
                            </div>
                          ) : (
                            <div className="grid gap-4 p-4">
                              {getTaskCompletionRateData().map((item, index) => {
                                // Calculate the total for percentages - use taskCompletionRate.totalTasks if available
                                const total = taskCompletionRate.totalTasks ||
                                             getTaskCompletionRateData().reduce((sum, i) => sum + i.value, 0);

                                // Calculate percentage (avoid division by zero)
                                const percentage = total ? Math.round((item.value / total) * 100) : 0;

                                return (
                                  <div key={index} className="flex items-center mb-3">
                                    <div
                                      className="w-4 h-4 mr-2 rounded-full"
                                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <div className="flex-1">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="font-medium">{item.value} tasks ({percentage}%)</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                          className="h-2.5 rounded-full"
                                          style={{
                                            width: `${percentage}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">No task data available</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* User Skills */}
                  <Card className="shadow-md" data-aos="fade-up" data-aos-delay="500">
                    <CardHeader>
                      <CardTitle>{getSelectedUserName()}'s Skills</CardTitle>
                      <CardDescription>Skills and proficiency levels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : userSkills ? (
                        <div>
                          {console.log("Rendering user skills:", userSkills)}

                          {Array.isArray(userSkills.skills) ? (
                            userSkills.skills.length > 0 ? (
                              <motion.div
                                variants={staggerContainerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-4"
                              >
                                {userSkills.skills.map((skill, index) => (
                                  <motion.div
                                    key={index}
                                    variants={cardItemVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="bg-gray-50 p-4 rounded-lg shadow-sm"
                                    data-aos="zoom-in-up"
                                    data-aos-delay={400 + (index * 50)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <motion.h4
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: 0.1 + (index * 0.05) }}
                                          className="font-medium text-gray-900"
                                        >
                                          {skill.skillName}
                                        </motion.h4>
                                        <motion.p
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: 0.2 + (index * 0.05) }}
                                          className="text-sm text-gray-500"
                                        >
                                          {skill.skillDescription}
                                        </motion.p>
                                      </div>
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + (index * 0.05), type: "spring" }}
                                        className="flex flex-wrap gap-2 items-center"
                                      >
                                        <motion.span
                                          whileHover={{ scale: 1.1 }}
                                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${skill.proficiencyLevel === 'expert' ? 'bg-green-100 text-green-800' :
                                              skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                              skill.proficiencyLevel === 'advanced' ? 'bg-purple-100 text-purple-800' :
                                              'bg-yellow-100 text-yellow-800'}`}
                                        >
                                          {skill.proficiencyLevel || 'beginner'}
                                        </motion.span>

                                        {skill.canMentor && (
                                          <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                          >
                                            Mentor
                                          </motion.span>
                                        )}

                                        {skill.isCertified && (
                                          <motion.span
                                            whileHover={{ scale: 1.1 }}
                                            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                                          >
                                            Certified
                                          </motion.span>
                                        )}
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            ) : (
                              <div className="text-center text-gray-500 py-8">No skills registered for this user</div>
                            )
                          ) : (
                            <div className="text-center text-gray-500 py-8">No skills data available</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">No skills data available</div>
                      )}
                    </CardContent>
                  </Card>

                </TabsContent>

                {/* Team Analytics View */}
                <TabsContent value="team">
                  {renderTeamStats()}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        ) : (
          // For employees, just show their individual stats without tabs
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Task Performance Metrics */}
            <motion.div
              variants={staggerContainerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6"
            >
              {/* Task Status */}
              <ScrollAnimationSection>
                <motion.div
                  variants={cardItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <Card className="shadow-md overflow-hidden">
                <CardHeader>
                  <CardTitle>Your Task Status</CardTitle>
                  <CardDescription>Distribution of completed vs pending tasks</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {loading ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : taskStats ? (
                    <div className="w-full h-full">
                      {console.log("Rendering task status with data:", getTaskStatusData())}
                      {getTaskStatusData().length === 1 && getTaskStatusData()[0].name === 'No Tasks' ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-gray-500">No task data available</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 p-4">
                          {getTaskStatusData().map((item, index) => {
                            // Calculate the total for percentages
                            const total = taskStats.totalTasksAssigned ||
                                        getTaskStatusData().reduce((sum, i) => sum + i.value, 0);

                            // Calculate percentage (avoid division by zero)
                            const percentage = total ? Math.round((item.value / total) * 100) : 0;

                            return (
                              <div key={index} className="flex items-center mb-3">
                                <div
                                  className="w-4 h-4 mr-2 rounded-full"
                                  style={{
                                    backgroundColor: item.name === 'Completed' ? '#4ade80' :
                                                     item.name === 'In Progress' ? '#60a5fa' :
                                                     item.name === 'Pending' ? '#f59e0b' :
                                                     item.name === 'Overdue' ? '#ef4444' : '#9ca3af'
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between mb-1">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="font-medium">{item.value} tasks ({percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="h-2.5 rounded-full"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: item.name === 'Completed' ? '#4ade80' :
                                                        item.name === 'In Progress' ? '#60a5fa' :
                                                        item.name === 'Pending' ? '#f59e0b' :
                                                        item.name === 'Overdue' ? '#ef4444' : '#9ca3af'
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No task data available</div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              </ScrollAnimationSection>

              {/* Completion Rates */}
              <ScrollAnimationSection>
                <motion.div
                  variants={cardItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <Card className="shadow-md overflow-hidden">
                <CardHeader>
                  <CardTitle>Your Completion Rates</CardTitle>
                  <CardDescription>Task completion and on-time performance</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] py-6">
                  {loading ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : taskStats ? (
                    <div className="space-y-8">
                      {/* Overall Completion Rate */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-medium">Overall Completion Rate</h4>
                            <p className="text-xs text-gray-500">{taskStats.tasksCompleted || 0} of {taskStats.totalTasksAssigned || 0} tasks completed</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{taskStats.taskCompletionRate || 0}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${taskStats.taskCompletionRate || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* On-Time Completion Rate */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-medium">On-Time Completion Rate</h4>
                            <p className="text-xs text-gray-500">{taskStats.tasksCompletedOnTime || 0} of {taskStats.tasksCompleted || 0} tasks completed on time</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{taskStats.onTimeCompletionRate || 0}%</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${taskStats.onTimeCompletionRate || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Average Completion Time */}
                      {taskStats.avgCompletionTime && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-medium">Average Completion Time</h4>
                              <p className="text-xs text-gray-500">Average time to complete tasks</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{taskStats.avgCompletionTime || '--'} days</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No completion data available</div>
                  )}
                </CardContent>
              </Card>
                </motion.div>
              </ScrollAnimationSection>
            </motion.div>

            {/* Leave and Overtime */}
            <ScrollAnimationSection className="mb-6">
              <motion.div
                variants={cardItemVariants}
                whileHover="hover"
                whileTap="tap"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <Card className="shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>Your Leave & Overtime</CardTitle>
                <CardDescription>Total leave days and overtime hours in the last 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : leaveStats ? (
                  <div className="space-y-8">
                    {/* Leave Days */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium">Leave Days</h4>
                          <p className="text-xs text-gray-500">Total approved leave in last 3 months</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{leaveStats.totalLeaveDays || 0} days</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{
                            width: `${Math.min(100, (leaveStats.totalLeaveDays || 0) / 0.3)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0 days</span>
                        <span className="text-xs text-gray-500">30 days</span>
                      </div>
                    </div>

                    {/* Overtime Hours */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium">Overtime Hours</h4>
                          <p className="text-xs text-gray-500">Total approved overtime in last 3 months</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{leaveStats.totalOvertimeHours || 0} hours</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-amber-500"
                          style={{
                            width: `${Math.min(100, (leaveStats.totalOvertimeHours || 0) / 0.6)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0 hours</span>
                        <span className="text-xs text-gray-500">60 hours</span>
                      </div>
                    </div>

                    {/* Approved Requests */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Approved Leave Requests</p>
                        <p className="text-xl font-bold">{leaveStats.approvedLeaveRequests || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-500 mb-1">Approved Overtime Requests</p>
                        <p className="text-xl font-bold">{leaveStats.approvedOvertimeRequests || 0}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-6">No leave or overtime data available</div>
                )}
              </CardContent>
            </Card>
              </motion.div>
            </ScrollAnimationSection>

            {/* Task Completion Rate */}
            <ScrollAnimationSection className="mb-6">
              <motion.div
                variants={cardItemVariants}
                whileHover="hover"
                whileTap="tap"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <Card className="shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>Your Task Completion Rate</CardTitle>
                <CardDescription>Distribution of tasks by status</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {loading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : taskCompletionRate ? (
                  <div className="w-full h-full">
                    {console.log("Rendering chart with data:", getTaskCompletionRateData())}
                    {getTaskCompletionRateData().length === 1 && getTaskCompletionRateData()[0].name === 'No Tasks' ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-center text-gray-500">No task data available</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 p-4">
                        {getTaskCompletionRateData().map((item, index) => {
                          // Calculate the total for percentages - use taskCompletionRate.totalTasks if available
                          const total = taskCompletionRate.totalTasks ||
                                       getTaskCompletionRateData().reduce((sum, i) => sum + i.value, 0);

                          // Calculate percentage (avoid division by zero)
                          const percentage = total ? Math.round((item.value / total) * 100) : 0;

                          return (
                            <div key={index} className="flex items-center mb-3">
                              <div
                                className="w-4 h-4 mr-2 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="font-medium">{item.value} tasks ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No task data available</div>
                )}
              </CardContent>
            </Card>
              </motion.div>
            </ScrollAnimationSection>

            {/* User Skills */}
            <ScrollAnimationSection className="mb-6">
              <motion.div
                variants={cardItemVariants}
                whileHover="hover"
                whileTap="tap"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <Card className="shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle>Your Skills</CardTitle>
                <CardDescription>Skills and proficiency levels</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : userSkills ? (
                  <div>
                    {console.log("Rendering user skills:", userSkills)}

                    {Array.isArray(userSkills.skills) ? (
                      userSkills.skills.length > 0 ? (
                        <div className="grid gap-4">
                          {userSkills.skills.map((skill, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium text-gray-900">{skill.skillName}</h4>
                                  <p className="text-sm text-gray-500">{skill.skillDescription}</p>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${skill.proficiencyLevel === 'expert' ? 'bg-green-100 text-green-800' :
                                        skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                        skill.proficiencyLevel === 'advanced' ? 'bg-purple-100 text-purple-800' :
                                        'bg-yellow-100 text-yellow-800'}`}
                                  >
                                    {skill.proficiencyLevel || 'beginner'}
                                  </span>

                                  {skill.canMentor && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      Mentor
                                    </span>
                                  )}

                                  {skill.isCertified && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                      Certified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">No skills registered for this user</div>
                      )
                    ) : (
                      <div className="text-center text-gray-500 py-8">No skills data available</div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">No skills data available</div>
                )}
              </CardContent>
            </Card>
              </motion.div>
            </ScrollAnimationSection>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;
