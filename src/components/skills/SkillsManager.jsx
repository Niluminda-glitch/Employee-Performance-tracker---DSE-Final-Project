import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, CheckCircle2, BookOpen, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const SkillsManager = () => {
  const { session, user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newSkillData, setNewSkillData] = useState({
    skill_id: '',
    proficiency_level: 'learning',
    willing_to_mentor: false,
    is_certified: false,
    is_training: false
  });

  // Fetch all available skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast.error('Failed to load skills');
      }
    };

    fetchSkills();
  }, []);

  // Fetch user's skills
  useEffect(() => {
    const fetchUserSkills = async () => {
      if (!session?.user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_skills')
          .select(`
            *,
            skills:skill_id (id, name, description)
          `)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
        setUserSkills(data || []);
      } catch (error) {
        console.error('Error fetching user skills:', error);
        toast.error('Failed to load your skills');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [session?.user?.id]);

  // Filter skills based on search query
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding a new skill to user profile
  const handleAddSkill = async () => {
    if (!newSkillData.skill_id) {
      toast.error('Please select a skill');
      return;
    }

    try {
      // Check if user already has this skill
      const existingSkill = userSkills.find(us => us.skill_id === newSkillData.skill_id);
      if (existingSkill) {
        toast.error('You already have this skill in your profile');
        return;
      }

      const { error } = await supabase
        .from('user_skills')
        .insert({
          user_id: session.user.id,
          skill_id: newSkillData.skill_id,
          proficiency_level: newSkillData.proficiency_level,
          willing_to_mentor: newSkillData.willing_to_mentor,
          is_certified: newSkillData.is_certified,
          is_training: newSkillData.is_training
        });
      
      if (error) throw error;
      
      // Refresh user skills
      const { data, error: fetchError } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills:skill_id (id, name, description)
        `)
        .eq('user_id', session.user.id);
      
      if (fetchError) throw fetchError;
      
      setUserSkills(data || []);
      toast.success('Skill added to your profile');
      setAddSkillDialogOpen(false);
      
      // Reset form
      setNewSkillData({
        skill_id: '',
        proficiency_level: 'learning',
        willing_to_mentor: false,
        is_certified: false,
        is_training: false
      });
      
    } catch (error) {
      console.error('Error adding skill:', error);
      toast.error('Failed to add skill');
    }
  };

  // Handle updating a user skill
  const handleUpdateSkill = async (skillId, updates) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .update(updates)
        .eq('user_id', session.user.id)
        .eq('skill_id', skillId);
      
      if (error) throw error;
      
      // Update local state
      setUserSkills(userSkills.map(skill => 
        skill.skill_id === skillId ? { ...skill, ...updates } : skill
      ));
      
      toast.success('Skill updated');
    } catch (error) {
      console.error('Error updating skill:', error);
      toast.error('Failed to update skill');
    }
  };

  // Handle removing a skill from user profile
  const handleRemoveSkill = async (skillId) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', session.user.id)
        .eq('skill_id', skillId);
      
      if (error) throw error;
      
      // Update local state
      setUserSkills(userSkills.filter(skill => skill.skill_id !== skillId));
      
      toast.success('Skill removed from your profile');
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('Failed to remove skill');
    }
  };

  // Get badge for proficiency level
  const getProficiencyBadge = (level) => {
    switch (level) {
      case 'learning':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Learning</Badge>;
      case 'proficient':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Proficient</Badge>;
      case 'expert':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Expert</Badge>;
      default:
        return null;
    }
  };

  // Mock data for skills if the database is empty
  const mockSkills = [
    { id: '1', name: 'JavaScript', description: 'Programming language for web development' },
    { id: '2', name: 'React', description: 'Frontend library for building user interfaces' },
    { id: '3', name: 'Node.js', description: 'JavaScript runtime for server-side development' },
    { id: '4', name: 'SQL', description: 'Language for managing relational databases' },
    { id: '5', name: 'TypeScript', description: 'Typed superset of JavaScript' }
  ];

  // Mock data for user skills if the database is empty
  const mockUserSkills = [
    { 
      user_id: '1', 
      skill_id: '1', 
      proficiency_level: 'expert', 
      willing_to_mentor: true, 
      is_certified: true,
      is_training: false,
      skills: mockSkills[0]
    },
    { 
      user_id: '1', 
      skill_id: '2', 
      proficiency_level: 'proficient', 
      willing_to_mentor: true, 
      is_certified: false,
      is_training: false,
      skills: mockSkills[1]
    },
    { 
      user_id: '1', 
      skill_id: '3', 
      proficiency_level: 'learning', 
      willing_to_mentor: false, 
      is_certified: false,
      is_training: true,
      skills: mockSkills[2]
    }
  ];

  // Use mock data if the database is empty
  const displaySkills = skills.length > 0 ? skills : mockSkills;
  const displayUserSkills = userSkills.length > 0 ? userSkills : mockUserSkills;

  return (
    <div className="space-y-6">
      <Card className="shadow-card border border-purple-100/80 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gradient">My Skills</CardTitle>
            <CardDescription>Manage your skills and expertise</CardDescription>
          </div>
          <Dialog open={addSkillDialogOpen} onOpenChange={setAddSkillDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a New Skill</DialogTitle>
                <DialogDescription>
                  Add a skill to your profile to showcase your expertise.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="skill">Select Skill</Label>
                  <Select 
                    value={newSkillData.skill_id} 
                    onValueChange={(value) => setNewSkillData({...newSkillData, skill_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {displaySkills.map(skill => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proficiency">Proficiency Level</Label>
                  <Select 
                    value={newSkillData.proficiency_level} 
                    onValueChange={(value) => setNewSkillData({...newSkillData, proficiency_level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proficiency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="proficient">Proficient</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="willing_to_mentor">Willing to Mentor</Label>
                    <p className="text-xs text-muted-foreground">
                      Are you willing to mentor others in this skill?
                    </p>
                  </div>
                  <Switch 
                    id="willing_to_mentor" 
                    checked={newSkillData.willing_to_mentor}
                    onCheckedChange={(checked) => setNewSkillData({...newSkillData, willing_to_mentor: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_certified">Certified</Label>
                    <p className="text-xs text-muted-foreground">
                      Do you have a certification for this skill?
                    </p>
                  </div>
                  <Switch 
                    id="is_certified" 
                    checked={newSkillData.is_certified}
                    onCheckedChange={(checked) => setNewSkillData({...newSkillData, is_certified: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_training">Currently Training</Label>
                    <p className="text-xs text-muted-foreground">
                      Are you currently in training for this skill?
                    </p>
                  </div>
                  <Switch 
                    id="is_training" 
                    checked={newSkillData.is_training}
                    onCheckedChange={(checked) => setNewSkillData({...newSkillData, is_training: checked})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddSkillDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSkill}>
                  Add Skill
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            </div>
          ) : displayUserSkills.length === 0 ? (
            <div className="text-center py-12 bg-purple-50/30 rounded-lg border border-purple-100/50">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-purple-300" />
              <h3 className="text-lg font-medium text-purple-700 mb-1">No skills added yet</h3>
              <p className="text-purple-500 text-sm mb-4">
                Add skills to your profile to showcase your expertise
              </p>
              <Button 
                onClick={() => setAddSkillDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Skill
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayUserSkills.map((userSkill) => (
                <div 
                  key={userSkill.skill_id} 
                  className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-purple-300"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {userSkill.skills.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getProficiencyBadge(userSkill.proficiency_level)}
                        {userSkill.is_certified && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            <Award className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                        {userSkill.is_training && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Training
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      {userSkill.skills.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {userSkill.willing_to_mentor && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Willing to mentor
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setSelectedSkill(userSkill);
                            // Open edit dialog (not implemented in this example)
                            toast.info("Edit skill functionality would open here");
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveSkill(userSkill.skill_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsManager;
