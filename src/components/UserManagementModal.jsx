import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const UserManagementModal = ({ open, onOpenChange, mode = "add", userData = null }) => {
  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit User" : "Add New User";

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    jobTitle: userData?.jobTitle || "",
    department: userData?.department || "",
    role: userData?.role || "employee",
    supervisor: userData?.supervisor || "",
    password: "",
  });

  // Simple state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Validate required fields
    if (!formData.name || !formData.email || !formData.role || (!isEditMode && !formData.password)) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Attempting to add user with email:", formData.email);

      // First, check if the email already exists in the users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingUser) {
        toast.error("This email is already in use. Please use a different email.");
        setIsSubmitting(false);
        return;
      }

      // Try to create the user directly with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role
          }
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        toast.error(`Authentication error: ${authError.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log("User created in Auth:", authData);

      // Now insert the user into the users table
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          full_name: formData.name,
          email: formData.email,
          // Use department_id instead of department
          department_id: formData.department || null,
          role: formData.role,
          supervisor_id: formData.supervisor || null,
          status: "first_login",
        },
      ]);

      if (dbError) {
        console.error("Database error:", dbError);

        if (dbError.message.includes("duplicate key value")) {
          toast.error("This email is already in use. Please use a different email.");
        } else {
          toast.error(`Database error: ${dbError.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      toast.success("User added successfully", {
        description: `${formData.name} has been added as a ${formData.role}`
      });

      // Close the modal and reset form
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        jobTitle: "",
        department: "",
        role: "employee",
        supervisor: "",
        password: "",
      });
    } catch (err) {
      console.error("Error adding user:", err);

      // Show detailed error message
      if (err.message) {
        toast.error(`Error: ${err.message}`);
      } else {
        toast.error("Failed to add user. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = () => {
    toast.success("Password reset link sent", {
      description: `A password reset email has been sent to ${formData.email}`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Enter a unique email address for the user
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>
            {!isEditMode && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="password" className="required">Temporary Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
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
                    <SelectItem value="supervisor1">Sam Supervisor</SelectItem>
                    <SelectItem value="supervisor2">Jordan Lee</SelectItem>
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
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditMode ? "Updating..." : "Adding...")
                : (isEditMode ? "Update User" : "Add User")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserManagementModal;
