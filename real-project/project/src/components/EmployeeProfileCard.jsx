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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Briefcase,
  Building,
  Calendar,
  Star,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Mock skills data generator function
const generateMockSkills = (userId, jobTitle = '') => {
  // Define skill sets based on job titles
  const skillSets = {
    developer: [
      {
        skillId: "1",
        name: "JavaScript",
        description: "Modern JavaScript including ES6+ features",
        proficiencyLevel: "advanced",
        willing_to_mentor: true,
        is_certified: true,
        is_training: false
      },
      {
        skillId: "2",
        name: "React",
        description: "Frontend development with React and related libraries",
        proficiencyLevel: "intermediate",
        willing_to_mentor: true,
        is_certified: false,
        is_training: false
      },
      {
        skillId: "3",
        name: "Node.js",
        description: "Server-side JavaScript with Express and other frameworks",
        proficiencyLevel: "beginner",
        willing_to_mentor: false,
        is_certified: false,
        is_training: true
      },
      {
        skillId: "4",
        name: "SQL",
        description: "Database query language and optimization techniques",
        proficiencyLevel: "intermediate",
        willing_to_mentor: false,
        is_certified: true,
        is_training: false
      }
    ],
    designer: [
      {
        skillId: "5",
        name: "UI/UX Design",
        description: "User interface and experience design principles",
        proficiencyLevel: "expert",
        willing_to_mentor: true,
        is_certified: true,
        is_training: false
      },
      {
        skillId: "6",
        name: "Figma",
        description: "Collaborative interface design tool",
        proficiencyLevel: "advanced",
        willing_to_mentor: true,
        is_certified: false,
        is_training: false
      },
      {
        skillId: "7",
        name: "Adobe Creative Suite",
        description: "Professional design software including Photoshop and Illustrator",
        proficiencyLevel: "intermediate",
        willing_to_mentor: false,
        is_certified: true,
        is_training: false
      }
    ],
    manager: [
      {
        skillId: "8",
        name: "Project Management",
        description: "Planning, executing, and closing projects successfully",
        proficiencyLevel: "advanced",
        willing_to_mentor: true,
        is_certified: true,
        is_training: false
      },
      {
        skillId: "9",
        name: "Team Leadership",
        description: "Leading and motivating teams to achieve objectives",
        proficiencyLevel: "expert",
        willing_to_mentor: true,
        is_certified: false,
        is_training: false
      },
      {
        skillId: "10",
        name: "Agile Methodologies",
        description: "Implementing Scrum, Kanban, and other agile frameworks",
        proficiencyLevel: "intermediate",
        willing_to_mentor: false,
        is_certified: true,
        is_training: false
      }
    ],
    default: [
      {
        skillId: "11",
        name: "Communication",
        description: "Effective verbal and written communication",
        proficiencyLevel: "intermediate",
        willing_to_mentor: userId.charAt(0) > 'c',
        is_certified: false,
        is_training: false
      },
      {
        skillId: "12",
        name: "Problem Solving",
        description: "Analytical thinking and creative problem solving",
        proficiencyLevel: "advanced",
        willing_to_mentor: userId.charAt(1) > 'd',
        is_certified: userId.charAt(2) > 'e',
        is_training: false
      },
      {
        skillId: "13",
        name: "Time Management",
        description: "Prioritizing tasks and managing deadlines effectively",
        proficiencyLevel: "intermediate",
        willing_to_mentor: false,
        is_certified: false,
        is_training: userId.charAt(3) > 'f'
      }
    ]
  };

  // Determine which skill set to use based on job title
  let selectedSkillSet = skillSets.default;
  const jobTitleLower = jobTitle.toLowerCase();

  if (jobTitleLower.includes('develop') || jobTitleLower.includes('engineer') || jobTitleLower.includes('program')) {
    selectedSkillSet = [...skillSets.developer, ...skillSets.default];
  } else if (jobTitleLower.includes('design') || jobTitleLower.includes('ux') || jobTitleLower.includes('ui')) {
    selectedSkillSet = [...skillSets.designer, ...skillSets.default];
  } else if (jobTitleLower.includes('manager') || jobTitleLower.includes('lead') || jobTitleLower.includes('supervisor')) {
    selectedSkillSet = [...skillSets.manager, ...skillSets.default];
  }

  // Shuffle the skills deterministically based on userId
  const shuffledSkills = [...selectedSkillSet].sort((a, b) => {
    const hashA = userId.charCodeAt(0) + a.skillId.charCodeAt(0);
    const hashB = userId.charCodeAt(0) + b.skillId.charCodeAt(0);
    return hashA - hashB;
  });

  // Return 2-4 skills based on the user ID
  const numSkills = 2 + (userId.charCodeAt(0) % 3);
  return shuffledSkills.slice(0, numSkills);
};

