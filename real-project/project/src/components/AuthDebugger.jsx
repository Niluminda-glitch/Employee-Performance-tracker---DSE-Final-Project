import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthDebugger = () => {
  const { user, isAuthenticated, isLoading, error, api, logout } = useAuth();

  const testProtectedRoute = async () => {
    try {
      console.log('[AuthDebugger] Testing protected route...');
      const response = await api.get('/profile');
      console.log('[AuthDebugger] Protected route response:', response.data);
      alert('Protected route access successful! Check console for details.');
    } catch (err) {
      console.error('[AuthDebugger] Protected route error:', err.response?.data || err.message);
      alert(`Protected route access failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const testUserMe = async () => {
    try {
      console.log('[AuthDebugger] Testing /users/me endpoint...');
      const response = await api.get('/users/me');
      console.log('[AuthDebugger] /users/me response:', response.data);
      alert('User profile fetch successful! Check console for details.');
    } catch (err) {
      console.error('[AuthDebugger] /users/me error:', err.response?.data || err.message);
      alert(`User profile fetch failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8 bg-white/90 shadow-lg border border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <CardTitle className="text-xl font-bold text-purple-800">Auth Debugger</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Authentication State:</h3>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono overflow-auto max-h-40">
            <div><span className="text-purple-600 font-semibold">isAuthenticated:</span> {String(isAuthenticated)}</div>
            <div><span className="text-purple-600 font-semibold">isLoading:</span> {String(isLoading)}</div>
            <div><span className="text-purple-600 font-semibold">error:</span> {error || 'null'}</div>
            <div><span className="text-purple-600 font-semibold">user:</span> {user ? JSON.stringify(user, null, 2) : 'null'}</div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">JWT Token:</h3>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm font-mono overflow-auto max-h-40">
            {localStorage.getItem('token') ? (
              <div className="break-all">{localStorage.getItem('token').substring(0, 20)}...</div>
            ) : (
              <div className="text-red-500">No token found in localStorage</div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button 
            onClick={testProtectedRoute}
            disabled={!isAuthenticated || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Test Protected Route
          </Button>
          
          <Button 
            onClick={testUserMe}
            disabled={!isAuthenticated || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Test /users/me Endpoint
          </Button>
          
          <Button 
            onClick={handleLogout}
            disabled={!isAuthenticated || isLoading}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;
