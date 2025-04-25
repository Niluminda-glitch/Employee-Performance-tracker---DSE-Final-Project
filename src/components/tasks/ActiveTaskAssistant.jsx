import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, HelpCircle, MessageSquare, ArrowRight, ChevronRight, Coffee } from "lucide-react";
import { toast } from "sonner";

const ActiveTaskAssistant = () => {
  const [activeTask, setActiveTask] = useState({
    id: 2,
    title: "Team meeting preparation",
    description: "Prepare slides and agenda for the weekly team meeting. Include project updates and upcoming milestones.",
    status: "in-progress",
    dueDate: "2025-04-18",
    priority: "medium",
    progress: 45,
    steps: [
      { id: 1, title: "Review previous meeting notes", completed: true },
      { id: 2, title: "Gather project updates from team members", completed: true },
      { id: 3, title: "Create presentation slides", completed: false },
      { id: 4, title: "Prepare discussion points", completed: false },
      { id: 5, title: "Share agenda with team", completed: false }
    ]
  });

  const [showingHelp, setShowingHelp] = useState(false);

  const handleCompleteStep = (stepId) => {
    const updatedSteps = activeTask.steps.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    );
    
    const completedSteps = updatedSteps.filter(step => step.completed).length;
    const progress = Math.round((completedSteps / updatedSteps.length) * 100);
    
    setActiveTask({
      ...activeTask,
      steps: updatedSteps,
      progress
    });
    
    toast.success("Step completed", {
      description: "Your progress has been updated."
    });
  };

  const handleCompleteTask = () => {
    // In a real app, this would update the task status in the database
    toast.success("Task completed!", {
      description: "The task has been marked as completed."
    });
  };

  const handleGetHelp = () => {
    setShowingHelp(!showingHelp);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
              <Coffee className="h-3 w-3" />
              In Progress
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
              Medium Priority
            </Badge>
          </div>
          <h3 className="text-xl font-semibold">{activeTask.title}</h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            Due: {activeTask.dueDate}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGetHelp}
            className={showingHelp ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Get Help
          </Button>
          <Button 
            size="sm"
            onClick={handleCompleteTask}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Complete Task
          </Button>
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {activeTask.description}
        </p>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{activeTask.progress}%</span>
        </div>
        <Progress value={activeTask.progress} className="h-2" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3">Task Steps</h4>
        <div className="space-y-2">
          {activeTask.steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`p-3 rounded-lg border ${
                step.completed 
                  ? "bg-green-50/50 border-green-100" 
                  : index === activeTask.steps.findIndex(s => !s.completed)
                    ? "bg-blue-50/50 border-blue-100"
                    : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  ) : (
                    <div className={`h-5 w-5 rounded-full border-2 mr-3 flex-shrink-0 ${
                      index === activeTask.steps.findIndex(s => !s.completed)
                        ? "border-blue-400"
                        : "border-gray-300"
                    }`}></div>
                  )}
                  <span className={`text-sm ${step.completed ? "line-through text-gray-500" : "font-medium"}`}>
                    {step.title}
                  </span>
                </div>
                
                {!step.completed && index === activeTask.steps.findIndex(s => !s.completed) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCompleteStep(step.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showingHelp && (
        <div className="bg-purple-50/70 p-4 rounded-lg border border-purple-100 mt-4">
          <h4 className="text-sm font-medium text-purple-800 mb-2">Need help with this task?</h4>
          <p className="text-sm text-purple-700 mb-3">
            Here are some resources that might help you complete this task:
          </p>
          <ul className="space-y-2">
            <li>
              <a 
                href="#" 
                className="text-sm flex items-center text-purple-700 hover:text-purple-900 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Resource would open here");
                }}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Meeting preparation template
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-sm flex items-center text-purple-700 hover:text-purple-900 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Resource would open here");
                }}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Previous meeting notes
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="text-sm flex items-center text-purple-700 hover:text-purple-900 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Resource would open here");
                }}
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Contact your supervisor
              </a>
            </li>
          </ul>
          <div className="mt-3 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-700 hover:bg-purple-100"
              onClick={() => {
                toast.info("Connecting to assistant...");
                setShowingHelp(false);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with assistant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTaskAssistant;
