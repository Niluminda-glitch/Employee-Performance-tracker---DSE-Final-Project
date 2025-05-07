import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Grid2X2, List, Edit, User, Mail, Calendar, Building, Hash, Loader2, Briefcase } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import { useCursorEffect } from "@/hooks/use-cursor-effect";
import SkillMatrix from "@/components/SkillMatrix";
import ProfileEditor from "@/components/ProfileEditor";
import ProfilePictureSelector from "@/components/ProfilePictureSelector";
import ProfileImageLoader from "@/components/ProfileImageLoader";
import ProfileFloatingElements from "@/components/ProfileFloatingElements";

const Profile = () => {
  const { user, isLoading: authLoading, refreshUserData } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skillView, setSkillView] = useState("list");
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isProfilePictureSelectorOpen, setIsProfilePictureSelectorOpen] = useState(false);

  // Define all state hooks at the top level, before any conditional returns
  const [userSkills, setUserSkills] = useState([
    {
      id: 1,
      name: "Lockstitch Machine Operation",
      willingToMentor: true,
      proficiencyLevel: "expert",
      isCertified: true,
      isTraining: false,
      lastCertifiedDate: "2024-12-15"
    },
    {
      id: 2,
      name: "Fabric Spreading",
      willingToMentor: false,
      proficiencyLevel: "proficient",
      isCertified: true,
      isTraining: false,
      lastCertifiedDate: "2024-10-20"
    },
    {
      id: 3,
      name: "Stitch Quality Inspection",
      willingToMentor: true,
      proficiencyLevel: "expert",
      isCertified: true,
      isTraining: false,
      lastCertifiedDate: "2025-02-05"
    },
    {
      id: 4,
      name: "Garment Finishing",
      willingToMentor: false,
      proficiencyLevel: "proficient",
      isCertified: false,
      isTraining: true,
      lastCertifiedDate: null
    },
    {
      id: 5,
      name: "Pattern Making",
      willingToMentor: true,
      proficiencyLevel: "learning",
      isCertified: false,
      isTraining: true,
      lastCertifiedDate: null
    },
  ]);

  const [availableSkills, setAvailableSkills] = useState([
    "Button Attachment",
    "Collar Assembly",
    "Cutting Machine Operation",
    "Embroidery",
    "Fabric Quality Control",
    "Garment Dyeing",
    "Sleeve Attachment"
  ]);

  // Refresh user data only when component mounts
  useEffect(() => {
    console.log("[Profile] Component mounted, refreshing user data");
    // Use a function reference to avoid dependency on refreshUserData
    const fetchData = async () => {
      try {
        await refreshUserData();
        console.log("[Profile] User data refreshed successfully");
      } catch (error) {
        console.error("[Profile] Error refreshing user data:", error);
      }
    };

    fetchData();
    // Empty dependency array means this effect runs once on mount
  }, []);

  // Customize cursor effect for profile page
  useCursorEffect({
    size: 70,
    color: 'rgba(124, 58, 237, 0.06)', // Indigo color for profile
    opacity: 0.7,
    blur: 'xl'
  }, []);

  // Helper to format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // Logged out or Error State
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Could not load user profile. Please try logging in again.</p>
      </div>
    );
  }

  const toggleMentorStatus = (skillId) => {
    setUserSkills(userSkills.map(skill =>
      skill.id === skillId
        ? {
            ...skill,
            willingToMentor: !skill.willingToMentor,
            proficiencyLevel: !skill.willingToMentor ? "expert" : "proficient"
          }
        : skill
    ));

    toast.success("Mentor status updated");
  };

  const removeSkill = (skillId) => {
    const skillToRemove = userSkills.find(skill => skill.id === skillId);

    setUserSkills(userSkills.filter(skill => skill.id !== skillId));

    if (skillToRemove) {
      setAvailableSkills([...availableSkills, skillToRemove.name].sort());
    }

    toast.success("Skill removed from your profile");
  };

  const addNewSkill = () => {
    if (!newSkill) {
      toast.error("Please select a skill to add");
      return;
    }

    const newId = Math.max(...userSkills.map(s => s.id), 0) + 1;

    setUserSkills([
      ...userSkills,
      {
        id: newId,
        name: newSkill,
        willingToMentor: false,
        proficiencyLevel: "learning",
        isCertified: false,
        isTraining: false,
        lastCertifiedDate: null
      }
    ]);

    setAvailableSkills(availableSkills.filter(skill => skill !== newSkill));
    setNewSkill("");

    toast.success("New skill added to your profile");
  };

  const handleRequestTraining = (skillName) => {
    if (user?.role !== "employee") {
      toast.success(`Training recommended for ${skillName}`);
    }
  };

  const filteredSkills = userSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50 relative overflow-hidden">
      {/* Add our custom floating elements */}
      <ProfileFloatingElements />

      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold mb-2 text-gradient animate-fade-in">My Profile & Skills</h1>
        <p className="text-gray-500 mb-8 animate-slide-up">Manage your personal information and showcase your expertise</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 overflow-visible relative group border-purple-200/80 bg-white/90 backdrop-blur-lg shadow-elevation-3 hover:shadow-glow-purple transition-all duration-500 rounded-2xl border-2">
            {/* Enhanced background decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/50 to-indigo-200/40 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-200/40 to-purple-100/30 rounded-full translate-y-8 -translate-x-8 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity"></div>

            {/* Enhanced card header with more pronounced gradient and padding */}
            <CardHeader className="bg-gradient-to-r from-purple-100/90 to-indigo-100/90 border-b-2 border-purple-200/70 pt-8 pb-6 px-6 rounded-t-2xl">
              <CardTitle className="flex items-center justify-between mb-2">
                <span className="text-gradient text-xl font-bold">Profile Information</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 bg-white hover:bg-purple-100 text-purple-700 shadow-md hover:shadow-glow-purple border-purple-200"
                  onClick={() => setIsProfileEditorOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="text-purple-700/80 font-medium">Your personal information and skills</CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-8">
              {/* Enhanced profile avatar section with more pronounced effects */}
              <div className="flex flex-col items-center space-y-5 mb-8 relative">
                <div className="relative group">
                  {/* Multiple layered glows for depth */}
                  <div className="absolute inset-0 scale-[1.15] rounded-full bg-gradient-to-br from-purple-300/40 to-indigo-400/30 blur-xl opacity-60 animate-pulse-slow"></div>
                  <div className="absolute inset-0 scale-[1.05] rounded-full bg-gradient-to-br from-purple-400/50 to-indigo-500/40 blur-md opacity-40 animate-pulse-slow animate-delay-300"></div>

                  {/* Avatar with user's profile picture or default icon */}
                  <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-white relative z-10 hover:scale-105 transition-transform duration-300 hover:shadow-glow-purple overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <ProfileImageLoader className="w-full h-full" size="2xl" />
                    </div>

                    {/* Clickable area without camera icon */}
                    <div
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => setIsProfilePictureSelectorOpen(true)}
                    >
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-xl mb-2 text-purple-900">
                    {user?.full_name || 'User Name'}
                  </h3>
                  <Badge variant="outline" className="px-4 py-1.5 capitalize text-sm bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 shadow-md font-medium">{user?.role}</Badge>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 text-purple-600 hover:text-purple-800"
                    onClick={() => setIsProfilePictureSelectorOpen(true)}
                  >
                    Change profile picture
                  </Button>
                </div>
              </div>

              <SeparatorWithText text="Contact Information" className="mb-6 text-purple-800 font-semibold" />

              <div className="space-y-5 mt-4">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/40 border-2 border-purple-100/80 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full shadow-glow-purple group-hover:shadow-lg">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-purple-700 font-medium mb-0.5 block">Department</Label>
                    <p className="font-semibold text-base text-purple-900 group-hover:text-purple-700 transition-colors">
                      {user?.userDepartment?.name || 'Not Assigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/40 border-2 border-purple-100/80 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full shadow-glow-purple group-hover:shadow-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-purple-700 font-medium mb-0.5 block">Email</Label>
                    <p className="font-semibold text-base text-purple-900 group-hover:text-purple-700 transition-colors">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/40 border-2 border-purple-100/80 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full shadow-glow-purple group-hover:shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-purple-700 font-medium mb-0.5 block">Join Date</Label>
                    <p className="font-semibold text-base text-purple-900 group-hover:text-purple-700 transition-colors">{formatJoinDate(user?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/40 border-2 border-purple-100/80 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full shadow-glow-purple group-hover:shadow-lg">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm text-purple-700 font-medium mb-0.5 block">Employee ID</Label>
                    <p className="font-semibold text-base text-purple-900 group-hover:text-purple-700 transition-colors" title={user?.id}>
                      ID-{user?.id?.slice(-6).toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>

                {user?.supervisor && (
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/40 border-2 border-purple-100/80 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full shadow-glow-purple group-hover:shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm text-purple-700 font-medium mb-0.5 block">Supervisor</Label>
                      <p className="font-semibold text-base text-purple-900 group-hover:text-purple-700 transition-colors">{user?.supervisor?.full_name || 'Not Assigned'}</p>
                    </div>
                  </div>
                )}

                {user?.job_title && (
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-purple-50/40 border-2 border-purple-100/80 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-full shadow-glow-purple group-hover:shadow-lg">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm text-purple-700 font-medium mb-0.5 block">Job Title</Label>
                      <p className="font-semibold text-base text-purple-900 group-hover:text-purple-700 transition-colors">{user?.job_title}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-8 border-purple-100" />

              <Button
                variant="outline"
                className="w-full mt-6 py-6 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-400/30 hover:to-indigo-400/30 text-purple-700 font-semibold text-base shadow-md hover:shadow-glow-purple transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group rounded-xl"
                onClick={() => setIsProfileEditorOpen(true)}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <Edit className="h-5 w-5 mr-3 animate-pulse-slow" /> Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 relative border-purple-200 bg-white/80 backdrop-blur-md shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/40 to-purple-100/30 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>

            <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-purple-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-gradient">My Skills</CardTitle>
                  <CardDescription>Manage your job skills, certifications and mentorship availability</CardDescription>
                </div>

                <div className="flex items-center p-1 bg-white/80 rounded-lg border border-purple-100 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={skillView === "list" ? "bg-purple-100 text-purple-700" : ""}
                    onClick={() => setSkillView("list")}
                  >
                    <List className="h-4 w-4 mr-1" /> List
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={skillView === "matrix" ? "bg-purple-100 text-purple-700" : ""}
                    onClick={() => setSkillView("matrix")}
                  >
                    <Grid2X2 className="h-4 w-4 mr-1" /> Matrix
                  </Button>
                </div>
              </div>

              <SeparatorWithText text="Skills Management" className="my-4" />

              <div className="relative mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                  <Input
                    placeholder="Search your skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-300"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {skillView === "list" ? (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-medium text-sm mb-3 text-purple-800">Your Current Skills ({filteredSkills.length})</h3>

                    {filteredSkills.length > 0 ? (
                      <div className="space-y-3">
                        {filteredSkills.map(skill => (
                          <div key={skill.id} className="flex items-center justify-between p-4 border border-purple-100 rounded-lg bg-gradient-to-r from-white to-purple-50/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm text-purple-900 group-hover:text-purple-700 transition-colors">{skill.name}</h4>

                                {skill.isCertified && (
                                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200 px-2 text-xs group-hover:bg-purple-100 group-hover:border-purple-300 transition-colors">
                                    <span className="inline-block mr-1 text-purple-500">✓</span> Certified
                                  </Badge>
                                )}

                                {skill.isTraining && (
                                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 px-2 text-xs group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors">
                                    <span className="inline-block mr-1 animate-pulse">⟳</span> In Training
                                  </Badge>
                                )}
                              </div>

                              {skill.lastCertifiedDate && (
                                <p className="text-xs text-gray-500 mt-1 group-hover:text-purple-500 transition-colors">
                                  Last certified: {new Date(skill.lastCertifiedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2 relative">
                                <div className={`absolute inset-0 rounded-full ${skill.willingToMentor ? 'bg-purple-400' : 'bg-gray-200'} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-md -z-10`}></div>
                                <Switch
                                  id={`mentor-${skill.id}`}
                                  checked={skill.willingToMentor}
                                  onCheckedChange={() => toggleMentorStatus(skill.id)}
                                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:shadow-glow-purple transition-all duration-300 z-10 pointer-events-auto"
                                />
                                <Label htmlFor={`mentor-${skill.id}`} className="text-xs cursor-pointer group-hover:text-purple-700 transition-colors">
                                  Willing to Mentor
                                </Label>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSkill(skill.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300 hover:rotate-12"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-purple-50/50 border-purple-100 backdrop-blur-sm shadow-sm animate-pulse-slow">
                        <div className="inline-block mb-3 p-2 bg-purple-100 rounded-full">
                          <Search className="h-5 w-5 text-purple-500 opacity-70" />
                        </div>
                        <p className="text-purple-600 font-medium">No skills found matching "{searchTerm}"</p>
                        <p className="text-xs text-purple-500 mt-1">Try a different search term or add new skills</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-medium text-sm mb-3 text-purple-800">Your Skills Matrix</h3>
                    <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                      <SkillMatrix
                        userSkills={userSkills}
                        availableSkills={availableSkills}
                        onRequestTraining={handleRequestTraining}
                        userRole={user?.role}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This matrix shows your current proficiency level, certification status, and training progress for each skill.
                    </p>
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              <div className="pt-5">
                <SeparatorWithText text="Add New Skill" className="mb-4" />

                <div className="flex space-x-2 bg-purple-50/50 p-4 rounded-lg border border-purple-100 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:bg-purple-50/70">
                  <select
                    className="flex h-9 w-full rounded-md border border-purple-200 bg-white/90 backdrop-blur-sm px-3 py-1 text-sm ring-offset-background focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-purple-300"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills.map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>

                  <Button
                    onClick={addNewSkill}
                    variant="gradient"
                    size="default"
                    className="text-white font-medium min-w-[120px] flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Skill</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <ProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />

      <ProfilePictureSelector
        open={isProfilePictureSelectorOpen}
        onOpenChange={(open) => {
          setIsProfilePictureSelectorOpen(open);
          if (!open) {
            // Refresh user data when the dialog is closed
            refreshUserData();
          }
        }}
      />
    </div>
  );
};

export default Profile;
