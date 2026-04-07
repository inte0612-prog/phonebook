import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only initialize if URL is valid to prevent runtime crash
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseAnonKey!)
    : null as any;

if (!supabase) {
    console.warn('Supabase URL is missing or invalid. Please check your .env.local file.');
}
