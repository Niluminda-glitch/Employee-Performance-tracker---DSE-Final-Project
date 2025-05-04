import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, BookOpen, Coins, Lightbulb, Download } from "lucide-react";
import TopNavigation from "@/components/TopNavigation";
import { useAuth } from "@/context/AuthContext";

const Wellbeing = () => {
  const { user } = useAuth();

  // Mock resources data - updated with real links
  const physicalResources = [
    {
      id: 1,
      title: "Ergonomic Workstation Guide",
      description: "Learn how to set up your workstation to prevent strain and injury during long shifts.",
      link: "https://www.adelaide.edu.au/hr/ua/media/1554/ergonomics-guideline.pdf",
      type: "PDF Guide"
    },
    {
      id: 2,
      title: "Factory Floor Stretches",
      description: "Simple stretches you can do during your shift to reduce muscle tension and prevent injury.",
      link: "https://blogs.macroairfans.com/stretches-for-warehouse-workers",
      type: "Video Series"
    },
    {
      id: 3,
      title: "Company Fitness Program",
      description: "Join our weekly fitness classes offered after shifts in the recreational area.",
      link: "https://www.wellsteps.com/blog/2020/01/01/corporate-fitness-programs/",
      type: "Program"
    },
    {
      id: 4,
      title: "Health Check-up Schedule",
      description: "Annual health screenings and check-ups schedule for all employees.",
      link: "https://choosingwiselycanada.org/pamphlet/health-check-ups/",
      type: "Calendar"
    }
  ];

  const mentalResources = [
    {
      id: 5,
      title: "Stress Management Techniques",
      description: "Practical methods to manage work-related stress and maintain mental wellbeing.",
      link: "https://www.verywellmind.com/tips-to-reduce-stress-3145195",
      type: "Workshop Recording"
    },
    {
      id: 6,
      title: "Employee Assistance Program",
      description: "Confidential counseling services available to all employees at no cost.",
      link: "https://cms.illinois.gov/benefits/stateemployee/employeeassistanceprogram.html",
      type: "Support Service"
    },
    {
      id: 7,
      title: "Mindfulness at Work",
      description: "Introduction to mindfulness practices that can be incorporated into your workday.",
      link: "https://positivepsychology.com/mindfulness-at-work/",
      type: "Audio Guide"
    },
    {
      id: 8,
      title: "Sleep Improvement Guide",
      description: "Tips for improving sleep quality, especially for those working varying shifts.",
      link: "https://www.sleepfoundation.org/sleep-hygiene/healthy-sleep-tips",
      type: "PDF Guide"
    }
  ];

  const financialResources = [
    {
      id: 9,
      title: "Retirement Planning Basics",
      description: "Information about the company retirement plan and how to make the most of it.",
      link: "https://www.investopedia.com/terms/r/retirement-planning.asp",
      type: "Workshop Recording"
    },
    {
      id: 10,
      title: "Education Assistance Program",
      description: "Details about company subsidies for continuing education and skill development.",
      link: "https://wacss.msu.edu/edu-assist-guide/index.html",
      type: "Program"
    },
    {
      id: 11,
      title: "Personal Budgeting Tools",
      description: "Resources to help you manage your personal finances effectively.",
      link: "https://money.usnews.com/money/personal-finance/saving-and-budgeting/articles/simple-and-free-budgeting-tools",
      type: "Tools & Templates"
    },
    {
      id: 12,
      title: "Financial Wellness Checkup",
      description: "Self-assessment tool to evaluate your current financial health and set goals.",
      link: "https://banzai.org/wellness/resources/financial-wellness-assessment",
      type: "Interactive Tool"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation userRole={user?.role} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Wellbeing Resources</h1>
        <p className="text-muted-foreground mb-8">Tools and resources to support your physical, mental, and financial wellbeing</p>

        <div className="mb-16">
          <Tabs defaultValue="physical" className="w-full">
            <TabsList className="inline-flex w-full space-x-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="physical"
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Heart className="h-4 w-4 text-red-500" />
                Physical Health
              </TabsTrigger>
              <TabsTrigger
                value="mental"
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Mental Wellbeing
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Coins className="h-4 w-4 text-green-500" />
                Financial Wellness
              </TabsTrigger>
            </TabsList>

            <TabsContent value="physical">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {physicalResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mental">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentalResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financial">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financialResources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Card className="mt-10 border-purple-200 bg-purple-50">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <BookOpen className="h-10 w-10 text-purple-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-medium text-purple-800 mb-2">
                  Need Someone to Talk To?
                </h3>
                <p className="text-purple-700 mb-4">
                  Our Employee Assistance Program offers free, confidential counseling and support 
                  for all employees and their family members. Available 24/7 for any personal or 
                  work-related concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button
                    asChild
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <a
                      href="https://www.beyondblue.org.au/get-support/talk-to-a-counsellor"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Call EAP Hotline
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    <a
                      href="https://www.7cups.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Schedule Appointment
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const ResourceCard = ({ resource }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{resource.title}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mt-4">
          <Badge resourceType={resource.type} />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => window.open(resource.link, '_blank', 'noopener,noreferrer')}
          >
            {resource.type.includes("PDF") ? (
              <Download className="h-4 w-4 mr-1" />
            ) : (
              <ExternalLink className="h-4 w-4 mr-1" />
            )}
            {resource.type.includes("PDF") ? "Download" : "Access Resource"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Badge = ({ resourceType }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";

  if (resourceType.includes("PDF") || resourceType.includes("Guide")) {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
  } else if (resourceType.includes("Video") || resourceType.includes("Audio")) {
    bgColor = "bg-purple-100";
    textColor = "text-purple-700";
  } else if (resourceType.includes("Workshop") || resourceType.includes("Program")) {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
  } else if (resourceType.includes("Tool") || resourceType.includes("Template")) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  } else if (resourceType.includes("Support") || resourceType.includes("Service")) {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {resourceType}
    </span>
  );
};

export default Wellbeing;
