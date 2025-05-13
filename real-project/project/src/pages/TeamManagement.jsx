
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, UserCheck, RefreshCw } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import UsersList from "@/components/UsersList";
import UserManagementModal from "@/components/UserManagementModal";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

const TeamManagement = () => {
  const { user, api } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dataFetchedRef = useRef(false);

  // Modal states
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // User statistics
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    employees: 0,
    supervisors: 0,
    managers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Function to fetch data directly using the token
  const fetchDataDirectly = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication error. Please try logging in again.');
        setLoading(false);
        return;
      }

      // Create a direct axios instance
      const directApi = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      console.log('TeamManagement: Fetching users directly with token...');
      const response = await directApi.get('/manager/users');
      console.log('TeamManagement: Direct API response received with',
        Array.isArray(response.data) ? response.data.length : 'non-array',
        'items');

      if (Array.isArray(response.data)) {
        const fetchedUsers = response.data;
        setUsers(fetchedUsers);

        // Calculate statistics
        const stats = {
          total: fetchedUsers.length,
          active: fetchedUsers.filter(u => u.status === 'active').length,
          inactive: fetchedUsers.filter(u => u.status !== 'active').length,
          employees: fetchedUsers.filter(u => u.role === 'employee').length,
          supervisors: fetchedUsers.filter(u => u.role === 'supervisor').length,
          managers: fetchedUsers.filter(u => u.role === 'manager').length
        };

        console.log('Calculated user statistics:', stats);
        setUserStats(stats);
        dataFetchedRef.current = true;
      } else {
        console.error('Expected array of users but got:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching data directly:', err);
      setError('Failed to load user data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount and when location changes
  useEffect(() => {
    console.log('TeamManagement component mounted or location changed', {
      locationKey: location.key,
      pathname: location.pathname,
      dataFetched: dataFetchedRef.current
    });

    // Force a data fetch on every mount, regardless of dataFetchedRef
    console.log('TeamManagement: Forcing data fetch on mount/location change');
    dataFetchedRef.current = false;
    fetchDataDirectly();

    // Set up event listeners for refresh events
    const handleRefreshEvent = () => {
      console.log('TeamManagement: Refresh event detected');
      dataFetchedRef.current = false;
      fetchDataDirectly();
    };

    window.addEventListener('team-management-refresh', handleRefreshEvent);
    window.addEventListener('popstate', handleRefreshEvent);

    return () => {
      console.log('TeamManagement component unmounting');
      window.removeEventListener('team-management-refresh', handleRefreshEvent);
      window.removeEventListener('popstate', handleRefreshEvent);
    };
  }, [fetchDataDirectly, location.key]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gradient animate-fade-in">Team Management</h1>
          <Button
            onClick={() => {
              console.log('Manual refresh triggered');
              dataFetchedRef.current = false;
              fetchDataDirectly();
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        <p className="text-gray-500 mb-8 animate-slide-up">Manage employees, supervisors, and their roles within the organization</p>

        {/* Summary Cards with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center p-8">
              <LoadingAnimation type="hash" size={40} text="Loading statistics..." />
            </div>
          ) : error ? (
            <div className="col-span-3 p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="text-blue-500 underline">Retry</button>
            </div>
          ) : (
            <>
              <Card className="shadow-card-hover border-0 animate-slide-up animate-delay-100
                bg-gradient-to-br from-purple-50 to-purple-100/50
                hover:scale-105 transition-all duration-300
                transform origin-center group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-purple-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100/70 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                      <Users className="h-6 w-6 text-purple-500 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-800">{userStats.total}</span>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="font-medium text-green-600 mr-2">{userStats.active}</span> active
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="font-medium text-amber-600">{userStats.inactive}</span> inactive
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card-hover border-0 animate-slide-up animate-delay-200
                bg-gradient-to-br from-blue-50 to-blue-100/50
                hover:scale-105 transition-all duration-300
                transform origin-center group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-blue-600">Employee Distribution</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100/70 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                      <UserCheck className="h-6 w-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <div className="text-center p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                        <div className="text-xl font-bold text-blue-600">{userStats.employees}</div>
                        <div className="text-xs text-blue-600">Employee</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                        <div className="text-xl font-bold text-purple-600">{userStats.supervisors}</div>
                        <div className="text-xs text-purple-600">Supervisor</div>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded hover:bg-amber-100 transition-colors">
                        <div className="text-xl font-bold text-amber-600">{userStats.managers}</div>
                        <div className="text-xs text-amber-600">Manager</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="shadow-card-hover border-0 animate-slide-up animate-delay-300
            bg-gradient-to-br from-green-50 to-green-100/50
            hover:scale-105 transition-all duration-300
            transform origin-center group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-green-600">Add User</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100/70 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                    <UserPlus className="h-6 w-6 text-green-500 group-hover:text-green-600 transition-colors" />
                  </div>
                  <span className="text-md font-medium text-gray-800">Register a new user</span>
                </div>
                <button
                  onClick={() => setAddUserModalOpen(true)}
                  className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-green-600" />
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Add new employees or supervisors to the system
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="users" className="mb-8 animate-fade-in">
          <TabsList className="p-1 bg-purple-50 rounded-xl border border-purple-100 mb-6">
            <TabsTrigger value="users" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 mr-2" />
              Users Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="animate-slide-up">
            <Card className="shadow-card hover:shadow-card-hover border border-purple-100/80">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add, edit, and manage user accounts in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Force key to re-render when users change */}
                <UsersList
                  key={`users-list-${users.length}-${loading}-${Date.now()}`}
                  onAddUser={() => setAddUserModalOpen(true)}
                  onEditUser={handleEditUser}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  usersData={users}
                  isLoading={loading}
                  errorMessage={error}
                  onRefresh={() => {
                    console.log('UsersList requested refresh');
                    dataFetchedRef.current = false;
                    fetchDataDirectly();
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <UserManagementModal
        open={addUserModalOpen}
        onOpenChange={(isOpen, shouldRefresh) => {
          setAddUserModalOpen(isOpen);
          if (!isOpen && shouldRefresh) {
            console.log('Add user modal closed with refresh flag');
            dataFetchedRef.current = false;
            fetchDataDirectly();
          }
        }}
        mode="add"
      />

      <UserManagementModal
        open={editUserModalOpen}
        onOpenChange={(isOpen, shouldRefresh) => {
          setEditUserModalOpen(isOpen);
          if (!isOpen && shouldRefresh) {
            console.log('Edit user modal closed with refresh flag');
            dataFetchedRef.current = false;
            fetchDataDirectly();
          }
        }}
        mode="edit"
        userData={selectedUser}
      />
    </div>
  );
};

export default TeamManagement;
