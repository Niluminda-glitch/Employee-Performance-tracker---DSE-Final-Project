import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Check } from "lucide-react";
import axios from 'axios';

// Array of profile pictures with animated GIFs
export const PROFILE_PICTURES = [
  "https://i.pinimg.com/originals/7c/e9/e3/7ce9e34927261d3b035090cac779fec5.gif", // Default animated GIF
  "https://cdn.dribbble.com/userupload/31270470/file/original-409fe4faaf259dce0b8c5da07e5b0a1c.gif", // New animated GIF 1
  "https://www.core4d.com/ipb/uploads/monthly_2016_09/skateloop.gif.47140a9404834b7802cced9389d3cd88.gif", // New animated GIF 2
  "https://cdn.dribbble.com/userupload/25968192/file/original-dd69e899ac095e6da3a0463be48ff3c5.gif", // New animated GIF 3
  "https://cdn.dribbble.com/userupload/26047548/file/original-0deea8324bb5590c8ff4f64872377499.gif", // New animated GIF 4
];

const ProfilePictureSelector = ({ open, onOpenChange }) => {
  const { user, updateUserProfile, refreshUserData, api } = useAuth();
  const [selectedPicture, setSelectedPicture] = useState(user?.avatar_url || PROFILE_PICTURES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preload images when component mounts
  useEffect(() => {
    // Preload images
    PROFILE_PICTURES.forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    // Update selected picture when user changes
    if (user?.avatar_url) {
      setSelectedPicture(user.avatar_url);
    }
  }, [user]);

  // Handle picture selection
  const handlePictureSelect = (pictureUrl) => {
    setSelectedPicture(pictureUrl);
  };

  // Handle save button click
  const handleSave = async () => {
    if (!selectedPicture) {
      toast.error("Please select a profile picture");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("[ProfilePictureSelector] Saving new profile picture:", selectedPicture);

      // First, update localStorage directly to ensure immediate UI update
      if (user) {
        const updatedUser = { ...user, avatar_url: selectedPicture };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("[ProfilePictureSelector] Updated localStorage with new avatar");
      }

      try {
        // Try direct SQL update first (most reliable method)
        console.log("[ProfilePictureSelector] Trying direct SQL update");
        // Use the regular API endpoint with the token
        const token = localStorage.getItem('token');

        // First, try the direct SQL update endpoint
        try {
          const directResponse = await axios.post('http://localhost:5000/api/users/update-avatar-sql',
            {
              userId: user?.id,
              avatarUrl: selectedPicture
            },
            {
              headers: {
                'x-auth-token': token
              }
            }
          );

          console.log("[ProfilePictureSelector] Direct SQL update response:", directResponse.data);

          if (directResponse.data.success) {
            console.log("[ProfilePictureSelector] Direct SQL update successful");
            return { data: directResponse.data };
          }
        } catch (directError) {
          console.log("[ProfilePictureSelector] Direct SQL update failed, falling back to regular update");
        }

        // Fall back to the regular update endpoint
        const sqlResponse = await axios.put(`http://localhost:5000/api/users/${user?.id}`,
          {
            avatar_url: selectedPicture
          },
          {
            headers: {
              'x-auth-token': token
            }
          }
        );

        // Log the response regardless of success property
        console.log("[ProfilePictureSelector] SQL update response:", sqlResponse.data);

        // If we got here without an error, consider it successful
        // No need to fall back to updateUserProfile since we're already using the same endpoint
      } catch (directUpdateError) {
        console.error("[ProfilePictureSelector] Direct update failed:", directUpdateError);

        // Fall back to regular update
        console.log("[ProfilePictureSelector] Falling back to regular update");
        await updateUserProfile({ avatar_url: selectedPicture });
      }

      // Refresh user data to ensure the UI shows the updated avatar
      console.log("[ProfilePictureSelector] Refreshing user data after update");
      await refreshUserData();

      // Verify the update
      console.log("[ProfilePictureSelector] User data after refresh:", user);

      toast.success("Profile picture updated successfully");

      // Close the dialog immediately
      onOpenChange(false);

      // Force a page reload to ensure the UI shows the updated avatar
      console.log("[ProfilePictureSelector] Forcing page reload");

      // Update localStorage with the new avatar URL to ensure it's available immediately after reload
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.avatar_url = selectedPicture;
          localStorage.setItem('user', JSON.stringify(parsedUser));
          console.log("[ProfilePictureSelector] Updated localStorage user with new avatar URL");
        } catch (e) {
          console.error('[ProfilePictureSelector] Error updating localStorage:', e);
        }
      }

      // Force reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose Profile Picture</DialogTitle>
          <DialogDescription>Select one of these animated GIFs as your profile picture.</DialogDescription>
        </DialogHeader>

        {/* Preview of selected image */}
        <div className="flex justify-center my-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-300 shadow-lg bg-white">
            <img
              src={selectedPicture}
              alt="Selected profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Grid of avatar options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2">
          {PROFILE_PICTURES.map((url, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePictureSelect(url)}
              className={`
                relative w-full pt-[100%] rounded-lg overflow-hidden border-2 bg-white
                ${selectedPicture === url ? 'border-purple-500 ring-2 ring-purple-300 shadow-lg' : 'border-gray-200 hover:border-purple-300 transition-all'}
              `}
            >
              <img
                src={url}
                alt={`Avatar option ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover p-2"
              />
              {selectedPicture === url && (
                <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1 shadow-md">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || selectedPicture === user?.avatar_url}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureSelector;
