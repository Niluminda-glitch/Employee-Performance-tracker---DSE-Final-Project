import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import LoadingScreen from '@/components/LoadingScreen';
import { getDashboardPathForRole } from '@/lib/auth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setError } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('[AuthCallback] Processing authentication callback');

        // Get the data parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        console.log('[AuthCallback] Encoded data received:', encodedData ? 'Yes' : 'No');

        if (!encodedData) {
          throw new Error('No authentication data found in URL');
        }

        // Decode the base64 data (browser-compatible)
        const base64Data = encodedData.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        const paddedBase64 = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
        const jsonString = atob(paddedBase64);

        console.log('[AuthCallback] Successfully decoded base64 data');

        const authData = JSON.parse(jsonString);

        console.log('[AuthCallback] Parsed auth data:', {
          hasToken: !!authData.token,
          hasUser: !!authData.user,
          userRole: authData.user?.role,
          userEmail: authData.user?.email
        });

        if (!authData.token || !authData.user) {
          throw new Error('Invalid authentication data');
        }

        // Store the token and user data
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));

        console.log('[AuthCallback] Stored token and user data in localStorage');

        // Redirect to the appropriate dashboard
        const dashboardPath = getDashboardPathForRole(authData.user.role);

        console.log('[AuthCallback] Redirecting to dashboard:', dashboardPath);

        toast.success(`Welcome, ${authData.user.full_name || authData.user.email}!`);

        // Small delay to ensure localStorage is written before navigation
        setTimeout(() => {
          navigate(dashboardPath, { replace: true });
        }, 100);

      } catch (error) {
        console.error('[AuthCallback] Error processing auth callback:', error);
        setError('Authentication failed. Please try again.');
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    processAuthCallback();
  }, [navigate, setError]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      {isProcessing && (
        <LoadingScreen loaderType="hash" message="Completing authentication..." />
      )}
    </div>
  );
};

export default AuthCallback;
