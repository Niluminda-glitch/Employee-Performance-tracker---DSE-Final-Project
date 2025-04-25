import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, MessageSquare, Star, Users, Award, Sparkles, BookOpen, UserCheck, Clock } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { SeparatorWithText } from "@/components/ui/separator-with-text";

const FindMentor = () => {
  const { user } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [animateSkills, setAnimateSkills] = useState(false);

  useEffect(() => {
    setAnimateSkills(true);
  }, []);

  const availableSkills = [
    "Button Attachment",
    "Collar Assembly",
    "Cutting Machine Operation",
    "Embroidery",
    "Fabric Quality Control",
    "Fabric Spreading",
    "Garment Dyeing",
    "Garment Finishing",
    "Lockstitch Machine Operation",
    "Pattern Making",
    "Sleeve Attachment",
    "Stitch Quality Inspection"
  ];

  const mentorsData = {
    "Lockstitch Machine Operation": [
      { id: 1, name: "Jamie Chen", role: "employee", department: "Manufacturing", experience: "3 years", rating: 4.8, studentsHelped: 12, availability: "Weekday afternoons" },
      { id: 2, name: "Sam Supervisor", role: "supervisor", department: "Production", experience: "5 years", rating: 4.9, studentsHelped: 27, availability: "Monday-Wednesday" },
    ],
    "Fabric Spreading": [
      { id: 3, name: "Taylor Singh", role: "employee", department: "Manufacturing", experience: "2 years", rating: 4.5, studentsHelped: 8, availability: "Tuesdays & Thursdays" },
      { id: 4, name: "Max Manager", role: "manager", department: "Operations", experience: "7 years", rating: 4.7, studentsHelped: 31, availability: "Fridays only" },
    ],
    "Pattern Making": [
      { id: 5, name: "Alex Kim", role: "employee", department: "Design", experience: "4 years", rating: 5.0, studentsHelped: 16, availability: "Flexible" },
      { id: 6, name: "Jordan Lee", role: "supervisor", department: "Production", experience: "6 years", rating: 4.6, studentsHelped: 22, availability: "After 2pm daily" },
    ],
    "Stitch Quality Inspection": [
      { id: 7, name: "Casey Johnson", role: "employee", department: "Quality Control", experience: "3 years", rating: 4.7, studentsHelped: 14, availability: "Mornings only" },
      { id: 8, name: "Sam Supervisor", role: "supervisor", department: "Production", experience: "5 years", rating: 4.9, studentsHelped: 27, availability: "Monday-Wednesday" },
    ],
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mentors = selectedSkill ? mentorsData[selectedSkill] || [] : [];

  const contactMentor = (mentorId, mentorName) => {
    toast.success(`Request sent to ${mentorName}`, {
      description: "They will be notified of your mentorship request"
    });
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
        <span className="ml-1 text-sm">{rating}/5.0</span>
      </div>
    );
  };

  return (
    <DashboardShell
      title="Find a Mentor"
      subtitle="Connect with expert colleagues to enhance your skills and grow your career"
    >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-gradient flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                Skills Directory
              </CardTitle>
              <CardDescription>Browse skills and find your perfect mentor</CardDescription>

              <SeparatorWithText text="Skill Search" className="my-4" />

              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredSkills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: animateSkills ? 1 : 0,
                      y: animateSkills ? 0 : 10
                    }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedSkill(skill)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedSkill === skill
                        ? 'bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200 border shadow-sm'
                        : 'hover:bg-purple-50 border border-transparent'
                    }`}
                  >
                    <h4 className={`font-medium ${selectedSkill === skill ? 'text-purple-700' : ''}`}>
                      {skill}
                    </h4>
                    {selectedSkill === skill && (
                      <div className="flex items-center mt-1.5 text-xs text-purple-600">
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        {mentorsData[skill] ? `${mentorsData[skill].length} mentors available` : "No mentors available"}
                      </div>
                    )}
                  </motion.div>
                ))}

                {filteredSkills.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No skills found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-gradient flex items-center">
                {selectedSkill
                  ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Mentors for {selectedSkill}
                    </>
                  )
                  : (
                    <>
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Available Mentors
                    </>
                  )
                }
              </CardTitle>
              <CardDescription>
                {selectedSkill
                  ? `Experts who can help you master ${selectedSkill}`
                  : "Select a skill to see available mentors"
                }
              </CardDescription>

              <Separator className="my-4" />
            </CardHeader>
            <CardContent>
              {!selectedSkill ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-6 shadow-inner">
                    <Search className="h-10 w-10 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-3 text-gradient">Find Your Perfect Mentor</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a skill from the list to discover colleagues who can help you develop your expertise and advance your career
                  </p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-center w-full max-w-md">
                    {['Personalized guidance', 'Hands-on training', 'Expert feedback', 'Career advice', 'Skill development', 'Build connections'].map((benefit, i) => (
                      <div key={i} className="bg-purple-50 px-2 py-1.5 rounded-md text-purple-700">
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              ) : mentors.length > 0 ? (
                <div className="space-y-4">
                  {mentors.map((mentor, index) => (
                    <motion.div
                      key={mentor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {mentor.name.charAt(0)}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-lg">{mentor.name}</h4>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <Badge variant={mentor.role === "supervisor" ? "default" : "outline"} className="capitalize">
                                {mentor.role}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{mentor.department}</span>
                              {renderStarRating(mentor.rating)}
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-sm">
                                <Award className="h-4 w-4 mr-2 text-purple-600" />
                                <span><strong>{mentor.experience}</strong> with {selectedSkill}</span>
                              </div>

                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-purple-600" />
                                <span>Helped <strong>{mentor.studentsHelped} colleagues</strong> develop their skills</span>
                              </div>

                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-purple-600" />
                                <span>Available: <strong>{mentor.availability}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 sm:space-y-3 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => contactMentor(mentor.id, mentor.name)}
                            className="flex items-center justify-center"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => contactMentor(mentor.id, mentor.name)}
                            className="flex items-center justify-center"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Mentoring
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <p className="text-muted-foreground">No mentors available for {selectedSkill}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check back later or select a different skill
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </DashboardShell>
  );
};

export default FindMentor;
