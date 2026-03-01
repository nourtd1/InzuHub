import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/admin.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://altolajlghoxgvebuvrn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG9sYWpsZ2hveGd2ZWJ1dnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk5NTYsImV4cCI6MjA4NzEwNTk1Nn0.VOf_U5BvWO3WInPR1Wa0C3Ncz4aZCHFtuW1-XuGYeCM';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
