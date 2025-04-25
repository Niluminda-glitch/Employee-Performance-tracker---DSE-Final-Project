import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import UserProfile from "@/components/profile/UserProfile";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <DashboardShell
      title="Your Profile"
      subtitle="Manage your personal information and account settings"
    >
      <div className="container mx-auto py-6">
        <UserProfile />
      </div>
    </DashboardShell>
  );
};

export default Profile;
