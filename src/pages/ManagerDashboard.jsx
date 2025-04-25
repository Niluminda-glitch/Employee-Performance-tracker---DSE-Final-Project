import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, PieChart, LineChart, Download, Users, ClipboardList, Calendar, Building } from "lucide-react";
import TopNavigation from "@/components/layout/TopNavigation";

const ManagerDashboard = () => {
  // Mock data - would come from API in real implementation
  const departmentStats = [
    { department: "Engineering", headcount: 25, performanceScore: 87, openRequests: 5 },
    { department: "Marketing", headcount: 12, performanceScore: 82, openRequests: 3 },
    { department: "Customer Support", headcount: 18, performanceScore: 90, openRequests: 2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation userRole="manager" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <Button>
            <Download className="h-4 w-4 mr-2" /> Generate Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">55</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across 3 departments</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">8</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">2 critical priority</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">10</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting manager approval</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">86%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+2% from last quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Performance metrics by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md">
                <BarChart className="h-16 w-16 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Employee distribution by project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md">
                <PieChart className="h-16 w-16 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="departments" className="mb-8">
          <TabsList>
            <TabsTrigger value="departments">Department Analysis</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Key metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex flex-col md:flex-row justify-between md:items-center">
                        <div>
                          <h3 className="font-medium text-lg">{dept.department}</h3>
                          <p className="text-sm text-muted-foreground">Headcount: {dept.headcount}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
                          <div>
                            <p className="text-sm text-muted-foreground">Performance Score</p>
                            <p className="font-medium text-lg">{dept.performanceScore}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Open Requests</p>
                            <p className="font-medium text-lg">{dept.openRequests}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-4 md:mt-0">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Historical performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full flex items-center justify-center bg-gray-50 rounded-md">
                  <LineChart className="h-16 w-16 text-gray-300" />
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals">
            <Card className="shadow-card hover:shadow-card-hover">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Items requiring manager approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-start">
                      <div>
                        <h3 className="font-medium">Budget Increase Request</h3>
                        <p className="text-sm">From: Engineering Department</p>
                        <p className="text-sm text-muted-foreground">Request Date: April 12, 2025</p>
                        <p className="text-sm mt-2">Amount: $15,000</p>
                        <p className="text-sm">Reason: Additional resources for project X</p>
                      </div>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-start">
                      <div>
                        <h3 className="font-medium">Extended Leave Request</h3>
                        <p className="text-sm">From: Sarah Johnson (Marketing)</p>
                        <p className="text-sm text-muted-foreground">Request Date: April 15, 2025</p>
                        <p className="text-sm mt-2">Dates: June 1-30, 2025</p>
                        <p className="text-sm">Reason: Family medical leave</p>
                      </div>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ManagerDashboard;
