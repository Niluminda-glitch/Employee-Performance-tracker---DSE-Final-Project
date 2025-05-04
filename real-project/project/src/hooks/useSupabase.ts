
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://tcrupfwftaohdylgkdbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcnVwZndmdGFvaGR5bGdrZGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjA0NDEsImV4cCI6MjA2MDUzNjQ0MX0.tlTGyih6f1wCSa3IeU_0b2DMJ3AUK7d82OgKYc8xh-A';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Hook to use Supabase client
export const useSupabase = () => {
  return { supabase };
};

export default useSupabase;
