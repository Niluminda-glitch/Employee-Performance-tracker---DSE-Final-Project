import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, MessageSquare, Star, Users, Award, Sparkles, BookOpen, UserCheck, Clock, Loader2, AlertCircle } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { SeparatorWithText } from "@/components/ui/separator-with-text";

const FindMentor = () => {
  const { user, api } = useAuth();
  const [selectedSkillId, setSelectedSkillId] = useState(""); // Store ID
  const [selectedSkillName, setSelectedSkillName] = useState(""); // Store Name
  const [searchTerm, setSearchTerm] = useState("");
  const [animateSkills, setAnimateSkills] = useState(false);

  // State for API data
  const [availableSkills, setAvailableSkills] = useState([]);
  const [mentors, setMentors] = useState([]); // Initialize mentors as empty
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [skillsError, setSkillsError] = useState(null);
  const [mentorsError, setMentorsError] = useState(null);
  const [hasSearchedMentors, setHasSearchedMentors] = useState(false); // Track if a mentor search has been triggered

  useEffect(() => {
    setAnimateSkills(true);
  }, []);

  // No fallback data - we'll rely on the API

  // Fetch skills from the API
  const fetchSkills = useCallback(async () => {
    if (!api) {
      console.log('[FindMentor] API not available');
      setIsLoadingSkills(false);
      setSkillsError('API is not available. Please try again later.');
      setAvailableSkills([]);
      return;
    }

    console.log('[FindMentor] Fetching skills from API...');
    console.log('[FindMentor] API instance available:', !!api);
    console.log('[FindMentor] API headers:', api.defaults?.headers?.common || 'No headers found');

    setIsLoadingSkills(true);
    setSkillsError(null);

    try {
      const response = await api.get('/skills');
      const skillsData = response.data || [];

      console.log('[FindMentor] API response status:', response.status);
      console.log('[FindMentor] Raw skills data from API:', skillsData);

      // Validate the data structure
      if (!Array.isArray(skillsData)) {
        console.error('[FindMentor] API returned non-array data for skills:', typeof skillsData);
        setSkillsError('Invalid data format received from server.');
        setAvailableSkills([]);
        return;
      }

      if (skillsData.length === 0) {
        console.log('[FindMentor] API returned empty skills array');
      } else {
        console.log('[FindMentor] First skill from API:', skillsData[0]);
      }

      // Transform the data to match the expected format with enhanced validation
      const formattedSkills = skillsData.map(skill => {
        // Validate skill ID
        if (!skill.id) {
          console.error('[FindMentor] Skill missing ID:', skill);
        } else {
          console.log(`[FindMentor] Skill ID format check - ID: ${skill.id}, Type: ${typeof skill.id}, Length: ${skill.id.length}`);
        }

        return {
          id: skill.id, // This should be a UUID
          name: skill.name || 'Unnamed Skill',
          description: skill.description || '',
          category: '', // Category field doesn't exist in the database, so we set it to empty string
          // We'll determine has_mentors in a separate API call or set it to false by default
          has_mentors: false
        };
      });

      if (formattedSkills.length > 0) {
        console.log('[FindMentor] First skill ID format:', formattedSkills[0]?.id);
        console.log('[FindMentor] First skill ID type:', typeof formattedSkills[0]?.id);
        console.log('[FindMentor] First skill ID length:', formattedSkills[0]?.id?.length || 0);
      }

      setAvailableSkills(formattedSkills);
      console.log('[FindMentor] Skills loaded from API:', formattedSkills.length);
    } catch (err) {
      console.error('[FindMentor] Failed to fetch skills:', err.response?.data || err.message);
      console.error('[FindMentor] Error status:', err.response?.status);
      console.error('[FindMentor] Error details:', err);

      let errorMsg = 'Could not load skills list. ';
      if (err.response?.status === 401) {
        errorMsg += 'Authentication error. Please log in again.';
      } else {
        errorMsg += 'Please try again.';
      }

      setSkillsError(errorMsg);
      setAvailableSkills([]);
    } finally {
      setIsLoadingSkills(false);
    }
  }, [api]);

  // Fetch mentors from the API
  const fetchMentors = useCallback(async (skillId, skillName) => {
    // Enhanced validation and logging
    console.log(`[FindMentor] fetchMentors CALLED with skillId: ${skillId}, skillName: ${skillName}`);
    console.log(`[FindMentor] skillId details - Type: ${typeof skillId}, Length: ${skillId?.length || 0}, Value: ${skillId}`);

    if (!skillId) {
      console.error("[FindMentor] fetchMentors called with null/undefined skillId");
      setMentors([]);
      return;
    }

    // Ensure skillId is a string and in proper UUID format
    let skillIdStr = typeof skillId === 'string' ? skillId : String(skillId);

    // Validate UUID format (basic check)
    if (skillIdStr.length < 30) {
      console.error(`[FindMentor] Invalid UUID format: ${skillIdStr} (length: ${skillIdStr.length})`);
      setMentorsError(`Invalid skill identifier format. Expected UUID.`);
      setIsLoadingMentors(false);
      return;
    }

    setIsLoadingMentors(true);
    setMentorsError(null);
    setMentors([]); // Clear previous mentors before fetching
    setHasSearchedMentors(true); // Mark that a search has been initiated

    // If API is not available, show an error
    if (!api) {
      console.log(`[FindMentor] API not available for skill ID: ${skillIdStr}`);
      setMentorsError('API is not available. Please try again later.');
      setIsLoadingMentors(false);
      return;
    }

    console.log(`[FindMentor] Fetching mentors for skill ID: ${skillIdStr} from API...`);
    console.log(`[FindMentor] API instance available:`, !!api);
    console.log(`[FindMentor] API headers:`, api.defaults?.headers?.common || 'No headers found');

    try {
      // Log the exact URL being called
      const url = `/mentors/skill/${skillIdStr}`;
      console.log(`[FindMentor] Making API request to: ${url}`);

      const response = await api.get(url);
      console.log(`[FindMentor] API response status:`, response.status);
      const mentorsData = response.data || [];

      console.log(`[FindMentor] Raw mentors data from API:`, mentorsData);
      console.log(`[FindMentor] Mentors loaded from API for skill ${skillIdStr}:`, mentorsData.length);

      // The API already returns data in the format we need
      setMentors(mentorsData);
    } catch (err) {
      console.error(`[FindMentor] Failed to fetch mentors for skill ${skillIdStr}:`, err.response?.data || err.message);
      console.error(`[FindMentor] Error status:`, err.response?.status);
      console.error(`[FindMentor] Error details:`, err);

      // More detailed error message
      let errorMsg = `Could not load mentors for ${skillName}. `;
      if (err.response?.status === 404) {
        errorMsg += 'Skill not found on the server.';
      } else if (err.response?.status === 401) {
        errorMsg += 'Authentication error. Please log in again.';
      } else {
        errorMsg += err.response?.data?.message || 'Please try again.';
      }

      setMentorsError(errorMsg);
      setMentors([]);
    } finally {
      setIsLoadingMentors(false);
    }
  }, [api]); // Include api as a dependency

  // Initial fetch for skills ONCE on mount
  useEffect(() => {
    if (api) {
      console.log('[FindMentor] API instance available, fetching skills');
      fetchSkills();
    } else {
      console.log('[FindMentor] API instance not available yet');
    }
  }, [fetchSkills, api]);

  // --- REMOVED useEffect that automatically fetched mentors on skill ID change ---

  // Handle skill selection - triggers mentor fetch
  const handleSkillSelect = (skillId, skillName) => {
    console.log(`[FindMentor] handleSkillSelect RECEIVED skillId: ${skillId} (Type: ${typeof skillId}), skillName: ${skillName}`);
    console.log(`[FindMentor] skillId details - Length: ${skillId?.length || 0}, Value: ${skillId}`);

    // More detailed UUID validation
    if (!skillId) {
      console.error("[FindMentor] INVALID skillId received: null or undefined");
      toast.error("Error: Invalid skill selection (missing ID)");
      return;
    }

    if (typeof skillId !== 'string') {
      console.error(`[FindMentor] INVALID skillId type: ${typeof skillId}, expected string`);
      // Try to convert to string if possible
      skillId = String(skillId);
      console.log(`[FindMentor] Converted skillId to string: ${skillId}`);
    }

    if (skillId.length < 30) {
      console.error(`[FindMentor] INVALID skillId length: ${skillId.length}, expected UUID format (36 chars)`);
      toast.error("Error: Invalid skill identifier format");
      return;
    }

    if (skillId === selectedSkillId) { // If clicking the same skill, maybe deselect? (Optional)
      console.log(`[FindMentor] Same skill selected again: ${skillId}`);
      // setSelectedSkillId("");
      // setSelectedSkillName("");
      // setMentors([]);
      // setHasSearchedMentors(false);
      return;
    }

    console.log(`[FindMentor] Setting selectedSkillId to: ${skillId}`);
    setSelectedSkillId(skillId);
    setSelectedSkillName(skillName);
    fetchMentors(skillId, skillName); // Fetch mentors when skill is clicked
  };

  // Filter skills based on search term
  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Send mentorship request via API
  const contactMentor = async (mentorId, mentorName) => {
    if (!selectedSkillId) return;

    console.log(`[FindMentor] Sending mentorship request to ${mentorName} (ID: ${mentorId}) for skill ID: ${selectedSkillId}`);

    // If API is not available, show an error
    if (!api) {
      console.log('[FindMentor] API not available for mentorship request');

      toast.error(`Failed to send request to ${mentorName}`, {
        description: "API is not available. Please try again later."
      });

      return;
    }

    try {
      const response = await api.post('/mentors/request', {
        mentorId,
        skillId: selectedSkillId,
        message: `I would like to learn more about ${selectedSkillName}`
      });

      toast.success(`Request sent to ${mentorName}`, {
        description: "They will be notified of your mentorship request"
      });

      console.log('[FindMentor] Mentorship request sent successfully:', response.data);
    } catch (err) {
      console.error('[FindMentor] Failed to send mentorship request:', err.response?.data || err.message);

      toast.error(`Failed to send request to ${mentorName}`, {
        description: err.response?.data?.message || "Please try again later"
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 text-gradient animate-fade-in">Find a Mentor</h1>
        <p className="text-gray-500 mb-8 animate-slide-up">Connect with expert colleagues to enhance your skills and grow your career</p>

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
                {isLoadingSkills ? (
                  <div className="text-center py-6">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-purple-500" />
                    <p className="text-sm text-purple-600 mt-2">Loading skills...</p>
                  </div>
                ) : skillsError ? (
                  <div className="text-center py-6 text-red-600">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                    <p>{skillsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={fetchSkills}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : filteredSkills.length > 0 ? (
                  filteredSkills.map((skill, index) => {
                    // Enhanced logging to verify skill object structure
                    console.log(`[FindMentor] Rendering skill at index ${index}:`, skill);
                    console.log(`[FindMentor] Skill ID: ${skill.id}, Type: ${typeof skill.id}, Length: ${skill.id?.length || 0}`);
                    console.log(`[FindMentor] Is UUID format: ${typeof skill.id === 'string' && skill.id.length >= 30}`);

                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: animateSkills ? 1 : 0,
                          y: animateSkills ? 0 : 10
                        }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => handleSkillSelect(skill.id, skill.name)}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSkillId === skill.id
                            ? 'bg-gradient-to-r from-purple-100 to-purple-50 border-purple-200 border shadow-sm'
                            : 'hover:bg-purple-50 border border-transparent'
                        }`}
                      >
                      <h4 className={`font-medium ${selectedSkillId === skill.id ? 'text-purple-700' : ''}`}>
                        {skill.name}
                        {skill.has_mentors && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Mentors
                          </span>
                        )}
                      </h4>
                      {selectedSkillId === skill.id && (
                        <div className="flex items-center mt-1.5 text-xs text-purple-600">
                          <UserCheck className="h-3.5 w-3.5 mr-1" />
                          {isLoadingMentors ? 'Loading mentors...' :
                            mentors.length > 0 ? `${mentors.length} mentors available` : "No mentors available"}
                        </div>
                      )}
                    </motion.div>
                    );
                  })
                ) : (
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
                {selectedSkillName
                  ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Mentors for {selectedSkillName}
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
                {selectedSkillName
                  ? `Experts who can help you master ${selectedSkillName}`
                  : "Select a skill to see available mentors"
                }
              </CardDescription>

              <Separator className="my-4" />
            </CardHeader>
            <CardContent>
              {!hasSearchedMentors ? (
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
              ) : isLoadingMentors ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-500 mb-3" />
                  <h3 className="text-lg font-medium text-purple-700 mb-1">Finding mentors...</h3>
                  <p className="text-purple-500 text-sm">Searching for experts in {selectedSkillName}</p>
                </div>
              ) : mentorsError ? (
                <div className="text-center py-12 border rounded-lg bg-red-50">
                  <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
                  <h3 className="text-lg font-medium text-red-700 mb-1">Error finding mentors</h3>
                  <p className="text-red-500 text-sm">{mentorsError}</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => fetchMentors(selectedSkillId, selectedSkillName)}
                  >
                    Try Again
                  </Button>
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
                              {mentor.name?.charAt(0) || '?'}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-lg">{mentor.name || 'N/A'}</h4>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                              <Badge variant={mentor.role === "supervisor" || mentor.role === "manager" ? "default" : "outline"} className="capitalize">
                                {mentor.role || 'N/A'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{mentor.department || 'N/A'}</span>
                              {mentor.is_mentor && (
                                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  Willing to Mentor
                                </Badge>
                              )}
                              {renderStarRating(mentor.rating)}
                            </div>

                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-sm">
                                <Award className="h-4 w-4 mr-2 text-purple-600" />
                                <span>{mentor.job_title || 'Experienced Colleague'}</span>
                              </div>

                              <div className="flex items-center text-sm">
                                <Star className="h-4 w-4 mr-2 text-purple-600" />
                                <span>Proficiency: <strong className="capitalize">{mentor.proficiency_level || 'Learning'}</strong></span>
                              </div>

                              <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-purple-600" />
                                <span>Helped <strong>{mentor.studentsHelped || 'several'} colleagues</strong> develop their skills</span>
                              </div>

                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-purple-600" />
                                <span>Available: <strong>{mentor.availability || 'N/A'}</strong></span>
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
                            disabled={!mentor.is_mentor}
                            title={mentor.is_mentor ? "Send mentorship request" : "This user is not available for mentoring"}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {mentor.is_mentor ? "Request Mentoring" : "Not Available for Mentoring"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <p className="text-muted-foreground">No colleagues found with {selectedSkillName} skill</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This skill may not be registered in our system yet. Try selecting a different skill.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => fetchMentors(selectedSkillId, selectedSkillName)}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FindMentor;
