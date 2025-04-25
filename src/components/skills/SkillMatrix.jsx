import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, StarHalf, Circle, Award, Shield, GraduationCap, CalendarClock, BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

// Proficiency level definitions
const proficiencyLevels = [
  { id: "not_skilled", name: "Not Skilled", color: "bg-gray-100", icon: Circle, description: "No experience with this skill" },
  { id: "learning", name: "Learning", color: "bg-amber-100", icon: StarHalf, description: "Currently developing this skill" },
  { id: "proficient", name: "Proficient", color: "bg-green-100", icon: Star, description: "Competent in this skill" },
  { id: "expert", name: "Expert/Trainer", color: "bg-blue-100", icon: Award, description: "Can train others in this skill" }
];

const SkillMatrix = ({ 
  userSkills = [], 
  availableSkills = [],
  onRequestTraining = null, // Optional callback for when a supervisor/manager requests training
  userRole = "employee" // To determine if user can request training (supervisor/manager only)
}) => {
  // Create a combined list of all skills (both user's and available skills)
  const allSkillNames = [...new Set([
    ...userSkills.map(skill => skill.name),
    ...availableSkills
  ])].sort();

  // Function to determine a skill's proficiency level
  const getSkillProficiency = (skillName) => {
    const skill = userSkills.find(s => s.name === skillName);
    
    // If user doesn't have this skill, it's "Not Skilled"
    if (!skill) return "not_skilled";
    
    // In a real implementation, this would come from the proficiencyLevel field from the API
    if (skill.proficiencyLevel) return skill.proficiencyLevel;
    
    // Fallback to the old logic for compatibility
    if (skill.willingToMentor) return "expert";
    return "proficient";
  };

  // Function to determine if a skill is certified
  const isSkillCertified = (skillName) => {
    const skill = userSkills.find(s => s.name === skillName);
    return skill?.isCertified || false;
  };

  // Function to determine if a skill is in training
  const isSkillInTraining = (skillName) => {
    const skill = userSkills.find(s => s.name === skillName);
    return skill?.isTraining || false;
  };

  // Function to get the last certified date for a skill
  const getLastCertifiedDate = (skillName) => {
    const skill = userSkills.find(s => s.name === skillName);
    return skill?.lastCertifiedDate || null;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not certified yet";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle training request click
  const handleRequestTraining = (skillName) => {
    if (onRequestTraining && userRole !== "employee") {
      onRequestTraining(skillName);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table className="border rounded-lg animate-fade-in">
        <TableHeader className="bg-purple-50/70">
          <TableRow>
            <TableHead className="w-[200px] font-semibold text-xs">Skill / Machine</TableHead>
            {proficiencyLevels.map(level => (
              <TableHead key={level.id} className="text-center font-semibold text-xs">
                <span className="flex flex-col items-center justify-center gap-1">
                  {level.name}
                  <level.icon className={`h-3 w-3 ${level.id === "not_skilled" ? "text-gray-400" : 
                                                    level.id === "learning" ? "text-amber-500" : 
                                                    level.id === "proficient" ? "text-green-600" : 
                                                    "text-blue-600"}`} />
                </span>
              </TableHead>
            ))}
            <TableHead className="text-center font-semibold text-xs w-28">
              <span className="flex flex-col items-center justify-center gap-1">
                Status
                <Shield className="h-3 w-3 text-purple-600" />
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allSkillNames.length > 0 ? (
            allSkillNames.map((skillName, index) => {
              const proficiencyId = getSkillProficiency(skillName);
              const isCertified = isSkillCertified(skillName);
              const isTraining = isSkillInTraining(skillName);
              const lastCertified = getLastCertifiedDate(skillName);
              
              return (
                <TableRow key={index} className="hover:bg-purple-50/30 transition-colors">
                  <TableCell className="font-medium text-xs">{skillName}</TableCell>
                  
                  {proficiencyLevels.map(level => {
                    const isCurrentLevel = level.id === proficiencyId;
                    const LevelIcon = level.icon;
                    
                    return (
                      <TableCell key={level.id} className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className={`
                                  mx-auto w-6 h-6 rounded-full flex items-center justify-center
                                  ${isCurrentLevel ? level.color : 'bg-transparent'} 
                                  ${isCurrentLevel ? 'shadow-sm border border-' + level.color.replace('bg-', '') : ''}
                                  ${(level.id === "not_skilled" || level.id === "learning") && userRole !== "employee" ? 'cursor-pointer' : ''}
                                `}
                                onClick={() => (level.id === "not_skilled" || level.id === "learning") && handleRequestTraining(skillName)}
                              >
                                {isCurrentLevel && (
                                  <LevelIcon 
                                    className={`h-4 w-4 ${
                                      level.id === "not_skilled" ? "text-gray-400" : 
                                      level.id === "learning" ? "text-amber-500" : 
                                      level.id === "proficient" ? "text-green-600" : 
                                      "text-blue-600"
                                    }`} 
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">{level.description}</p>
                              {(level.id === "not_skilled" || level.id === "learning") && userRole !== "employee" && (
                                <p className="text-xs text-purple-600 font-medium mt-1">Click to recommend training</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    );
                  })}
                  
                  {/* Certification Status */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center space-y-1">
                            {isCertified ? (
                              <div className="rounded-full w-6 h-6 bg-purple-100 flex items-center justify-center">
                                <BadgeCheck className="h-4 w-4 text-purple-600" />
                              </div>
                            ) : isTraining ? (
                              <div className="rounded-full w-6 h-6 bg-blue-100 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-blue-600" />
                              </div>
                            ) : (
                              <div className="rounded-full w-6 h-6 bg-gray-100 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Optional small indicator for Last Certified Date */}
                            {lastCertified && (
                              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="w-56">
                          {isCertified ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-purple-700">✓ Certified</p>
                              <div className="flex items-center text-xs text-gray-600">
                                <CalendarClock className="h-3 w-3 mr-1 inline-block" />
                                Last certified: {formatDate(lastCertified)}
                              </div>
                            </div>
                          ) : isTraining ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-blue-700">Training in Progress</p>
                              <p className="text-xs text-gray-600">Currently undergoing formal training</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600">Not certified for this skill</p>
                              {userRole !== "employee" && (
                                <p className="text-xs text-purple-600">Click on "Not Skilled" or "Learning" to recommend training</p>
                              )}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-sm">
                No skills available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Legend for the skill matrix */}
      <div className="mt-4 border rounded-lg p-3 bg-white">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-5 h-5 bg-purple-100 flex items-center justify-center">
              <BadgeCheck className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-xs">Certified</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-5 h-5 bg-blue-100 flex items-center justify-center">
              <GraduationCap className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-xs">Training in Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="rounded-full w-5 h-5 bg-gray-100 flex items-center justify-center">
              <Shield className="h-3 w-3 text-gray-400" />
            </div>
            <span className="text-xs">Not Certified</span>
          </div>
          
          {proficiencyLevels.map(level => (
            <div key={level.id} className="flex items-center space-x-2">
              <div className={`rounded-full w-5 h-5 ${level.color} flex items-center justify-center`}>
                <level.icon 
                  className={`h-3 w-3 ${
                    level.id === "not_skilled" ? "text-gray-400" : 
                    level.id === "learning" ? "text-amber-500" : 
                    level.id === "proficient" ? "text-green-600" : 
                    "text-blue-600"
                  }`} 
                />
              </div>
              <span className="text-xs">{level.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillMatrix;