const EmployeeProfileCard = ({ open, onOpenChange, employeeId }) => {
  const { api } = useAuth();
  const { toast } = useToast();
  const [employee, setEmployee] = useState(null);
  const [skills, setSkills] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [skillsError, setSkillsError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

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

  // Fetch employee details
  useEffect(() => {
    if (!open || !employeeId || !api) return;

    const fetchEmployeeDetails = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        console.log(`[EmployeeProfileCard] Fetching details for employee ID: ${employeeId}`);
        // Using the correct endpoint from user.routes.js
        const response = await api.get(`/users/${employeeId}`);
        setEmployee(response.data);
        console.log(`[EmployeeProfileCard] Employee details fetched:`, response.data);
      } catch (err) {
        console.error(`[EmployeeProfileCard] Error fetching employee details:`, err.response?.data || err.message);
        setProfileError(err.response?.data?.message || 'Failed to load employee details.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchEmployeeDetails();
  }, [employeeId, open, api]);

  // Fetch employee skills
  useEffect(() => {
    if (!open || !employeeId || !api) return;

    const fetchEmployeeSkills = async () => {
      setIsLoadingSkills(true);
      setSkillsError(null);
      setUsingMockData(false);

      try {
        console.log(`[EmployeeProfileCard] Fetching skills for employee ID: ${employeeId}`);
        // Using the correct endpoint from user.routes.js
        const response = await api.get(`/users/${employeeId}/skills`);

        // The server now returns already transformed data
        const skillsData = response.data || [];
        setSkills(skillsData);
        console.log(`[EmployeeProfileCard] Employee skills fetched:`, skillsData);
      } catch (err) {
        console.error(`[EmployeeProfileCard] Error fetching employee skills:`, err.response?.data || err.message);

        // For debugging purposes, log more details about the error
        if (err.response) {
          console.error('Error response status:', err.response.status);
          console.error('Error response data:', err.response.data);
        } else if (err.request) {
          console.error('Error request:', err.request);
        } else {
          console.error('Error message:', err.message);
        }

        // Use mock data as a fallback
        console.log('[EmployeeProfileCard] Using mock skills data as fallback');
        // Get the employee's job title if available
        const jobTitle = employee?.job_title || '';
        console.log(`[EmployeeProfileCard] Generating mock skills for job title: ${jobTitle}`);
        const mockSkills = generateMockSkills(employeeId, jobTitle);
        setSkills(mockSkills);
        setUsingMockData(true);

        // Still set the error for display purposes
        setSkillsError(err.response?.data?.message || 'Failed to load employee skills. Using sample data instead.');
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchEmployeeSkills();
  }, [employeeId, open, api]);

  // Helper function to get proficiency level color
  const getProficiencyColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'beginner': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-green-100 text-green-800 border-green-200';
      case 'expert': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        {isLoadingProfile ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-purple-700 font-medium">Loading employee profile...</p>
          </div>
        ) : profileError ? (
          <div className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-500">{profileError}</p>
            <Button className="mt-4" onClick={onOpenChange}>Close</Button>
          </div>
        ) : employee ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-500" />
                Employee Profile
              </DialogTitle>
              <DialogDescription>
                Detailed information about {employee.full_name || 'this employee'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src={employee.avatar_url || "https://i.pinimg.com/originals/7c/e9/e3/7ce9e34927261d3b035090cac779fec5.gif"}
                    alt={employee.full_name || 'Employee'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{employee.full_name}</h2>
                  <p className="text-gray-500 flex items-center justify-center sm:justify-start mt-1">
                    <Mail className="h-4 w-4 mr-1" /> {employee.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <Badge variant="outline" className={`px-2 py-1 capitalize ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                      employee.status === 'inactive' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {employee.status}
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1 capitalize bg-purple-100 text-purple-800 border-purple-200">
                      {employee.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Employee Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Job Title</p>
                    <p className="font-medium">{employee.job_title || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <Building className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{employee.userDepartment?.name || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="font-medium">{formatDate(employee.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="font-medium text-sm" title={employee.id}>
                      ID-{employee.id?.slice(-6).toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Skills Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                  Skills & Expertise
                </h3>

                {isLoadingSkills ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500 mr-2" />
                    <span className="text-purple-700">Loading skills...</span>
                  </div>
                ) : usingMockData ? (
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-700 mb-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">Using sample skills data</p>
                        <p className="text-sm">We couldn't load the actual skills data from the server. Showing sample data instead.</p>
                        <div className="flex justify-between items-center mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                            onClick={() => {
                              // Retry fetching skills
                              if (employeeId && api) {
                                setIsLoadingSkills(true);
                                api.get(`/users/${employeeId}/skills`)
                                  .then(response => {
                                    setSkills(response.data || []);
                                    setUsingMockData(false);
                                    setSkillsError(null);
                                    console.log(`[EmployeeProfileCard] Successfully fetched skills on retry`);
                                  })
                                  .catch(err => {
                                    console.error(`[EmployeeProfileCard] Retry failed:`, err.response?.data || err.message);
                                    // Keep using mock data
                                  })
                                  .finally(() => {
                                    setIsLoadingSkills(false);
                                  });
                              }
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-amber-700 hover:bg-amber-100"
                            onClick={() => {
                              // Report the issue
                              toast({
                                title: "Issue Reported",
                                description: "Thank you for reporting this issue. Our team will look into it.",
                                variant: "default"
                              });
                            }}
                          >
                            Report Issue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : skillsError && !usingMockData ? (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-700 mb-4">
                    <p className="font-medium">Error loading skills</p>
                    <p className="text-sm">{skillsError}</p>
                  </div>
                ) : skills.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-md">
                    <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No skills found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This employee hasn't added any skills to their profile yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Display skills grid */}
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                    {skills.map((skill) => (
                      <motion.div
                        key={skill.skillId}
                        variants={itemVariants}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{skill.name}</h4>
                          <Badge className={getProficiencyColor(skill.proficiencyLevel)}>
                            {skill.proficiencyLevel || 'Beginner'}
                          </Badge>
                        </div>

                        {skill.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{skill.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                          {skill.willing_to_mentor && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Mentor
                            </Badge>
                          )}
                          {skill.is_certified && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              <Award className="h-3 w-3" /> Certified
                            </Badge>
                          )}
                          {skill.is_training && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                              <Star className="h-3 w-3" /> In Training
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-6 text-center">
            <p>No employee data available</p>
            <Button className="mt-4" onClick={onOpenChange}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeProfileCard;
