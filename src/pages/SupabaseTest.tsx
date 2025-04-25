import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SupabaseTest = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing Supabase connection...');
  const [dbVersion, setDbVersion] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [profileInfo, setProfileInfo] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");

        // Test basic connection
        const { data, error } = await supabase
          .from('users')
          .select('count(*)', { count: 'exact', head: true });

        if (error) {
          console.error("Database query error:", error);
          throw error;
        }

        console.log("Database connection successful");

        // Check session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        setSessionInfo(sessionData.session);
        console.log("Session data:", sessionData);

        // Check user if session exists
        if (sessionData.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error("User data error:", userError);
            throw userError;
          }

          setUserInfo(userData.user);
          console.log("User data:", userData);

          // Try to fetch user profile
          if (userData.user) {
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userData.user.id)
              .single();

            if (profileError) {
              console.error("Profile fetch error:", profileError);
            } else {
              console.log("Profile data:", profileData);
              setProfileInfo(profileData);
            }
          }
        }

        // Get Supabase version
        try {
          const { data: versionData, error: versionError } = await supabase.rpc('get_db_version');

          if (versionError) {
            console.warn('Could not get DB version:', versionError);
          } else {
            setDbVersion(versionData);
          }
        } catch (versionErr) {
          console.warn('DB version check failed:', versionErr);
        }

        setStatus('success');
        setMessage('Supabase connection successful!');
      } catch (error: any) {
        console.error('Supabase connection error:', error);
        setStatus('error');
        setMessage(`Connection error: ${error.message || 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div
              className={`w-4 h-4 rounded-full ${
                status === 'loading'
                  ? 'bg-yellow-400 animate-pulse'
                  : status === 'success'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            ></div>
            <p className="text-lg font-medium">{message}</p>
          </div>

          {dbVersion && (
            <div className="text-sm text-gray-500 mb-4">
              <p>Database Version: {dbVersion}</p>
            </div>
          )}

          {sessionInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Session Info:</h3>
              <p className="text-sm">User ID: {sessionInfo.user.id}</p>
              <p className="text-sm">Email: {sessionInfo.user.email}</p>
              <p className="text-sm">Expires: {new Date(sessionInfo.expires_at * 1000).toLocaleString()}</p>
            </div>
          )}

          {userInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">User Info:</h3>
              <p className="text-sm">ID: {userInfo.id}</p>
              <p className="text-sm">Email: {userInfo.email}</p>
              <p className="text-sm">Created: {new Date(userInfo.created_at).toLocaleString()}</p>
            </div>
          )}

          {profileInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Profile Info:</h3>
              <p className="text-sm">Full Name: {profileInfo.full_name}</p>
              <p className="text-sm">Role: {profileInfo.role}</p>
              <p className="text-sm">Status: {profileInfo.status}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {sessionInfo ? (
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Go to Login</Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/signup">Go to Signup</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/debug">Debug Auth</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SupabaseTest;
