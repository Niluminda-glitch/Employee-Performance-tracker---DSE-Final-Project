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
        // Get the data parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        
        if (!encodedData) {
          throw new Error('No authentication data found in URL');
        }

        // Decode the base64 data
        const jsonString = Buffer.from(
          encodedData.replace(/-/g, '+').replace(/_/g, '/'),
          'base64'
        ).toString();
        
        const authData = JSON.parse(jsonString);
        
        if (!authData.token || !authData.user) {
          throw new Error('Invalid authentication data');
        }

        // Store the token and user data
        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        // Redirect to the appropriate dashboard
        const dashboardPath = getDashboardPathForRole(authData.user.role);
        
        toast.success(`Welcome, ${authData.user.full_name || authData.user.email}!`);
        
        // Redirect to dashboard
        navigate(dashboardPath, { replace: true });
      } catch (error) {
        console.error('Error processing auth callback:', error);
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
