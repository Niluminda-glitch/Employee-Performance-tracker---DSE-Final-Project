-- Run this SQL directly in your database management tool (pgAdmin, DBeaver, etc.)

-- First, check if the notification_type enum exists
SELECT typname, typtype
FROM pg_type
WHERE typname = 'notification_type';

-- Check the current values in the enum
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
ORDER BY enumsortorder;

-- Option 1: Try to add the new value to the enum (this might work in PostgreSQL 9.1+)
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'request_submitted';

-- Option 2: If Option 1 fails, create a new type with all values, drop the old one, and rename
-- WARNING: This is more risky and should be done with caution
/*
-- Create a new type with all the values
CREATE TYPE notification_type_new AS ENUM (
  'system',
  'task_assigned',
  'task_completed',
  'deadline_reminder',
  'mentorship_request',
  'request_approved',
  'request_rejected',
  'announcement',
  'request_submitted'
);

-- Update the column to use the new type (this requires dropping constraints and recreating them)
-- This is complex and should be done carefully with proper backups
*/

-- Option 3: Temporary workaround - update the controller to use an existing type
-- This is the safest option and has already been implemented in the code
