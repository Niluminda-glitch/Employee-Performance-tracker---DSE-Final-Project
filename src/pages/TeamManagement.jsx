
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, UserCheck } from "lucide-react";
import TopNavigation from "@/components/layout/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import UsersList from "@/components/UsersList";
import UserManagementModal from "@/components/UserManagementModal";

const TeamManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gradient animate-fade-in">Team Management</h1>
        <p className="text-gray-500 mb-8 animate-slide-up">Manage employees, supervisors, and their roles within the organization</p>

        {/* Summary Cards with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <span className="text-3xl font-bold text-gray-800">6</span>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span className="font-medium text-green-600 mr-2">4</span> active
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-medium text-amber-600">2</span> inactive
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
                    <div className="text-xl font-bold text-blue-600">3</div>
                    <div className="text-xs text-blue-600">Employee</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                    <div className="text-xl font-bold text-purple-600">2</div>
                    <div className="text-xs text-purple-600">Supervisor</div>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded hover:bg-amber-100 transition-colors">
                    <div className="text-xl font-bold text-amber-600">1</div>
                    <div className="text-xs text-amber-600">Manager</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <UsersList
                  onAddUser={() => setAddUserModalOpen(true)}
                  onEditUser={handleEditUser}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <UserManagementModal
        open={addUserModalOpen}
        onOpenChange={setAddUserModalOpen}
        mode="add"
      />

      <UserManagementModal
        open={editUserModalOpen}
        onOpenChange={setEditUserModalOpen}
        mode="edit"
        userData={selectedUser}
      />
    </div>
  );
};

export default TeamManagement;
