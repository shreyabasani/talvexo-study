import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://bwjgsdqrcqyllmzezunf.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3amdzZHFyY3F5bGxtemV6dW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1OTk0MzIsImV4cCI6MjExMTE3NTQzMn0.FCl_w1ed2tM1aWxDp-E4IApD86p3pe4nF0vACypGrX0';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
