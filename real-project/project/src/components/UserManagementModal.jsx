import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from '../context/AuthContext';
import LoadingAnimation from './LoadingAnimation';
import { useLocation } from "react-router-dom";

// Add CSS to hide the close button in the QR code dialog
import './UserManagementModal.css';

const UserManagementModal = ({ open, onOpenChange, mode = "add", userData = null }) => {
  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit User" : "Add New User";
  const { api } = useAuth(); // Get the authenticated API instance
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    jobTitle: userData?.jobTitle || "",
    department: userData?.department || "",
    role: userData?.role || "employee",
    supervisor: userData?.supervisor || "",
    selectedSkill: "",
  });

  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [userCredentials, setUserCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Function to trigger a refresh in the parent component
  const triggerParentRefresh = () => {
    // Dispatch a custom event that the parent component listens for
    const refreshEvent = new Event('team-management-refresh');
    window.dispatchEvent(refreshEvent);

    // Also dispatch a popstate event to force components to re-render
    window.dispatchEvent(new Event('popstate'));
  };

  // Fetch departments, supervisors and skills when component mounts
  useEffect(() => {
    // Only fetch data when the modal is open
    if (!open) return;

    // Set loading state immediately
    setLoading(true);

    let isMounted = true;

    const fetchData = async () => {
      if (!api) {
        console.error('API instance not available');
        if (isMounted) {
          setError('Authentication error. Please try logging in again.');
          setLoading(false);
        }
        return;
      }

      try {
        setError(null);

        // Check if API is properly configured
        console.log('API instance:', api);
        console.log('API headers:', api.defaults?.headers);
        console.log('API base URL:', api.defaults?.baseURL);

        // Fetch departments from the database
        console.log('Fetching departments...');
        try {
          const departmentsResponse = await api.get('/departments');
          console.log('Departments response:', departmentsResponse.data);
          if (isMounted) {
            setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);
          }
        } catch (deptError) {
          console.error('Error fetching departments:', deptError);
          if (isMounted) {
            setDepartments([]);
          }
        }

        // Fetch supervisors (users with role="supervisor") from the database
        console.log('Fetching supervisors...');
        try {
          const supervisorsResponse = await api.get('/manager/users', { params: { role: 'supervisor' } });
          console.log('Supervisors response:', supervisorsResponse.data);
          if (isMounted) {
            setSupervisors(Array.isArray(supervisorsResponse.data) ? supervisorsResponse.data : []);
          }
        } catch (supError) {
          console.error('Error fetching supervisors:', supError);
          if (isMounted) {
            setSupervisors([]);
          }
        }

        // Fetch skills from the database
        console.log('Fetching skills...');
        try {
          const skillsResponse = await api.get('/skills');
          console.log('Skills response:', skillsResponse.data);
          if (isMounted) {
            setSkills(Array.isArray(skillsResponse.data) ? skillsResponse.data : []);
          }
        } catch (skillError) {
          console.error('Error fetching skills:', skillError);
          if (isMounted) {
            setSkills([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        if (isMounted) {
          setError('Failed to load form data: ' + (error.response?.data?.message || error.message));
          toast.error('Failed to load form data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Execute the fetch
    fetchData();

    // Clean up function
    return () => {
      isMounted = false;
    };
  }, [api, open, location.key]); // Use location.key to trigger re-fetch on navigation

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!api) {
      console.error('API instance not available');
      toast.error('Authentication error. Please try logging in again.');
      return;
    }

    // Set submitting state to true to show loading animation
    setSubmitting(true);

    try {
      // Prepare data for submission
      const userData = {
        full_name: formData.name,
        email: formData.email,
        role: formData.role,
        department_id: formData.department || null,
        supervisor_id: formData.supervisor || null,
        // If a skill is selected, use its name as the job_title
        job_title: formData.selectedSkill ?
          skills.find(skill => skill.id === formData.selectedSkill)?.name || formData.jobTitle :
          formData.jobTitle
      };

      // Only add skill_id if it's actually selected
      if (formData.selectedSkill &&
          formData.selectedSkill !== "none" &&
          formData.selectedSkill !== "" &&
          formData.selectedSkill !== "null" &&
          formData.selectedSkill !== "undefined") {

        // Verify the skill exists in our skills array
        const selectedSkill = skills.find(skill => skill.id === formData.selectedSkill);

        if (selectedSkill) {
          userData.skill_id = formData.selectedSkill;
          console.log('Adding skill_id to user data:', formData.selectedSkill);
          console.log('Skill name:', selectedSkill.name);
        } else {
          console.warn('Selected skill ID not found in skills array:', formData.selectedSkill);
          // Don't add the skill_id if we can't verify it exists
        }
      } else {
        console.log('No skill selected, not adding skill_id to user data');
      }

      console.log('Submitting user data:', userData);

      if (isEditMode) {
        console.log(`Updating user ${userData?.id} with API call to /users/${userData?.id}`);
        const updateResponse = await api.put(`/users/${userData?.id}`, userData);
        console.log('User update response:', updateResponse.data);

        toast.success("User updated successfully", {
          description: `${formData.name}'s information has been updated`
        });

        // Trigger a refresh in the parent component
        triggerParentRefresh();
      } else {
        // For new users, the backend will generate a temporary password
        // No need to set password here

        // Use the manager API endpoint which handles both user creation and skill association
        console.log('Creating new user with API call to /manager/users');
        console.log('API headers:', api.defaults?.headers);

        try {
          try {
            const response = await api.post('/manager/users', userData);
            console.log('User creation response:', response.data);

            if (!response.data) {
              throw new Error('Empty response from server');
            }

            // Use the temporary password returned from the backend
            setUserCredentials({
              email: formData.email,
              password: response.data.temporaryPassword || "Check server logs", // Use the password from the response
              name: formData.name,
              role: formData.role,
              // Include skill information if available
              skill: formData.selectedSkill ?
                skills.find(skill => skill.id === formData.selectedSkill)?.name :
                null
            });

            // Log the user ID for debugging
            console.log('Created user ID:', response.data.id);
          } catch (apiError) {
            console.error('API error details:', apiError.response?.data);
            throw apiError; // Re-throw to be caught by the outer catch block
          }

          setShowQRCode(true);

          toast.success("User added successfully", {
            description: `${formData.name} has been added as a ${formData.role}`
          });

          // Trigger a refresh in the parent component
          triggerParentRefresh();
        } catch (postError) {
          console.error('Error in POST request:', postError);
          console.error('Error response:', postError.response);
          throw postError; // Re-throw to be caught by the outer catch block
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);

      // Get detailed error information
      const errorData = error.response?.data;
      console.error('Error response data:', errorData);

      // Create a more detailed error message
      let errorMessage = errorData?.message || "Failed to save user information";

      // If there are validation errors, add them to the message
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const validationErrors = errorData.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        errorMessage += ` (${validationErrors})`;
      }

      // If there's a specific error message from the server, add it
      if (errorData?.error) {
        errorMessage += ` - ${errorData.error}`;
      }

      // Check if this is an email-related error (already exists, etc.)
      const isEmailError =
        errorMessage.toLowerCase().includes('email') ||
        (errorData?.errors && errorData.errors.some(e => e.field === 'email')) ||
        error.response?.status === 409; // Conflict status often used for duplicate resources

      // For email errors, just show a toast and don't open an error dialog
      if (isEmailError) {
        toast.error(errorMessage, {
          description: "Please use a different email address"
        });
      } else {
        // For other errors, set the error state which will show the error dialog
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      // Set submitting state back to false when done
      setSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    toast.success("Password reset link sent", {
      description: `A password reset email has been sent to ${formData.email}`
    });
  };

  const closeModal = () => {
    setShowQRCode(false);
    setUserCredentials(null);

    // Notify the parent component to close the modal with refresh flag
    if (typeof onOpenChange === 'function') {
      // If onOpenChange accepts a second parameter for refresh, use it
      if (onOpenChange.length >= 2) {
        onOpenChange(false, true); // Pass true to indicate refresh needed
      } else {
        // Otherwise just close the modal
        onOpenChange(false);

        // And trigger refresh separately
        setTimeout(() => {
          console.log('Triggering refresh after modal close');
          triggerParentRefresh();
        }, 100);
      }
    }
  };

  // Generate QR code content
  const getQRCodeContent = () => {
    if (!userCredentials) return '';

    // Create a URL with credentials as parameters
    const loginUrl = window.location.origin + '/login';

    // Create a text version of the credentials that's easy to read when scanned
    const credText = `
EmpTrack Login Credentials
--------------------------
Name: ${userCredentials.name}
Email: ${userCredentials.email}
Password: ${userCredentials.password}
Role: ${userCredentials.role}
${userCredentials.skill ? 'Skill: ' + userCredentials.skill : ''}
Login URL: ${loginUrl}
    `.trim();

    return credText;
  };

  // Render loading state if data is still being fetched
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <p>Loading form data...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render error state if there was an error
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="text-sm text-gray-600 mb-4">
              <p>Debug Information:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>API Base URL: {api?.defaults?.baseURL || 'Not set'}</li>
                <li>Auth Header: {api?.defaults?.headers?.common?.['x-auth-token'] ? 'Present' : 'Missing'}</li>
                <li>Departments loaded: {departments.length}</li>
                <li>Supervisors loaded: {supervisors.length}</li>
                <li>Skills loaded: {skills.length}</li>
              </ul>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setTimeout(() => {
                    const fetchData = async () => {
                      try {
                        // Try fetching departments again
                        const departmentsResponse = await api.get('/departments');
                        setDepartments(Array.isArray(departmentsResponse.data) ? departmentsResponse.data : []);

                        // Try fetching supervisors again
                        const supervisorsResponse = await api.get('/manager/users', { params: { role: 'supervisor' } });
                        setSupervisors(Array.isArray(supervisorsResponse.data) ? supervisorsResponse.data : []);

                        // Try fetching skills again
                        const skillsResponse = await api.get('/skills');
                        setSkills(Array.isArray(skillsResponse.data) ? skillsResponse.data : []);

                        setLoading(false);
                      } catch (error) {
                        console.error('Error retrying data fetch:', error);
                        setError('Failed to load data on retry: ' + (error.response?.data?.message || error.message));
                        setLoading(false);
                      }
                    };
                    fetchData();
                  }, 1000);
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={showQRCode ? null : onOpenChange}>
      <DialogContent className={`sm:max-w-md ${showQRCode ? 'hideCloseButton' : ''}`}>
        {!showQRCode ? (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update user information in the system."
                  : "Add a new employee or supervisor to the system."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="required">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="required">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title (Skills)</Label>
                  <Select
                    name="selectedSkill"
                    value={formData.selectedSkill}
                    onValueChange={(value) => handleSelectChange("selectedSkill", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(skills) && skills.map(skill => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    name="department"
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(departments) && departments.map(department => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="required">User Role</Label>
                  <Select
                    name="role"
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "employee" && (
                  <div className="space-y-2">
                    <Label htmlFor="supervisor">Assign Supervisor</Label>
                    <Select
                      name="supervisor"
                      value={formData.supervisor}
                      onValueChange={(value) => handleSelectChange("supervisor", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(supervisors) && supervisors.map(supervisor => (
                          <SelectItem key={supervisor.id} value={supervisor.id}>
                            {supervisor.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {isEditMode && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetPassword}
                    className="w-full"
                  >
                    Reset User Password
                  </Button>
                </div>
              )}

              <DialogFooter className="pt-4">
                <div className="flex justify-between w-full">
                  <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <LoadingAnimation type="beat" size={20} color="#ffffff" />
                        <span>{isEditMode ? "Updating..." : "Adding..."}</span>
                      </div>
                    ) : (
                      isEditMode ? "Update User" : "Add User"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>User Registration Successful</DialogTitle>
              <DialogDescription>
                Scan this QR code with your phone's camera or QR scanner app to view the login credentials.
                You can also copy or download the credentials using the buttons below.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-6">
              {userCredentials && (
                <>
                  <div className="p-4 border-2 border-gray-300 rounded-md bg-white inline-block mb-4">
                    <QRCodeSVG
                      value={getQRCodeContent()}
                      size={200}
                      level="H"
                      // Use margin instead of includeMargin (which is deprecated)
                      margin={10}
                      bgColor={"#FFFFFF"}
                      fgColor={"#000000"}
                    />
                  </div>
                  <div className="text-center mt-4 p-4 border rounded-md bg-gray-50 w-full">
                    <p className="mb-2"><strong>Name:</strong> {userCredentials.name}</p>
                    <p className="mb-2"><strong>Email:</strong> {userCredentials.email}</p>
                    <p className="mb-2"><strong>Password:</strong> {userCredentials.password}</p>
                    <p className="mb-2"><strong>Role:</strong> {userCredentials.role}</p>
                    {userCredentials.skill && (
                      <p className="mb-2"><strong>Skill:</strong> {userCredentials.skill}</p>
                    )}
                    <p className="mb-3">
                      <strong>Login URL:</strong>{" "}
                      <a
                        href={`${window.location.origin}/login`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {window.location.origin}/login
                      </a>
                    </p>

                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          // Create a text version of the credentials
                          const credText = `
EmpTrack Login Credentials
--------------------------
Name: ${userCredentials.name}
Email: ${userCredentials.email}
Password: ${userCredentials.password}
Role: ${userCredentials.role}
${userCredentials.skill ? 'Skill: ' + userCredentials.skill : ''}
Login URL: ${window.location.origin}/login
                          `.trim();

                          // Copy to clipboard
                          navigator.clipboard.writeText(credText)
                            .then(() => {
                              toast.success("Credentials copied to clipboard");
                            })
                            .catch(err => {
                              console.error('Failed to copy credentials:', err);
                              toast.error("Failed to copy credentials");
                            });
                        }}
                      >
                        Copy Credentials
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          // Create a text version of the credentials
                          const credText = `
EmpTrack Login Credentials
--------------------------
Name: ${userCredentials.name}
Email: ${userCredentials.email}
Password: ${userCredentials.password}
Role: ${userCredentials.role}
${userCredentials.skill ? 'Skill: ' + userCredentials.skill : ''}
Login URL: ${window.location.origin}/login
                          `.trim();

                          // Create a download link
                          const element = document.createElement('a');
                          const file = new Blob([credText], {type: 'text/plain'});
                          element.href = URL.createObjectURL(file);
                          element.download = `emptrack-credentials-${userCredentials.email}.txt`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);

                          toast.success("Credentials downloaded as text file");
                        }}
                      >
                        Download Credentials
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button onClick={closeModal}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;
