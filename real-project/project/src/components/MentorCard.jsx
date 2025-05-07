import React from 'react';
import { motion } from 'framer-motion';

// Enhanced Mentor Card Component with animations
const MentorCard = ({ mentor, onContact, selectedSkillName }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.15)',
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    }
  };

  const iconVariants = {
    hover: { scale: 1.15, rotate: 5, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <motion.div
      className="group relative rounded-2xl p-6 bg-gradient-to-br from-white via-white to-purple-50 backdrop-blur-sm border border-purple-100/50 shadow-lg overflow-hidden w-full max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}>
      {/* Enhanced decorative elements */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-purple-500 to-indigo-600 rotate-12 opacity-10 group-hover:opacity-25 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500 transform group-hover:translate-y-2 group-hover:translate-x-2"></div>
      <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-indigo-400 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-500 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-purple-400 rounded-full opacity-10 group-hover:opacity-30 transition-all duration-500 animate-ping animation-delay-1000"></div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
        {/* Enhanced Avatar with glow effect */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}>
          <img
            src={mentor.avatar_url || "https://i.pinimg.com/originals/7c/e9/e3/7ce9e34927261d3b035090cac779fec5.gif"}
            alt={mentor.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl group-hover:shadow-purple-400/50 transition-all duration-500 bg-white"
            style={{
              boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)',
            }}
          />
          {/* Enhanced Status indicator with pulse effect */}
          <div className="absolute bottom-1 right-1">
            <div className={`w-5 h-5 rounded-full border-2 border-white ${mentor.is_mentor ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            {mentor.is_mentor && (
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-60 animate-ping"></div>
            )}
          </div>
        </motion.div>

        {/* Details section with improved typography and animation */}
        <motion.div
          className="flex-1 min-w-0 text-center sm:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}>
          <h3 className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors duration-300 group-hover:tracking-wide">{mentor.name}</h3>
          <p className="text-gray-600 text-sm mb-3 group-hover:text-indigo-600 transition-colors duration-300 font-medium">{mentor.job_title || 'Team Member'}</p>

          {/* Enhanced Badges with subtle glow */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-4">
            <motion.span
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100/70 to-purple-200/70 text-purple-700 border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              variants={iconVariants}>
              {mentor.department || mentor.role || 'Team Member'}
            </span>
            {mentor.is_mentor && (
              <motion.span
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100/70 to-green-200/70 text-green-700 border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                variants={iconVariants}>
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Mentor
              </span>
            )}
            {mentor.rating && (
              <motion.span
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-100/70 to-amber-200/70 text-amber-700 border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                variants={iconVariants}>
                <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                {mentor.rating}/5.0
              </span>
            )}
          </div>

          {/* Enhanced Details with glass card effect */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 bg-white/80 backdrop-blur-sm p-5 rounded-lg border border-purple-100/30 shadow-md transition-all duration-300 group-hover:shadow-lg relative"
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 200 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 opacity-30 rounded-lg"></div>
            <div className="flex items-center">
              <motion.span
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center mr-3 shadow-inner"
                variants={iconVariants}>
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </span>
              <span>Proficiency: <strong className="text-gray-800 capitalize">{mentor.proficiency_level || 'Learning'}</strong></span>
            </div>
            <div className="flex items-center">
              <motion.span
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center mr-3 shadow-inner"
                variants={iconVariants}>
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </span>
              <span>Helped <strong className="text-gray-800">{mentor.studentsHelped || '0'} colleagues</strong></span>
            </div>
            <div className="flex items-center">
              <motion.span
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center mr-3 shadow-inner"
                variants={iconVariants}>
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </motion.span>
              <span>Available: <strong className="text-gray-800">{mentor.availability || 'Not specified'}</strong></span>
            </div>
          </motion.div>
        </motion.div>

        {/* Action buttons with enhanced styling and animations */}
        <motion.div
          className="flex flex-col space-y-4 mt-4 sm:mt-0 w-full sm:w-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}>
          <motion.button
            onClick={() => onContact(mentor.id, mentor.name, 'message')}
            className="px-6 py-3 rounded-lg border border-purple-200 text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md w-full sm:w-40 relative overflow-hidden group/btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-100/50 to-indigo-100/50 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              <motion.svg
                className="w-5 h-5 mr-2 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                variants={iconVariants}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </motion.svg>
              Send Message
            </span>
          </motion.button>
          <motion.button
            onClick={() => onContact(mentor.id, mentor.name, 'mentor')}
            className={`px-6 py-3 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md w-full sm:w-40 relative overflow-hidden ${mentor.is_mentor ? 'hover:scale-105' : ''} ${
              mentor.is_mentor
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } transition-all duration-300`}
            disabled={!mentor.is_mentor}
            whileHover={mentor.is_mentor ? { scale: 1.03 } : {}}
            whileTap={mentor.is_mentor ? { scale: 0.98 } : {}}
          >
            {mentor.is_mentor && (
              <span className="absolute inset-0 w-0 h-full bg-white opacity-20 transform -skew-x-12 group-hover:w-full transition-all duration-1000 ease-out"></span>
            )}
            <span className="relative flex items-center">
              <motion.svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                variants={iconVariants}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </motion.svg>
              {mentor.is_mentor ? "Request Mentoring" : "Mentoring N/A"}
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Enhanced skill tag with animation */}
      {selectedSkillName && (
        <motion.div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100/80 to-purple-100/80 text-indigo-700 border border-indigo-200/50 shadow-md z-10 flex items-center"
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
          {selectedSkillName}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MentorCard;
