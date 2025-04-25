
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Gauge, LayoutDashboard, Users, Clipboard, Settings } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">EmpTrack</h1>
              <p className="text-xs text-gray-500">Employee Performance Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-medium text-purple-700">JD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">124</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clipboard className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">28</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Due this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Gauge className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">76%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+3% from last quarter</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Overall employee performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md">
                <LineChart className="h-16 w-16 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Department Analysis</CardTitle>
              <CardDescription>Performance by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md">
                <BarChart className="h-16 w-16 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
            <CardDescription>Employee skills across the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center bg-gray-50 rounded-md">
              <PieChart className="h-16 w-16 text-gray-300" />
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-500">Last updated: April 15, 2023</p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
