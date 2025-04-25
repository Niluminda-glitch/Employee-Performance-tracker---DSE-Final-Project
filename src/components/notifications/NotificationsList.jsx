import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Clock, Calendar, MessageSquare, ClipboardList, Trash2, User, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const NotificationsList = () => {
  const { session, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            related_user:related_user_id (id, full_name, avatar_url),
            related_task:related_task_id (id, title, status, due_date)
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session?.user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <ClipboardList className="h-5 w-5 text-blue-500" />;
      case 'task_completed':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'deadline_reminder':
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'mentorship_request':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'request_approved':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'request_rejected':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(notif => !notif.is_read);
      case 'tasks':
        return notifications.filter(notif => 
          notif.type === 'task_assigned' || 
          notif.type === 'task_completed' || 
          notif.type === 'deadline_reminder'
        );
      case 'mentorship':
        return notifications.filter(notif => 
          notif.type === 'mentorship_request' || 
          notif.type === 'request_approved' || 
          notif.type === 'request_rejected'
        );
      case 'announcements':
        return notifications.filter(notif => notif.type === 'announcement');
      default:
        return notifications;
    }
  };

  // Count unread notifications
  const unreadCount = {
    total: notifications.filter(notif => !notif.is_read).length,
    tasks: notifications.filter(notif => 
      (notif.type === 'task_assigned' || 
       notif.type === 'task_completed' || 
       notif.type === 'deadline_reminder') && 
      !notif.is_read
    ).length,
    mentorship: notifications.filter(notif => 
      (notif.type === 'mentorship_request' || 
       notif.type === 'request_approved' || 
       notif.type === 'request_rejected') && 
      !notif.is_read
    ).length,
    announcements: notifications.filter(notif => 
      notif.type === 'announcement' && !notif.is_read
    ).length
  };

  // Mock data for notifications if the database is empty
  const mockNotifications = [
    {
      id: '1',
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Complete weekly report"',
      is_read: false,
      created_at: '2025-04-15T10:00:00Z',
      related_task: { id: '1', title: 'Complete weekly report', status: 'pending', due_date: '2025-04-20' }
    },
    {
      id: '2',
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: 'Jane Smith has requested you to be their mentor for React',
      is_read: false,
      created_at: '2025-04-14T14:30:00Z',
      related_user: { id: '2', full_name: 'Jane Smith', avatar_url: null }
    },
    {
      id: '3',
      type: 'announcement',
      title: 'New Leave Policy',
      message: 'Please review the updated leave policy effective from May 1, 2025',
      is_read: true,
      created_at: '2025-04-10T09:15:00Z'
    },
    {
      id: '4',
      type: 'deadline_reminder',
      title: 'Task Deadline Approaching',
      message: 'Your task "Team meeting preparation" is due in 2 days',
      is_read: false,
      created_at: '2025-04-16T08:00:00Z',
      related_task: { id: '2', title: 'Team meeting preparation', status: 'in-progress', due_date: '2025-04-18' }
    }
  ];

  // Use mock data if the database is empty
  const displayNotifications = notifications.length > 0 ? getFilteredNotifications() : mockNotifications.filter(notif => {
    switch (activeTab) {
      case 'unread':
        return !notif.is_read;
      case 'tasks':
        return notif.type === 'task_assigned' || notif.type === 'task_completed' || notif.type === 'deadline_reminder';
      case 'mentorship':
        return notif.type === 'mentorship_request' || notif.type === 'request_approved' || notif.type === 'request_rejected';
      case 'announcements':
        return notif.type === 'announcement';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-card border border-purple-100/80 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gradient">Notifications</CardTitle>
            <CardDescription>Stay updated with important information</CardDescription>
          </div>
          {unreadCount.total > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="relative">
                All
                {unreadCount.total > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                Unread
                {unreadCount.total > 0 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {unreadCount.total}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="relative">
                Tasks
                {unreadCount.tasks > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="mentorship" className="relative">
                Mentorship
                {unreadCount.mentorship > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-purple-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="announcements" className="relative">
                Announcements
                {unreadCount.announcements > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full"></span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="text-center py-12 bg-purple-50/30 rounded-lg border border-purple-100/50">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                  <h3 className="text-lg font-medium text-purple-700 mb-1">No notifications</h3>
                  <p className="text-purple-500 text-sm">
                    {activeTab === 'unread' 
                      ? "You don't have any unread notifications" 
                      : activeTab === 'all'
                        ? "You don't have any notifications yet"
                        : `You don't have any ${activeTab} notifications`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 ${
                        notification.is_read 
                          ? 'border-gray-100 hover:border-gray-300' 
                          : 'border-purple-200 hover:border-purple-400 bg-purple-50/30'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-lg font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-2 ml-4">
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </span>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                            <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            
                            {/* Related content based on notification type */}
                            {notification.type.includes('task') && notification.related_task && (
                              <div className="mt-2 p-2 bg-blue-50/50 rounded-md border border-blue-100/50">
                                <div className="flex items-center">
                                  <ClipboardList className="h-4 w-4 text-blue-500 mr-2" />
                                  <span className="text-sm font-medium text-blue-700">
                                    {notification.related_task.title}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1 text-xs text-blue-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>Due: {notification.related_task.due_date}</span>
                                </div>
                              </div>
                            )}
                            
                            {notification.type.includes('mentorship') && notification.related_user && (
                              <div className="mt-2 p-2 bg-purple-50/50 rounded-md border border-purple-100/50">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-purple-500 mr-2" />
                                  <span className="text-sm font-medium text-purple-700">
                                    {notification.related_user.full_name}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3 flex justify-end space-x-2">
                              {!notification.is_read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCheck className="h-4 w-4 mr-1" />
                                  Mark as Read
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsList;
