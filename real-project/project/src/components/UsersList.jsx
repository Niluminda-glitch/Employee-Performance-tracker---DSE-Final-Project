
import React, { useState } from 'react';
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

const UsersList = ({ 
  onAddUser, 
  onEditUser,
  searchTerm = "",
  onSearchChange = () => {},
}) => {
  // Mock users data - in a real app this would come from an API
  const [users, setUsers] = useState([
    { id: 1, name: "Alex Employee", email: "alex@example.com", role: "employee", department: "Engineering", jobTitle: "Software Engineer", status: "active", supervisor: "Sam Supervisor" },
    { id: 2, name: "Sam Supervisor", email: "sam@example.com", role: "supervisor", department: "Production", jobTitle: "Production Lead", status: "active", supervisor: null },
    { id: 3, name: "Jordan Lee", email: "jordan@example.com", role: "supervisor", department: "Quality Control", jobTitle: "QA Manager", status: "active", supervisor: null },
    { id: 4, name: "Max Manager", email: "max@example.com", role: "manager", department: "Operations", jobTitle: "Operations Director", status: "active", supervisor: null },
    { id: 5, name: "Taylor Singh", email: "taylor@example.com", role: "employee", department: "Engineering", jobTitle: "Frontend Developer", status: "active", supervisor: "Sam Supervisor" },
    { id: 6, name: "Jamie Chen", email: "jamie@example.com", role: "employee", department: "Design", jobTitle: "UI Designer", status: "inactive", supervisor: "Jordan Lee" },
  ]);

  const handleDeactivateUser = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === "active" ? "inactive" : "active" } 
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    const newStatus = user.status === "active" ? "inactive" : "active";
    
    toast.success(
      `User ${newStatus === "active" ? "activated" : "deactivated"}`, 
      { description: `${user.name} is now ${newStatus}` }
    );
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Button onClick={onAddUser} className="ml-2">
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button>
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
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm">{user.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
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
                      <p className="text-sm">{user.supervisor || "—"}</p>
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
                    No users match your search criteria
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
