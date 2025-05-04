
import React from "react";
import TopNavigation from "@/components/TopNavigation";
import ActiveTaskAssistant from "@/components/ActiveTaskAssistant";
import SkillMatrix from "@/components/SkillMatrix";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeparatorWithText } from "@/components/ui/separator-with-text";

const TaskWorkflow = () => {
  // Mock data for the skill matrix
  const userSkills = [
    { name: "Pocket Setting", willingToMentor: false },
    { name: "Collar Attachment", willingToMentor: true },
    { name: "Sleeve Hemming", willingToMentor: false }
  ];
  
  const availableSkills = ["Pocket Setting", "Collar Attachment", "Sleeve Hemming", "Button Attachment", "Inspection"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole="employee" />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gradient animate-fade-in">Task Workflow</h1>
        <p className="text-gray-500 mb-8 animate-slide-up">Manage your current tasks and track your performance</p>
        
        {/* Active Task Assistant */}
        <section className="mb-10">
          <ActiveTaskAssistant />
        </section>
        
        <SeparatorWithText text="My Skills Profile" />
        
        {/* Skills Matrix */}
        <section className="mt-10">
          <Card className="shadow-elevation-1">
            <CardHeader>
              <CardTitle className="text-xl text-gradient">Skills Matrix</CardTitle>
              <CardDescription>Your current skill proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillMatrix userSkills={userSkills} availableSkills={availableSkills} />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default TaskWorkflow;
