import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const DebugAuth = () => {
  const [debugInfo, setDebugInfo] = useState<any>({
    supabaseUrl: supabase.supabaseUrl,
    sessionLoading: true,
    sessionError: null,
    session: null,
    userLoading: true,
    userError: null,
    user: null
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        setDebugInfo(prev => ({
          ...prev,
          sessionLoading: false,
          sessionError: error ? error.message : null,
          session: data.session
        }));

        // Only try to get user if we have a session
        if (data.session) {
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            setDebugInfo(prev => ({
              ...prev,
              userLoading: false,
              userError: userError ? userError.message : null,
              user: userData.user
            }));
          } catch (err: any) {
            setDebugInfo(prev => ({
              ...prev,
              userLoading: false,
              userError: err.message
            }));
          }
        } else {
          setDebugInfo(prev => ({
            ...prev,
            userLoading: false
          }));
        }
      } catch (err: any) {
        setDebugInfo(prev => ({
          ...prev,
          sessionLoading: false,
          sessionError: err.message
        }));
      }
    };

    checkSession();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Auth Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium">Supabase URL:</h3>
          <p className="text-sm break-all">{debugInfo.supabaseUrl}</p>
        </div>

        <div>
          <h3 className="font-medium">Session:</h3>
          {debugInfo.sessionLoading ? (
            <p>Loading session...</p>
          ) : debugInfo.sessionError ? (
            <p className="text-red-500">Error: {debugInfo.sessionError}</p>
          ) : debugInfo.session ? (
            <div className="text-sm">
              <p>Session found</p>
              <p>User ID: {debugInfo.session.user.id}</p>
              <p>Email: {debugInfo.session.user.email}</p>
            </div>
          ) : (
            <p>No active session</p>
          )}
        </div>

        <div>
          <h3 className="font-medium">User:</h3>
          {debugInfo.userLoading ? (
            <p>Loading user...</p>
          ) : debugInfo.userError ? (
            <p className="text-red-500">Error: {debugInfo.userError}</p>
          ) : debugInfo.user ? (
            <div className="text-sm">
              <p>User found</p>
              <p>ID: {debugInfo.user.id}</p>
              <p>Email: {debugInfo.user.email}</p>
              <p>Created at: {new Date(debugInfo.user.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p>No user data</p>
          )}
        </div>

        {debugInfo.session && (
          <Button onClick={handleSignOut} variant="destructive" className="w-full">
            Sign Out
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugAuth;
