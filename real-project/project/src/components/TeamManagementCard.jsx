import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Briefcase,
  Building,
  Calendar,
  Users,
  UserPlus,
  Search,
  UserCheck,
  UserX,
  Loader2,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Edit,
  CheckCircle2,
  XCircle,
  Filter
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TeamManagementCard = ({ open, onOpenChange }) => {
  const { api, user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Fetch team members
  useEffect(() => {
    if (!open || !api) return;

    const fetchTeamMembers = async () => {
      setIsLoadingTeam(true);
      setTeamError(null);

      try {
        console.log(`[TeamManagementCard] Fetching team members`);
        const response = await api.get('/supervisor/team');
        setTeamMembers(response.data || []);
        console.log(`[TeamManagementCard] Team members fetched:`, response.data);
      } catch (err) {
        console.error(`[TeamManagementCard] Error fetching team members:`, err.response?.data || err.message);
        setTeamError(err.response?.data?.message || 'Failed to load team members.');
      } finally {
        setIsLoadingTeam(false);
      }
    };

    fetchTeamMembers();
  }, [open, api]);

  // Filter team members based on search term and active filter
  const filteredTeamMembers = teamMembers.filter(member => {
    // Search filter
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.userDepartment?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesFilter =
      activeFilter === 'all' ||
      member.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Handle status change
  const handleStatusChange = async (memberId, newStatus) => {
    try {
      // In a real implementation, you would call an API endpoint to update the user status
      console.log(`[TeamManagementCard] Changing status for user ${memberId} to ${newStatus}`);

      // Optimistic update
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, status: newStatus } : member
        )
      );

      toast({
        title: "Status Updated",
        description: `User status has been changed to ${newStatus}.`,
        variant: "default",
      });

    } catch (err) {
      console.error(`[TeamManagementCard] Error updating status:`, err);
      toast({
        title: "Update Failed",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle view profile
  const handleViewProfile = (memberId) => {
    console.log(`[TeamManagementCard] View profile for user ${memberId}`);
    // In a real implementation, you would navigate to the user profile or open a profile modal
    toast({
      title: "View Profile",
      description: "User profile view would open here.",
      variant: "default",
    });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[85vw] md:max-w-[80vw] max-h-[80vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg md:text-xl flex items-center">
            <Users className="h-4 w-4 md:h-5 md:w-5 mr-2 text-purple-500" />
            Team Management
          </DialogTitle>
          <DialogDescription className="text-sm">
            Manage your team members, view details, and perform actions
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* Team Statistics */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-100 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-2">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-purple-600">Total</p>
                <p className="text-lg font-bold text-purple-700">{teamMembers.length}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 border border-green-100 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-2">
                <UserCheck className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-green-600">Active</p>
                <p className="text-lg font-bold text-green-700">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 border border-amber-100 flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg mr-2">
                <UserPlus className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-amber-600">New</p>
                <p className="text-lg font-bold text-amber-700">
                  {teamMembers.filter(m => m.status === 'first_login').length}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Search and Filter */}
          <div className="flex flex-row justify-between items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-7 pr-2 h-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <select
                className="border rounded-md px-2 py-1 text-xs bg-white h-8"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="first_login">New</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  toast({
                    title: "Add Team Member",
                    description: "Add team member form would open here.",
                    variant: "default",
                  });
                }}
              >
                <UserPlus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Team Members Table */}
          {isLoadingTeam ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500 mr-2" />
              <span className="text-purple-700 text-sm">Loading team members...</span>
            </div>
          ) : teamError ? (
            <div className="p-3 border border-red-200 bg-red-50 rounded-md text-red-700 mb-3">
              <div className="flex">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Error loading team members</p>
                  <p className="text-xs">{teamError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 text-xs h-7 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (api) {
                        setIsLoadingTeam(true);
                        api.get('/supervisor/team')
                          .then(response => {
                            setTeamMembers(response.data || []);
                            setTeamError(null);
                          })
                          .catch(err => {
                            setTeamError(err.response?.data?.message || 'Failed to load team members.');
                          })
                          .finally(() => {
                            setIsLoadingTeam(false);
                          });
                      }
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Retry
                  </Button>
                </div>
              </div>
            </div>
          ) : filteredTeamMembers.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-md">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <h3 className="text-base font-medium text-gray-900">No team members found</h3>
              <p className="text-xs text-gray-500">
                {searchTerm || activeFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "You currently have no team members assigned to you in the system."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="py-2 px-2 text-xs font-medium">Name</TableHead>
                    <TableHead className="py-2 px-2 text-xs font-medium">Email</TableHead>
                    <TableHead className="py-2 px-2 text-xs font-medium hidden md:table-cell">Job Title</TableHead>
                    <TableHead className="py-2 px-2 text-xs font-medium hidden md:table-cell">Department</TableHead>
                    <TableHead className="py-2 px-2 text-xs font-medium">Status</TableHead>
                    <TableHead className="py-2 px-2 text-xs font-medium hidden md:table-cell">Joined</TableHead>
                    <TableHead className="py-2 px-2 text-xs font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeamMembers.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/20">
                      <TableCell className="py-1 px-2 font-medium flex items-center">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2 text-xs">
                          {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-sm truncate max-w-[100px]">
                          {member.full_name || 'Unnamed User'}
                        </span>
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
                          <span className="text-xs truncate max-w-[120px]">{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 hidden md:table-cell">
                        {member.job_title ? (
                          <div className="flex items-center">
                            <Briefcase className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
                            <span className="text-xs truncate max-w-[100px]">{member.job_title}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2 hidden md:table-cell">
                        {member.userDepartment ? (
                          <div className="flex items-center">
                            <Building className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
                            <span className="text-xs truncate max-w-[100px]">{member.userDepartment.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1 px-2">
                        <span className={`px-1.5 py-0.5 inline-flex text-xs leading-none font-medium rounded-full ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' :
                          member.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800' // For first_login or other statuses
                        }`}>
                          {member.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-1 px-2 hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-muted-foreground mr-1 flex-shrink-0" />
                          <span className="text-xs">{formatDate(member.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1 px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => handleViewProfile(member.id)} className="text-xs py-1.5">
                              <User className="mr-2 h-3 w-3" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast({
                                title: "Edit User",
                                description: "Edit user form would open here.",
                                variant: "default",
                              });
                            }} className="text-xs py-1.5">
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            {member.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'inactive')} className="text-xs py-1.5">
                                <UserX className="mr-2 h-3 w-3" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'active')} className="text-xs py-1.5">
                                <UserCheck className="mr-2 h-3 w-3" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button onClick={() => onOpenChange(false)} size="sm" className="h-8">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamManagementCard;
