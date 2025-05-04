// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Using the credentials from the working project
const SUPABASE_URL = "https://zsvzwnuwxlvgxwlexvgi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzdnp3bnV3eGx2Z3h3bGV4dmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTkzMzgsImV4cCI6MjA2MTEzNTMzOH0.sNqfDyUDTF0MfRTX0yfkVcBvK3w_R0g06T--QzA4OI4";
// Service role key should be used only in secure server environments, not in client code
// This is included here for reference but should be used with caution
export const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzdnp3bnV3eGx2Z3h3bGV4dmdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU1OTMzOCwiZXhwIjoyMDYxMTM1MzM4fQ.ISAiqWDZupSSl03Ap2L7f9AHbf8Su0Ne2lxEB2-S7yo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);