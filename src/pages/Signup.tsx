import React from 'react';
import { Link } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
import { LogIn } from 'lucide-react';

const Signup = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-mesh-gradient">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-40 right-[10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>
      <div className="w-full max-w-md z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 relative group w-20 h-20">
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 opacity-60 blur-xl group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient-enhanced mb-2">EmpTrack</h1>
          <p className="text-sm text-purple-600 font-medium">Employee Management System</p>
        </div>

        <SignupForm />
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth" className="font-medium text-purple-600 hover:text-purple-800 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
