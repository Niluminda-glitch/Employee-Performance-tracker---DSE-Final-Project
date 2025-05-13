
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, UserPlus, UserX, UserCheck, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import LoadingAnimation from './LoadingAnimation';
import { useLocation } from "react-router-dom";

const UsersList = ({
  onAddUser,
  onEditUser,
  searchTerm = "",
  onSearchChange = () => {},
  usersData = null,
  isLoading = false,
  errorMessage = null,
  onRefresh = null
}) => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Function to trigger a refresh in the parent component
  const triggerParentRefresh = useCallback(() => {
    if (onRefresh) {
      // Use the provided refresh function if available
      onRefresh();
    } else {
      // Fallback to event dispatch
      const refreshEvent = new Event('team-management-refresh');
      window.dispatchEvent(refreshEvent);
    }
  }, [onRefresh]);

  // Use the provided data if available, otherwise use local state
  useEffect(() => {
    if (usersData) {
      console.log('UsersList received external data:', usersData.length, 'users');
      setUsers(usersData);
      setLoading(isLoading);
      setError(errorMessage);
    } else {
      console.log('UsersList: No external data provided, will fetch directly');
    }
  }, [usersData, isLoading, errorMessage]);

  // Only fetch data if no external data is provided
  useEffect(() => {
    // If we have external data, don't fetch
    if (usersData !== null) return;

    let isMounted = true;
    setLoading(true);

    const fetchUsers = async () => {
      if (!isMounted) return;

      try {
        setError(null);

        if (!api) {
          console.log('API not available yet in UsersList, waiting...');
          return;
        }

        console.log('Fetching users in UsersList (fallback)...');
        const response = await api.get('/manager/users');
        console.log('Fetched users (fallback):', response.data);

        if (!isMounted) return;

        if (Array.isArray(response.data)) {
          setUsers(response.data);
          setLoading(false);
        } else {
          console.error('Expected array of users but got:', response.data);
          setUsers([]);
          setError('Invalid data format received from server');
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        toast.error('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [api, location.key, usersData]);

  const handleDeactivateUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('User not found');
        return;
      }

      const currentStatus = user.status;
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      // Optimistically update UI
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      ));

      // Call the appropriate API endpoint based on the action
      const endpoint = `/manager/users/${userId}/${newStatus === 'active' ? 'reactivate' : 'deactivate'}`;
      await api.put(endpoint);

      toast.success(
        `User ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        { description: `${user.full_name} is now ${newStatus}` }
      );

      // Trigger a refresh immediately
      triggerParentRefresh();
    } catch (err) {
      console.error('Error updating user status:', err);

      // Revert the optimistic update
      setUsers(prev => [...prev]); // Force a re-render with original data

      toast.error('Failed to update user status');

      // Refresh the user list to ensure data consistency
      const response = await api.get('/manager/users');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      user.job_title?.toLowerCase().includes(searchTermLower) ||
      (user.userDepartment?.name || '').toLowerCase().includes(searchTermLower)
    );
  });

  // Debug log what we're about to render
  console.log('UsersList rendering:', {
    totalUsers: users.length,
    filteredUsers: filteredUsers.length,
    searchTerm: searchTerm ? searchTerm : 'none',
    loading,
    error: error ? 'yes' : 'no'
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingAnimation type="hash" size={40} text="Loading users..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
          <Button onClick={triggerParentRefresh} variant="outline">Refresh Data</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={triggerParentRefresh}
            variant="outline"
            size="icon"
            title="Refresh data"
            className="h-10 w-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-refresh-cw"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </Button>
          <Button onClick={onAddUser}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Name / Email</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Position</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">Supervisor</th>
                <th className="p-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm">{user.job_title || '—'}</p>
                        <p className="text-sm text-muted-foreground">{user.userDepartment?.name || '—'}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.role === "manager" ? "destructive" : user.role === "supervisor" ? "outline" : "secondary"}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.status === "active" ? "success" : "secondary"} className={user.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <p className="text-sm">{user.supervisor?.full_name || '—'}</p>
                    </td>
                    <td className="p-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
                            {user.status === "active" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    {searchTerm ? 'No users match your search criteria' : 'No users found in the system'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersList;
