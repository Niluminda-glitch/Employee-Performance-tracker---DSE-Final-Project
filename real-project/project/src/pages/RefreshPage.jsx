import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingAnimation from '@/components/LoadingAnimation';

/**
 * This is a utility component that serves as a temporary page during navigation
 * to force a complete remount of components. It immediately redirects back to
 * the previous page, causing React to fully unmount and remount the components.
 */
const RefreshPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get the previous path from state or default to dashboard
    const previousPath = location.state?.from || '/manager-dashboard';
    
    // Redirect back to the previous page immediately
    setTimeout(() => {
      navigate(previousPath, { replace: true });
    }, 100);
  }, [navigate, location]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="text-center">
        <LoadingAnimation type="hash" size={50} text="Refreshing data..." />
        <p className="mt-4 text-gray-500">Please wait...</p>
      </div>
    </div>
  );
};

export default RefreshPage;
