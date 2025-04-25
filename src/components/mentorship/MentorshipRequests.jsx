import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, User, BookOpen, MessageSquare, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const MentorshipRequests = () => {
  const { session, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  // Fetch mentorship requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user?.id) return;
      
      setLoading(true);
      try {
        // Fetch requests where user is the mentor
        const { data: receivedData, error: receivedError } = await supabase
          .from('mentorship_requests')
          .select(`
            *,
            requester:requester_id (id, full_name, avatar_url, email),
            skill:skill_id (id, name, description)
          `)
          .eq('mentor_id', session.user.id);
        
        if (receivedError) throw receivedError;
        
        // Fetch requests where user is the requester
        const { data: sentData, error: sentError } = await supabase
          .from('mentorship_requests')
          .select(`
            *,
            mentor:mentor_id (id, full_name, avatar_url, email),
            skill:skill_id (id, name, description)
          `)
          .eq('requester_id', session.user.id);
        
        if (sentError) throw sentError;
        
        // Combine and format the data
        const formattedData = [
          ...(receivedData || []).map(req => ({ ...req, type: 'received' })),
          ...(sentData || []).map(req => ({ ...req, type: 'sent' }))
        ];
        
        setRequests(formattedData);
      } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        toast.error('Failed to load mentorship requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [session?.user?.id]);

  // Handle responding to a mentorship request
  const handleRespondToRequest = async (accept) => {
    if (!selectedRequest) return;
    
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ 
          status: accept ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);
      
      if (error) throw error;
      
      // Create notification for the requester
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.requester_id,
          title: `Mentorship Request ${accept ? 'Accepted' : 'Rejected'}`,
          message: accept 
            ? `Your mentorship request for ${selectedRequest.skill.name} has been accepted.`
            : `Your mentorship request for ${selectedRequest.skill.name} has been rejected.`,
          type: accept ? 'request_approved' : 'request_rejected',
          related_user_id: session.user.id
        });
      
      if (notifError) console.error('Error creating notification:', notifError);
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: accept ? 'accepted' : 'rejected' } 
          : req
      ));
      
      toast.success(`Request ${accept ? 'accepted' : 'rejected'} successfully`);
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      setResponseMessage('');
      
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
      default:
        return null;
    }
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(req => req.type === activeTab);

  // Mock data for mentorship requests if the database is empty
  const mockRequests = [
    {
      id: '1',
      type: 'received',
      status: 'pending',
      created_at: '2025-04-10T10:00:00Z',
      message: 'I would like to learn more about React and improve my frontend skills. Could you mentor me?',
      requester: { id: '2', full_name: 'Jane Smith', avatar_url: null },
      skill: { id: '2', name: 'React', description: 'Frontend library for building user interfaces' }
    },
    {
      id: '2',
      type: 'sent',
      status: 'accepted',
      created_at: '2025-04-05T14:30:00Z',
      message: 'I am interested in learning more about Node.js for backend development. Would you be willing to mentor me?',
      mentor: { id: '3', full_name: 'Mike Johnson', avatar_url: null },
      skill: { id: '3', name: 'Node.js', description: 'JavaScript runtime for server-side development' }
    },
    {
      id: '3',
      type: 'sent',
      status: 'pending',
      created_at: '2025-04-12T09:15:00Z',
      message: 'I would like to improve my SQL skills for database management. Can you help me?',
      mentor: { id: '4', full_name: 'Sarah Williams', avatar_url: null },
      skill: { id: '4', name: 'SQL', description: 'Language for managing relational databases' }
    }
  ];

  // Use mock data if the database is empty
  const displayRequests = requests.length > 0 ? filteredRequests : mockRequests.filter(req => req.type === activeTab);

  return (
    <div className="space-y-6">
      <Card className="shadow-card border border-purple-100/80 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl text-gradient">Mentorship Requests</CardTitle>
          <CardDescription>Manage your mentorship connections</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="received">Received Requests</TabsTrigger>
              <TabsTrigger value="sent">Sent Requests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="received">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : displayRequests.length === 0 ? (
                <div className="text-center py-12 bg-purple-50/30 rounded-lg border border-purple-100/50">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                  <h3 className="text-lg font-medium text-purple-700 mb-1">No mentorship requests</h3>
                  <p className="text-purple-500 text-sm">
                    You haven't received any mentorship requests yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-purple-300"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {request.requester?.full_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Requested: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                        
                        <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100/50 mb-3">
                          <div className="flex items-center mb-2">
                            <BookOpen className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="font-medium text-purple-700">
                              {request.skill?.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {request.message}
                          </p>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                setSelectedRequest(request);
                                setResponseDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                            <Button 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedRequest(request);
                                handleRespondToRequest(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && (
                          <div className="flex justify-end">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                // In a real app, this would open a chat or scheduling dialog
                                toast.info("Contact functionality would open here");
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Mentee
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : displayRequests.length === 0 ? (
                <div className="text-center py-12 bg-purple-50/30 rounded-lg border border-purple-100/50">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                  <h3 className="text-lg font-medium text-purple-700 mb-1">No sent requests</h3>
                  <p className="text-purple-500 text-sm mb-4">
                    You haven't sent any mentorship requests yet
                  </p>
                  <Button 
                    onClick={() => {
                      // In a real app, this would navigate to the find mentor page
                      toast.info("This would navigate to the Find Mentor page");
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Find a Mentor
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-purple-300"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {request.mentor?.full_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Requested: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                        
                        <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100/50 mb-3">
                          <div className="flex items-center mb-2">
                            <BookOpen className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="font-medium text-purple-700">
                              {request.skill?.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {request.message}
                          </p>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => {
                                // In a real app, this would cancel the request
                                toast.info("Cancel request functionality would be here");
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Request
                            </Button>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && (
                          <div className="flex justify-end">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                // In a real app, this would open a chat or scheduling dialog
                                toast.info("Contact functionality would open here");
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Mentor
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Mentorship Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this mentorship request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea 
              placeholder="Provide feedback to the requester..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleRespondToRequest(false)}
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorshipRequests;
