import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TopNavigation from "../components/TopNavigation";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { ScrollAnimationSection, initializeAOS, refreshAOS, fadeInVariants, slideUpVariants, staggerContainerVariants, cardItemVariants, progressBarVariants } from "../components/AnimationWrapper";
import "aos/dist/aos.css";
import "../styles/animations.css";
import "../styles/dashboard-float.css";
import "../styles/analytics-enhancements.css";
import "../styles/analytics-background.css";
import { CheckCircle, Clock, ArrowRight, Users, ClipboardList, FileText, Download } from 'lucide-react';
import AnalyticsBackground from '../components/AnalyticsBackground';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
        const response = await api.get('/supervisor/team');
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

  const fetchUserStats = async (userId) => {
    setLoading(true);
    try {
      console.log("Fetching stats for user:", userId);
      const taskResponse = await api.get(`/analytics/user/${userId}/task-stats`);
      console.log("Raw task stats response:", taskResponse.data);
      setTaskStats(taskResponse.data);
      const leaveResponse = await api.get(`/analytics/user/${userId}/leave-overtime`);
      console.log("Raw leave stats response:", leaveResponse.data);
      setLeaveStats(leaveResponse.data);
      const completionRateResponse = await api.get(`/analytics/user/${userId}/task-completion-rate`);
      console.log("Raw task completion rate response:", completionRateResponse.data);
      setTaskCompletionRate(completionRateResponse.data);
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
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">Team Overview</CardTitle>
              <CardDescription className="text-gray-600">Key team performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Team Members</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.totalTeamMembers}</p>
                </div>

                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center mr-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.avgCompletionRate}%</p>
                </div>

                <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. On-Time</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{teamStats.avgOnTimeRate}%</p>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span>Team Performance:</span>
                  <span className="font-medium text-blue-600">
                    {teamStats.avgCompletionRate > 70 ? 'Above Average' : 'Needs Improvement'}
                  </span>
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
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-lg font-semibold text-gray-900">Team Member Performance</CardTitle>
              <CardDescription className="text-gray-600">Individual metrics for each team member</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 pb-5 space-y-6">
              {/* Team performance summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Top Performer</span>
                  <span className="text-sm font-bold text-gray-900">
                    {teamStats.memberStats.reduce((prev, current) =>
                      (prev.completionRate > current.completionRate) ? prev : current
                    ).userName.split(' ')[0]}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Avg. Skills</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(teamStats.memberStats.reduce((sum, member) => sum + member.skillCount, 0) / teamStats.memberStats.length)}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Tasks</span>
                  <span className="text-sm font-bold text-gray-900">
                    {teamStats.memberStats.reduce((sum, member) => sum + member.totalTasks, 0)}
                  </span>
                </div>
              </div>

              {/* Team member cards */}
              <div className="space-y-5">
                {teamStats.memberStats.map((member, index) => (
                  <div
                    key={member.userId || index}
                    className="bg-white p-5 rounded-md border border-gray-200 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{member.userName}</h4>
                        <p className="text-sm text-gray-600">{member.jobTitle || 'Team Member'}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="px-3 py-1 rounded-md bg-green-100 text-green-800 font-medium text-sm">
                          {member.completionRate}% Completion
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Tasks</span>
                          <span>{member.completedTasks} / {member.totalTasks}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-2 bg-green-500 rounded-full"
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
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-2 bg-blue-500 rounded-full"
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
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-2 bg-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (member.skillCount / 10) * 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <span>Leave: {member.totalLeaveDays} days</span>
                      <span>Overtime: {member.totalOvertimeHours} hrs</span>
                      <span>Email: {member.email}</span>
                    </div>
                  </div>
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
          className="flex justify-end gap-4 flex-row mt-10 mb-4"
        >
          <Button
            variant="outline"
            onClick={handleGenerateReport}
            disabled={generatingReport || !teamStats}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {generatingReport ? 'Generating...' : 'Generate Team Report'}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={generatingReport || !teamStats}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {generatingReport ? 'Exporting...' : 'Export Team PDF'}
          </Button>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Performance Analytics</h1>
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
                <TabsContent value="individual" className="space-y-8 relative pb-24" ref={individualStatsRef}>
                  {/* Performance PDF Button positioned at left bottom corner of individual tab */}
                  <div className="absolute bottom-0 left-0 z-50 p-4 bg-gradient-to-r from-blue-500/20 to-transparent rounded-tr-xl">
                    <Button
                      onClick={handleGeneratePerformancePDF}
                      disabled={generatingReport || !taskStats}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                      style={{ minWidth: '240px' }}
                    >
                      <FileText className="h-6 w-6" />
                      {generatingReport ? 'Generating...' : `Generate ${getSelectedUserName().replace("'s", "")} Performance PDF`}
                    </Button>
                  </div>
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
                                    <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-100">
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
                                      <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <motion.div
                                          className="h-2.5 rounded-full"
                                          style={{ backgroundColor: color }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${percentage}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}

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
                              {/* Completion Rate */}
                              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-800">Completion Rate</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{taskStats.tasksCompleted || 0} of {taskStats.totalTasksAssigned || 0} tasks completed</p>
                                  </div>
                                  <div className="text-xl font-bold text-gray-900">{taskStats.taskCompletionRate || 0}%</div>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                  <motion.div
                                    className="h-2.5 bg-green-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${taskStats.taskCompletionRate || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* On-Time Rate */}
                              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-medium text-gray-800">On-Time Rate</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{taskStats.tasksCompletedOnTime || 0} of {taskStats.tasksCompleted || 0} completed on time</p>
                                  </div>
                                  <div className="text-xl font-bold text-gray-900">{taskStats.onTimeCompletionRate || 0}%</div>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                  <motion.div
                                    className="h-2.5 bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${taskStats.onTimeCompletionRate || 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>

                              {/* Additional Metrics */}
                              {taskStats.avgCompletionTime && (
                                <div className="bg-white p-4 rounded-md border border-gray-200">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">Avg. Completion Time</span>
                                    <span className="font-bold text-gray-900">{taskStats.avgCompletionTime} days</span>
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
                            {/* Leave Days */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-800">Leave Days</h4>
                                <p className="font-bold text-gray-900">{leaveStats.totalLeaveDays || 0} days</p>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  className="h-2.5 bg-purple-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (leaveStats.totalLeaveDays || 0) / 0.3)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                                <span>0 days</span>
                                <span>30 days</span>
                              </div>
                            </div>

                            {/* Overtime Hours */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-800">Overtime Hours</h4>
                                <p className="font-bold text-gray-900">{leaveStats.totalOvertimeHours || 0} hrs</p>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  className="h-2.5 bg-amber-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (leaveStats.totalOvertimeHours || 0) / 0.6)}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                                <span>0 hrs</span>
                                <span>60 hrs</span>
                              </div>
                            </div>

                            {/* Request Summary */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="bg-white p-4 rounded-md border border-gray-200 text-center">
                                <p className="text-sm text-gray-600 mb-1">Leave Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{leaveStats.approvedLeaveRequests || 0}</p>
                              </div>
                              <div className="bg-white p-4 rounded-md border border-gray-200 text-center">
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
                                  <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-100">
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
                                    <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                      <motion.div
                                        className="h-2.5 rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}

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
                              <div className="space-y-4">
                                {userSkills.skills.map((skill, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-4 rounded-md border border-gray-100"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                      <div>
                                        <h4 className="font-medium text-gray-900">{skill.skillName}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{skill.skillDescription}</p>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <span
                                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                                            skill.proficiencyLevel === 'expert' ? 'bg-green-100 text-green-800 border border-green-200' :
                                            skill.proficiencyLevel === 'intermediate' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                            skill.proficiencyLevel === 'advanced' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                          }`}
                                        >
                                          {skill.proficiencyLevel || 'beginner'}
                                        </span>
                                        {skill.canMentor && (
                                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                            Mentor
                                          </span>
                                        )}
                                        {skill.isCertified && (
                                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                            Certified
                                          </span>
                                        )}
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