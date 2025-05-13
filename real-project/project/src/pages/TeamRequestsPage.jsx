import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CircularRequestButtons from "@/components/requests/CircularRequestButtons";

const TeamRequestsPage = () => {
  const { api, user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch team requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = "/requests/team";
      const response = await api.get(endpoint);
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching team requests:", err);
      setError(err.response?.data?.message || "Failed to load team requests");
      toast({
        title: "Error",
        description: "Failed to load team requests. Please try again.",
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

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === "pending") return request.status === "pending";
    if (activeTab === "approved") return request.status === "approved";
    if (activeTab === "rejected") return request.status === "rejected";
    if (activeTab === "leave") return request.type === "leave";
    if (activeTab === "overtime") return request.type === "overtime";
    return true; // 'all' tab
  });

  // Handle request approval
  const handleApproveRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/status`, {
        status: "approved"
      });

      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: "approved", approver_id: user.id }
            : req
        )
      );

      toast({
        title: "Request Approved",
        description: "The request has been approved successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Error approving request:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/status`, {
        status: "rejected"
      });

      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: "rejected", approver_id: user.id }
            : req
        )
      );

      toast({
        title: "Request Rejected",
        description: "The request has been rejected.",
        variant: "default",
      });
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Team Requests</h1>
      <p className="text-gray-600 mb-6">Manage leave and overtime requests from your team members</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="leave">Leave</TabsTrigger>
              <TabsTrigger value="overtime">Overtime</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className={
                          request.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          request.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        }>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium">{request.user?.full_name || "Employee"}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">
                          {format(new Date(request.start_date), "MMM dd, yyyy")} - {format(new Date(request.end_date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Reason: {request.reason}
                      </p>
                      
                      <p className="text-xs text-gray-400 mb-4">
                        Submitted on {format(new Date(request.created_at), "MMM dd, yyyy")}
                      </p>
                      
                      {request.status === "pending" && (
                        <div className="flex justify-end">
                          <CircularRequestButtons
                            onApprove={() => handleApproveRequest(request.id)}
                            onReject={() => handleRejectRequest(request.id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamRequestsPage;
