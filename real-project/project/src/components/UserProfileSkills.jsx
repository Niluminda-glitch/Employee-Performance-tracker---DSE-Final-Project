import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; // Import the custom hook
import { useToast } from "@/hooks/use-toast"; // Import toast hook
import {
    Calendar,
    Clock,
    Check,
    RotateCcw
} from 'lucide-react';

function UserProfileSkills() {
    // Get user, error state, setError function, and api instance from context
    const { user, error: authError, setError: setAuthError, api } = useAuth();
    const { toast } = useToast(); // Get toast function

    const [userSkills, setUserSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // Local error state specifically for this component's operations
    const [componentError, setComponentError] = useState(null);
    const [updatingSkillId, setUpdatingSkillId] = useState(null);

    // --- State for Add Skill section ---
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkillToAdd, setSelectedSkillToAdd] = useState('');
    const [initialMentorStatus, setInitialMentorStatus] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // --- State for My Tasks section ---
    const [myTasks, setMyTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [tasksError, setTasksError] = useState(null);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);


    // --- Fetch User Skills (using 'api' instance) ---
    const fetchUserSkills = useCallback(async () => {
        const userId = user?.id; // Get ID from authenticated user context
        if (!userId || !api) return; // Don't fetch if no user or api instance not ready

        console.log(`[UserProfileSkills] Fetching skills for user ID: ${userId}`);
        setIsLoading(true);
        setComponentError(null); // Clear local error
        try {
            // Use the 'api' instance which includes the auth token header
            // Call the protected route that gets skills for the *authenticated* user
            const response = await api.get('/user/skills'); // Changed endpoint

            setUserSkills(response.data || []); // Use response.data
            console.log("[UserProfileSkills] User skills fetched:", response.data);
        } catch (err) {
            console.error("[UserProfileSkills] Failed to fetch user skills:", err.response?.data || err.message);
            setComponentError(err.response?.data?.message || 'Failed to load your skills.');
             setUserSkills([]); // Clear skills on error
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, api]); // Depend on user.id and api instance

    // --- Fetch Master Skill List (using 'api' instance - assuming public or uses token) ---
    const fetchAllSkills = useCallback(async () => {
         if (!api) return;
         console.log("[UserProfileSkills] Fetching all skills list");
         // Assuming /api/skills is public or middleware allows authenticated access
        try {
            const response = await api.get('/skills'); // Changed endpoint if needed
            setAllSkills(response.data || []);
        } catch (err) {
            console.error("[UserProfileSkills] Failed to fetch all skills:", err.response?.data || err.message);
            setComponentError('Could not load list of available skills.');
             setAllSkills([]);
        }
    }, [api]);

    // --- Fetch My Tasks (using 'api' instance) ---
    const fetchMyTasks = useCallback(async () => {
        const userId = user?.id;
        if (!userId || !api) return;

        console.log(`[UserProfileSkills] Fetching tasks for user ID: ${userId}`);
        setIsLoadingTasks(true);
        setTasksError(null);

        try {
            const response = await api.get('/tasks/my');

            // Add detailed logging for task status values
            if (response.data && Array.isArray(response.data)) {
                console.log("[UserProfileSkills] Task status values received:", response.data);

                // Check if tasks have the expected structure
                const hasMissingStatus = response.data.some(task => !task.hasOwnProperty('status'));
                if (hasMissingStatus) {
                    console.error("[UserProfileSkills] WARNING: Some tasks are missing the 'status' property!");
                }

                // Log each task's status details
                response.data.forEach(task => {
                    console.log(`Task ID: ${task.id}, Raw Status: "${task.status}", Type: ${typeof task.status}, Normalized: "${normalizeTaskStatus(task.status)}"`);

                    // Direct status checks
                    console.log(`Task ${task.id} status checks:`, {
                        'has status property': task.hasOwnProperty('status'),
                        'status === "pending"': task.status === 'pending',
                        'status === "in-progress"': task.status === 'in-progress',
                        'status === "completed"': task.status === 'completed',
                        'normalized === "pending"': normalizeTaskStatus(task.status) === 'pending',
                        'normalized === "in-progress"': normalizeTaskStatus(task.status) === 'in-progress',
                        'normalized === "completed"': normalizeTaskStatus(task.status) === 'completed'
                    });
                });

                // Always add test tasks with known status values for debugging
                console.log("[UserProfileSkills] Adding test tasks with known status values");

                // Create a copy of the original data
                const originalData = [...(response.data || [])];

                // Add test tasks with guaranteed correct status values
                const testTasks = [
                    {
                        id: 'test-pending',
                        title: 'Test Pending Task',
                        status: 'pending',
                        priority: 'medium',
                        description: 'This is a test task with status="pending"',
                        due_date: new Date().toISOString(),
                        supervisor: { id: 'test-supervisor', full_name: 'Test Supervisor' }
                    },
                    {
                        id: 'test-inprogress',
                        title: 'Test In-Progress Task',
                        status: 'in-progress',
                        priority: 'high',
                        description: 'This is a test task with status="in-progress"',
                        due_date: new Date().toISOString(),
                        supervisor: { id: 'test-supervisor', full_name: 'Test Supervisor' }
                    },
                    {
                        id: 'test-completed',
                        title: 'Test Completed Task',
                        status: 'completed',
                        priority: 'low',
                        description: 'This is a test task with status="completed"',
                        due_date: new Date().toISOString(),
                        supervisor: { id: 'test-supervisor', full_name: 'Test Supervisor' }
                    }
                ];

                // Combine original data with test tasks
                response.data = [...testTasks, ...originalData];
            }

            setMyTasks(response.data || []);
            console.log("[UserProfileSkills] User tasks fetched:", response.data);
        } catch (err) {
            console.error("[UserProfileSkills] Failed to fetch user tasks:", err.response?.data || err.message);
            setTasksError(err.response?.data?.message || 'Failed to load your tasks.');
            setMyTasks([]);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [user?.id, api, normalizeTaskStatus]);


    // --- Fetch data on mount or when user changes ---
    useEffect(() => {
        // Only fetch if we have a user and the api instance
        if (user?.id && api) {
            fetchUserSkills();
            fetchAllSkills();
            fetchMyTasks();
        } else {
            // Clear data if user logs out
             setUserSkills([]);
             setAllSkills([]);
             setMyTasks([]);
        }
    }, [user?.id, api, fetchUserSkills, fetchAllSkills, fetchMyTasks]); // Add fetchMyTasks to dependencies


    // --- Handler for toggling mentor status (using 'api' instance) ---
    const handleToggleMentor = async (skillId, currentCanMentor) => {
        const userId = user?.id;
        if (!userId || !api) return;

        const newCanMentor = !currentCanMentor;
        console.log(`[UserProfileSkills] Toggling mentor for skill ${skillId} to ${newCanMentor}`);
        setUpdatingSkillId(skillId);
        setComponentError(null);

        try {
             // Use the protected route, user ID comes from token on backend
            await api.put(`/user/skills/${skillId}`, { canMentor: newCanMentor });

            // Update state locally
            setUserSkills(currentSkills =>
                currentSkills.map(skill =>
                    skill.skillId === skillId ? { ...skill, canMentor: newCanMentor } : skill
                )
            );
            console.log(`[UserProfileSkills] Mentor status updated locally for skill ${skillId}`);
        } catch (err) {
            console.error(`[UserProfileSkills] Failed to update mentor status for skill ${skillId}:`, err.response?.data || err.message);
            setComponentError(err.response?.data?.message || `Failed to update mentor status.`);
        } finally {
            setUpdatingSkillId(null);
        }
    };

    // --- Handler for deleting a skill (using 'api' instance) ---
    const handleDeleteSkill = async (skillId, skillName) => {
        const userId = user?.id;
        if (!userId || !api) return;

        if (!window.confirm(`Are you sure you want to remove the skill "${skillName}"?`)) return;

        console.log(`[UserProfileSkills] Deleting skill ${skillId} (${skillName})`);
        setUpdatingSkillId(skillId);
        setComponentError(null);

        try {
            // Use the protected route, user ID comes from token on backend
            await api.delete(`/user/skills/${skillId}`);

            // Update state locally
            setUserSkills(currentSkills =>
                currentSkills.filter(skill => skill.skillId !== skillId)
            );
             console.log(`[UserProfileSkills] Skill ${skillId} removed locally.`);
        } catch (err) {
            console.error(`[UserProfileSkills] Failed to delete skill ${skillId}:`, err.response?.data || err.message);
            setComponentError(err.response?.data?.message || `Failed to remove skill ${skillName}.`);
        } finally {
            setUpdatingSkillId(null);
        }
    };

    // --- Handler for adding a skill (using 'api' instance) ---
    const handleAddSkill = async (event) => {
        event.preventDefault();
        const userId = user?.id;
        if (!userId || !api || !selectedSkillToAdd) return;


        console.log(`[UserProfileSkills] Adding skill ${selectedSkillToAdd} with mentor status ${initialMentorStatus}`);
        setIsAdding(true);
        setComponentError(null);

        try {
            // Use the protected route, user ID comes from token on backend
            await api.post('/user/skills', {
                skillId: parseInt(selectedSkillToAdd, 10),
                canMentor: initialMentorStatus
            });

            // Refetch user skills to ensure consistency
            await fetchUserSkills();
            console.log(`[UserProfileSkills] Skill ${selectedSkillToAdd} added, refetched skills.`);
            setSelectedSkillToAdd('');
            setInitialMentorStatus(false);

        } catch (err) {
            console.error("[UserProfileSkills] Failed to add skill:", err.response?.data || err.message);
            setComponentError(err.response?.data?.message || `Failed to add skill.`);
             // Note: Error might be 409 Conflict if already added, handle appropriately
             if (err.response?.status === 409) {
                 setComponentError(`Skill is already added to your profile.`);
             }
        } finally {
            setIsAdding(false);
        }
    };

    // --- Handler for updating task status ---
    const handleUpdateTaskStatus = useCallback(async (taskId, newStatus) => {
        if (!api || !taskId) {
            console.error("[UserProfileSkills] API instance or Task ID missing");
            toast({
                title: "Error",
                description: "Could not update task status.",
                variant: "destructive"
            });
            return;
        }

        // Normalize the status to ensure consistent values are sent to the backend
        const normalizedStatus = normalizeTaskStatus(newStatus);

        console.log(`[UserProfileSkills] Updating task ${taskId} status to ${normalizedStatus}`);
        setUpdatingTaskId(taskId); // Disable buttons for this specific task
        setTasksError(null); // Clear previous task errors

        try {
            // Call the backend PUT endpoint with normalized status
            await api.put(`/tasks/${taskId}/status`, { status: normalizedStatus });

            // Update local state for immediate feedback
            setMyTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: normalizedStatus } : task
                )
            );

            // Show success toast notification
            toast({
                title: "Task Status Updated",
                description: `Task marked as ${normalizedStatus}.`,
                variant: "default" // Or "success"
            });

            console.log(`[UserProfileSkills] Task ${taskId} status updated to ${normalizedStatus}`);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update task status.';
            console.error(`[UserProfileSkills] Failed to update task status:`, err.response?.data || err.message);
            setTasksError(errorMsg); // Set the error state

            // Show error toast notification
            toast({
                title: "Update Failed",
                description: errorMsg,
                variant: "destructive"
            });

            // Refresh tasks to ensure consistency
            fetchMyTasks();
        } finally {
            setUpdatingTaskId(null); // Re-enable buttons for this task
        }
    }, [api, setMyTasks, setTasksError, toast, fetchMyTasks, normalizeTaskStatus]);

    // Helper function to get status badge color
    const getStatusBadgeColor = (status) => {
        // Normalize the status for consistent handling
        const normalizedStatus = normalizeTaskStatus(status);

        switch (normalizedStatus) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to get priority badge color
    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Helper function to normalize task status for consistent comparison
    const normalizeTaskStatus = (status) => {
        // Handle null, undefined, or empty status
        if (status === null || status === undefined || status === '') {
            console.warn('Received empty/null/undefined status value');
            return 'pending'; // Default to pending as a fallback
        }

        try {
            // Convert to string, lowercase, and trim whitespace
            const normalized = status.toString().toLowerCase().trim();

            // Log the normalization process for debugging
            console.log(`Normalizing status: "${status}" → "${normalized}"`);

            // Handle common variations
            if (normalized === 'in progress' || normalized === 'inprogress' || normalized === 'in_progress') {
                return 'in-progress';
            }

            return normalized;
        } catch (error) {
            console.error('Error normalizing task status:', error, 'Status value:', status);
            return 'pending'; // Default to pending as a fallback
        }
    };

    // Calculate available skills (keep existing logic)
    const userSkillIds = userSkills.map(s => s.skillId);
    const availableSkillsToAdd = allSkills.filter(
        skill => !userSkillIds.includes(skill.id) // Assuming master list has 'id'
    );

    // --- Render Logic ---
    // Display authError OR componentError OR tasksError
     const displayError = authError || componentError || tasksError;

    if (!user && !isLoading) { // Check if user is definitely logged out and not just loading
         return <p className="p-6 text-center text-red-600">Please log in to view your profile.</p>;
     }

    return (
        <div className="p-6 bg-white rounded-lg shadow max-w-2xl mx-auto mt-10">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">My Skills (User ID: {user?.id})</h3> {/* Display ID for debug */}
            {isLoading && <p>Loading skills...</p>}
            {displayError && <p className="text-red-600 mb-4">Error: {displayError}</p>}

            {/* Display Skills List */}
            {!isLoading && userSkills.length > 0 && !displayError && (
                <ul className="space-y-3 mb-6">
                    {userSkills.map((skill) => (
                        <li key={skill.skillId} className="flex justify-between items-center p-3 border rounded-lg">
                            <span className="font-medium">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" checked={skill.canMentor}
                                        onChange={() => handleToggleMentor(skill.skillId, skill.canMentor)}
                                        disabled={updatingSkillId === skill.skillId}
                                        className="mr-2" />
                                    <span className="text-sm">Mentor</span>
                                </label>
                                <button onClick={() => handleDeleteSkill(skill.skillId, skill.name)}
                                    disabled={updatingSkillId === skill.skillId}
                                    className="text-red-500 hover:text-red-700 text-sm">
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Add Skill Section */}
            {!isLoading && (
                <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-2">Add New Skill</h4>
                    <form onSubmit={handleAddSkill} className="flex flex-col space-y-4">
                        <select
                            value={selectedSkillToAdd}
                            onChange={(e) => setSelectedSkillToAdd(e.target.value)}
                            className="border rounded p-2"
                            required
                        >
                            <option value="">Select a skill...</option>
                            {availableSkillsToAdd.map((skill) => (
                                <option key={skill.id} value={skill.id}>
                                    {skill.name}
                                </option>
                            ))}
                        </select>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={initialMentorStatus}
                                onChange={() => setInitialMentorStatus(!initialMentorStatus)}
                                className="mr-2"
                            />
                            <span>I can mentor others in this skill</span>
                        </label>

                        <button
                            type="submit"
                            disabled={!selectedSkillToAdd || isAdding}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
                        >
                            {isAdding ? 'Adding...' : 'Add Skill'}
                        </button>
                    </form>
                </div>
            )}

            {/* My Tasks Section */}
            <div className="mt-8 pt-4 border-t">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">My Assigned Tasks</h3>
                {isLoadingTasks && <p>Loading tasks...</p>}

                {!isLoadingTasks && myTasks.length === 0 && (
                    <p className="text-gray-500 italic">You don't have any assigned tasks.</p>
                )}

                {!isLoadingTasks && myTasks.length > 0 && (
                    <div className="space-y-4">
                        {myTasks.map((task) => {
                            // Add debug logging for each task
                            console.log('Rendering Task:', task.id, 'Status:', task.status, 'Type:', typeof task.status, 'Raw Task:', task);

                            return (
                                <div key={task.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-lg">{task.title}</h4>
                                        <div className="flex space-x-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>

                                {task.description && (
                                    <p className="text-gray-600 mb-3">{task.description}</p>
                                )}

                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    {task.due_date && (
                                        <div className="flex items-center mr-4">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    {task.supervisor && (
                                        <div className="flex items-center">
                                            <span>Assigned by: {task.supervisor.full_name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-2 mt-2">
                                    {/* Text indicators to test conditions */}
                                    <div className="flex space-x-4 mb-1">
                                        <span className="text-xs">Raw status: <b>"{task.status}"</b></span>
                                        <span className="text-xs">Normalized: <b>"{normalizeTaskStatus(task.status)}"</b></span>
                                        <span className="text-xs">Type: <b>{typeof task.status}</b></span>
                                    </div>

                                    <div className="flex space-x-4 mb-1">
                                        {normalizeTaskStatus(task.status) === 'pending' ?
                                            <span className="text-red-500 text-xs font-bold">PENDING_TRUE</span> :
                                            <span className="text-gray-400 text-xs">pending_false</span>
                                        }

                                        {normalizeTaskStatus(task.status) === 'in-progress' ?
                                            <span className="text-red-500 text-xs font-bold">INPROGRESS_TRUE</span> :
                                            <span className="text-gray-400 text-xs">inprogress_false</span>
                                        }

                                        {normalizeTaskStatus(task.status) === 'completed' ?
                                            <span className="text-red-500 text-xs font-bold">COMPLETED_TRUE</span> :
                                            <span className="text-gray-400 text-xs">completed_false</span>
                                        }
                                    </div>

                                    {/* Direct string equality tests */}
                                    <div className="flex flex-col space-y-1 mb-1 border p-1 bg-gray-50 rounded text-xs">
                                        <div>
                                            <span>Direct equality: </span>
                                            <span className={task.status === 'pending' ? 'text-red-500 font-bold' : 'text-gray-400'}>
                                                status === 'pending': {String(task.status === 'pending')}
                                            </span>
                                        </div>
                                        <div>
                                            <span>Direct equality: </span>
                                            <span className={task.status === 'in-progress' ? 'text-red-500 font-bold' : 'text-gray-400'}>
                                                status === 'in-progress': {String(task.status === 'in-progress')}
                                            </span>
                                        </div>
                                        <div>
                                            <span>Direct equality: </span>
                                            <span className={task.status === 'completed' ? 'text-red-500 font-bold' : 'text-gray-400'}>
                                                status === 'completed': {String(task.status === 'completed')}
                                            </span>
                                        </div>
                                        <div>
                                            <span>String code points: </span>
                                            <span className="font-mono">
                                                {Array.from(task.status || '').map(c => c.charCodeAt(0)).join(', ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        {/* Direct test button that always renders */}
                                        <button
                                            onClick={() => console.log('Test button clicked')}
                                            className="bg-purple-500 text-white py-1 px-3 rounded"
                                        >
                                            Test Button (Always Visible)
                                        </button>

                                        {/* --- DETAILED DEBUGGING FOR BUTTONS --- */}
                                        <div className="flex flex-col space-y-1 md:flex-row md:space-y-0 md:space-x-1 mt-2">
                                            {(() => { // Immediately invoked function expression for cleaner logging
                                                // Trim whitespace and log the status value and type being checked
                                                const currentStatus = task.status?.trim(); // Trim whitespace!
                                                console.log(`TASK ID: ${task.id}, STATUS (raw): "${task.status}", TYPE: ${typeof task.status}, STATUS (trimmed): "${currentStatus}"`);

                                                // Character-by-character analysis
                                                if (currentStatus) {
                                                    console.log(`TASK ID: ${task.id}, Character-by-character analysis:`);
                                                    const statusChars = Array.from(currentStatus);
                                                    statusChars.forEach((char, index) => {
                                                        console.log(`  Char at position ${index}: '${char}', code point: ${char.charCodeAt(0)}`);
                                                    });

                                                    // Compare with expected strings character by character
                                                    const expectedStrings = ['pending', 'in-progress', 'completed'];
                                                    expectedStrings.forEach(expected => {
                                                        const expectedChars = Array.from(expected);
                                                        if (statusChars.length === expectedChars.length) {
                                                            let differences = [];
                                                            expectedChars.forEach((char, index) => {
                                                                if (statusChars[index] !== char) {
                                                                    differences.push(`Position ${index}: expected '${char}' (${char.charCodeAt(0)}), got '${statusChars[index]}' (${statusChars[index].charCodeAt(0)})`);
                                                                }
                                                            });
                                                            if (differences.length > 0) {
                                                                console.log(`  Comparing with '${expected}': ${differences.length} differences found`);
                                                                differences.forEach(diff => console.log(`    ${diff}`));
                                                            } else {
                                                                console.log(`  Comparing with '${expected}': EXACT MATCH`);
                                                            }
                                                        } else {
                                                            console.log(`  Comparing with '${expected}': Length mismatch (${statusChars.length} vs ${expectedChars.length})`);
                                                        }
                                                    });
                                                }

                                                // Log the result of the boolean comparisons
                                                const isPending = currentStatus === 'pending';
                                                const isInProgress = currentStatus === 'in-progress';
                                                const isCompleted = currentStatus === 'completed';
                                                console.log(`TASK ID: ${task.id}, Comparisons: isPending=${isPending}, isInProgress=${isInProgress}, isCompleted=${isCompleted}`);

                                                // Render based on the comparisons
                                                if (isPending) {
                                                    console.log(`TASK ID: ${task.id}, RENDERING 'Start Task' button`);
                                                    return (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                                            disabled={updatingTaskId === task.id}
                                                            className={`px-2 py-1 border rounded text-xs ${updatingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                                            title="Start working on this task"
                                                        >
                                                            ▶ Start Task
                                                        </button>
                                                    );
                                                } else if (isInProgress) {
                                                    console.log(`TASK ID: ${task.id}, RENDERING 'Complete Task' button`);
                                                    return (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                                            disabled={updatingTaskId === task.id}
                                                            className={`px-2 py-1 border rounded text-xs text-green-600 border-green-300 ${updatingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50'}`}
                                                            title="Mark this task as complete"
                                                        >
                                                            ✔ Complete Task
                                                        </button>
                                                    );
                                                } else if (isCompleted) {
                                                    console.log(`TASK ID: ${task.id}, RENDERING 'Reopen Task' button`);
                                                    return (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                                                            disabled={updatingTaskId === task.id}
                                                            className={`px-2 py-1 border rounded text-xs text-amber-600 border-amber-300 ${updatingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-50'}`}
                                                            title="Reopen this task"
                                                        >
                                                            ↩ Reopen Task
                                                        </button>
                                                    );
                                                } else {
                                                    // Log if status doesn't match any known value
                                                    console.log(`TASK ID: ${task.id}, Status "${currentStatus}" doesn't match known values, rendering fallback button.`);

                                                    // Render a fallback button that shows the actual status
                                                    return (
                                                        <div className="flex flex-col space-y-2">
                                                            <span className="text-xs text-red-500 font-bold">
                                                                Unknown status: "{currentStatus}"
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => console.log(`Fallback button clicked for task ${task.id} with status "${currentStatus}"`)}
                                                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                                                            >
                                                                Fallback Button (Unknown Status)
                                                            </button>

                                                            {/* Force rendering buttons for all statuses for testing */}
                                                            <div className="flex space-x-2 mt-2 border-t pt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                                >
                                                                    Force: Start
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                                >
                                                                    Force: Complete
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                                                                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                                                                >
                                                                    Force: Reopen
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                        {/* --- END DETAILED DEBUGGING --- */}

                                        {/* Also try with direct string comparison without normalization */}
                                        <div className="flex space-x-2 mt-2 border-t pt-2">
                                            <span className="text-xs text-gray-500">Direct string comparison:</span>

                                            {task.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                >
                                                    Start (Direct)
                                                </button>
                                            )}

                                            {task.status === 'in-progress' && (
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                >
                                                    Complete (Direct)
                                                </button>
                                            )}

                                            {task.status === 'completed' && (
                                                <button
                                                    type="button"
                                                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                                                >
                                                    Reopen (Direct)
                                                </button>
                                            )}
                                        </div>

                                        {/* Hardcoded buttons that always render regardless of status */}
                                        <div className="flex space-x-2 mt-2 border-t pt-2 bg-gray-50 p-2 rounded">
                                            <span className="text-xs text-gray-500">Hardcoded buttons:</span>

                                            <button
                                                type="button"
                                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                onClick={() => console.log('Hardcoded Start clicked')}
                                            >
                                                Start (Hardcoded)
                                            </button>

                                            <button
                                                type="button"
                                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                onClick={() => console.log('Hardcoded Complete clicked')}
                                            >
                                                Complete (Hardcoded)
                                            </button>

                                            <button
                                                type="button"
                                                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                                                onClick={() => console.log('Hardcoded Reopen clicked')}
                                            >
                                                Reopen (Hardcoded)
                                            </button>
                                        </div>

                                        {/* Alternative comparison methods */}
                                        <div className="flex flex-col space-y-2 mt-2 border-t pt-2">
                                            <span className="text-xs text-gray-500">Alternative comparison methods:</span>

                                            <div className="flex space-x-2">
                                                {/* Using includes() */}
                                                {task.status && task.status.toString().toLowerCase().includes('pend') && (
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                    >
                                                        Start (includes 'pend')
                                                    </button>
                                                )}

                                                {/* Using startsWith() */}
                                                {task.status && task.status.toString().toLowerCase().startsWith('in') && (
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                    >
                                                        Complete (starts with 'in')
                                                    </button>
                                                )}

                                                {/* Using indexOf() */}
                                                {task.status && task.status.toString().toLowerCase().indexOf('compl') >= 0 && (
                                                    <button
                                                        type="button"
                                                        className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                                                    >
                                                        Reopen (indexOf 'compl')
                                                    </button>
                                                )}
                                            </div>

                                            {/* Using switch statement with IIFE */}
                                            <div className="flex space-x-2 mt-2">
                                                <span className="text-xs text-gray-500">Switch statement:</span>

                                                {(() => {
                                                    // Use an IIFE to allow switch statement in JSX
                                                    if (!task.status) return null;

                                                    const status = task.status.toString().toLowerCase().trim();

                                                    switch (status) {
                                                        case 'pending':
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                                >
                                                                    Start (Switch)
                                                                </button>
                                                            );
                                                        case 'in-progress':
                                                        case 'in progress':
                                                        case 'inprogress':
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                                >
                                                                    Complete (Switch)
                                                                </button>
                                                            );
                                                        case 'completed':
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs"
                                                                >
                                                                    Reopen (Switch)
                                                                </button>
                                                            );
                                                        default:
                                                            return (
                                                                <span className="text-xs text-gray-500">
                                                                    Unknown status: "{status}"
                                                                </span>
                                                            );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfileSkills;
