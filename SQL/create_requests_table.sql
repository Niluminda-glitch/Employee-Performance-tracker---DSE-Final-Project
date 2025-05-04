-- Create enum type for request types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_type') THEN
        CREATE TYPE request_type AS ENUM ('leave', 'overtime');
    END IF;
END $$;

-- Create enum type for request status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  hours integer,
  reason text NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  approver_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comment to the table
COMMENT ON TABLE public.requests IS 'Stores leave and overtime requests from employees';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON public.requests(type);

-- Add notification type for requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
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
    ELSE
        -- Check if 'request_submitted' value exists in the enum
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
            AND enumlabel = 'request_submitted'
        ) THEN
            -- Add the new value to the enum
            ALTER TYPE notification_type ADD VALUE 'request_submitted';
        END IF;
    END IF;
END $$;
