import React from "react";
import TopNavigation from "@/components/layout/TopNavigation";
import { useAuth } from "@/context/AuthContext";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50">
      <TopNavigation userRole={user?.role} />
      
      <main className="container mx-auto px-4 py-8">
        {(title || actions) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            {title && (
              <div>
                <h1 className="text-2xl font-bold mb-1 text-gradient animate-fade-in">{title}</h1>
                {subtitle && <p className="text-gray-500 animate-slide-up">{subtitle}</p>}
              </div>
            )}
            
            {actions && (
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
