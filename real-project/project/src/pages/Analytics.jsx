import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import TopNavigation from "../components/TopNavigation";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { ScrollAnimationSection, initializeAOS, refreshAOS, fadeInVariants, slideUpVariants, staggerContainerVariants, cardItemVariants, progressBarVariants } from "../components/AnimationWrapper";
import "aos/dist/aos.css";
import "../styles/animations.css";
import "../styles/dashboard-float.css";
import "../styles/analytics-enhancements.css";
import "../styles/analytics-background.css";
import "../styles/ai-analytics.css";
import { CheckCircle, Clock, ArrowRight, Users, ClipboardList, FileText, Download, Brain } from 'lucide-react';
import AnalyticsBackground from '../components/AnalyticsBackground';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AIAnalyticsButton from '../components/analytics/AIAnalyticsButton';

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
  const [generatingReport, setGeneratingReport] = useState(false);
  const teamStatsRef = useRef(null);
  const individualStatsRef = useRef(null);

  useEffect(() => {
    const cleanup = initializeAOS();
    return cleanup;
  }, []);

  useEffect(() => {
    if (taskStats || teamStats || leaveStats || userSkills) {
      refreshAOS();
    }
  }, [taskStats, teamStats, leaveStats, userSkills]);

  useEffect(() => {
    refreshAOS();
  }, [activeTab]);

  const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#8b5cf6'];

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleUserChange = (value) => {
    setSelectedUserId(value);
  };

  const getSelectedUserName = () => {
    if (!selectedUserId) return "Employee";
    if (selectedUserId === user.id) return "Your";
    const selectedUser = teamMembers.find(member => member.id === selectedUserId);
    return selectedUser ? `${selectedUser.full_name}'s` : "Employee";
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setLoading(true);
      try {
        console.log("Fetching team members for analytics");
        if (user.role === 'employee') {
          setSelectedUserId(user.id);
          setTeamMembers([user]);
          return;
        }

        // Use different endpoints based on user role
        let response;
        if (user.role === 'manager') {
          // Managers can see all employees
          console.log("Manager role detected, fetching all users");
          response = await api.get('/manager/users');
        } else {
          // Supervisors see only their team members
          console.log("Supervisor role detected, fetching team members");
          response = await api.get('/supervisor/team');
        }

        console.log("Team members response:", response.data);
        setTeamMembers(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedUserId(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
        toast.error("Failed to load team members");
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, [user, api]);

  useEffect(() => {
    if (user) {
      console.log("User loaded in Analytics:", user);
      if (user.role === 'supervisor' || user.role === 'manager') {
        console.log("Fetching team stats for role:", user.role);
        fetchTeamStats();
      } else {
        fetchTaskStats();
        fetchTaskCompletionRate();
        fetchUserSkills();
        fetchLeaveOvertime();
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserStats(selectedUserId);
    }
  }, [selectedUserId]);

  // Helper function to calculate days between two dates (inclusive)
  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  // Fetch all requests for a user and calculate leave/overtime stats
  const fetchUserRequests = async (userId) => {
    try {
      console.log("Fetching requests for user:", userId);

      // Use the appropriate endpoint based on the user's role
      let requests = [];

      if (user.role === 'manager') {
        // Managers can see all requests
        const allRequestsResponse = await api.get('/requests/all');
        const allRequests = allRequestsResponse.data;
        // Filter requests for the specific user
        requests = allRequests.filter(req => req.user_id === userId);
      } else if (user.role === 'supervisor') {
        // Supervisors can see team requests
        const teamRequestsResponse = await api.get('/requests/team');
        const teamRequests = teamRequestsResponse.data;
        // Filter requests for the specific user
        requests = teamRequests.filter(req => req.user_id === userId);
      } else {
        // Employees can only see their own requests
        if (user.id === userId) {
          const myRequestsResponse = await api.get('/requests/my');
          requests = myRequestsResponse.data;
        } else {
          // If an employee is trying to access another user's requests, return empty
          return {
            userId,
            approvedLeaveRequests: 0,
            approvedOvertimeRequests: 0,
            totalLeaveDays: 0,
            totalOvertimeHours: 0
          };
        }
      }

      console.log("User requests:", requests);

      // Calculate leave and overtime stats
      let totalLeaveDays = 0;
      let totalOvertimeHours = 0;
      let approvedLeaveRequests = 0;
      let approvedOvertimeRequests = 0;

      requests.forEach(request => {
        if (request.status === 'approved') {
          if (request.type === 'leave') {
            approvedLeaveRequests++;
            totalLeaveDays += calculateDaysBetween(request.start_date, request.end_date);
          } else if (request.type === 'overtime') {
            approvedOvertimeRequests++;
            totalOvertimeHours += request.hours || 0;
          }
        }
      });

      return {
        userId,
        approvedLeaveRequests,
        approvedOvertimeRequests,
        totalLeaveDays,
        totalOvertimeHours
      };
    } catch (error) {
      console.error("Error fetching user requests:", error);
      // Return default values if there's an error
      return {
        userId,
        approvedLeaveRequests: 0,
        approvedOvertimeRequests: 0,
        totalLeaveDays: 0,
        totalOvertimeHours: 0
      };
    }
  };

  const fetchUserStats = async (userId) => {
    setLoading(true);
    try {
      console.log("Fetching stats for user:", userId);

      // Fetch task stats
      const taskResponse = await api.get(`/analytics/user/${userId}/task-stats`);
      console.log("Raw task stats response:", taskResponse.data);
      setTaskStats(taskResponse.data);

      // Fetch leave/overtime stats using our custom function
      try {
        const leaveOvertimeStats = await fetchUserRequests(userId);
        console.log("Custom leave/overtime stats:", leaveOvertimeStats);
        setLeaveStats(leaveOvertimeStats);
      } catch (leaveError) {
        console.error("Error fetching leave/overtime stats:", leaveError);
        // Fallback to the original endpoint
        const leaveResponse = await api.get(`/analytics/user/${userId}/leave-overtime`);
        console.log("Raw leave stats response:", leaveResponse.data);
        setLeaveStats(leaveResponse.data);
      }

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

  useEffect(() => {
    if (activeTab === 'team' && (user.role === 'supervisor' || user.role === 'manager')) {
      fetchTeamStats();
    }
  }, [activeTab, user.role]);

  useEffect(() => {
    console.log("Task stats updated:", taskStats);
    console.log("Task completion rate updated:", taskCompletionRate);
    console.log("User skills updated:", userSkills);
  }, [taskStats, taskCompletionRate, userSkills]);

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
      const supervisorId = user.id;
      setTeamStats(getMockedTeamData());
      setLoading(false);
      return;
      const url = `/analytics/team/${supervisorId}/stats`;
      console.log("Calling API:", url);
      const response = await api.get(url);
      console.log("Team stats API response:", response);
      console.log("Team stats response data:", response.data);
      if (response.data && (response.data.memberStats === undefined || response.data.memberStats === null)) {
        console.error("Warning: API response does not contain memberStats array");
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

  const getTaskStatusData = () => {
    if (!taskStats) return [];
    console.log("Raw task status data:", taskStats);
    const result = [];
    if (taskStats.tasksCompleted > 0) {
      result.push({ name: 'Completed', value: taskStats.tasksCompleted });
    }
    if (taskStats.tasksInProgress > 0) {
      result.push({ name: 'In Progress', value: taskStats.tasksInProgress });
    }
    if (taskStats.tasksPending > 0) {
      result.push({ name: 'Pending', value: taskStats.tasksPending });
    }
    if (taskStats.tasksOverdue > 0) {
      result.push({ name: 'Overdue', value: taskStats.tasksOverdue });
    }
    if (result.length === 0) {
      if (taskStats.totalTasksAssigned && taskStats.totalTasksAssigned > 0) {
        result.push({ name: 'Other', value: taskStats.totalTasksAssigned });
      } else {
        result.push({ name: 'No Tasks', value: 1 });
      }
    }
    console.log("Final task status data:", result);
    return result;
  };

  const getTaskCompletionData = () => {
    if (!taskStats) return [];
    return [
      { name: 'Task Metrics', 'Completion Rate': taskStats.taskCompletionRate, 'On-Time Rate': taskStats.onTimeCompletionRate }
    ];
  };

  const getLeaveOvertimeData = () => {
    if (!leaveStats) return [];
    return [
      { name: 'Leave Days', value: leaveStats.totalLeaveDays },
      { name: 'Overtime Hours', value: leaveStats.totalOvertimeHours }
    ];
  };

  const getTeamComparisonData = () => {
    console.log("Preparing team comparison data. teamStats:", teamStats);
    if (!teamStats || !teamStats.memberStats || !Array.isArray(teamStats.memberStats)) {
      return [];
    }
    return teamStats.memberStats.map(member => {
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

  const getTaskCompletionRateData = () => {
    console.log("Raw task completion rate data:", taskCompletionRate);
    if (!taskCompletionRate) {
      return [{ name: 'No Tasks', value: 100 }];
    }
    const result = [];
    if (taskCompletionRate.completed !== undefined) {
      const completed = Number(taskCompletionRate.completed);
      const inProgress = Number(taskCompletionRate.inProgress);
      const pending = Number(taskCompletionRate.pending);
      if (completed > 0) result.push({ name: 'Completed', value: completed });
      if (inProgress > 0) result.push({ name: 'In Progress', value: inProgress });
      if (pending > 0) result.push({ name: 'Pending', value: pending });
    } else if (taskCompletionRate.tasksByStatus) {
      const { tasksByStatus } = taskCompletionRate;
      const completed = Number(tasksByStatus.completed || 0);
      const inProgress = Number(tasksByStatus['in-progress'] || 0);
      const pending = Number(tasksByStatus.pending || 0);
      if (completed > 0) result.push({ name: 'Completed', value: completed });
      if (inProgress > 0) result.push({ name: 'In Progress', value: inProgress });
      if (pending > 0) result.push({ name: 'Pending', value: pending });
    }
    if (result.length === 0) {
      result.push({ name: 'No Tasks', value: 100 });
    }
    console.log("Final chart data:", result);
    return result;
  };

  const handleGenerateReport = async () => {
    // Check if we're in team tab or individual tab
    const isTeamTab = activeTab === 'team';

    // Validate data availability
    if (isTeamTab) {
      if (!teamStats || !teamStats.memberStats || teamStats.memberStats.length === 0) {
        toast.error("No team data available to generate report");
        return;
      }
    } else {
      if (!taskStats) {
        toast.error("No individual data available to generate report");
        return;
      }
    }

    setGeneratingReport(true);
    toast.info(`Generating ${isTeamTab ? 'team' : 'individual'} report...`);

    try {
      // Create a formatted report as a string
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();

      let reportContent = '';
      let fileName = '';

      if (isTeamTab) {
        // Team report
        reportContent = `
          Team Performance Report
          Generated on: ${reportDate} at ${reportTime}
          Supervisor: ${user.full_name || 'Unknown'}

          TEAM OVERVIEW
          -------------
          Total Team Members: ${teamStats.totalTeamMembers}
          Average Completion Rate: ${teamStats.avgCompletionRate}%
          Average On-Time Rate: ${teamStats.avgOnTimeRate}%
          Team Performance: ${teamStats.avgCompletionRate > 70 ? 'Above Average' : 'Needs Improvement'}

          TEAM MEMBER DETAILS
          ------------------
        `;

        teamStats.memberStats.forEach((member, index) => {
          reportContent += `
          Member ${index + 1}: ${member.userName}
          Job Title: ${member.jobTitle || 'Team Member'}
          Email: ${member.email}
          Completion Rate: ${member.completionRate}%
          On-Time Rate: ${member.onTimeRate}%
          Tasks: ${member.completedTasks} / ${member.totalTasks}
          Skills: ${member.skillCount}
          Leave Days: ${member.totalLeaveDays}
          Overtime Hours: ${member.totalOvertimeHours}

          `;
        });

        fileName = `team-report-${reportDate.replace(/\//g, '-')}.txt`;
      } else {
        // Individual report
        const userName = getSelectedUserName();

        reportContent = `
          ${userName} Performance Report
          Generated on: ${reportDate} at ${reportTime}

          TASK PERFORMANCE
          ---------------
          Total Tasks Assigned: ${taskStats.totalTasksAssigned || 0}
          Tasks Completed: ${taskStats.tasksCompleted || 0}
          Tasks In Progress: ${taskStats.tasksInProgress || 0}
          Tasks Pending: ${taskStats.tasksPending || 0}
          Tasks Overdue: ${taskStats.tasksOverdue || 0}
          Completion Rate: ${taskStats.taskCompletionRate || 0}%
          On-Time Rate: ${taskStats.onTimeCompletionRate || 0}%

          LEAVE & OVERTIME
          ---------------
        `;

        if (leaveStats) {
          reportContent += `
          Total Leave Days: ${leaveStats.totalLeaveDays || 0}
          Total Overtime Hours: ${leaveStats.totalOvertimeHours || 0}
          Approved Leave Requests: ${leaveStats.approvedLeaveRequests || 0}
          Approved Overtime Requests: ${leaveStats.approvedOvertimeRequests || 0}
          `;
        }

        if (userSkills && Array.isArray(userSkills.skills)) {
          reportContent += `

          SKILLS
          ------
          Total Skills: ${userSkills.skills.length}
          `;

          userSkills.skills.forEach((skill, index) => {
            reportContent += `
          Skill ${index + 1}: ${skill.skillName}
          Description: ${skill.skillDescription || 'N/A'}
          Proficiency: ${skill.proficiencyLevel || 'beginner'}
          Can Mentor: ${skill.canMentor ? 'Yes' : 'No'}
          Certified: ${skill.isCertified ? 'Yes' : 'No'}
            `;
          });
        }

        fileName = `${userName.replace("'s", "")}-report-${reportDate.replace(/\//g, '-')}.txt`;
      }

      // Create a blob and download link
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${isTeamTab ? 'Team' : 'Individual'} report generated successfully`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Check if we're in team tab or individual tab
    const isTeamTab = activeTab === 'team';

    // Validate data availability
    if (isTeamTab) {
      if (!teamStats || !teamStats.memberStats || teamStats.memberStats.length === 0) {
        toast.error("No team data available to export");
        return;
      }

      if (!teamStatsRef.current) {
        toast.error("Cannot capture team data for PDF");
        return;
      }
    } else {
      if (!taskStats) {
        toast.error("No individual data available to export");
        return;
      }

      if (!individualStatsRef.current) {
        toast.error("Cannot capture individual data for PDF");
        return;
      }
    }

    setGeneratingReport(true);
    toast.info("Preparing PDF export...");

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();

      if (isTeamTab) {
        // Team PDF
        // Add header
        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 128); // Dark blue
        pdf.text("Team Performance Report", pageWidth / 2, 15, { align: 'center' });

        // Add report metadata
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text(`Generated on: ${reportDate} at ${reportTime}`, pageWidth / 2, 22, { align: 'center' });
        pdf.text(`Supervisor: ${user.full_name || 'Unknown'}`, pageWidth / 2, 27, { align: 'center' });

        // Add team overview section
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Team Overview", 14, 40);

        pdf.setFontSize(10);
        pdf.text(`Total Team Members: ${teamStats.totalTeamMembers}`, 14, 48);
        pdf.text(`Average Completion Rate: ${teamStats.avgCompletionRate}%`, 14, 54);
        pdf.text(`Average On-Time Rate: ${teamStats.avgOnTimeRate}%`, 14, 60);
        pdf.text(`Team Performance: ${teamStats.avgCompletionRate > 70 ? 'Above Average' : 'Needs Improvement'}`, 14, 66);

        // Add team member details section
        pdf.setFontSize(14);
        pdf.text("Team Member Details", 14, 80);

        let yPosition = 88;

        // Capture the team stats section as an image
        const canvas = await html2canvas(teamStatsRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        // Add the image to the PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 28; // Margins on both sides
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 14, yPosition, imgWidth, imgHeight);

        // Save the PDF
        pdf.save(`team-performance-report-${reportDate.replace(/\//g, '-')}.pdf`);
      } else {
        // Individual PDF
        // Get the selected user name
        const userName = getSelectedUserName();

        // Add header
        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 128); // Dark blue
        pdf.text(`${userName} Performance Report`, pageWidth / 2, 15, { align: 'center' });

        // Add report metadata
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100); // Gray
        pdf.text(`Generated on: ${reportDate} at ${reportTime}`, pageWidth / 2, 22, { align: 'center' });

        // Add task stats section
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Task Performance", 14, 35);

        pdf.setFontSize(10);
        if (taskStats) {
          pdf.text(`Total Tasks Assigned: ${taskStats.totalTasksAssigned || 0}`, 14, 43);
          pdf.text(`Tasks Completed: ${taskStats.tasksCompleted || 0}`, 14, 49);
          pdf.text(`Tasks In Progress: ${taskStats.tasksInProgress || 0}`, 14, 55);
          pdf.text(`Tasks Pending: ${taskStats.tasksPending || 0}`, 14, 61);
          pdf.text(`Tasks Overdue: ${taskStats.tasksOverdue || 0}`, 14, 67);
          pdf.text(`Completion Rate: ${taskStats.taskCompletionRate || 0}%`, 14, 73);
          pdf.text(`On-Time Rate: ${taskStats.onTimeCompletionRate || 0}%`, 14, 79);
        }

        // Add leave stats section
        pdf.setFontSize(14);
        pdf.text("Leave & Overtime", 14, 90);

        pdf.setFontSize(10);
        if (leaveStats) {
          pdf.text(`Total Leave Days: ${leaveStats.totalLeaveDays || 0}`, 14, 98);
          pdf.text(`Total Overtime Hours: ${leaveStats.totalOvertimeHours || 0}`, 14, 104);
          pdf.text(`Approved Leave Requests: ${leaveStats.approvedLeaveRequests || 0}`, 14, 110);
          pdf.text(`Approved Overtime Requests: ${leaveStats.approvedOvertimeRequests || 0}`, 14, 116);
        }

        // Capture the individual stats section as an image
        const canvas = await html2canvas(individualStatsRef.current, {
          scale: 1.5,
          useCORS: true,
          logging: false
        });

        // Add the image to the PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 28; // Margins on both sides
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add a new page for the screenshot
        pdf.addPage();
        pdf.text("Performance Dashboard Screenshot", pageWidth / 2, 15, { align: 'center' });

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 14, 25, imgWidth, imgHeight);

        // Save the PDF
        pdf.save(`${userName.replace("'s", "")}-performance-report-${reportDate.replace(/\//g, '-')}.pdf`);
      }

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Function to generate a detailed performance PDF for the selected individual
  const handleGeneratePerformancePDF = async () => {

    if (!taskStats) {
      toast.error("No individual data available to generate performance PDF");
      return;
    }

    if (!individualStatsRef.current) {
      toast.error("Cannot capture individual data for PDF");
      return;
    }

    setGeneratingReport(true);
    toast.info("Generating performance PDF...");

    try {
      // Get the selected user name
      const userName = getSelectedUserName();
      const cleanName = userName.replace("'s", "");

      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();

      // Add decorative header with gradient background
      pdf.setFillColor(100, 58, 237); // Purple
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setFillColor(79, 70, 229); // Indigo
      pdf.rect(0, 35, pageWidth, 5, 'F');

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255); // White
      pdf.text(`${cleanName} Performance Report`, pageWidth / 2, 20, { align: 'center' });

      // Add report metadata
      pdf.setFontSize(10);
      pdf.setTextColor(220, 220, 220); // Light gray
      pdf.text(`Generated on: ${reportDate} at ${reportTime}`, pageWidth / 2, 30, { align: 'center' });

      // Add summary section
      pdf.setFontSize(16);
      pdf.setTextColor(100, 58, 237); // Purple
      pdf.text("Performance Summary", 14, 50);

      // Add horizontal line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(14, 53, pageWidth - 14, 53);

      // Add performance metrics
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60); // Dark gray

      let yPos = 60;

      if (taskStats) {
        // Create a completion rate indicator
        const completionRate = taskStats.taskCompletionRate || 0;
        pdf.text(`Task Completion Rate: ${completionRate}%`, 14, yPos);

        // Draw progress bar background
        pdf.setFillColor(230, 230, 230);
        pdf.roundedRect(14, yPos + 3, 100, 6, 3, 3, 'F');

        // Draw progress bar fill
        pdf.setFillColor(74, 222, 128); // Green
        pdf.roundedRect(14, yPos + 3, completionRate, 6, 3, 3, 'F');

        yPos += 15;

        // Create an on-time rate indicator
        const onTimeRate = taskStats.onTimeCompletionRate || 0;
        pdf.text(`On-Time Completion Rate: ${onTimeRate}%`, 14, yPos);

        // Draw progress bar background
        pdf.setFillColor(230, 230, 230);
        pdf.roundedRect(14, yPos + 3, 100, 6, 3, 3, 'F');

        // Draw progress bar fill
        pdf.setFillColor(96, 165, 250); // Blue
        pdf.roundedRect(14, yPos + 3, onTimeRate, 6, 3, 3, 'F');

        yPos += 20;

        // Add task breakdown
        pdf.setFontSize(14);
        pdf.setTextColor(100, 58, 237); // Purple
        pdf.text("Task Breakdown", 14, yPos);
        yPos += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60); // Dark gray

        // Create a table for task breakdown
        const taskData = [
          ["Total Tasks", `${taskStats.totalTasksAssigned || 0}`],
          ["Completed", `${taskStats.tasksCompleted || 0}`],
          ["In Progress", `${taskStats.tasksInProgress || 0}`],
          ["Pending", `${taskStats.tasksPending || 0}`],
          ["Overdue", `${taskStats.tasksOverdue || 0}`]
        ];

        // Draw table
        const colWidth = 80;
        const rowHeight = 8;

        // Draw table header
        pdf.setFillColor(240, 240, 250);
        pdf.rect(14, yPos, colWidth * 2, rowHeight, 'F');
        pdf.setTextColor(100, 58, 237);
        pdf.text("Metric", 20, yPos + 5.5);
        pdf.text("Value", 20 + colWidth, yPos + 5.5);

        // Draw table rows
        pdf.setTextColor(60, 60, 60);
        taskData.forEach((row, i) => {
          const isEvenRow = i % 2 === 0;
          if (isEvenRow) {
            pdf.setFillColor(250, 250, 255);
            pdf.rect(14, yPos + rowHeight * (i + 1), colWidth * 2, rowHeight, 'F');
          }

          pdf.text(row[0], 20, yPos + rowHeight * (i + 1) + 5.5);
          pdf.text(row[1], 20 + colWidth, yPos + rowHeight * (i + 1) + 5.5);
        });

        yPos += rowHeight * (taskData.length + 1) + 15;
      }

      // Add leave and overtime section
      if (leaveStats) {
        pdf.setFontSize(14);
        pdf.setTextColor(100, 58, 237); // Purple
        pdf.text("Leave & Overtime", 14, yPos);
        yPos += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60); // Dark gray

        // Create a table for leave and overtime
        const leaveData = [
          ["Leave Days", `${leaveStats.totalLeaveDays || 0} days`],
          ["Overtime Hours", `${leaveStats.totalOvertimeHours || 0} hours`],
          ["Leave Requests", `${leaveStats.approvedLeaveRequests || 0}`],
          ["Overtime Requests", `${leaveStats.approvedOvertimeRequests || 0}`]
        ];

        // Draw table
        const colWidth = 80;
        const rowHeight = 8;

        // Draw table header
        pdf.setFillColor(240, 240, 250);
        pdf.rect(14, yPos, colWidth * 2, rowHeight, 'F');
        pdf.setTextColor(100, 58, 237);
        pdf.text("Metric", 20, yPos + 5.5);
        pdf.text("Value", 20 + colWidth, yPos + 5.5);

        // Draw table rows
        pdf.setTextColor(60, 60, 60);
        leaveData.forEach((row, i) => {
          const isEvenRow = i % 2 === 0;
          if (isEvenRow) {
            pdf.setFillColor(250, 250, 255);
            pdf.rect(14, yPos + rowHeight * (i + 1), colWidth * 2, rowHeight, 'F');
          }

          pdf.text(row[0], 20, yPos + rowHeight * (i + 1) + 5.5);
          pdf.text(row[1], 20 + colWidth, yPos + rowHeight * (i + 1) + 5.5);
        });

        yPos += rowHeight * (leaveData.length + 1) + 15;
      }

      // Add skills section if available
      if (userSkills && Array.isArray(userSkills.skills) && userSkills.skills.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(100, 58, 237); // Purple
        pdf.text("Skills & Proficiency", 14, yPos);
        yPos += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60); // Dark gray

        // Check if we need a new page
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          yPos = 20;

          // Add section header on new page
          pdf.setFontSize(14);
          pdf.setTextColor(100, 58, 237); // Purple
          pdf.text("Skills & Proficiency (continued)", 14, yPos);
          yPos += 10;
        }

        // Create a table for skills
        userSkills.skills.forEach((skill) => {
          // Check if we need a new page
          if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = 20;

            // Add section header on new page
            pdf.setFontSize(14);
            pdf.setTextColor(100, 58, 237); // Purple
            pdf.text("Skills & Proficiency (continued)", 14, yPos);
            yPos += 10;
          }

          // Draw skill card
          pdf.setFillColor(250, 250, 255);
          pdf.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'F');

          // Skill name
          pdf.setFontSize(12);
          pdf.setTextColor(60, 60, 60);
          pdf.text(skill.skillName, 20, yPos + 8);

          // Skill description
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(skill.skillDescription || 'No description', 20, yPos + 15);

          // Proficiency level
          const proficiencyColor =
            skill.proficiencyLevel === 'expert' ? [74, 222, 128] : // Green
            skill.proficiencyLevel === 'advanced' ? [139, 92, 246] : // Purple
            skill.proficiencyLevel === 'intermediate' ? [96, 165, 250] : // Blue
            [250, 204, 21]; // Yellow (beginner)

          pdf.setFillColor(...proficiencyColor);
          pdf.roundedRect(pageWidth - 70, yPos + 5, 50, 7, 3, 3, 'F');

          pdf.setFontSize(8);
          pdf.setTextColor(255, 255, 255);
          pdf.text(skill.proficiencyLevel || 'beginner', pageWidth - 45, yPos + 9.5, { align: 'center' });

          // Mentor & Certified badges
          if (skill.canMentor) {
            pdf.setFillColor(79, 70, 229); // Indigo
            pdf.roundedRect(pageWidth - 70, yPos + 15, 23, 7, 3, 3, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Mentor', pageWidth - 58.5, yPos + 19.5, { align: 'center' });
          }

          if (skill.isCertified) {
            pdf.setFillColor(245, 158, 11); // Amber
            pdf.roundedRect(pageWidth - 45, yPos + 15, 25, 7, 3, 3, 'F');
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Certified', pageWidth - 32.5, yPos + 19.5, { align: 'center' });
          }

          yPos += 30;
        });
      }

      // Add a new page for the dashboard screenshot
      pdf.addPage();

      // Add header
      pdf.setFillColor(100, 58, 237); // Purple
      pdf.rect(0, 0, pageWidth, 35, 'F');

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255); // White
      pdf.text("Performance Dashboard Visualization", pageWidth / 2, 20, { align: 'center' });

      // Capture the individual stats section as an image
      const canvas = await html2canvas(individualStatsRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false
      });

      // Add the image to the PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 28; // Margins on both sides
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 14, 40, imgWidth, imgHeight);

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`EmpTrack Performance Report - Generated on ${reportDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      pdf.save(`${cleanName}-detailed-performance-${reportDate.replace(/\//g, '-')}.pdf`);

      toast.success("Performance PDF generated successfully");
    } catch (error) {
      console.error("Error generating performance PDF:", error);
      toast.error("Failed to generate performance PDF");
    } finally {
      setGeneratingReport(false);
    }
  };

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



  const renderTeamStats = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      );
    }

    if (!teamStats || !teamStats.memberStats || teamStats.memberStats.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 bg-white shadow-sm rounded-lg border border-gray-200"
        >
          <div className="flex items-center justify-center space-x-2 text-xl text-gray-500">
            <span>No team data available</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-8" ref={teamStatsRef}>
        {/* Team Overview */}
        <motion.div
          variants={cardItemVariants}
          initial="hidden"
          animate="visible"
          className=""
          data-aos="fade-up"
        >
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">Team Overview</CardTitle>
              <CardDescription className="text-gray-600">Key team performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Team Members</p>
                      <p className="text-2xl font-bold text-gray-900">{teamStats.totalTeamMembers}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {teamStats.totalTeamMembers > 3 ? 'Large team' : 'Small team'}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                      <p className="text-2xl font-bold text-gray-900">{teamStats.avgCompletionRate}%</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #4ade80dd, #4ade80)',
                        boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${teamStats.avgCompletionRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. On-Time</p>
                      <p className="text-2xl font-bold text-gray-900">{teamStats.avgOnTimeRate}%</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #8b5cf6dd, #8b5cf6)',
                        boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${teamStats.avgOnTimeRate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Team Performance Chart */}
              <div className="mt-8 bg-white p-4 rounded-xl border border-gray-200 shadow-md">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Team Performance Comparison</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getTeamComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Completion Rate" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="On-Time Rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Team Performance:</span>
                  <span className={`font-medium text-sm px-3 py-1 rounded-full ${
                    teamStats.avgCompletionRate > 70
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {teamStats.avgCompletionRate > 70 ? 'Above Average' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {teamStats.avgCompletionRate > 70
                    ? 'Your team is performing well above average. Keep up the good work!'
                    : 'Your team could use some improvement in task completion rates. Consider additional training or resources.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Member Performance */}
        <motion.div
          variants={cardItemVariants}
          initial="hidden"
          animate="visible"
          className=""
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Card className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">Team Member Performance</CardTitle>
              <CardDescription className="text-gray-600">Individual metrics for each team member</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 pb-5 space-y-6">
              {/* Team Performance Metrics */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Team Performance Overview</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={teamStats.memberStats.map(member => ({
                        name: member.userName.split(' ')[0],
                        'Completion Rate': member.completionRate,
                        'On-Time Rate': member.onTimeRate
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Completion Rate"
                        stroke="#4ade80"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="On-Time Rate"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Team performance summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Top Performer</p>
                      <p className="text-lg font-bold text-gray-900">
                        {teamStats.memberStats.reduce((prev, current) =>
                          (prev.completionRate > current.completionRate) ? prev : current
                        ).userName.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Skills</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(teamStats.memberStats.reduce((sum, member) => sum + member.skillCount, 0) / teamStats.memberStats.length)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-lg font-bold text-gray-900">
                        {teamStats.memberStats.reduce((sum, member) => sum + member.totalTasks, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team member cards */}
              <div className="space-y-5">
                {teamStats.memberStats.map((member, index) => (
                  <motion.div
                    key={member.userId || index}
                    className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                          {member.userName.split(' ').map(name => name[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg">{member.userName}</h4>
                          <p className="text-sm text-gray-600">{member.jobTitle || 'Team Member'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          member.completionRate > 75 ? 'bg-green-100 text-green-800 border border-green-200' :
                          member.completionRate > 50 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {member.completionRate}% Completion
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Tasks</span>
                          <span>{member.completedTasks} / {member.totalTasks}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            className="h-2.5 rounded-full"
                            style={{
                              background: 'linear-gradient(90deg, #4ade80dd, #4ade80)',
                              boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(member.completedTasks / Math.max(member.totalTasks, 1)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>On-time</span>
                          <span>{member.onTimeRate}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            className="h-2.5 rounded-full"
                            style={{
                              background: 'linear-gradient(90deg, #60a5fadd, #60a5fa)',
                              boxShadow: '0 0 8px rgba(96, 165, 250, 0.5)'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${member.onTimeRate}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Skills</span>
                          <span>{member.skillCount}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            className="h-2.5 rounded-full"
                            style={{
                              background: 'linear-gradient(90deg, #8b5cf6dd, #8b5cf6)',
                              boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (member.skillCount / 10) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Leave</p>
                        <p className="text-sm font-semibold text-gray-700">{member.totalLeaveDays} days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Overtime</p>
                        <p className="text-sm font-semibold text-gray-700">{member.totalOvertimeHours} hrs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm font-semibold text-gray-700 truncate" title={member.email}>{member.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export/Print Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-md mb-6"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800">Export Options</h3>
          <p className="text-sm text-gray-600 mb-4">Generate reports or export data for your team's performance metrics</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Text Report</h4>
                  <p className="text-xs text-gray-500 mt-1">Generate a detailed text report with all team metrics</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateReport}
                disabled={generatingReport || !teamStats}
                className="w-full bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {generatingReport ? 'Generating...' : 'Generate Team Report'}
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">PDF Export</h4>
                  <p className="text-xs text-gray-500 mt-1">Export a professional PDF with charts and metrics</p>
                </div>
              </div>
              <Button
                onClick={handleDownloadPDF}
                disabled={generatingReport || !teamStats}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                {generatingReport ? 'Exporting...' : 'Export Team PDF'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  const headerOpacity = useSpring(1);
  const headerScale = useSpring(1);
  const headerY = useSpring(0);

  const fetchTaskStats = async () => {
    setLoading(true);
    try {
      console.log("Fetching task stats for user:", user.id);
      const response = await api.get(`/analytics/user/${user.id}/task-stats`);
      console.log("Task stats response:", response.data);
      setTaskStats(response.data);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      toast.error("Failed to load task statistics");
      setTaskStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskCompletionRate = async () => {
    setLoading(true);
    try {
      console.log("Fetching task completion rate for user:", user.id);
      const response = await api.get(`/analytics/user/${user.id}/task-completion-rate`);
      console.log("Task completion rate response:", response.data);
      setTaskCompletionRate(response.data);
    } catch (error) {
      console.error("Error fetching task completion rate:", error);
      toast.error("Failed to load task completion data");
      setTaskCompletionRate(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSkills = async () => {
    setLoading(true);
    try {
      console.log("Fetching user skills for user:", user.id);
      const response = await api.get(`/analytics/user/${user.id}/user-skills`);
      console.log("User skills response:", response.data);
      setUserSkills(response.data);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      toast.error("Failed to load user skills");
      setUserSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveOvertime = async () => {
    setLoading(true);
    try {
      console.log("Fetching leave and overtime for user:", user.id);
      const response = await api.get(`/analytics/user/${user.id}/leave-overtime`);
      console.log("Leave and overtime response:", response.data);
      setLeaveStats(response.data);
    } catch (error) {
      console.error("Error fetching leave and overtime data:", error);
      toast.error("Failed to load leave and overtime data");
      setLeaveStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Analytics Background Wallpaper */}
      <AnalyticsBackground />

      <TopNavigation userRole={user?.role} className="relative z-10" />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 bg-white/30 backdrop-blur-sm rounded-xl mt-4">

        {/* Header - Clean and professional */}
        <motion.div
          style={{ opacity: headerOpacity, scale: headerScale, y: headerY }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm sticky top-0 z-10"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Performance Analytics</h1>
            <AIAnalyticsButton
              userData={user}
              userSkills={userSkills}
              taskStats={taskStats}
              leaveStats={leaveStats}
            />
          </div>
        </motion.div>

        {(user.role === 'supervisor' || user.role === 'manager') ? (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            {/* Tabs - Clean and professional */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-2"
            >
              <TabsList className="bg-gray-100 p-1.5 rounded-md flex space-x-1 border border-gray-200">
                <TabsTrigger
                  value="individual"
                  className="py-2 px-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-gray-600 transition-all"
                >
                  Individual
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="py-2 px-6 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-gray-600 transition-all"
                >
                  Team
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TabsContent value="individual" className="space-y-8 relative" ref={individualStatsRef}>
                  {/* User Selection - Clean and professional */}
                  {(user.role === 'supervisor' || user.role === 'manager') && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={cardItemVariants}
                      className="mb-6"
                      data-aos="fade-up"
                    >
                      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                          <CardTitle className="text-lg font-semibold text-gray-900">Select Employee</CardTitle>
                          <CardDescription className="text-gray-600">Choose an employee to view their performance</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4">
                          <Select value={selectedUserId} onValueChange={handleUserChange} disabled={loading}>
                            <SelectTrigger className="w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                              <SelectValue placeholder="Select an employee" />
                            </SelectTrigger>
                            <SelectContent className="border border-gray-200 shadow-md rounded-md">
                              {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id} className="focus:bg-blue-50">
                                  {member.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Task Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                      variants={cardItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="h-full"
                      data-aos="fade-up"
                      data-aos-delay="100"
                    >
                      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-full">
                        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                          <CardTitle className="text-lg font-semibold text-gray-900">{getSelectedUserName()} Task Status</CardTitle>
                          <CardDescription className="text-gray-600">Task distribution by status</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5 pb-5">
                          {loading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-10 w-full rounded-md" />
                              <Skeleton className="h-10 w-full rounded-md" />
                              <Skeleton className="h-10 w-full rounded-md" />
                              <Skeleton className="h-10 w-full rounded-md" />
                            </div>
                          ) : taskStats ? (
                            getTaskStatusData().length === 1 && getTaskStatusData()[0].name === 'No Tasks' ? (
                              <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <ArrowRight className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-sm">No task data available</span>
                              </div>
                            ) : (
                              <div className="space-y-5">
                                {/* Pie Chart for Task Status */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
                                  <h4 className="text-sm font-medium text-gray-700 mb-4">Task Status Distribution</h4>
                                  <div className="h-64 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie
                                          data={getTaskStatusData()}
                                          cx="50%"
                                          cy="50%"
                                          labelLine={false}
                                          outerRadius={80}
                                          fill="#8884d8"
                                          dataKey="value"
                                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                          {getTaskStatusData().map((entry, index) => {
                                            // Define status colors
                                            const statusColors = {
                                              'Completed': '#4ade80',
                                              'In Progress': '#60a5fa',
                                              'Pending': '#f59e0b',
                                              'Overdue': '#ef4444',
                                              'Other': '#9ca3af'
                                            };
                                            const color = statusColors[entry.name] || statusColors['Other'];
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                          })}
                                        </Pie>
                                        <Tooltip
                                          formatter={(value, name, props) => [`${value} tasks`, name]}
                                          contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                          }}
                                        />
                                        <Legend
                                          layout="horizontal"
                                          verticalAlign="bottom"
                                          align="center"
                                          wrapperStyle={{ paddingTop: '20px' }}
                                        />
                                      </PieChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>

                                {/* Task Status Bars */}
                                <div className="space-y-3 mt-4">
                                  {getTaskStatusData().map((item, index) => {
                                    const total = taskStats.totalTasksAssigned || getTaskStatusData().reduce((sum, i) => sum + i.value, 0);
                                    const percentage = total ? Math.round((item.value / total) * 100) : 0;

                                    // Define status colors
                                    const statusColors = {
                                      'Completed': '#4ade80',
                                      'In Progress': '#60a5fa',
                                      'Pending': '#f59e0b',
                                      'Overdue': '#ef4444',
                                      'Other': '#9ca3af'
                                    };

                                    const color = statusColors[item.name] || statusColors['Other'];

                                    return (
                                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center">
                                            <div
                                              className="w-3 h-3 rounded-full mr-2"
                                              style={{ backgroundColor: color }}
                                            />
                                            <span className="font-medium text-gray-800">{item.name}</span>
                                          </div>
                                          <span className="text-sm font-medium text-gray-700">{item.value} ({percentage}%)</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                          <motion.div
                                            className="h-2.5 rounded-full"
                                            style={{
                                              background: `linear-gradient(90deg, ${color}dd, ${color})`,
                                              boxShadow: `0 0 8px ${color}80`
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Summary */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex justify-between items-center text-sm text-gray-700">
                                    <span>Total Tasks:</span>
                                    <span className="font-semibold">{taskStats.totalTasksAssigned || 0}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-gray-400" />
                              </div>
                              <span className="text-sm">No task data available</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      variants={cardItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="h-full"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden h-full">
                        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                          <CardTitle className="text-lg font-semibold text-gray-900">{getSelectedUserName()} Completion Rates</CardTitle>
                          <CardDescription className="text-gray-600">Completion and on-time metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-5 pb-5">
                          {loading ? (
                            <div className="space-y-6">
                              <Skeleton className="h-16 w-full rounded-md" />
                              <Skeleton className="h-16 w-full rounded-md" />
                              <Skeleton className="h-8 w-full rounded-md" />
                            </div>
                          ) : taskStats ? (
                            <div className="space-y-6">
                              {/* Bar Chart for Completion Metrics */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
                                <h4 className="text-sm font-medium text-gray-700 mb-4">Performance Metrics</h4>
                                <div className="h-64 flex items-center justify-center">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={[
                                        {
                                          name: 'Completion Rate',
                                          value: taskStats.taskCompletionRate || 0,
                                          fill: '#4ade80'
                                        },
                                        {
                                          name: 'On-Time Rate',
                                          value: taskStats.onTimeCompletionRate || 0,
                                          fill: '#60a5fa'
                                        }
                                      ]}
                                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                      <XAxis dataKey="name" />
                                      <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                      <Tooltip
                                        formatter={(value) => [`${value}%`, 'Rate']}
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          borderRadius: '8px',
                                          border: '1px solid #e2e8f0',
                                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                      />
                                      <Legend />
                                      <Bar
                                        dataKey="value"
                                        name="Percentage"
                                        radius={[4, 4, 0, 0]}
                                        barSize={60}
                                        fill="#8884d8"
                                        label={{
                                          position: 'top',
                                          formatter: (value) => `${value}%`,
                                          fill: '#666',
                                          fontSize: 12
                                        }}
                                      >
                                        {[
                                          { name: 'Completion Rate', fill: '#4ade80' },
                                          { name: 'On-Time Rate', fill: '#60a5fa' }
                                        ].map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* Completion Rate */}
                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium text-gray-800 text-lg">Completion Rate</h4>
                                    <p className="text-sm text-gray-500 mt-1">{taskStats.tasksCompleted || 0} of {taskStats.totalTasksAssigned || 0} tasks completed</p>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{taskStats.taskCompletionRate || 0}%</div>
                                </div>
                                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <motion.div
                                    className="h-3 rounded-full"
                                    style={{
                                      background: 'linear-gradient(90deg, #4ade80dd, #4ade80)',
                                      boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)'
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${taskStats.taskCompletionRate || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* On-Time Rate */}
                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium text-gray-800 text-lg">On-Time Rate</h4>
                                    <p className="text-sm text-gray-500 mt-1">{taskStats.tasksCompletedOnTime || 0} of {taskStats.tasksCompleted || 0} completed on time</p>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{taskStats.onTimeCompletionRate || 0}%</div>
                                </div>
                                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                  <motion.div
                                    className="h-3 rounded-full"
                                    style={{
                                      background: 'linear-gradient(90deg, #60a5fadd, #60a5fa)',
                                      boxShadow: '0 0 8px rgba(96, 165, 250, 0.5)'
                                    }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${taskStats.onTimeCompletionRate || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* Additional Metrics */}
                              {taskStats.avgCompletionTime && (
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium text-gray-800 text-lg">Avg. Completion Time</h4>
                                      <p className="text-sm text-gray-500 mt-1">Average time to complete tasks</p>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{taskStats.avgCompletionTime} days</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-gray-400" />
                              </div>
                              <span className="text-sm">No completion data available</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Leave & Overtime */}
                  <motion.div
                    variants={cardItemVariants}
                    initial="hidden"
                    animate="visible"
                    className=""
                    data-aos="fade-up"
                    data-aos-delay="300"
                  >
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                        <CardTitle className="text-lg font-semibold text-gray-900">{getSelectedUserName()} Leave & Overtime</CardTitle>
                        <CardDescription className="text-gray-600">Last 3 months summary</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5 pb-5">
                        {loading ? (
                          <div className="space-y-6">
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-24 w-full rounded-md" />
                          </div>
                        ) : leaveStats ? (
                          <div className="space-y-6">
                            {/* Bar Chart for Leave & Overtime */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
                              <h4 className="text-sm font-medium text-gray-700 mb-4">Leave & Overtime Comparison</h4>
                              <div className="h-64 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={[
                                      {
                                        name: 'Leave Days',
                                        value: leaveStats.totalLeaveDays || 0,
                                        fill: '#8b5cf6'
                                      },
                                      {
                                        name: 'Overtime Hours',
                                        value: leaveStats.totalOvertimeHours || 0,
                                        fill: '#f59e0b'
                                      }
                                    ]}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                      formatter={(value, name) => [
                                        name === 'Leave Days' ? `${value} days` : `${value} hours`,
                                        name
                                      ]}
                                      contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                      }}
                                    />
                                    <Legend />
                                    <Bar
                                      dataKey="value"
                                      name="Value"
                                      radius={[4, 4, 0, 0]}
                                      barSize={60}
                                      label={{
                                        position: 'top',
                                        formatter: (value) => value,
                                        fill: '#666',
                                        fontSize: 12
                                      }}
                                    >
                                      {[
                                        { name: 'Leave Days', fill: '#8b5cf6' },
                                        { name: 'Overtime Hours', fill: '#f59e0b' }
                                      ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Leave Days */}
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-800 text-lg">Leave Days</h4>
                                  <p className="text-sm text-gray-500 mt-1">Total approved leave days</p>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{leaveStats.totalLeaveDays || 0} days</div>
                              </div>
                              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className="h-3 rounded-full"
                                  style={{
                                    background: 'linear-gradient(90deg, #8b5cf6dd, #8b5cf6)',
                                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (leaveStats.totalLeaveDays || 0) / 0.3)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>0 days</span>
                                <span>15 days</span>
                                <span>30 days</span>
                              </div>
                            </div>

                            {/* Overtime Hours */}
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-800 text-lg">Overtime Hours</h4>
                                  <p className="text-sm text-gray-500 mt-1">Total approved overtime hours</p>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{leaveStats.totalOvertimeHours || 0} hrs</div>
                              </div>
                              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className="h-3 rounded-full"
                                  style={{
                                    background: 'linear-gradient(90deg, #f59e0bdd, #f59e0b)',
                                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)'
                                  }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (leaveStats.totalOvertimeHours || 0) / 0.6)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>0 hrs</span>
                                <span>30 hrs</span>
                                <span>60 hrs</span>
                              </div>
                            </div>

                            {/* Request Summary */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Leave Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{leaveStats.approvedLeaveRequests || 0}</p>
                              </div>
                              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Overtime Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{leaveStats.approvedOvertimeRequests || 0}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <ArrowRight className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-sm">No leave or overtime data available</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Task Completion Rate */}
                  <motion.div
                    variants={cardItemVariants}
                    initial="hidden"
                    animate="visible"
                    className=""
                    data-aos="fade-up"
                    data-aos-delay="400"
                  >
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                        <CardTitle className="text-lg font-semibold text-gray-900">{getSelectedUserName()} Task Completion Rate</CardTitle>
                        <CardDescription className="text-gray-600">Tasks by status</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5 pb-5">
                        {loading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                            <Skeleton className="h-10 w-full rounded-md" />
                          </div>
                        ) : taskCompletionRate ? (
                          getTaskCompletionRateData().length === 1 && getTaskCompletionRateData()[0].name === 'No Tasks' ? (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-gray-400" />
                              </div>
                              <span className="text-sm">No task data available</span>
                            </div>
                          ) : (
                            <div className="space-y-5">
                              {/* Pie Chart for Task Completion Rate */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
                                <h4 className="text-sm font-medium text-gray-700 mb-4">Task Status Distribution</h4>
                                <div className="h-64 flex items-center justify-center">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={getTaskCompletionRateData()}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                      >
                                        {getTaskCompletionRateData().map((entry, index) => {
                                          // Define status colors
                                          const statusColors = {
                                            'Completed': '#4ade80',
                                            'In Progress': '#60a5fa',
                                            'Pending': '#f59e0b',
                                            'Other': '#9ca3af'
                                          };
                                          const color = statusColors[entry.name] || COLORS[index % COLORS.length];
                                          return <Cell key={`cell-${index}`} fill={color} stroke="#ffffff" strokeWidth={2} />;
                                        })}
                                      </Pie>
                                      <Tooltip
                                        formatter={(value, name, props) => [`${value} tasks`, name]}
                                        contentStyle={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          borderRadius: '8px',
                                          border: '1px solid #e2e8f0',
                                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                      />
                                      <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* Task Status Bars */}
                              <div className="space-y-3 mt-4">
                                {getTaskCompletionRateData().map((item, index) => {
                                  const total = taskCompletionRate.totalTasks || getTaskCompletionRateData().reduce((sum, i) => sum + i.value, 0);
                                  const percentage = total ? Math.round((item.value / total) * 100) : 0;

                                  // Define status colors
                                  const statusColors = {
                                    'Completed': '#4ade80',
                                    'In Progress': '#60a5fa',
                                    'Pending': '#f59e0b',
                                    'Other': '#9ca3af'
                                  };

                                  const color = statusColors[item.name] || COLORS[index % COLORS.length];

                                  return (
                                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                          <div
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: color }}
                                          />
                                          <span className="font-medium text-gray-800">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{item.value} ({percentage}%)</span>
                                      </div>
                                      <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <motion.div
                                          className="h-2.5 rounded-full"
                                          style={{
                                            background: `linear-gradient(90deg, ${color}dd, ${color})`,
                                            boxShadow: `0 0 8px ${color}80`
                                          }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percentage}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Summary */}
                              {taskCompletionRate.totalTasks && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="flex justify-between items-center text-sm text-gray-700">
                                    <span>Total Tasks:</span>
                                    <span className="font-semibold">{taskCompletionRate.totalTasks || getTaskCompletionRateData().reduce((sum, i) => sum + i.value, 0)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <ArrowRight className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-sm">No task data available</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* User Skills */}
                  <motion.div
                    variants={cardItemVariants}
                    initial="hidden"
                    animate="visible"
                    className=""
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                        <CardTitle className="text-lg font-semibold text-gray-900">{getSelectedUserName()} Skills</CardTitle>
                        <CardDescription className="text-gray-600">Skills and proficiency levels</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5 pb-5">
                        {loading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-16 w-full rounded-md" />
                            <Skeleton className="h-16 w-full rounded-md" />
                          </div>
                        ) : userSkills ? (
                          Array.isArray(userSkills.skills) ? (
                            userSkills.skills.length > 0 ? (
                              <div className="space-y-6">
                                {/* Skills List */}
                                <div className="space-y-4">
                                  {userSkills.skills.map((skill, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                        <div>
                                          <h4 className="font-medium text-gray-900 text-lg">{skill.skillName}</h4>
                                          <p className="text-sm text-gray-600 mt-1">{skill.skillDescription}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                              skill.proficiencyLevel === 'expert' ? 'bg-green-100 text-green-800 border border-green-200' :
                                              skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                              skill.proficiencyLevel === 'advanced' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                              'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            }`}
                                          >
                                            {skill.proficiencyLevel || 'beginner'}
                                          </span>
                                          {skill.canMentor && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                              Mentor
                                            </span>
                                          )}
                                          {skill.isCertified && (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                              Certified
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Proficiency Bar */}
                                      <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                          <span>Proficiency Level</span>
                                          <span>{skill.proficiencyLevel || 'beginner'}</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                          <motion.div
                                            className="h-2.5 rounded-full"
                                            style={{
                                              background: skill.proficiencyLevel === 'expert' ? 'linear-gradient(90deg, #4ade80dd, #4ade80)' :
                                                skill.proficiencyLevel === 'advanced' ? 'linear-gradient(90deg, #8b5cf6dd, #8b5cf6)' :
                                                skill.proficiencyLevel === 'intermediate' ? 'linear-gradient(90deg, #60a5fadd, #60a5fa)' :
                                                'linear-gradient(90deg, #f59e0bdd, #f59e0b)',
                                              boxShadow: skill.proficiencyLevel === 'expert' ? '0 0 8px rgba(74, 222, 128, 0.5)' :
                                                skill.proficiencyLevel === 'advanced' ? '0 0 8px rgba(139, 92, 246, 0.5)' :
                                                skill.proficiencyLevel === 'intermediate' ? '0 0 8px rgba(96, 165, 250, 0.5)' :
                                                '0 0 8px rgba(245, 158, 11, 0.5)'
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{
                                              width: skill.proficiencyLevel === 'expert' ? '100%' :
                                                skill.proficiencyLevel === 'advanced' ? '75%' :
                                                skill.proficiencyLevel === 'intermediate' ? '50%' :
                                                '25%'
                                            }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Summary */}
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-sm text-gray-700">
                                      <span>Total Skills:</span>
                                      <span className="font-semibold">{userSkills.skills.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
                                      <span>Can Mentor:</span>
                                      <span className="font-semibold">{userSkills.skills.filter(skill => skill.canMentor).length} skills</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
                                      <span>Certified:</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <ArrowRight className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-sm">No skills registered</span>
                              </div>
                            )
                          ) : (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-gray-400" />
                              </div>
                              <span className="text-sm">No skills data available</span>
                            </div>
                          )
                        ) : (
                          <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-2">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <ArrowRight className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-sm">No skills data available</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Export/Print Buttons for Individual View - Added at the bottom of the page */}
                  <motion.div
                    variants={cardItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-8"
                    data-aos="fade-up"
                    data-aos-delay="600"
                  >
                    <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
                        <CardTitle className="text-lg font-semibold text-gray-900">Export Options</CardTitle>
                        <CardDescription className="text-gray-600">Generate reports or export performance data</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5 pb-5">
                        <motion.div
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Download className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">PDF Export</h4>
                              <p className="text-xs text-gray-500 mt-1">Export a professional PDF with charts and metrics</p>
                            </div>
                          </div>
                          <Button
                            onClick={handleGeneratePerformancePDF}
                            disabled={generatingReport || !taskStats}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            {generatingReport ? 'Generating...' : `Generate ${getSelectedUserName().replace("'s", "")} Performance PDF`}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="team">
                  {renderTeamStats()}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        ) : (
          <div className="space-y-8">
            {/* Task Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                variants={cardItemVariants}
                initial="hidden"
                animate="visible"
                className="card-gradient-enhanced backdrop-blur-md rounded-2xl border-white/20 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay="100"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Task Status</CardTitle>
                    <CardDescription>Task distribution by status</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {loading ? (
                      <Skeleton className="h-64 w-full rounded-lg" />
                    ) : taskStats ? (
                      getTaskStatusData().length === 1 && getTaskStatusData()[0].name === 'No Tasks' ? (
                        <div className="h-64 flex items-center justify-center text-gray-500">No task data available</div>
                      ) : (
                        <div className="space-y-4">
                          {getTaskStatusData().map((item, index) => {
                            const total = taskStats.totalTasksAssigned || getTaskStatusData().reduce((sum, i) => sum + i.value, 0);
                            const percentage = total ? Math.round((item.value / total) * 100) : 0;
                            return (
                              <div key={index} className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{
                                    backgroundColor: item.name === 'Completed' ? '#4ade80' :
                                                    item.name === 'In Progress' ? '#60a5fa' :
                                                    item.name === 'Pending' ? '#f59e0b' :
                                                    item.name === 'Overdue' ? '#ef4444' : '#9ca3af'
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>{item.name}</span>
                                    <span>{item.value} ({percentage}%)</span>
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                      className="h-2 rounded-full"
                                      style={{
                                        backgroundColor: item.name === 'Completed' ? '#4ade80' :
                                                        item.name === 'In Progress' ? '#60a5fa' :
                                                        item.name === 'Pending' ? '#f59e0b' :
                                                        item.name === 'Overdue' ? '#ef4444' : '#9ca3af'
                                      }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      <div className="h-64 flex items-center justify-center space-x-2 text-gray-500">
                        <span>No task data available</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardItemVariants}
                initial="hidden"
                animate="visible"
                className="card-gradient-enhanced backdrop-blur-md rounded-2xl border-white/20 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay="200"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Completion Rates</CardTitle>
                    <CardDescription>Completion and on-time metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-6">
                    {loading ? (
                      <Skeleton className="h-64 w-full rounded-lg" />
                    ) : taskStats ? (
                      <>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <div>
                              <h4 className="font-medium">Completion Rate</h4>
                              <p className="text-xs text-gray-500">{taskStats.tasksCompleted || 0} / {taskStats.totalTasksAssigned || 0}</p>
                            </div>
                            <p className="font-bold">{taskStats.taskCompletionRate || 0}%</p>
                          </div>
                          <div className="bg-gray-200/60 backdrop-blur-sm rounded-full h-2.5 overflow-hidden shadow-inner">
                            <motion.div
                              className="h-2.5 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-glow-success"
                              initial={{ width: 0 }}
                              animate={{ width: `${taskStats.taskCompletionRate || 0}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <div>
                              <h4 className="font-medium">On-Time Rate</h4>
                              <p className="text-xs text-gray-500">{taskStats.tasksCompletedOnTime || 0} / {taskStats.tasksCompleted || 0}</p>
                            </div>
                            <p className="font-bold">{taskStats.onTimeCompletionRate || 0}%</p>
                          </div>
                          <div className="bg-gray-200/60 backdrop-blur-sm rounded-full h-2.5 overflow-hidden shadow-inner">
                            <motion.div
                              className="h-2.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-glow-info"
                              initial={{ width: 0 }}
                              animate={{ width: `${taskStats.onTimeCompletionRate || 0}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        {taskStats.avgCompletionTime && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Avg. Completion Time</span>
                            <span className="font-bold">{taskStats.avgCompletionTime} days</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-64 flex items-center justify-center space-x-2 text-gray-500">
                        <span>No completion data available</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Leave & Overtime */}
            <motion.div
              variants={cardItemVariants}
              initial="hidden"
              animate="visible"
              className="card-gradient-enhanced backdrop-blur-md rounded-2xl border-white/20 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="300"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Leave & Overtime</CardTitle>
                  <CardDescription>Last 3 months summary</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  {loading ? (
                    <Skeleton className="h-64 w-full rounded-lg" />
                  ) : leaveStats ? (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <h4 className="font-medium">Leave Days</h4>
                          <p className="font-bold">{leaveStats.totalLeaveDays || 0} days</p>
                        </div>
                        <div className="bg-gray-200/60 backdrop-blur-sm rounded-full h-2.5 overflow-hidden shadow-inner">
                          <motion.div
                            className="h-2.5 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full shadow-glow-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (leaveStats.totalLeaveDays || 0) / 0.3)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>30</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <h4 className="font-medium">Overtime Hours</h4>
                          <p className="font-bold">{leaveStats.totalOvertimeHours || 0} hrs</p>
                        </div>
                        <div className="bg-gray-200/60 backdrop-blur-sm rounded-full h-2.5 overflow-hidden shadow-inner">
                          <motion.div
                            className="h-2.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-glow-warning"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (leaveStats.totalOvertimeHours || 0) / 0.6)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>60</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          variants={cardItemVariants}
                          className="backdrop-blur-md bg-white/80 p-4 rounded-xl border border-white/50 shadow-subtle text-center"
                          whileHover={{ scale: 1.05, y: -3, transition: { duration: 0.2 } }}
                        >
                          <p className="text-sm text-gray-600">Leave Requests</p>
                          <p className="text-xl font-bold">{leaveStats.approvedLeaveRequests || 0}</p>
                        </motion.div>
                        <motion.div
                          variants={cardItemVariants}
                          className="backdrop-blur-md bg-white/80 p-4 rounded-xl border border-white/50 shadow-subtle text-center"
                          whileHover={{ scale: 1.05, y: -3, transition: { duration: 0.2 } }}
                        >
                          <p className="text-sm text-gray-600">Overtime Requests</p>
                          <p className="text-xl font-bold">{leaveStats.approvedOvertimeRequests || 0}</p>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center space-x-2 text-gray-500">
                      <span>No leave or overtime data available</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Completion Rate */}
            <motion.div
              variants={cardItemVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-purple-100/70 shadow-lg overflow-hidden"
              data-aos="fade-up"
              data-aos-delay="400"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(124, 58, 237, 0.04)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 border-b border-purple-100/50 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-purple-500" />
                  <h3 className="text-xl font-semibold text-gray-800">Your Task Completion Rate</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Tasks by status</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <Skeleton className="h-64 w-full rounded-lg" />
                ) : taskCompletionRate ? (
                  getTaskCompletionRateData().length === 1 && getTaskCompletionRateData()[0].name === 'No Tasks' ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-purple-300" />
                      </div>
                      <span className="text-sm font-medium">No task data available</span>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {getTaskCompletionRateData().map((item, index) => {
                        const total = taskCompletionRate.totalTasks || getTaskCompletionRateData().reduce((sum, i) => sum + i.value, 0);
                        const percentage = total ? Math.round((item.value / total) * 100) : 0;

                        // Define status colors with gradients and shadows
                        const statusStyles = {
                          'Completed': {
                            bg: '#4ade80',
                            gradient: 'from-green-400 to-green-600',
                            shadow: 'shadow-glow-success'
                          },
                          'In Progress': {
                            bg: '#60a5fa',
                            gradient: 'from-blue-400 to-blue-600',
                            shadow: 'shadow-glow-info'
                          },
                          'Pending': {
                            bg: '#f59e0b',
                            gradient: 'from-amber-400 to-amber-600',
                            shadow: 'shadow-glow-warning'
                          },
                          'default': {
                            bg: COLORS[index % COLORS.length],
                            gradient: `from-purple-400 to-purple-600`,
                            shadow: 'shadow-glow-primary'
                          }
                        };

                        const style = statusStyles[item.name] || statusStyles.default;

                        return (
                          <motion.div
                            key={index}
                            className="bg-white p-4 rounded-xl border border-purple-100/30 shadow-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: style.bg }}
                                />
                                <span className="font-medium text-gray-800">{item.name}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{item.value} ({percentage}%)</span>
                            </div>
                            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                              <motion.div
                                className={`h-3 rounded-full bg-gradient-to-r ${style.gradient} ${style.shadow}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Summary */}
                      {taskCompletionRate.totalTasks && (
                        <motion.div
                          className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="text-sm font-medium text-gray-700">Total Tasks:</span>
                          <span className="text-sm font-bold text-purple-700">{taskCompletionRate.totalTasks}</span>
                        </motion.div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-purple-300" />
                    </div>
                    <span className="text-sm font-medium">No task data available</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* User Skills */}
            <motion.div
              variants={cardItemVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-purple-100/70 shadow-lg overflow-hidden"
              data-aos="fade-up"
              data-aos-delay="500"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(124, 58, 237, 0.04)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 border-b border-purple-100/50 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-500" />
                  <h3 className="text-xl font-semibold text-gray-800">Your Skills</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Skills and proficiency levels</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <Skeleton className="h-64 w-full rounded-lg" />
                ) : userSkills ? (
                  Array.isArray(userSkills.skills) ? (
                    userSkills.skills.length > 0 ? (
                      <div className="space-y-5">
                        {userSkills.skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            className="bg-white p-5 rounded-xl border border-purple-100/50 shadow-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{
                              y: -3,
                              boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.1), 0 4px 6px -2px rgba(124, 58, 237, 0.05)",
                              transition: { duration: 0.2 }
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800">{skill.skillName}</h4>
                                <p className="text-sm text-gray-600 mt-1">{skill.skillDescription}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    skill.proficiencyLevel === 'expert' ? 'bg-green-100 text-green-800 border border-green-200' :
                                    skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                    skill.proficiencyLevel === 'advanced' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  }`}
                                >
                                  {skill.proficiencyLevel || 'beginner'}
                                </span>
                                {skill.canMentor && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    Mentor
                                  </span>
                                )}
                                {skill.isCertified && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                    Certified
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                          <Users className="w-8 h-8 text-purple-300" />
                        </div>
                        <span className="text-sm font-medium">No skills registered</span>
                      </div>
                    )
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                        <Users className="w-8 h-8 text-purple-300" />
                      </div>
                      <span className="text-sm font-medium">No skills data available</span>
                    </div>
                  )
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                      <Users className="w-8 h-8 text-purple-300" />
                    </div>
                    <span className="text-sm font-medium">No skills data available</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Export/Print Buttons for Employee View */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Export Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  disabled={generatingReport || !taskStats}
                  className="bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  {generatingReport ? 'Generating...' : 'Generate Text Report'}
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={generatingReport || !taskStats}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-glow-primary transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  {generatingReport ? 'Exporting...' : 'Export Basic PDF'}
                </Button>
              </div>
            </div>


          </div>
        )}
      </main>


    </motion.div>
  );
};

export default Analytics;