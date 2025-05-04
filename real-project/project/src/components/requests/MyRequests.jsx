import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequestForm from "./RequestForm";

const MyRequests = () => {
  const { api } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  // Fetch user's requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/requests/my");
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || "Failed to load your requests");
      toast({
        title: "Error",
        description: "Failed to load your requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load requests when component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle new request creation
  const handleRequestCreated = (newRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
  };

  // Filter requests based on active tab
  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter(request => request.type === activeTab);

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return null;
    }
  };

  // Get request icon
  const getRequestIcon = (type) => {
    return type === "leave" ? (
      <Calendar className="h-5 w-5 text-purple-500" />
    ) : (
      <Clock className="h-5 w-5 text-blue-500" />
    );
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>View and manage your leave and overtime requests</CardDescription>
        </div>
        <Button onClick={() => setIsRequestFormOpen(true)}>
          <FileText className="h-4 w-4 mr-2" /> New Request
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="overtime">Overtime</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No requests found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsRequestFormOpen(true)}
                >
                  Create a new request
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {getRequestIcon(request.type)}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900 capitalize">
                              {request.type} Request
                            </h3>
                            <div className="ml-2">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(request.start_date), "MMM d, yyyy")} - {format(new Date(request.end_date), "MMM d, yyyy")}
                          </p>
                          {request.type === "overtime" && (
                            <p className="text-sm text-gray-500">
                              Hours: {request.hours}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Reason: {request.reason}
                          </p>
                          {request.approver && (
                            <p className="text-sm text-gray-500 mt-1">
                              {request.status === "approved" ? "Approved" : "Rejected"} by: {request.approver.full_name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted on {format(new Date(request.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div>
                        {request.status === "approved" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : request.status === "rejected" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Request Form Dialog */}
      <RequestForm
        open={isRequestFormOpen}
        onOpenChange={setIsRequestFormOpen}
        onRequestCreated={handleRequestCreated}
      />
    </Card>
  );
};

export default MyRequests;
