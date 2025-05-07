
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const ProfileEditor = ({ open, onOpenChange }) => {
  const { user, updateProfile, isLoading, api } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    job_title: "",
    department_id: "",
    email: "",
    avatar_url: ""
  });
  const [initialProfile, setInitialProfile] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  // Load user data when the component opens
  useEffect(() => {
    if (open && user) {
      const userData = {
        full_name: user.full_name || "",
        job_title: user.job_title || "",
        department_id: user.department_id || "none",
        email: user.email || "",
        avatar_url: user.avatar_url || ""
      };
      setProfile(userData);
      setInitialProfile(userData);
      setFormChanged(false);
    }
  }, [open, user]);

  // Fetch departments when the component opens
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!open || !api) return;

      setIsLoadingDepartments(true);
      try {
        const response = await api.get('/departments');
        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
        } else {
          console.error("Invalid departments data:", response.data);
          setDepartments([]);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast.error("Failed to load departments");
        setDepartments([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [open, api]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateProfileField(name, value);
  };

  // Handle select changes (for dropdowns)
  const handleSelectChange = (name, value) => {
    updateProfileField(name, value);
  };

  // Common function to update profile state
  const updateProfileField = (name, value) => {
    const updatedProfile = {
      ...profile,
      [name]: value
    };
    setProfile(updatedProfile);

    // Check if any field has changed from initial values
    const hasChanged = Object.keys(initialProfile).some(
      key => initialProfile[key] !== updatedProfile[key]
    );
    setFormChanged(hasChanged);
  };

  // Handle form submission
  const handleSave = async () => {
    if (!formChanged) return;

    // Basic validation
    if (!profile.full_name?.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!profile.email?.trim()) {
      toast.error("Email is required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // Only send fields that have changed
      const changedFields = {};
      Object.keys(profile).forEach(key => {
        if (profile[key] !== initialProfile[key]) {
          // Handle empty strings or "none" for optional fields
          if (key === 'department_id' && (profile[key] === '' || profile[key] === 'none')) {
            changedFields[key] = null;
          } else {
            changedFields[key] = profile[key];
          }
        }
      });

      console.log("Updating profile with:", changedFields);
      await updateProfile(changedFields);
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile information below.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-purple-600">Loading profile...</span>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                name="job_title"
                value={profile.job_title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              {isLoadingDepartments ? (
                <div className="flex items-center h-10 px-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500 mr-2" />
                  <span className="text-sm text-muted-foreground">Loading departments...</span>
                </div>
              ) : (
                <Select
                  value={profile.department_id || "none"}
                  onValueChange={(value) => handleSelectChange("department_id", value)}
                >
                  <SelectTrigger id="department_id">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                value={profile.avatar_url}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formChanged || isSubmitting}
            className={!formChanged ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;
