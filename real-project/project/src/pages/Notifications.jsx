import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Clock, Calendar, MessageSquare, ClipboardList, Settings, Trash2, Send, AlertCircle, User, Search, Filter, SlidersHorizontal, Star } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { toast } from "sonner";
import NotificationSettings from "@/components/NotificationSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Notifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createSystemNotification,
    toggleImportant,
    formatDate
  } = useNotifications();

  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'announcement'
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications by date
  const filterNotificationsByDate = (notifications) => {
    if (dateFilter === 'all') return notifications;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return notifications.filter(notification => {
      const notificationDate = new Date(notification.created_at);

      switch (dateFilter) {
        case 'today':
          return notificationDate >= today;
        case 'week':
          return notificationDate >= thisWeek;
        case 'month':
          return notificationDate >= thisMonth;
        default:
          return true;
      }
    });
  };

  // Filter notifications by search query
  const filterNotificationsBySearch = (notifications) => {
    if (!searchQuery.trim()) return notifications;

    const query = searchQuery.toLowerCase();
    return notifications.filter(notification =>
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      (notification.relatedUser && notification.relatedUser.full_name.toLowerCase().includes(query))
    );
  };

  // Apply all filters
  const filteredNotifications = filterNotificationsBySearch(filterNotificationsByDate(notifications));

  // Group notifications by type
  const groupedNotifications = {
    system: filteredNotifications.filter(n => n.type === 'system' || n.type === 'announcement'),
    tasks: filteredNotifications.filter(n =>
      n.type === 'task_assigned' ||
      n.type === 'task_completed' ||
      n.type === 'deadline_reminder'
    ),
    messages: filteredNotifications.filter(n =>
      n.type === 'mentorship_request' ||
      n.type === 'request_approved' ||
      n.type === 'request_rejected'
    )
  };

  // Handle creating a new notification
  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error("Please fill in all fields");
      return;
    }

    const success = await createSystemNotification(newNotification);

    if (success) {
      setCreateNotificationOpen(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'announcement'
      });

      // Refresh notifications immediately
      fetchNotifications();
    }
  };

  // Handle input change for new notification
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change for notification type
  const handleTypeChange = (value) => {
    setNewNotification(prev => ({
      ...prev,
      type: value
    }));
  };



  // Count unread notifications
  const unreadCount = {
    system: groupedNotifications.system.filter(n => !n.is_read).length,
    tasks: groupedNotifications.tasks.filter(n => !n.is_read).length,
    messages: groupedNotifications.messages.filter(n => !n.is_read).length,
    total: notifications.filter(n => !n.is_read).length
  };

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      case 'deadline_reminder':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'task_assigned':
        return <ClipboardList className="h-5 w-5 text-purple-500" />;
      case 'task_completed':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'mentorship_request':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'request_approved':
        return <Calendar className="h-5 w-5 text-teal-500" />;
      case 'request_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {loading ? 'Loading notifications...' : `You have ${unreadCount.total} unread notifications`}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {/* Show create notification button for all users */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setCreateNotificationOpen(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Create Notification
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="mb-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="flex w-full mb-4 space-x-2">
                <TabsTrigger value="all" className="flex-shrink-0 px-4">
                  All
                  {unreadCount.total > 0 &&
                    <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount.total}
                    </span>
                  }
                </TabsTrigger>
                <TabsTrigger value="important" className="flex-shrink-0 px-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" fill="currentColor" />
                    Important
                  </div>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex-shrink-0 px-4">
                  System
                  {unreadCount.system > 0 &&
                    <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount.system}
                    </span>
                  }
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex-shrink-0 px-4">
                  Tasks
                  {unreadCount.tasks > 0 &&
                    <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount.tasks}
                    </span>
                  }
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex-shrink-0 px-4">
                  Messages
                  {unreadCount.messages > 0 &&
                    <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount.messages}
                    </span>
                  }
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search and Filter UI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative md:col-span-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ textIndent: "0.5rem" }}
                />
              </div>
              <div className="md:col-span-1">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* All Notifications */}
          <TabsContent value="all">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>Recent updates and messages</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    markAllAsRead('system');
                    markAllAsRead('tasks');
                    markAllAsRead('messages');
                  }}
                  disabled={unreadCount.total === 0}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p>Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error loading notifications: {error}</p>
                  </div>
                ) : (
                  <NotificationList
                    notifications={filteredNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
                    formatDate={formatDate}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getNotificationIcon={getNotificationIcon}
                    toggleImportant={toggleImportant}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Important Notifications */}
          <TabsContent value="important">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Important Notifications</CardTitle>
                  <CardDescription>Notifications you've marked as important</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p>Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error loading notifications: {error}</p>
                  </div>
                ) : (
                  <NotificationList
                    notifications={filteredNotifications
                      .filter(n => n.is_important === true)
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
                    formatDate={formatDate}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getNotificationIcon={getNotificationIcon}
                    toggleImportant={toggleImportant}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Notifications */}
          <TabsContent value="system">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>System Notifications</CardTitle>
                  <CardDescription>Announcements and system updates</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead('system')}
                  disabled={unreadCount.system === 0}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p>Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error loading notifications: {error}</p>
                  </div>
                ) : (
                  <NotificationList
                    notifications={groupedNotifications.system.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
                    formatDate={formatDate}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getNotificationIcon={getNotificationIcon}
                    toggleImportant={toggleImportant}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Notifications */}
          <TabsContent value="tasks">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Task Notifications</CardTitle>
                  <CardDescription>Updates about your tasks and assignments</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead('tasks')}
                  disabled={unreadCount.tasks === 0}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p>Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error loading notifications: {error}</p>
                  </div>
                ) : (
                  <NotificationList
                    notifications={groupedNotifications.tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
                    formatDate={formatDate}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getNotificationIcon={getNotificationIcon}
                    toggleImportant={toggleImportant}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message Notifications */}
          <TabsContent value="messages">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>Message Notifications</CardTitle>
                  <CardDescription>Messages and requests from colleagues</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead('messages')}
                  disabled={unreadCount.messages === 0}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <p>Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    <p>Error loading notifications: {error}</p>
                  </div>
                ) : (
                  <NotificationList
                    notifications={groupedNotifications.messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
                    formatDate={formatDate}
                    markAsRead={markAsRead}
                    deleteNotification={deleteNotification}
                    getNotificationIcon={getNotificationIcon}
                    toggleImportant={toggleImportant}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </main>

      {/* Add NotificationSettings modal */}
      <NotificationSettings
        open={notificationSettingsOpen}
        onOpenChange={setNotificationSettingsOpen}
      />

      {/* Create Notification Dialog */}
      <Dialog open={createNotificationOpen} onOpenChange={setCreateNotificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create System Notification</DialogTitle>
            <DialogDescription>
              Send a notification to all users in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter notification title"
                value={newNotification.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter notification message"
                value={newNotification.message}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select
                value={newNotification.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateNotificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Notification List Component
const NotificationList = ({
  notifications,
  formatDate,
  markAsRead,
  deleteNotification,
  getNotificationIcon,
  toggleImportant
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-muted-foreground">No notifications to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 transition-colors ${!notification.is_read ? 'bg-purple-50 border-purple-100' : ''}`}
        >
          <div className="flex items-start">
            <div className="mr-4 mt-1">
              {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-1">
              <h4 className={`font-medium ${!notification.is_read ? 'text-purple-900' : ''}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${!notification.is_read ? 'text-purple-700' : 'text-muted-foreground'}`}>
                {notification.message}
              </p>
              {notification.relatedUser && (
                <div className="mt-2 flex items-center">
                  <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-1">
                    <User className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-600">
                    From: <span className="font-medium">{notification.relatedUser.full_name}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({notification.relatedUser.role})
                    </span>
                  </span>
                </div>
              )}
              {notification.relatedTask && (
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                  <span className="font-medium">Related Task: </span>
                  {notification.relatedTask.title}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(notification.created_at)}
                </span>

                <div className="flex space-x-2">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark as read
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleImportant(notification.id)}
                    className={`h-8 w-8 p-0 ${notification.is_important ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 hover:bg-yellow-50`}
                    title={notification.is_important ? "Remove from important" : "Mark as important"}
                  >
                    <Star className="h-4 w-4" fill={notification.is_important ? "currentColor" : "none"} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};



export default Notifications;
