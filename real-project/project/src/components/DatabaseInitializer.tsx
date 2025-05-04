
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { seedDatabase } from '@/database/seedData';
import { supabase } from '@/hooks/useSupabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const DatabaseInitializer: React.FC<{ showOnLogin?: boolean }> = ({ showOnLogin = false }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { user } = useAuth();

  const handleInitializeDatabase = async () => {
    try {
      setIsInitializing(true);
      toast.info('Initializing database with test data...');

      await seedDatabase(supabase);

      toast.success('Database initialized successfully! You can now log in with the test accounts.');
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Failed to initialize database. See console for details.');
    } finally {
      setIsInitializing(false);
    }
  };

  // If not on login page, only show to managers
  if (!showOnLogin && (!user || user.role !== 'manager')) return null;

  return (
    <div className="w-full">
      <Alert className="bg-amber-50 border-amber-200 shadow-sm">
        <AlertTitle className="text-amber-800 font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Database Setup Required
        </AlertTitle>
        <AlertDescription className="text-amber-700 mt-2">
          <p className="mb-3 text-sm">
            {showOnLogin
              ? "Before logging in, you need to initialize the database with sample data."
              : "Initialize the database with sample data for testing. This will create users, skills, tasks, and departments."}
          </p>
          <Button
            variant="outline"
            className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 hover:text-amber-900 transition-colors"
            onClick={handleInitializeDatabase}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Initializing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Initialize Database
              </span>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DatabaseInitializer;
