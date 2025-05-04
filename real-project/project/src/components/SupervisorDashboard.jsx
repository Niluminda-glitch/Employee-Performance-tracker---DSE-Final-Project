import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupervisorTasksTab from './SupervisorTasksTab';

function SupervisorDashboard() {
    const { user, api } = useAuth();
    
    // State for team members
    const [teamMembers, setTeamMembers] = useState([]);
    const [isLoadingTeam, setIsLoadingTeam] = useState(false);
    const [teamError, setTeamError] = useState(null);
    
    // Fetch team members
    const fetchTeamMembers = useCallback(async () => {
        if (!user?.id || !api) return;
        
        console.log('[SupervisorDashboard] Fetching team members');
        setIsLoadingTeam(true);
        setTeamError(null);
        
        try {
            const response = await api.get('/supervisor/team');
            setTeamMembers(response.data || []);
            console.log('[SupervisorDashboard] Team members fetched:', response.data);
        } catch (err) {
            console.error('[SupervisorDashboard] Failed to fetch team members:', err.response?.data || err.message);
            setTeamError(err.response?.data?.message || 'Failed to load team members.');
            setTeamMembers([]);
        } finally {
            setIsLoadingTeam(false);
        }
    }, [user?.id, api]);
    
    // Fetch data on mount
    useEffect(() => {
        if (user?.id && api) {
            fetchTeamMembers();
        }
    }, [user?.id, api, fetchTeamMembers]);
    
    if (!user) {
        return <p className="p-6 text-center text-red-600">Please log in to access the supervisor dashboard.</p>;
    }
    
    if (user.role !== 'supervisor' && user.role !== 'manager') {
        return <p className="p-6 text-center text-red-600">Access denied. This page is only for supervisors and managers.</p>;
    }
    
    return (
        <div className="p-6 bg-white rounded-lg shadow max-w-4xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6">Supervisor Dashboard</h2>
            
            {teamError && (
                <div className="bg-red-50 p-4 rounded mb-4">
                    <p className="text-red-700">{teamError}</p>
                </div>
            )}
            
            <Tabs defaultValue="team">
                <TabsList className="mb-4">
                    <TabsTrigger value="team">My Team</TabsTrigger>
                    <TabsTrigger value="tasks">Team Tasks</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="team">
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-4">Team Members</h3>
                        
                        {isLoadingTeam && (
                            <p>Loading team members...</p>
                        )}
                        
                        {!isLoadingTeam && teamMembers.length === 0 && !teamError && (
                            <p className="text-gray-500 italic">No team members found.</p>
                        )}
                        
                        {!isLoadingTeam && teamMembers.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teamMembers.map((member) => (
                                            <tr key={member.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{member.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{member.job_title || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>
                
                <TabsContent value="tasks">
                    <SupervisorTasksTab teamMembers={teamMembers} />
                </TabsContent>
                
                <TabsContent value="reports">
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-4">Reports</h3>
                        <p className="text-gray-500 italic">Reports functionality coming soon.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default SupervisorDashboard;
