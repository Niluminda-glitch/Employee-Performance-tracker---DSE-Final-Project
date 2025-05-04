import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Send, Users, Bell, User, Check } from "lucide-react";

const CreateNotificationModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { user, api } = useAuth();
  const { createNotification, createSystemNotification, createBulkNotifications } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    recipientType: 'system', // 'system', 'department', 'specific'
    departmentId: '',
    userIds: []
  });

  // Fetch departments and users for recipient selection
  useEffect(() => {
    const fetchData = async () => {
      if (!api) return;

      try {
        // Fetch departments
        const deptResponse = await api.get('/departments');
        setDepartments(deptResponse.data || []);

        // Fetch users (for supervisors and managers)
        if (user?.role === 'supervisor' || user?.role === 'manager') {
          let endpoint = '/users';

          // For supervisors, only fetch their team members
          if (user.role === 'supervisor') {
            endpoint = '/supervisors/my-team';
          }

          const usersResponse = await api.get(endpoint);
          setRecipients(usersResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data for notification modal:', error);
        toast({
          title: "Error",
          description: "Failed to load recipients data",
          variant: "destructive"
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [api, user?.role, open]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle user selection for specific recipients
  const handleUserSelection = (userId) => {
    setFormData(prev => {
      const userIds = [...prev.userIds];

      if (userIds.includes(userId)) {
        // Remove user if already selected
        return {
          ...prev,
          userIds: userIds.filter(id => id !== userId)
        };
      } else {
        // Add user if not selected
        return {
          ...prev,
          userIds: [...userIds, userId]
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let success = false;

      // Prepare notification data
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type
      };

      // Send notification based on recipient type
      switch (formData.recipientType) {
        case 'system':
          // Send to all users
          success = await createSystemNotification(notificationData);
          break;

        case 'department':
          // Send to users in a specific department
          if (!formData.departmentId) {
            toast({
              title: "Validation Error",
              description: "Please select a department",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          // Get users in the department
          const departmentUsers = recipients.filter(user => user.department_id === formData.departmentId);
          const userIds = departmentUsers.map(user => user.id);

          if (userIds.length === 0) {
            toast({
              title: "No Recipients",
              description: "There are no users in the selected department",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          success = await createBulkNotifications({
            ...notificationData,
            user_ids: userIds
          });
          break;

        case 'specific':
          // Send to specific users
          if (formData.userIds.length === 0) {
            toast({
              title: "Validation Error",
              description: "Please select at least one recipient",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          success = await createBulkNotifications({
            ...notificationData,
            user_ids: formData.userIds
          });
          break;

        default:
          toast({
            title: "Error",
            description: "Invalid recipient type",
            variant: "destructive"
          });
      }

      if (success) {
        // Reset form and close modal
        setFormData({
          title: '',
          message: '',
          type: 'announcement',
          recipientType: 'system',
          departmentId: '',
          userIds: []
        });

        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get available notification types for all users
  const getNotificationTypes = () => {
    const types = [
      { value: 'announcement', label: 'Announcement' },
      { value: 'system', label: 'System Message' }
    ];

    return types;
  };

  // Get available recipient types based on user role
  const getRecipientTypes = () => {
    // All users can send to all users
    const types = [
      { value: 'system', label: 'All Users' }
    ];

    // Supervisors can send to specific team members
    if (user?.role === 'supervisor') {
      types.push({ value: 'specific', label: 'Specific Team Members' });
    }

    // Managers can send to departments and specific users
    if (user?.role === 'manager') {
      types.push({ value: 'department', label: 'Department' });
      types.push({ value: 'specific', label: 'Specific Users' });
    }

    return types;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
          <DialogDescription>
            Send a notification to users in the system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Notification Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent>
                {getNotificationTypes().map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Type */}
          <div className="space-y-2">
            <Label htmlFor="recipientType">Send To</Label>
            <Select
              value={formData.recipientType}
              onValueChange={(value) => handleSelectChange('recipientType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                {getRecipientTypes().map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection (for managers) */}
          {formData.recipientType === 'department' && user?.role === 'manager' && (
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                value={formData.departmentId}
                onValueChange={(value) => handleSelectChange('departmentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* User Selection (for specific recipients) */}
          {formData.recipientType === 'specific' && (
            <div className="space-y-2">
              <Label>Select Recipients</Label>
              <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                {recipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No recipients available
                  </p>
                ) : (
                  <div className="space-y-1">
                    {recipients.map(recipient => (
                      <div
                        key={recipient.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${
                          formData.userIds.includes(recipient.id)
                            ? 'bg-purple-50 border border-purple-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleUserSelection(recipient.id)}
                      >
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <User className="h-3 w-3 text-purple-600" />
                        </div>
                        <span className="text-sm">{recipient.full_name}</span>
                        {formData.userIds.includes(recipient.id) && (
                          <div className="ml-auto">
                            <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {formData.userIds.length} recipient(s)
              </p>
            </div>
          )}

          {/* Notification Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter notification title"
              required
            />
          </div>

          {/* Notification Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter notification message"
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotificationModal;
