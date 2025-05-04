
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailUpdates: true,
    taskReminders: true,
    teamAnnouncements: true,
    deadlineAlerts: true,
    newMessages: false,
    leaveApprovals: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
      variant: "success",
    });
    onOpenChange(false);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailUpdates" className="font-medium">
                Email Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch 
              id="emailUpdates" 
              checked={settings.emailUpdates} 
              onCheckedChange={() => toggleSetting('emailUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="taskReminders" className="font-medium">
                Task Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Get reminders about upcoming tasks
              </p>
            </div>
            <Switch 
              id="taskReminders" 
              checked={settings.taskReminders} 
              onCheckedChange={() => toggleSetting('taskReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="teamAnnouncements" className="font-medium">
                Team Announcements
              </Label>
              <p className="text-xs text-muted-foreground">
                Be notified about team announcements
              </p>
            </div>
            <Switch 
              id="teamAnnouncements" 
              checked={settings.teamAnnouncements} 
              onCheckedChange={() => toggleSetting('teamAnnouncements')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="deadlineAlerts" className="font-medium">
                Deadline Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive alerts for upcoming deadlines
              </p>
            </div>
            <Switch 
              id="deadlineAlerts" 
              checked={settings.deadlineAlerts} 
              onCheckedChange={() => toggleSetting('deadlineAlerts')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="newMessages" className="font-medium">
                New Messages
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when you receive new messages
              </p>
            </div>
            <Switch 
              id="newMessages" 
              checked={settings.newMessages} 
              onCheckedChange={() => toggleSetting('newMessages')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="leaveApprovals" className="font-medium">
                Leave Approvals
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified about leave request status
              </p>
            </div>
            <Switch 
              id="leaveApprovals" 
              checked={settings.leaveApprovals} 
              onCheckedChange={() => toggleSetting('leaveApprovals')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettings;
