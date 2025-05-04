import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, Search, Trash2, Grid2X2, List, Edit, User, Mail, Calendar, Building, Hash, Loader2, Briefcase } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SeparatorWithText } from "@/components/ui/separator-with-text";
import SkillMatrix from "@/components/SkillMatrix";
import ProfileEditor from "@/components/ProfileEditor";

const Profile = () => {
  const { user, api, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skillView, setSkillView] = useState("list");
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 text-gradient animate-fade-in">My Profile & Skills</h1>
        <p className="text-gray-500 mb-8 animate-slide-up">Manage your personal information and showcase your expertise</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 overflow-visible relative group border-purple-200 bg-white/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/40 to-indigo-100/30 rounded-full -translate-y-12 translate-x-12 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>

            <CardHeader className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 border-b border-purple-100">
              <CardTitle className="flex items-center justify-between">
                <span className="text-gradient">Profile Information</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 bg-purple-50 hover:bg-purple-100 text-purple-700 shadow-sm"
                  onClick={() => setIsProfileEditorOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Your personal information and skills</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col items-center space-y-4 mb-6 relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg border-4 border-white">
                  {user?.full_name?.charAt(0).toUpperCase() || user?.role?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-lg mb-1">
                    {user?.full_name || 'User Name'}
                  </h3>
                  <Badge variant="outline" className="px-3 py-1 capitalize text-xs bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700">{user?.role}</Badge>
                </div>
              </div>

              <SeparatorWithText text="Contact Information" className="mb-4" />

              <div className="space-y-4 mt-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                  <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-full">
                    <Building className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-xs text-purple-700">Department</Label>
                    <p className="font-medium text-sm">
                      {user?.userDepartment?.name || 'Not Assigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                  <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-full">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-xs text-purple-700">Email</Label>
                    <p className="font-medium text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                  <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-xs text-purple-700">Join Date</Label>
                    <p className="font-medium text-sm">{formatJoinDate(user?.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                  <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-full">
                    <Hash className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Label className="text-xs text-purple-700">Employee ID</Label>
                    <p className="font-medium text-sm" title={user?.id}>
                      ID-{user?.id?.slice(-6).toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>

                {user?.supervisor && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <Label className="text-xs text-purple-700">Supervisor</Label>
                      <p className="font-medium text-sm">{user?.supervisor?.full_name || 'Not Assigned'}</p>
                    </div>
                  </div>
                )}

                {user?.job_title && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 shadow-sm hover:shadow-md transition-all">
                    <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-full">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <Label className="text-xs text-purple-700">Job Title</Label>
                      <p className="font-medium text-sm">{user?.job_title}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <Button
                variant="outline"
                className="w-full mt-4 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 border-purple-200 hover:bg-gradient-to-r hover:from-purple-400/20 hover:to-indigo-400/20 text-purple-700 shadow-sm"
                onClick={() => setIsProfileEditorOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 relative border-purple-200 bg-white/80">
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
                          <div key={skill.id} className="flex items-center justify-between p-4 border border-purple-100 rounded-lg bg-gradient-to-r from-white to-purple-50/30 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm text-purple-900">{skill.name}</h4>

                                {skill.isCertified && (
                                  <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200 px-2 text-xs">
                                    Certified
                                  </Badge>
                                )}

                                {skill.isTraining && (
                                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200 px-2 text-xs">
                                    In Training
                                  </Badge>
                                )}
                              </div>

                              {skill.lastCertifiedDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Last certified: {new Date(skill.lastCertifiedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`mentor-${skill.id}`}
                                  checked={skill.willingToMentor}
                                  onCheckedChange={() => toggleMentorStatus(skill.id)}
                                  className="data-[state=checked]:bg-purple-600"
                                />
                                <Label htmlFor={`mentor-${skill.id}`} className="text-xs cursor-pointer">
                                  Willing to Mentor
                                </Label>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSkill(skill.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-purple-50/50 border-purple-100">
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

                <div className="flex space-x-2 bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                  <select
                    className="flex h-9 w-full rounded-md border border-purple-200 bg-white px-3 py-1 text-sm ring-offset-background focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  >
                    <option value="">Select a skill...</option>
                    {availableSkills.map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>

                  <Button onClick={addNewSkill} className="shrink-0 text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Skill
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
    </div>
  );
};

export default Profile;
