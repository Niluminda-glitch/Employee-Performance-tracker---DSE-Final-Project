import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, LineChart, Users, ClipboardList, Building,
  Mail, Briefcase, UserCheck, Edit, CalendarIcon, AlertCircle, UserX, Send, Bell,
  TrendingUp
} from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import CreateNotificationModal from "@/components/notifications/CreateNotificationModal";
import TeamRequests from "@/components/requests/TeamRequests";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import '../styles/dashboard-float.css'; // Floating background shapes

// Form Handling & Validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, api, isLoading: authLoading } = useAuth(); // Get user info and api instance

  // State for all users
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // State for Edit User Modal
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserError, setEditUserError] = useState(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // State for Add User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserError, setAddUserError] = useState(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // State for tracking user operations
  const [operatingUserId, setOperatingUserId] = useState(null); // Track user being edited/deactivated

  // State for confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [userToConfirm, setUserToConfirm] = useState(null);

  // State for notification modal
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);

  // State for dropdowns
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState(null);

  // State for department management
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isSubmittingDepartment, setIsSubmittingDepartment] = useState(false);
  const [departmentError, setDepartmentError] = useState(null);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  // Define the form schema for editing users
  const editUserFormSchema = z.object({
    full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    job_title: z.string().optional().nullable(),
    role: z.enum(["employee", "supervisor", "manager"], {
      required_error: "Please select a role."
    }),
    status: z.enum(["active", "inactive", "first_login"], {
      required_error: "Please select a status."
    }),
    department_id: z.string()
      .refine(val => val === "none" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "Invalid UUID format for department",
      }),
    supervisor_id: z.string()
      .refine(val => val === "none" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "Invalid UUID format for supervisor",
      }),
  });

  // Define the form schema for adding users
  const addUserFormSchema = z.object({
    full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    job_title: z.string().optional().or(z.literal('')),
    role: z.enum(["employee", "supervisor", "manager"]), // Ensure this matches backend
    status: z.enum(["active", "inactive", "first_login"]), // Ensure this matches backend
    department_id: z.string()
      .refine(val => val === "none" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "Invalid UUID format for department",
      }),
    supervisor_id: z.string()
      .refine(val => val === "none" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "Invalid UUID format for supervisor",
      }),
    skill_id: z.string()
      .refine(val => val === "none" || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "Invalid UUID format for skill",
      }),
  });

  // Initialize the edit form
  const editForm = useForm({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      job_title: "",
      role: "employee",
      status: "active",
      department_id: "none",  // Use "none" instead of empty string
      supervisor_id: "none"   // Use "none" instead of empty string
    }
  });

  // Initialize the add user form
  const addForm = useForm({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      job_title: "",
      role: "employee",
      status: "first_login", // Default new users to first_login
      department_id: "none", // Start with "none" (represents "None")
      supervisor_id: "none", // Start with "none" (represents "None")
      skill_id: "none", // Start with "none" (represents "None")
    }
  });

  // Define the form schema for adding departments
  const departmentFormSchema = z.object({
    name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
    description: z.string().optional(),
  });

  // Initialize the department form
  const departmentForm = useForm({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  // Function to handle opening the edit modal
  const handleOpenEditModal = (userToEdit) => {
    console.log("[ManagerDashboard] Opening edit modal for:", userToEdit);
    setEditingUser(userToEdit);

    // Reset form with user data - ensure we handle null/undefined values properly
    editForm.reset({
      full_name: userToEdit.full_name || "",
      email: userToEdit.email || "",
      job_title: userToEdit.job_title || "",
      role: userToEdit.role || "employee",
      status: userToEdit.status || "active",
      department_id: userToEdit.department_id || "none",  // Use "none" instead of empty string
      supervisor_id: userToEdit.supervisor_id || "none"   // Use "none" instead of empty string
    });

    // Log the form values to verify they're being set correctly
    console.log("[ManagerDashboard] Form values set to:", {
      full_name: userToEdit.full_name,
      email: userToEdit.email,
      job_title: userToEdit.job_title,
      role: userToEdit.role,
      status: userToEdit.status,
      department_id: userToEdit.department_id || "none",
      supervisor_id: userToEdit.supervisor_id || "none"
    });

    setIsEditUserOpen(true);
    setEditUserError(null);
  };

  // Function to handle form submission
  const onEditUserSubmit = async (values) => {
    if (!api || !editingUser?.id) return;

    setIsSubmittingEdit(true);
    setEditUserError(null);
    setOperatingUserId(editingUser.id); // Set operating user ID

    // Format the data for API submission - convert "none" to null for foreign keys
    const dataToSubmit = {
      ...values,
      department_id: values.department_id === "none" ? null : values.department_id,
      supervisor_id: values.supervisor_id === "none" ? null : values.supervisor_id
    };

    console.log("[ManagerDashboard] Updating user with values:", dataToSubmit);
    console.log("[ManagerDashboard] Original user data:", editingUser);

    try {
      // Call the API to update the user
      const response = await api.put(`/manager/users/${editingUser.id}`, dataToSubmit);
      console.log("[ManagerDashboard] User updated successfully:", response.data);

      // Update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === editingUser.id ? response.data : u
        )
      );

      // Close the modal and show success message
      setIsEditUserOpen(false);
      toast({
        title: "User Updated",
        description: `${values.full_name}'s profile has been updated successfully.`,
        variant: "default"
      });

    } catch (err) {
      console.error("[ManagerDashboard] Error updating user:", err.response?.data || err.message);
      setEditUserError(err.response?.data?.message || "Failed to update user profile.");
    } finally {
      setIsSubmittingEdit(false);
      setOperatingUserId(null); // Clear operating user ID
    }
  };

  // Function to show confirmation dialog for user actions
  const showConfirmDialog = (action, user) => {
    setConfirmAction(action);
    setUserToConfirm(user);
    setIsConfirmDialogOpen(true);
  };

  // Function to handle deactivating a user
  const handleDeactivateUser = async (userToDeactivate) => {
    if (!api || !userToDeactivate?.id) return;

    console.log(`[ManagerDashboard] Deactivating user ${userToDeactivate.id}`);
    setOperatingUserId(userToDeactivate.id); // Disable buttons for this row
    setUsersError(null); // Clear general errors

    try {
        // Call the dedicated deactivate endpoint
        const response = await api.put(`/manager/users/${userToDeactivate.id}/deactivate`);
        console.log("[ManagerDashboard] User deactivated successfully:", response.data);

        toast({
          title: "User Deactivated",
          description: `${userToDeactivate.full_name || userToDeactivate.email} has been deactivated.`,
          variant: "default"
        });

        // Update the user list state locally
        setUsers(currentUsers => currentUsers.map(u =>
            u.id === userToDeactivate.id ? response.data : u // Replace with updated user data (status='inactive')
        ));

    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to deactivate user.';
        console.error('[ManagerDashboard] Error deactivating user:', errorMsg, err.response);
        setUsersError(errorMsg); // Show error message
        toast({
          title: "Deactivation Failed",
          description: errorMsg,
          variant: "destructive"
        });
    } finally {
        setOperatingUserId(null); // Re-enable buttons for this row
    }
  };

  // Function to handle reactivating a user
  const handleReactivateUser = async (userToReactivate) => {
    if (!api || !userToReactivate?.id) return;

    console.log(`[ManagerDashboard] Reactivating user ${userToReactivate.id}`);
    setOperatingUserId(userToReactivate.id); // Disable buttons for this row
    setUsersError(null); // Clear general errors

    try {
        // Call the dedicated reactivate endpoint
        const response = await api.put(`/manager/users/${userToReactivate.id}/reactivate`);
        console.log("[ManagerDashboard] User reactivated successfully:", response.data);

        toast({
          title: "User Reactivated",
          description: `${userToReactivate.full_name || userToReactivate.email} has been reactivated.`,
          variant: "default"
        });

        // Update the user list state locally
        setUsers(currentUsers => currentUsers.map(u =>
            u.id === userToReactivate.id ? response.data : u // Replace with updated user data (status='active')
        ));

    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to reactivate user.';
        console.error('[ManagerDashboard] Error reactivating user:', errorMsg, err.response);
        setUsersError(errorMsg); // Show error message
        toast({
          title: "Reactivation Failed",
          description: errorMsg,
          variant: "destructive"
        });
    } finally {
        setOperatingUserId(null); // Re-enable buttons for this row
    }
  };

  // Function to handle confirmation dialog actions
  const handleConfirmAction = () => {
    if (!confirmAction || !userToConfirm) return;

    if (confirmAction === 'deactivate') {
      handleDeactivateUser(userToConfirm);
    } else if (confirmAction === 'reactivate') {
      handleReactivateUser(userToConfirm);
    }

    // Close the dialog and reset state
    setIsConfirmDialogOpen(false);
    setConfirmAction(null);
    setUserToConfirm(null);
  };

  // Function to handle adding a new user
  const onAddUserSubmit = async (values) => {
    if (!api) return;
    setIsSubmittingAdd(true);
    setAddUserError(null);
    console.log("[ManagerDashboard] Submitting new user:", values);

    try {
      // If a skill is selected, find its name to use as job_title
      let jobTitle = values.job_title;
      if (values.skill_id !== "none") {
        const selectedSkill = skills.find(skill => skill.id === values.skill_id);
        if (selectedSkill) {
          jobTitle = selectedSkill.name;
        }
      }

      // Convert "none" values for optional FKs to null for the backend
      const dataToSend = {
        ...values,
        job_title: jobTitle, // Use the skill name as job title if a skill was selected
        department_id: values.department_id === "none" ? null : values.department_id,
        supervisor_id: values.supervisor_id === "none" ? null : values.supervisor_id,
        skill_id: values.skill_id === "none" ? null : values.skill_id,
      };

      const response = await api.post('/manager/users', dataToSend);

      // Show success message
      toast({
        title: "User Created",
        description: `${values.full_name} has been added successfully.`,
        variant: "default"
      });

      // Store the new user credentials for QR code
      setNewUserCredentials({
        email: values.email,
        password: 'password123', // This is the default temporary password set in the backend
        name: values.full_name,
        role: values.role
      });

      // Show QR code modal
      setShowQRCode(true);

      // Close the add user dialog
      setIsAddUserOpen(false);

      // Reset form to default values
      addForm.reset();

      // Update user list locally for immediate feedback
      setUsers(currentUsers => [response.data, ...currentUsers].sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      ));

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add user.';
      console.error('[ManagerDashboard] Error adding user:', errorMsg, err.response);
      setAddUserError(errorMsg); // Display error within the modal
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Function to handle adding a new department
  const onAddDepartmentSubmit = async (values) => {
    if (!api) return;
    setIsSubmittingDepartment(true);
    setDepartmentError(null);
    console.log("[ManagerDashboard] Creating new department:", values);

    try {
      // Call the API to create the department
      const response = await api.post('/departments', values);
      console.log("[ManagerDashboard] Department created successfully:", response.data);

      // Add the new department to the local state
      setDepartments(prevDepartments => [...prevDepartments, response.data]);

      // Close the modal and show success message
      setIsAddDepartmentOpen(false);
      toast({
        title: "Department Created",
        description: `${values.name} department has been created successfully.`,
        variant: "default"
      });

      // Reset form to default values
      departmentForm.reset();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create department.';
      console.error('[ManagerDashboard] Error creating department:', errorMsg, err.response);
      setDepartmentError(errorMsg);
      toast({
        title: "Department Creation Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsSubmittingDepartment(false);
    }
  };

  // Reset forms when dialogs close
  useEffect(() => {
    if (!isEditUserOpen) {
      setEditUserError(null);
    }
  }, [isEditUserOpen]);

  useEffect(() => {
    if (!isAddUserOpen) {
      setAddUserError(null);
      // Reset the form when dialog closes
      if (addForm) {
        addForm.reset({
          full_name: "",
          email: "",
          job_title: "",
          role: "employee",
          status: "first_login",
          department_id: "none",
          supervisor_id: "none",
          skill_id: "none"
        });
      }
    }
  }, [isAddUserOpen, addForm]);

  // Reset department form when dialog closes
  useEffect(() => {
    if (!isAddDepartmentOpen) {
      setDepartmentError(null);
      // Reset the form when dialog closes
      if (departmentForm) {
        departmentForm.reset({
          name: "",
          description: ""
        });
      }
    }
  }, [isAddDepartmentOpen, departmentForm]);

  // Fetch all users
  useEffect(() => {
    // Ensure user is loaded, authenticated, and is a manager
    if (!authLoading && user?.id && api && user.role === 'manager') {
      const fetchAllUsers = async () => {
        setIsLoadingUsers(true);
        setUsersError(null);
        console.log(`[ManagerDashboard] Fetching all users using GET /manager/users`);

        try {
          // Check if api is a valid axios instance
          if (typeof api.get !== 'function') {
            console.error('[ManagerDashboard] Error: api.get is not a function. API object:', api);
            setUsersError('API client not properly initialized. Please try logging out and back in.');
            setUsers([]);
            setIsLoadingUsers(false);
            return;
          }

          // Use the 'api' instance from context - token is attached automatically
          const response = await api.get('/manager/users');
          setUsers(response.data || []);
          console.log(`[ManagerDashboard] Fetched ${response.data?.length} users.`);
        } catch (err) {
          console.error('[ManagerDashboard] Error fetching users:', err.response?.data || err.message);
          // Handle 403 Forbidden specifically if backend check fails
          if (err.response?.status === 403) {
            setUsersError('Access Denied: You do not have permission to view users.');
          } else {
            setUsersError(err.response?.data?.message || 'Failed to load user list.');
          }
          setUsers([]); // Clear data on error
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchAllUsers();
    } else if (!authLoading && user?.id && user.role !== 'manager') {
      // Should be caught by PrivateRoute, but good safeguard
      setUsersError("Access Denied: Manager role required.");
    }
  }, [user, api, authLoading]);

  // Fetch departments, supervisors, and skills for dropdowns
  useEffect(() => {
    if (!authLoading && user?.id && api && user.role === 'manager') {
      // Check if the API has the auth token set
      console.log('[ManagerDashboard] API headers:', api.defaults?.headers?.common);
      console.log('[ManagerDashboard] Current departments state:', departments);
      console.log('[ManagerDashboard] Current skills state:', skills);
      const fetchDepartments = async () => {
        setIsLoadingDepartments(true);
        try {
          console.log('[ManagerDashboard] Fetching departments...');
          const response = await api.get('/departments');
          console.log('[ManagerDashboard] Departments API response:', response);
          setDepartments(response.data || []);
          console.log(`[ManagerDashboard] Fetched ${response.data?.length} departments.`);

          // Log departments for debugging
          if (response.data && response.data.length > 0) {
            console.log('[ManagerDashboard] Department examples:', response.data.slice(0, 2));
          } else {
            console.warn('[ManagerDashboard] No departments found in the response');
          }
        } catch (err) {
          console.error('[ManagerDashboard] Error fetching departments:', err);
          console.error('[ManagerDashboard] Error details:', err.response?.data || err.message);
          // Don't show error to user, just log it
        } finally {
          setIsLoadingDepartments(false);
        }
      };

      // Fetch supervisors for dropdown
      const fetchSupervisors = async () => {
        try {
          // Get users with supervisor or manager role
          const supervisorUsers = users.filter(u =>
            u.role === 'supervisor' || u.role === 'manager'
          );
          setSupervisors(supervisorUsers);

          // Log supervisors for debugging
          if (supervisorUsers.length > 0) {
            console.log('[ManagerDashboard] Supervisor examples:', supervisorUsers.slice(0, 2));
          }
        } catch (err) {
          console.error('[ManagerDashboard] Error preparing supervisors list:', err);
        }
      };

      // Fetch skills for dropdown
      const fetchSkills = async () => {
        try {
          console.log('[ManagerDashboard] Fetching skills...');
          const response = await api.get('/skills');
          console.log('[ManagerDashboard] Skills API response:', response);
          setSkills(response.data || []);
          console.log(`[ManagerDashboard] Fetched ${response.data?.length} skills.`);

          // Log skills for debugging
          if (response.data && response.data.length > 0) {
            console.log('[ManagerDashboard] Skill examples:', response.data.slice(0, 2));
          } else {
            console.warn('[ManagerDashboard] No skills found in the response');
          }
        } catch (err) {
          console.error('[ManagerDashboard] Error fetching skills:', err);
          console.error('[ManagerDashboard] Error details:', err.response?.data || err.message);
          // Don't show error to user, just log it
        }
      };

      fetchDepartments();
      fetchSupervisors();
      fetchSkills();
    }
  }, [user, api, authLoading, users]);

  // Calculate department stats from real data
  const calculateDepartmentStats = () => {
    if (!departments || departments.length === 0) {
      return [];
    }

    // Map departments to include basic metrics
    return departments.map(dept => {
      return {
        id: dept.id,
        department: dept.name,
        description: dept.description,
        headcount: dept.headcount || 0,
        created_at: dept.created_at,
        updated_at: dept.updated_at
      };
    });
  };



  const departmentStats = calculateDepartmentStats();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-purple-50 to-amber-50 pb-24 overflow-x-hidden">
      {/* Floating background shapes */}
      <div className="floating-bg">
        <div className="floating-shape shape1 animate-float" />
        <div className="floating-shape shape2 animate-float" />
        <div className="floating-shape shape3 animate-float" />
        <div className="floating-shape shape4 animate-float" />
      </div>
      <TopNavigation userRole={user?.role} />

      <main className="max-w-7xl mx-auto px-2 md:px-10 pt-6 z-10">
        {/* Dashboard header with chunky card and animation */}
        <div className="relative mb-10">
          <div className="relative w-full max-w-4xl mx-auto animate-slide-up animate-grow rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border-2 border-purple-300/40 shadow-[0_8px_32px_0_rgba(124,58,237,0.10)] px-8 py-10 flex flex-col items-center gap-8 overflow-hidden">
            <img
              src={user?.avatar_url || "https://i.pinimg.com/originals/7c/e9/e3/7ce9e34927261d3b035090cac779fec5.gif"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-purple-300 shadow-2xl object-cover animate-float bg-white"
              style={{ marginTop: '-2rem', boxShadow: '0 8px 32px 0 rgba(168,139,250,0.18)' }}
            />
            <div className="flex-1 flex flex-col justify-center items-center min-w-0">
              <h1 className="text-4xl md:text-5xl font-black text-purple-700 mb-3 tracking-tight drop-shadow-lg animate-slide-right whitespace-nowrap overflow-hidden text-ellipsis text-center">
                Welcome back, {user?.full_name || 'Manager'}!
              </h1>
              <div className="flex flex-wrap justify-center items-center gap-4 mb-3 animate-slide-left">
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-amber-100/90 text-amber-700 font-bold text-base shadow border border-amber-200/60 animate-pulse-slow">
                  <Briefcase className="w-5 h-5 mr-2" /> {user?.role || 'Manager'}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-purple-100/90 text-purple-700 font-bold text-base shadow border border-purple-200/60 animate-pulse-slow">
                  <CalendarIcon className="w-5 h-5 mr-2" /> Joined: {user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '---'}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-blue-100/90 text-blue-700 font-bold text-base shadow border border-blue-200/60 animate-pulse-slow">
                  <Users className="w-5 h-5 mr-2" /> Users: {users.length}
                </span>
              </div>
              <p className="text-gray-700 font-semibold text-lg animate-slide-up bg-white/60 rounded-xl px-4 py-2 shadow border border-purple-100/40 text-center">
                Oversee operations, manage users, and drive success across teams!
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gradient animate-fade-in">Manager Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCreateNotificationOpen(true)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Bell className="h-4 w-4 mr-2" />
              Create Notification
            </Button>

            <div className="relative group inline-block">
              {/* Animated floating dust effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="animate-float bg-green-400 opacity-30 w-1 h-1 rounded-full absolute top-1/4 left-1/3 blur-sm" />
                <div className="animate-float-delay bg-blue-400 opacity-30 w-1.5 h-1.5 rounded-full absolute top-1/2 left-2/3 blur-sm" />
                <div className="animate-float-slow bg-green-300 opacity-20 w-2 h-2 rounded-full absolute bottom-1/4 right-1/3 blur-md" />
              </div>

              {/* The button itself */}
              <Button
                onClick={() => navigate('/trends')}
                className="relative z-10 text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-blue-600 hover:to-green-500 shadow-lg px-6 py-3 rounded-lg transition duration-300 ease-in-out"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                View Industry Trends
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoadingUsers ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-500"></div>
                  ) : (
                    users.length
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {users.length > 0
                  ? `Across ${new Set(users.filter(u => u.department_id).map(u => u.department_id)).size} departments`
                  : 'Loading departments...'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">8</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">2 critical priority</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting manager approval</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">86%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+2% from last quarter</p>
            </CardContent>
          </Card>
        </div>



        {/* Tabbed Content */}
        <Tabs defaultValue="users" className="mb-8">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="departments">Department Analysis</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {usersError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    <p className="font-medium">Error loading users</p>
                    <p className="text-sm">{usersError}</p>
                  </div>
                )}

                {isLoadingUsers ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
                    <span className="ml-2 text-purple-700">Loading users...</span>
                  </div>
                ) : users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Job Title</TableHead>
                          <TableHead>Supervisor</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium flex items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2">
                                {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              {u.full_name || 'Unnamed User'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                {u.email}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{u.role}</span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                u.status === 'active' ? 'bg-green-100 text-green-800' :
                                u.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800' // For first_login or other statuses
                              }`}>
                                {u.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {u.job_title ? (
                                <div className="flex items-center">
                                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                                  {u.job_title}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not specified</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.supervisor?.full_name || (u.supervisor_id ? `ID: ...${u.supervisor_id.slice(-4)}` : 'N/A')}
                            </TableCell>
                            <TableCell>
                              {u.userDepartment?.name || (u.department_id ? `ID: ...${u.department_id.slice(-4)}` : 'N/A')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => handleOpenEditModal(u)}
                                  disabled={operatingUserId === u.id} // Disable if operating on this user
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                </Button>
                                {u.status === 'inactive' ? (
                                  <Button
                                    variant="outline" // Use outline variant for reactivate
                                    size="sm"
                                    className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() => showConfirmDialog('reactivate', u)}
                                    disabled={operatingUserId === u.id}
                                    title="Reactivate User"
                                  >
                                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                                    Reactivate
                                  </Button>
                                ) : (
                                  <Button
                                    variant="destructive" // Use destructive variant for deactivate
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => showConfirmDialog('deactivate', u)}
                                    // Disable if operating on this user OR if it's the manager themselves
                                    disabled={operatingUserId === u.id || u.id === user?.id}
                                    title={u.id === user?.id ? 'Cannot deactivate self' : 'Deactivate User'}
                                  >
                                    <UserX className="h-3.5 w-3.5 mr-1" />
                                    Deactivate
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no users in the system or you don't have permission to view them.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Department Management</CardTitle>
                  <CardDescription>View and manage departments</CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddDepartmentOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Add Department
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingDepartments ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
                    <span className="ml-2 text-purple-700">Loading departments...</span>
                  </div>
                ) : departmentStats.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <Building className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no departments in the system yet. Click "Add Department" to create one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {departmentStats.map((dept) => (
                      <div key={dept.id} className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center">
                          <div>
                            <h3 className="font-medium text-lg">{dept.department}</h3>
                            <p className="text-sm text-muted-foreground">Headcount: {dept.headcount}</p>
                            {dept.description && (
                              <p className="text-sm text-muted-foreground mt-1 max-w-md">{dept.description}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm" className="mt-4 md:mt-0">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Historical performance data</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/analytics')}
                  >
                    <BarChart className="h-4 w-4 mr-1" /> View Full Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <BarChart className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Advanced Analytics Available</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                    View detailed performance metrics, department comparisons, and individual employee analytics in our comprehensive analytics dashboard.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => navigate('/analytics')}
                  >
                    Go to Analytics Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <TeamRequests isManager={true} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Modify the details for {editingUser?.full_name || 'selected user'}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditUserSubmit)} className="space-y-4 py-2">
                {/* Full Name Field */}
                <FormField
                  control={editForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Employee's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="employee@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Title Field */}
                <FormField
                  control={editForm.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Stitcher, Line Supervisor" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Field */}
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Field */}
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="first_login">First Login</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department Field */}
                <FormField
                  control={editForm.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- None --</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supervisor Field */}
                <FormField
                  control={editForm.control}
                  name="supervisor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supervisor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- None --</SelectItem>
                          {/* Filter out the user being edited from the supervisor list */}
                          {supervisors.filter(s => s.id !== editingUser.id).map(sup => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.full_name || sup.email} ({sup.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display API Error */}
                {editUserError && (
                  <div className="bg-red-50 p-3 rounded flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <p className="text-red-700 text-sm">{editUserError}</p>
                  </div>
                )}

                {/* Footer with Buttons */}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingEdit}
                  >
                    {isSubmittingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'deactivate' ? 'Deactivate User' : 'Reactivate User'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'deactivate'
                ? 'This action will prevent the user from logging in. They will no longer have access to the system until reactivated.'
                : 'This action will allow the user to log in again and regain access to the system.'}
            </DialogDescription>
          </DialogHeader>

          {userToConfirm && (
            <div className="py-4">
              <div className="flex items-center space-x-4 p-4 border rounded-md bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  {userToConfirm.full_name ? userToConfirm.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-medium">{userToConfirm.full_name || 'Unnamed User'}</h4>
                  <p className="text-sm text-muted-foreground">{userToConfirm.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userToConfirm.job_title && `${userToConfirm.job_title} • `}
                    {userToConfirm.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'deactivate' ? "destructive" : "default"}
              onClick={handleConfirmAction}
            >
              {confirmAction === 'deactivate' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the details for the new user. They will receive a temporary password
              and their status will be set to 'First Login'.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddUserSubmit)} className="space-y-4 py-2 pb-4">
              {/* Full Name (Required) */}
              <FormField
                control={addForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="Enter full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (Required) */}
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input type="email" placeholder="Enter email address" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Title (Optional) - Now a text field, will be replaced by skill selection */}
              <FormField
                control={addForm.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (Manual Entry)</FormLabel>
                    <FormControl><Input placeholder="e.g., Stitcher, Line Supervisor" {...field} /></FormControl>
                    <FormMessage />
                    <FormDescription>
                      You can either enter a job title manually here, or select a skill below which will be used as the job title.
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Role (Required - Select) */}
              <FormField
                control={addForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status (Select - Defaulted, maybe hidden or shown) */}
              <FormField
                control={addForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="first_login">First Login</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department (Optional - Input) */}
              <FormField
                control={addForm.control}
                name="department_id"
                render={({ field }) => {
                  console.log('[ManagerDashboard] Rendering department field:', { field, departments });
                  return (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter department ID" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Enter "none" for no department or a valid UUID for a department.
                      </FormDescription>
                    </FormItem>
                  );
                }}
              />

              {/* Supervisor (Optional - Select) */}
              <FormField
                control={addForm.control}
                name="supervisor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select supervisor" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {supervisors.map(sup => (
                          <SelectItem key={sup.id} value={sup.id}>{sup.full_name || sup.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skill (Optional - Input) */}
              <FormField
                control={addForm.control}
                name="skill_id"
                render={({ field }) => {
                  console.log('[ManagerDashboard] Rendering skill field:', { field, skills });
                  return (
                    <FormItem>
                      <FormLabel>Job Skill</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter skill ID" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Enter "none" for no skill or a valid UUID for a skill. The skill will be used as the job title.
                      </FormDescription>
                    </FormItem>
                  );
                }}
              />

              {/* Display API Error */}
              {addUserError && <p className="text-sm font-medium text-destructive">{addUserError}</p>}

              <DialogFooter className="flex flex-col items-stretch gap-2">
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmittingAdd}>
                    {isSubmittingAdd ? "Adding..." : "Add User"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('Current departments:', departments);
                    console.log('Current skills:', skills);
                    alert(`Departments: ${departments.length}, Skills: ${skills.length}`);
                  }}
                >
                  Debug: Show Data
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <CreateNotificationModal
        open={createNotificationOpen}
        onOpenChange={setCreateNotificationOpen}
      />

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department in the organization.
            </DialogDescription>
          </DialogHeader>

          <Form {...departmentForm}>
            <form onSubmit={departmentForm.handleSubmit(onAddDepartmentSubmit)} className="space-y-4 py-2">
              {departmentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  <p className="text-sm">{departmentError}</p>
                </div>
              )}

              {/* Department Name Field */}
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Engineering, Marketing, HR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department Description Field */}
              <FormField
                control={departmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the department" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Optional: Provide a short description of the department's function.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddDepartmentOpen(false)}
                  disabled={isSubmittingDepartment}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDepartment}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmittingDepartment ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Department'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
            <DialogDescription>
              Scan this QR code to share login credentials with the new user.
            </DialogDescription>
          </DialogHeader>

          {newUserCredentials && (
            <div className="py-4 flex flex-col items-center">
              <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    email: newUserCredentials.email,
                    password: newUserCredentials.password,
                    name: newUserCredentials.name,
                    role: newUserCredentials.role,
                    url: window.location.origin + '/login'
                  })}
                  size={200}
                  level="H"
                  marginSize={4}
                />
              </div>

              <div className="w-full bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">Login Credentials</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {newUserCredentials.name}</p>
                  <p><span className="font-medium">Email:</span> {newUserCredentials.email}</p>
                  <p><span className="font-medium">Password:</span> {newUserCredentials.password}</p>
                  <p><span className="font-medium">Role:</span> {newUserCredentials.role}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    The user will be prompted to change their password on first login.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowQRCode(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Decorative floating elements for extra visual pop (foreground, non-interactive) */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <div className="absolute left-10 top-1/3 w-12 h-12 bg-purple-300/40 rounded-full animate-float blur-2xl" style={{animationDuration:'7s'}} />
        <div className="absolute right-16 top-1/4 w-16 h-16 bg-amber-300/30 rounded-full animate-float blur-2xl" style={{animationDuration:'8s', animationDelay:'1s'}} />
        <div className="absolute left-1/2 bottom-20 w-20 h-20 bg-blue-300/30 rounded-full animate-float blur-2xl" style={{animationDuration:'6s', animationDelay:'2s'}} />
      </div>
    </div>
  );
};

export default ManagerDashboard;
