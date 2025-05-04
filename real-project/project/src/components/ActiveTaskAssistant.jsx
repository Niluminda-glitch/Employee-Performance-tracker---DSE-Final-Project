import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle, Link as LinkIcon, Target, Clock, Ruler, Leaf, Eye, Wrench, MoveVertical, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ActiveTaskAssistant = () => {
  const { user, api, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // --- State for Task Assistant ---
  const [operations, setOperations] = useState([]); // List for dropdown
  const [selectedOperationId, setSelectedOperationId] = useState(''); // Currently selected ID
  const [activeTaskDetails, setActiveTaskDetails] = useState(null); // Details of the active task
  const [isLoadingOpsList, setIsLoadingOpsList] = useState(false);
  const [isLoadingTaskDetails, setIsLoadingTaskDetails] = useState(false);
  const [error, setError] = useState(null);

  // --- Fetch Operations List ---
  const fetchOperationsList = useCallback(async () => {
    if (!api || authLoading) return; // Wait for API instance and auth check
    console.log("[ActiveTaskAssistant] Fetching operations list...");
    setIsLoadingOpsList(true);
    setError(null);
    try {
      // Log the API instance to verify it's configured correctly
      console.log("[ActiveTaskAssistant] API instance:", api);

      // Make the API call with detailed logging
      console.log("[ActiveTaskAssistant] Making API call to /operations");
      const response = await api.get('/operations');

      // Log the raw response
      console.log("[ActiveTaskAssistant] RAW API RESPONSE for /operations:", response);

      if (!response.data) {
        console.error("[ActiveTaskAssistant] API response for /operations is missing data property!");
        throw new Error("Invalid data format from API.");
      }

      // Log the actual data
      console.log("[ActiveTaskAssistant] Data received from /operations:", response.data);

      // Update state with the API data
      setOperations(response.data || []);
      console.log("[ActiveTaskAssistant] setOperations called successfully with", response.data.length, "items");

      // Log the first item to verify structure
      if (response.data && response.data.length > 0) {
        console.log("[ActiveTaskAssistant] First operation item structure:", response.data[0]);
      }
    } catch (err) {
      console.error("[ActiveTaskAssistant] FETCH ERROR fetching operations list:", err);
      console.error("[ActiveTaskAssistant] Error details:", err.response?.data || err.message);
      console.error("[ActiveTaskAssistant] Error status:", err.response?.status);
      setError("Could not load available operations. " + (err.response?.data?.message || err.message));
      setOperations([]); // Ensure state is cleared on error
    } finally {
      setIsLoadingOpsList(false);
    }
  }, [api, authLoading]);

  // --- Fetch Specific Task Details ---
  const fetchTaskDetails = useCallback(async (operationId) => {
    if (!api || !operationId || authLoading) return;
    console.log(`[ActiveTaskAssistant] Fetching details for operation ID: ${operationId}`);
    setIsLoadingTaskDetails(true);
    setActiveTaskDetails(null); // Clear previous details
    setError(null);
    try {
      // Log the API call details
      console.log(`[ActiveTaskAssistant] Making API call to /operations/${operationId}/details`);

      const response = await api.get(`/operations/${operationId}/details`);

      // Log the raw response
      console.log("[ActiveTaskAssistant] RAW API RESPONSE for operation details:", response);

      if (!response.data) {
        console.error("[ActiveTaskAssistant] API response for operation details is missing data property!");
        throw new Error("Invalid data format from API.");
      }

      // Log the actual data
      console.log("[ActiveTaskAssistant] Task details received:", response.data);

      // Update state with the API data
      setActiveTaskDetails(response.data);
      console.log("[ActiveTaskAssistant] setActiveTaskDetails called successfully");

      // Show success toast
      toast({
        title: "Task Started",
        description: `You are now working on: ${response.data.name}`,
        variant: "default",
      });
    } catch (err) {
      console.error(`[ActiveTaskAssistant] FETCH ERROR for operation ${operationId}:`, err);
      console.error("[ActiveTaskAssistant] Error details:", err.response?.data || err.message);
      console.error("[ActiveTaskAssistant] Error status:", err.response?.status);

      const errorMessage = err.response?.status === 404
        ? "Selected operation not found."
        : "Could not load task details. " + (err.response?.data?.message || err.message);

      setError(errorMessage);
      setActiveTaskDetails(null);

      // Show error toast
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTaskDetails(false);
    }
  }, [api, authLoading, toast]);

  // --- Fetch operations list on mount ---
  useEffect(() => {
    fetchOperationsList();
  }, [fetchOperationsList]);

  // --- Handlers ---
  const handleStartTask = () => {
    if (selectedOperationId) {
      fetchTaskDetails(selectedOperationId);
    } else {
      setError("Please select an operation first.");
      toast({
        title: "Error",
        description: "Please select an operation first.",
        variant: "destructive",
      });
    }
  };

  const handleStopTask = () => {
    setActiveTaskDetails(null);
    setSelectedOperationId(''); // Reset the dropdown too
    setError(null);
    console.log("[ActiveTaskAssistant] Active task cleared.");

    // Show toast
    toast({
      title: "Task Stopped",
      description: "You have stopped working on the current task.",
      variant: "default",
    });
  };

  // Helper function to get the text content from a checkpoint
  const getCheckpointText = (checkpoint) => {
    if (typeof checkpoint === 'string') {
      return checkpoint;
    } else if (checkpoint && typeof checkpoint === 'object' && checkpoint.text) {
      return checkpoint.text;
    } else if (checkpoint && typeof checkpoint === 'object') {
      return JSON.stringify(checkpoint);
    } else {
      return "Unknown checkpoint format";
    }
  };

  // Helper function to get the appropriate icon component based on checkpoint type
  const getCheckpointIcon = (checkpoint) => {
    // Default icon
    let IconComponent = CheckCircle;
    let iconColor = "text-green-500";

    // If checkpoint is an object with icon property
    if (checkpoint && typeof checkpoint === 'object' && checkpoint.icon) {
      const iconType = checkpoint.icon.toLowerCase();

      // Choose the appropriate icon based on type
      switch (iconType) {
        case 'ruler':
          IconComponent = Ruler;
          iconColor = "text-blue-500";
          break;
        case 'stitch':
          IconComponent = CheckCircle;
          iconColor = "text-green-500";
          break;
        case 'clean':
          IconComponent = Leaf;
          iconColor = "text-teal-500";
          break;
        case 'inspect':
          IconComponent = Eye;
          iconColor = "text-purple-500";
          break;
        case 'tools':
          IconComponent = Wrench;
          iconColor = "text-gray-500";
          break;
        case 'align':
          IconComponent = MoveVertical;
          iconColor = "text-indigo-500";
          break;
        case 'warning':
          IconComponent = AlertTriangle;
          iconColor = "text-amber-500";
          break;
        default:
          IconComponent = CheckCircle;
          iconColor = "text-green-500";
      }
    }

    return { IconComponent, iconColor };
  };

  // --- Render ---
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-purple-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* --- Task Selector --- */}
      {!activeTaskDetails && (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100 flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-3">
          <div className="flex-grow">
            <label htmlFor="operationSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Current Operation:
            </label>
            <Select
              value={selectedOperationId}
              onValueChange={(value) => {
                setSelectedOperationId(value);
                setError(null);
              }}
              disabled={isLoadingOpsList}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Select Task --" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingOpsList ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading operations...</span>
                  </div>
                ) : operations.length === 0 ? (
                  <SelectItem value="none" disabled>No operations available</SelectItem>
                ) : (
                  operations.map((op) => {
                    console.log("[ActiveTaskAssistant] Rendering operation item:", op);
                    return (
                      <SelectItem key={op.id} value={op.id}>
                        {op.number ? `${op.number} - ` : ''}{op.name}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleStartTask}
            disabled={!selectedOperationId || isLoadingTaskDetails}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoadingTaskDetails ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Start Task'
            )}
          </Button>
        </div>
      )}

      {/* --- Active Task Assistant Panel --- */}
      {activeTaskDetails && (
        <div className="p-5 bg-purple-50 border border-purple-200 rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-purple-800">
                Active Task: {activeTaskDetails.number ? `${activeTaskDetails.number} - ` : ''}{activeTaskDetails.name}
              </h3>
              <p className="text-sm text-purple-600 mt-1">
                Follow the quality checkpoints below to ensure proper execution
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopTask}
              className="text-sm border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              Stop Task
            </Button>
          </div>

          {/* Quality Checkpoints */}
          {activeTaskDetails.quality_checkpoints && (
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-700 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-500" />
                Quality Focus Points:
              </h4>
              <ul className="space-y-2">
                {Array.isArray(activeTaskDetails.quality_checkpoints) ? (
                  // Handle array of different formats
                  activeTaskDetails.quality_checkpoints.map((checkpoint, index) => {
                    console.log("[ActiveTaskAssistant] Rendering checkpoint:", checkpoint);

                    // Get the appropriate icon for this checkpoint
                    const { IconComponent, iconColor } = getCheckpointIcon(checkpoint);

                    return (
                      <li key={index} className="flex items-start">
                        <IconComponent className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} />
                        <span className="text-gray-700">{getCheckpointText(checkpoint)}</span>
                      </li>
                    );
                  })
                ) : typeof activeTaskDetails.quality_checkpoints === 'object' ? (
                  // Handle object with properties
                  Object.entries(activeTaskDetails.quality_checkpoints).map(([key, value], index) => {
                    console.log("[ActiveTaskAssistant] Rendering checkpoint from object:", key, value);

                    // Get the appropriate icon for this checkpoint value
                    const { IconComponent, iconColor } = getCheckpointIcon(value);

                    return (
                      <li key={index} className="flex items-start">
                        <IconComponent className={`h-5 w-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} />
                        <span className="text-gray-700">{getCheckpointText(value)}</span>
                      </li>
                    );
                  })
                ) : (
                  // Fallback for unexpected format
                  <li className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Quality checkpoints data format not recognized
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* SMV Target */}
          {activeTaskDetails.smv_target !== null && activeTaskDetails.smv_target !== undefined && (
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-purple-500" />
                Target Time (SMV):
              </h4>
              <p className="text-gray-700 font-medium text-lg">
                {activeTaskDetails.smv_target} <span className="text-sm font-normal text-gray-500">minutes/piece</span>
              </p>
            </div>
          )}

          {/* SOP/Video Link */}
          {activeTaskDetails.sop_url && (
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-700 mb-2 flex items-center">
                <LinkIcon className="h-4 w-4 mr-2 text-purple-500" />
                Resources:
              </h4>
              <a
                href={activeTaskDetails.sop_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 hover:underline flex items-center"
              >
                <Button variant="outline" size="sm" className="border-purple-200">
                  View Instructions / Video Guide
                </Button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveTaskAssistant;
