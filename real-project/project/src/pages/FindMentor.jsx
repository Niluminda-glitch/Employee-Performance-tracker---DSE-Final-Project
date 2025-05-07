import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, MessageSquare, Star, Users, Award, Sparkles, BookOpen, UserCheck, Clock, Loader2,
  AlertCircle, SlidersHorizontal, User, ArrowLeft, Filter, X, CheckCircle2 } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";


// Custom Skeleton component since we don't have the UI library's Skeleton
const Skeleton = ({ className }) => {
  return <div className={className} />;
};

// Animation variants for Framer Motion
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
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(124, 58, 237, 0.04)",
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  }
};

const filterVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring', stiffness: 300, damping: 24 },
      opacity: { duration: 0.2 }
    }
  }
};

const FindMentor = () => {
  const { user, api } = useAuth();
  const [selectedSkillId, setSelectedSkillId] = useState(""); // Store ID
  const [selectedSkillName, setSelectedSkillName] = useState(""); // Store Name
  const [searchTerm, setSearchTerm] = useState("");
  const [animateSkills, setAnimateSkills] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortOption, setSortOption] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced filtering options
  const [filters, setFilters] = useState({
    proficiencyLevels: [],
    availability: [],
    minRating: 0
  });

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

    try {
      // First approach: Try using the dedicated mentors endpoint
      try {
        const url = `/mentors/skill/${skillIdStr}`;
        console.log(`[FindMentor] Making API request to: ${url}`);

        const response = await api.get(url);
        console.log(`[FindMentor] API response status:`, response.status);
        const mentorsData = response.data || [];

        console.log(`[FindMentor] Raw mentors data from API:`, mentorsData);
        console.log(`[FindMentor] Mentors loaded from API for skill ${skillIdStr}:`, mentorsData.length);

        // The API already returns data in the format we need
        setMentors(mentorsData);
        setIsLoadingMentors(false);
        return;
      } catch (mentorsEndpointError) {
        console.error(`[FindMentor] Error using mentors endpoint:`, mentorsEndpointError.message);
        console.log(`[FindMentor] Falling back to manual database query approach...`);
        // Continue to fallback approach
      }

      // Fallback approach: Manually query the database tables
      console.log(`[FindMentor] Using fallback approach to fetch mentors for skill ID: ${skillIdStr}`);

      // Step 1: Get all user_ids from user_skills table for this skill
      console.log(`[FindMentor] Step 1: Fetching user_ids from user_skills table for skill ID: ${skillIdStr}`);
      const userSkillsResponse = await api.get(`/user-skills/by-skill/${skillIdStr}`);
      const userSkillsData = userSkillsResponse.data || [];

      if (userSkillsData.length === 0) {
        console.log(`[FindMentor] No users found with skill ID: ${skillIdStr}`);
        setMentors([]);
        setIsLoadingMentors(false);
        return;
      }

      console.log(`[FindMentor] Found ${userSkillsData.length} user_skills entries for skill ID: ${skillIdStr}`);

      // Extract user IDs and skill details
      const userIds = userSkillsData.map(entry => entry.userId || entry.user_id);
      console.log(`[FindMentor] Extracted user IDs:`, userIds);

      if (userIds.length === 0) {
        console.log(`[FindMentor] No valid user IDs found for skill ID: ${skillIdStr}`);
        setMentors([]);
        setIsLoadingMentors(false);
        return;
      }

      // Step 2: Get user details for these user IDs
      console.log(`[FindMentor] Step 2: Fetching user details for ${userIds.length} users`);

      // We'll fetch each user individually to avoid complex API endpoints
      const userDetailsPromises = userIds.map(userId =>
        api.get(`/users/${userId}`)
          .then(response => ({
            ...response.data,
            // Find the corresponding user_skill entry to get proficiency and willing_to_mentor
            ...userSkillsData.find(entry =>
              (entry.userId || entry.user_id) === userId
            )
          }))
          .catch(error => {
            console.error(`[FindMentor] Error fetching user ${userId}:`, error.message);
            return null;
          })
      );

      const userResults = await Promise.all(userDetailsPromises);
      const validUsers = userResults.filter(user => user !== null);

      console.log(`[FindMentor] Found ${validUsers.length} valid users with skill ID: ${skillIdStr}`);

      // Format the response to match the expected format
      const formattedUsers = validUsers.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown User',
        role: user.role || 'employee',
        job_title: user.job_title || 'Team Member',
        department: user.userDepartment?.name || 'N/A',
        is_mentor: user.willing_to_mentor || false,
        proficiency_level: user.proficiency_level || user.proficiencyLevel || 'learning',
        // Add some placeholder data for UI display
        experience: `${Math.floor(Math.random() * 5) + 1} years`,
        rating: (4 + Math.random()).toFixed(1),
        studentsHelped: Math.floor(Math.random() * 20) + 5,
        availability: "Weekdays",
        avatar_url: user.avatar_url || null
      }));

      console.log(`[FindMentor] Returning ${formattedUsers.length} formatted users for skill ID: ${skillIdStr}`);
      setMentors(formattedUsers);
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

  // Removed unused renderStarRating function

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      if (type === 'proficiencyLevels' || type === 'availability') {
        // Toggle array values
        const currentValues = [...prev[type]];
        const valueIndex = currentValues.indexOf(value);

        if (valueIndex === -1) {
          currentValues.push(value);
        } else {
          currentValues.splice(valueIndex, 1);
        }

        return { ...prev, [type]: currentValues };
      } else if (type === 'minRating') {
        // Set numeric value
        return { ...prev, minRating: value };
      }

      return prev;
    });
  };

  // Apply filters and sort mentors
  const filteredAndSortedMentors = [...mentors]
    .filter(mentor => {
      // Apply proficiency level filter if any are selected
      if (filters.proficiencyLevels.length > 0) {
        const level = mentor.proficiency_level || 'learning';
        if (!filters.proficiencyLevels.includes(level.toLowerCase())) {
          return false;
        }
      }

      // Apply availability filter if any are selected
      if (filters.availability.length > 0) {
        const availability = mentor.availability || '';
        if (!filters.availability.some(option => availability.toLowerCase().includes(option.toLowerCase()))) {
          return false;
        }
      }

      // Apply minimum rating filter
      if (filters.minRating > 0) {
        const rating = parseFloat(mentor.rating) || 0;
        if (rating < filters.minRating) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'availability':
          return (b.availability ? 1 : 0) - (a.availability ? 1 : 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Redesigned Hero Section */}
        <div className="mb-12 text-center relative overflow-hidden py-10">
          {/* Enhanced background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
              <div className="w-full h-full bg-gradient-to-br from-purple-300/30 to-indigo-300/30 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
            </div>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-200/20 rounded-full filter blur-xl opacity-30 animate-float"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-200/20 rounded-full filter blur-xl opacity-30 animate-float animation-delay-2000"></div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-10 right-1/4 w-20 h-20 bg-purple-400/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-indigo-400/20 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-1/3 w-8 h-8 bg-pink-400/20 rounded-full animate-float animation-delay-1000"></div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-4xl mx-auto px-4"
          >
            <div className="inline-block mb-3 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-purple-100">
              <span className="text-purple-800 font-medium text-sm flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                Find experts in your organization
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 leading-tight">
              Connect With Your Perfect Mentor
            </h1>

            <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl mb-8">
              Accelerate your growth by learning directly from experienced colleagues who are ready to share their expertise
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('skills-directory').scrollIntoView({ behavior: 'smooth' })}
              >
                Browse Skills
              </Button>
              <Button
                variant="outline"
                className="border-2 border-purple-300 bg-white/80 backdrop-blur-sm text-purple-700 hover:bg-purple-50 font-medium py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                How It Works
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Redesigned Skills Directory */}
          <Card id="skills-directory" className="lg:col-span-4 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

              <div className="flex items-center relative z-10">
                <div className="p-3 bg-white/20 rounded-xl mr-4 shadow-inner">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Skills Directory</CardTitle>
                  <CardDescription className="text-purple-100 mt-1">
                    Browse skills and find your perfect mentor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Enhanced Search Bar */}
              <div className="relative mt-2 mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-purple-500" />
                </div>
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-purple-100 bg-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 shadow-md text-purple-900 placeholder-purple-400"
                />
              </div>

              {/* Skills List with Enhanced Styling */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
                {isLoadingSkills ? (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4 p-4 shadow-inner">
                      <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    </div>
                    <p className="text-purple-700 font-medium text-lg">Loading skills...</p>
                    <p className="text-purple-500 text-sm mt-1">This will just take a moment</p>
                  </div>
                ) : skillsError ? (
                  <div className="text-center py-8 bg-red-50/80 backdrop-blur-sm p-6 rounded-xl border border-red-200 shadow-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-md border border-red-200">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="font-medium text-lg text-red-700 mb-2">Unable to Load Skills</p>
                    <p className="text-red-600 mb-4">{skillsError}</p>
                    <Button
                      variant="outline"
                      className="border-2 border-red-300 bg-white text-red-700 hover:bg-red-50 px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={fetchSkills}
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" /> Try Again
                    </Button>
                  </div>
                ) : filteredSkills.length > 0 ? (
                  filteredSkills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: animateSkills ? 1 : 0,
                        y: animateSkills ? 0 : 10
                      }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      whileHover={{ scale: selectedSkillId === skill.id ? 1 : 1.02 }}
                      onClick={() => handleSkillSelect(skill.id, skill.name)}
                      className={`p-5 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        selectedSkillId === skill.id
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-50 border-2 border-purple-300 shadow-lg'
                          : 'hover:bg-purple-50/80 border-2 border-transparent hover:border-purple-200 hover:shadow-md bg-white'
                      }`}
                    >
                      {/* Decorative corner accent */}
                      {selectedSkillId === skill.id && (
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-bl-xl"></div>
                      )}

                      <h4 className={`font-medium flex items-center text-base ${
                        selectedSkillId === skill.id ? 'text-purple-800' : 'text-gray-700'
                      }`}>
                        {skill.name}
                        {skill.has_mentors && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Mentors
                          </span>
                        )}
                      </h4>

                      {skill.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {skill.description}
                        </p>
                      )}

                      {selectedSkillId === skill.id && (
                        <div className="flex items-center mt-3 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full shadow-sm border border-purple-200/50">
                          <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                          {isLoadingMentors ? 'Loading mentors...' :
                            mentors.length > 0 ? `${mentors.length} mentors available` : "No mentors available"}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-indigo-50/50 rounded-xl border-2 border-dashed border-indigo-200 shadow-inner">
                    <Search className="h-12 w-12 mx-auto text-indigo-300 mb-3 opacity-70" />
                    <p className="text-indigo-700 font-medium text-lg">No skills found matching "{searchTerm}"</p>
                    <p className="text-indigo-500 text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Redesigned Mentor Results - 8 columns on large screens */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80">
              <CardHeader className="bg-white p-6 border-b border-gray-100 relative">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-50/50 to-transparent opacity-50"></div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center">
                      {selectedSkillName ? (
                        <>
                          <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mr-4 shadow-md">
                            <Sparkles className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                              Mentors for {selectedSkillName}
                              {filteredAndSortedMentors.length > 0 && (
                                <span className="ml-3 text-sm bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                                  {filteredAndSortedMentors.length}
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1 text-gray-500">
                              Experts who can help you master {selectedSkillName}
                            </CardDescription>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl mr-4 shadow-md">
                            <Users className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold text-gray-800">
                              Available Mentors
                            </CardTitle>
                            <CardDescription className="mt-1 text-gray-500">
                              Select a skill to see available mentors
                            </CardDescription>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedSkillName && (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="border-2 border-purple-200 bg-white hover:bg-purple-50 text-purple-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {(filters.proficiencyLevels.length > 0 || filters.availability.length > 0 || filters.minRating > 0) && (
                          <span className="ml-2 w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center">
                            {filters.proficiencyLevels.length + (filters.availability.length > 0 ? 1 : 0) + (filters.minRating > 0 ? 1 : 0)}
                          </span>
                        )}
                      </Button>

                      <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2.5 ${viewMode === "grid" ? "bg-purple-100 text-purple-700 font-medium" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                          aria-label="Grid view"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 3V5h2v2H5zM3 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm2 3V11h2v2H5zM13 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm2 3V5h2v2h-2zM13 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4zm2 3V11h2v2h-2z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2.5 ${viewMode === "list" ? "bg-purple-100 text-purple-700 font-medium" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                          aria-label="List view"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      <div className="relative">
                        <select
                          value={sortOption}
                          onChange={(e) => setSortOption(e.target.value)}
                          className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-gray-700 font-medium"
                        >
                          <option value="relevance">Sort by Relevance</option>
                          <option value="rating">Sort by Rating</option>
                          <option value="name">Sort by Name</option>
                          <option value="availability">Sort by Availability</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <SlidersHorizontal className="h-4 w-4 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filter Panel */}
                <AnimatePresence>
                  {showFilters && selectedSkillName && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={filterVariants}
                      className="mt-6 pt-5 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Proficiency Level Filter */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                            <Award className="h-4 w-4 mr-2 text-purple-500" />
                            Proficiency Level
                          </h4>
                          <div className="space-y-2">
                            {['Learning', 'Intermediate', 'Advanced', 'Expert'].map(level => (
                              <div key={level} className="flex items-center">
                                <button
                                  onClick={() => handleFilterChange('proficiencyLevels', level.toLowerCase())}
                                  className={`flex items-center w-full p-2 rounded-lg transition-all ${
                                    filters.proficiencyLevels.includes(level.toLowerCase())
                                      ? 'bg-purple-100 text-purple-700 font-medium'
                                      : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-2 ${
                                    filters.proficiencyLevels.includes(level.toLowerCase())
                                      ? 'bg-purple-600 border-purple-600 text-white'
                                      : 'border-gray-300 bg-white'
                                  }`}>
                                    {filters.proficiencyLevels.includes(level.toLowerCase()) && (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </div>
                                  {level}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Availability Filter */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-purple-500" />
                            Availability
                          </h4>
                          <div className="space-y-2">
                            {['Weekdays', 'Weekends', 'Evenings'].map(time => (
                              <div key={time} className="flex items-center">
                                <button
                                  onClick={() => handleFilterChange('availability', time.toLowerCase())}
                                  className={`flex items-center w-full p-2 rounded-lg transition-all ${
                                    filters.availability.includes(time.toLowerCase())
                                      ? 'bg-purple-100 text-purple-700 font-medium'
                                      : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-2 ${
                                    filters.availability.includes(time.toLowerCase())
                                      ? 'bg-purple-600 border-purple-600 text-white'
                                      : 'border-gray-300 bg-white'
                                  }`}>
                                    {filters.availability.includes(time.toLowerCase()) && (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </div>
                                  {time}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Minimum Rating Filter */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                            <Star className="h-4 w-4 mr-2 text-purple-500" />
                            Minimum Rating
                          </h4>
                          <div className="space-y-2">
                            {[0, 3, 4, 4.5].map(rating => (
                              <div key={rating} className="flex items-center">
                                <button
                                  onClick={() => handleFilterChange('minRating', rating)}
                                  className={`flex items-center w-full p-2 rounded-lg transition-all ${
                                    filters.minRating === rating
                                      ? 'bg-purple-100 text-purple-700 font-medium'
                                      : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${
                                    filters.minRating === rating
                                      ? 'bg-purple-600 border-purple-600 text-white'
                                      : 'border-gray-300 bg-white'
                                  }`}>
                                    {filters.minRating === rating && (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                  </div>
                                  {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Filter Actions */}
                      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFilters({
                              proficiencyLevels: [],
                              availability: [],
                              minRating: 0
                            });
                          }}
                          className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 mr-3"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                        <Button
                          onClick={() => setShowFilters(false)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>

              <CardContent className="p-6 flex-1 min-h-[400px]">
                {/* Enhanced Mentor Loading State with Skeletons */}
                {isLoadingMentors && (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start gap-6 p-6 border border-indigo-100 rounded-2xl bg-white/80 shadow-md backdrop-blur-sm">
                        <Skeleton className="h-24 w-24 rounded-full bg-indigo-100/70 flex-shrink-0 mx-auto sm:mx-0" />
                        <div className="space-y-4 flex-1 w-full sm:w-auto">
                          <Skeleton className="h-6 w-3/4 bg-indigo-100/70 rounded-lg" />
                          <Skeleton className="h-4 w-1/2 bg-indigo-100/70 rounded-lg" />
                          <div className="flex flex-wrap gap-2 pt-1">
                             <Skeleton className="h-5 w-20 bg-indigo-100/70 rounded-full" />
                             <Skeleton className="h-5 w-28 bg-indigo-100/70 rounded-full" />
                             <Skeleton className="h-5 w-16 bg-indigo-100/70 rounded-full" />
                          </div>
                          <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-full sm:w-5/6 bg-indigo-100/70 rounded-lg" />
                            <Skeleton className="h-4 w-full sm:w-4/6 bg-indigo-100/70 rounded-lg" />
                            <Skeleton className="h-4 w-full sm:w-3/6 bg-indigo-100/70 rounded-lg" />
                          </div>
                        </div>
                        {/* Simulate button column */}
                        <div className="flex flex-col space-y-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-indigo-100/50">
                          <Skeleton className="h-10 w-full sm:w-32 bg-indigo-100/70 rounded-lg" />
                          <Skeleton className="h-10 w-full sm:w-32 bg-indigo-100/70 rounded-lg" />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center items-center py-8">
                      <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-full shadow-lg border border-indigo-100 flex items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-3" />
                        <p className="font-medium text-purple-800">Finding mentors for <span className="text-indigo-600 font-semibold">{selectedSkillName}</span>...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Mentor Error State */}
                {mentorsError && !isLoadingMentors && (
                  <div className="flex flex-col justify-center items-center text-center h-[400px] bg-red-50/80 backdrop-blur-sm border-2 border-red-200 text-red-700 px-6 py-10 rounded-2xl">
                    <div className="bg-white/80 p-4 rounded-full shadow-md border border-red-200 mb-6">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                    <p className="font-bold text-xl mb-3 text-red-800">Error Loading Mentors</p>
                    <p className="mb-6 max-w-md text-red-700">{mentorsError}</p>
                    <Button
                      variant="outline"
                      onClick={() => fetchMentors(selectedSkillId, selectedSkillName)}
                      className="bg-white hover:bg-red-50 border-2 border-red-300 text-red-700 hover:text-red-800 font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <SlidersHorizontal className="h-5 w-5 mr-2" /> Try Again
                    </Button>
                  </div>
                )}

                {/* Enhanced Initial State / No Skill Selected */}
                {!isLoadingMentors && !mentorsError && !hasSearchedMentors && (
                  <div className="flex flex-col justify-center items-center text-center h-[400px] border-2 border-dashed border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50/40 to-purple-50/40 p-10">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="bg-white/80 backdrop-blur-sm p-5 rounded-full shadow-lg border border-indigo-100 mb-6"
                    >
                      <Sparkles className="h-14 w-14 text-indigo-500" />
                    </motion.div>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-2xl font-bold text-indigo-800 mb-3"
                    >
                      Ready to find a mentor?
                    </motion.p>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-indigo-600 max-w-md text-lg"
                    >
                      Select a skill from the list to discover colleagues who can guide you on your learning journey.
                    </motion.p>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="mt-8 flex gap-3"
                    >
                      <div className="flex items-center text-purple-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span className="font-medium">Browse skills</span>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Enhanced Mentor Results & Empty State for Selected Skill */}
                {!isLoadingMentors && !mentorsError && hasSearchedMentors && (
                  mentors.length > 0 ? (
                    <motion.div
                      className="space-y-6" // Increased spacing between mentor cards
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      layout // Added layout prop for smooth transitions when list changes
                    >
                      {filteredAndSortedMentors.map((mentor) => (
                        <motion.div
                          key={mentor.id}
                          variants={itemVariants}
                          whileHover="hover"
                          layout // Apply layout animation to individual items for smooth reordering/filtering
                          className="relative bg-white border-2 border-indigo-100/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden backdrop-blur-sm"
                        >
                          {/* Decorative background elements */}
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-purple-400/5 to-indigo-400/5 rounded-full transform rotate-12"></div>
                          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-pink-400/5 to-purple-400/5 rounded-full"></div>

                          {/* Skill tag */}
                          {selectedSkillName && (
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200/50 shadow-sm flex items-center">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1.5 animate-pulse"></span>
                              {selectedSkillName}
                            </div>
                          )}

                          {/* Restructured layout with centered text and button at bottom */}
                          <div className="flex flex-col items-center gap-6 relative z-10">
                            {/* Avatar Section - Centered */}
                            <div className="flex-shrink-0 relative mb-2">
                              <img
                                src={mentor.avatar_url || "https://i.pinimg.com/originals/7c/e9/e3/7ce9e34927261d3b035090cac779fec5.gif"}
                                alt={`${mentor.name}'s profile picture`}
                                className="w-20 h-20 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                              />

                              {/* Status indicator - repositioned for better visibility */}
                              {mentor.is_mentor && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md border-2 border-white">
                                  MENTOR
                                </div>
                              )}
                            </div>

                            {/* Main Content Container - All centered */}
                            <div className="flex-1 flex flex-col items-center w-full min-w-0">
                              {/* Mentor Info Section - All text centered */}
                              <div className="flex-1 min-w-0 text-center w-full">
                                {/* Name and job title with increased vertical spacing */}
                                <div className="mb-4">
                                  <h3 className="text-xl font-bold text-gray-800 mb-2" title={mentor.name}>
                                    {mentor.name}
                                    {parseFloat(mentor.rating) >= 4.5 && (
                                      <span className="ml-2 text-yellow-500">
                                        <Star className="h-5 w-5 inline fill-yellow-500" />
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-purple-600 font-medium">{mentor.job_title || 'Team Member'}</p>
                                </div>

                                {/* Employee status and rating badges - centered */}
                                <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                                  <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                                    employee
                                  </div>

                                  {mentor.rating && (
                                    <div className="flex items-center bg-yellow-50 border border-yellow-100 text-yellow-700 px-2 py-1 rounded-md shadow-sm">
                                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                                      <span className="font-medium text-xs">{mentor.rating}/5.0</span>
                                    </div>
                                  )}

                                  {mentor.is_mentor === false && (
                                    <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                                      N/A
                                    </div>
                                  )}
                                </div>

                                {/* Role and department badges - centered */}
                                <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                                  {mentor.role && (
                                    <Badge variant="outline" className="border border-purple-200 text-purple-700 bg-purple-50/80 px-3 py-1 text-xs font-medium rounded-md shadow-sm">
                                      {mentor.role}
                                    </Badge>
                                  )}
                                  {mentor.department && (
                                    <Badge variant="outline" className="border border-indigo-200 text-indigo-700 bg-indigo-50/80 px-3 py-1 text-xs font-medium rounded-md shadow-sm">
                                      {mentor.department}
                                    </Badge>
                                  )}
                                </div>

                                {/* Details Section - Vertical layout with centered items */}
                                <div className="flex flex-col space-y-3 text-sm text-gray-600 bg-white p-4 rounded-xl border border-purple-100/50 shadow-sm">
                                  {/* Helped colleagues */}
                                  <div className="flex items-center justify-center">
                                    <div className="flex-shrink-0 p-2 bg-purple-100/80 rounded-lg mr-3 shadow-sm">
                                      <Users className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 font-medium block">Helped</span>
                                      <span className="font-semibold text-purple-800 block">{mentor.studentsHelped || '0'} colleagues</span>
                                    </div>
                                  </div>

                                  {/* Proficiency level */}
                                  <div className="flex items-center justify-center">
                                    <div className="flex-shrink-0 p-2 bg-purple-100/80 rounded-lg mr-3 shadow-sm">
                                      <Award className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 font-medium block">Proficiency</span>
                                      <span className="font-semibold text-purple-800 capitalize block">{mentor.proficiency_level || 'Learning'}</span>
                                    </div>
                                  </div>

                                  {/* Availability */}
                                  <div className="flex items-center justify-center">
                                    <div className="flex-shrink-0 p-2 bg-purple-100/80 rounded-lg mr-3 shadow-sm">
                                      <Clock className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <span className="text-xs text-gray-500 font-medium block">Available</span>
                                      <span className="font-semibold text-purple-800 block">{mentor.availability || 'Not specified'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons Section - Moved to bottom */}
                              <div className="flex flex-col space-y-3 w-full mt-6 pt-4 border-t border-purple-100">
                                {mentor.is_mentor ? (
                                  <Button
                                    onClick={() => contactMentor(mentor.id, mentor.name)}
                                    className="flex items-center justify-center group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2 relative z-10" />
                                    <span className="relative z-10">Request Mentoring</span>
                                  </Button>
                                ) : null}

                                <Button
                                  variant="outline"
                                  onClick={() => contactMentor(mentor.id, mentor.name)}
                                  className="flex items-center justify-center group border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-800 font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  title={`Send a message to ${mentor.name}`}
                                >
                                  <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                  <span>Send Message</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col justify-center items-center text-center h-[400px] border-2 border-dashed border-purple-200 rounded-2xl bg-gradient-to-br from-purple-50/30 to-pink-50/30 p-10">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="bg-white/80 backdrop-blur-sm p-5 rounded-full shadow-lg border border-purple-100 mb-6"
                      >
                        <Users className="h-14 w-14 text-purple-500" />
                      </motion.div>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-2xl font-bold text-purple-800 mb-3"
                      >
                        No Mentors Found
                      </motion.p>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-purple-600 max-w-md text-lg"
                      >
                        We couldn't find any colleagues marked as mentors for <strong className="text-purple-800 font-semibold">{selectedSkillName}</strong> right now.
                      </motion.p>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-8"
                      >
                        <Button
                          variant="outline"
                          onClick={() => { setSelectedSkillId(''); setHasSearchedMentors(false); }}
                          className="bg-white hover:bg-purple-50 border-2 border-purple-300 text-purple-700 hover:text-purple-800 font-medium px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" /> Browse Other Skills
                        </Button>
                      </motion.div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* Redesigned Statistics & Tips Section */}
            {hasSearchedMentors && filteredAndSortedMentors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  className="relative bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-6 shadow-xl rounded-2xl border border-white/20 backdrop-blur-sm overflow-hidden group"
                >
                  {/* Decorative elements */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl opacity-70"></div>
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl opacity-50"></div>

                  <div className="flex items-center relative z-10">
                    <div className="p-4 rounded-xl bg-white/20 mr-5 group-hover:bg-white/30 transition-all duration-300 shadow-inner">
                      <Users className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-100">Available Mentors</p>
                      <h3 className="text-3xl font-bold mt-1">{filteredAndSortedMentors.length}</h3>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/20 text-sm text-purple-100/80">
                    {filteredAndSortedMentors.length < mentors.length ? (
                      <p>Showing {filteredAndSortedMentors.length} of {mentors.length} total mentors</p>
                    ) : (
                      <p>Showing all available mentors for {selectedSkillName}</p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  className="relative bg-gradient-to-br from-green-500 to-emerald-700 text-white p-6 shadow-xl rounded-2xl border border-green-300/30 backdrop-blur-none overflow-hidden group"
                >
                  {/* Decorative elements */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-green-200/30 rounded-full blur-xl opacity-80"></div>
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/30 rounded-full blur-xl opacity-70"></div>

                  <div className="flex items-center relative z-10">
                    <div className="p-4 rounded-xl bg-green-200/40 mr-5 group-hover:bg-green-200/50 transition-all duration-300 shadow-inner">
                      <Star className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-100">Average Rating</p>
                      <h3 className="text-3xl font-bold mt-1">
                        {(filteredAndSortedMentors.reduce((sum, m) => sum + (parseFloat(m.rating) || 0), 0) / filteredAndSortedMentors.length || 0).toFixed(1)}/5.0
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-300/30 text-sm text-green-100/90">
                    <p>
                      {filteredAndSortedMentors.filter(m => parseFloat(m.rating) >= 4.5).length} mentors with 4.5+ rating
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  className="relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 shadow-xl rounded-2xl border border-white/20 backdrop-blur-sm overflow-hidden group"
                >
                  {/* Decorative elements */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl opacity-70"></div>
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl opacity-50"></div>

                  <div className="flex items-center relative z-10">
                    <div className="p-4 rounded-xl bg-white/20 mr-5 group-hover:bg-white/30 transition-all duration-300 shadow-inner">
                      <Award className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-100">Top Skill Level</p>
                      <h3 className="text-3xl font-bold mt-1">
                        {filteredAndSortedMentors.reduce((top, m) => {
                          const level = m.proficiency_level || 'Learning';
                          if (level.toLowerCase() === 'expert') return 'Expert';
                          if (level.toLowerCase() === 'advanced' && top !== 'Expert') return 'Advanced';
                          if (level.toLowerCase() === 'intermediate' && top !== 'Expert' && top !== 'Advanced') return 'Intermediate';
                          return top;
                        }, 'Learning')}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/20 text-sm text-purple-100/80">
                    <p>
                      {filteredAndSortedMentors.filter(m => (m.proficiency_level || '').toLowerCase() === 'expert').length} expert mentors available
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        {/* Larger, more vibrant blobs with better positioning */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>

        {/* Subtle floating particles */}
        <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-purple-400 rounded-full opacity-30 animate-float"></div>
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-indigo-400 rounded-full opacity-30 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-2/3 w-5 h-5 bg-pink-400 rounded-full opacity-30 animate-float animation-delay-2000"></div>

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
    </div>
  );
};

export default FindMentor;
