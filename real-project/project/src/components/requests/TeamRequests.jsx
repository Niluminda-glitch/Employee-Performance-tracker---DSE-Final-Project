import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, AlertCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import RequestActionButtons from "./RequestActionButtons";

const TeamRequests = ({ isManager = false }) => {
  const { api, user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseAction, setResponseAction] = useState(null); // 'approve' or 'reject'
  const [responseReason, setResponseReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch team requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use different endpoint based on user role
      const endpoint = isManager ? "/requests/all" : "/requests/team";
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
  }, [isManager]);

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === "pending") return request.status === "pending";
    if (activeTab === "approved") return request.status === "approved";
    if (activeTab === "rejected") return request.status === "rejected";
    if (activeTab === "leave") return request.type === "leave";
    if (activeTab === "overtime") return request.type === "overtime";
    return true; // 'all' tab
  });

  // Handle request response (approve/reject)
  const handleResponseSubmit = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await api.put(`/requests/${selectedRequest.id}/status`, {
        status: responseAction
      });

      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: responseAction, approver_id: user.id }
            : req
        )
      );

      toast({
        title: `Request ${responseAction === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The ${selectedRequest.type} request has been ${responseAction}.`,
        variant: "default",
      });

      // Close dialog and reset
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseReason("");
      setResponseAction(null);
    } catch (err) {
      console.error(`Error ${responseAction} request:`, err);
      toast({
        title: "Error",
        description: err.response?.data?.message || `Failed to ${responseAction} request. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open response dialog
  const openResponseDialog = (request, action) => {
    setSelectedRequest(request);
    setResponseAction(action);
    setResponseDialogOpen(true);
  };

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
      <CardHeader>
        <CardTitle>Team Requests</CardTitle>
        <CardDescription>
          {isManager
            ? "Manage leave and overtime requests from all employees"
            : "Manage leave and overtime requests from your team members"}
        </CardDescription>
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
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No requests found</p>
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
                          <div className="flex items-center mt-1">
                            <User className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-600">
                              {request.user?.full_name || "Employee"}
                              {request.user?.job_title && ` - ${request.user.job_title}`}
                            </p>
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

                      {/* Action buttons for pending requests */}
                      {request.status === "pending" && (
                        <RequestActionButtons
                          request={request}
                          onApprove={(req) => openResponseDialog(req, "approved")}
                          onReject={(req) => openResponseDialog(req, "rejected")}
                          variant="text"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {responseAction === "approved" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {responseAction === "approved"
                ? "Are you sure you want to approve this request?"
                : "Please provide a reason for rejecting this request."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex items-center mb-2">
                  <div className="p-1.5 bg-gray-100 rounded-md mr-2">
                    {getRequestIcon(selectedRequest.type)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{selectedRequest.type} Request</p>
                    <p className="text-sm text-gray-500">
                      {selectedRequest.user?.full_name || "Employee"}
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  <span className="text-gray-500">Dates:</span>{" "}
                  {format(new Date(selectedRequest.start_date), "MMM d, yyyy")} - {format(new Date(selectedRequest.end_date), "MMM d, yyyy")}
                </p>
                {selectedRequest.type === "overtime" && (
                  <p className="text-sm">
                    <span className="text-gray-500">Hours:</span> {selectedRequest.hours}
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-gray-500">Reason:</span> {selectedRequest.reason}
                </p>
              </div>

              {responseAction === "rejected" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Rejection Reason (Optional)</label>
                  <Textarea
                    placeholder="Provide a reason for rejecting this request"
                    value={responseReason}
                    onChange={(e) => setResponseReason(e.target.value)}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResponseSubmit}
              disabled={isSubmitting}
              variant="outline"
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              {isSubmitting
                ? "Processing..."
                : responseAction === "approved"
                ? "Approve Request"
                : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TeamRequests;
