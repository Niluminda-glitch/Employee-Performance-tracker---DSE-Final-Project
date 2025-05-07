import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PROFILE_PICTURES } from './ProfilePictureSelector';

// Component to load and display profile image with fallback
const ProfileImageLoader = ({ className = '', size = 'md' }) => {
  const { user } = useAuth();
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  useEffect(() => {
    // Reset state when user changes
    setIsLoading(true);
    setError(false);

    // Get avatar URL from user or localStorage
    const getAvatarUrl = () => {
      // First check localStorage for the most up-to-date avatar
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.avatar_url) {
            return parsedUser.avatar_url;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      // Fall back to user object from context
      if (user?.avatar_url) {
        return user.avatar_url;
      }

      // Default to first profile picture if no avatar is set
      return PROFILE_PICTURES[0];
    };

    const avatarUrl = getAvatarUrl();
    console.log('ProfileImageLoader: Using avatar URL:', avatarUrl);
    
    // Set the image URL
    setImageUrl(avatarUrl);

    // Create an image object to check if the image loads
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setError(false);
      console.log('ProfileImageLoader: Image loaded successfully:', avatarUrl);
    };
    img.onerror = () => {
      setIsLoading(false);
      setError(true);
      console.error('ProfileImageLoader: Error loading image:', avatarUrl);
      // Fall back to default image
      setImageUrl(PROFILE_PICTURES[0]);
    };
    img.src = avatarUrl;

    // Force reload the image by adding a timestamp
    const timestamp = new Date().getTime();
    setImageUrl(`${avatarUrl}?t=${timestamp}`);

  }, [user]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  // Show error state or image
  return (
    <img
      src={imageUrl}
      alt={user?.full_name || 'User'}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={() => {
        setError(true);
        setImageUrl(PROFILE_PICTURES[0]);
      }}
    />
  );
};

export default ProfileImageLoader;
