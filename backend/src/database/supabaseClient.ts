import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();  // ✅ Load .env variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env file');
}

// ✅ Initialize the client
export const supabase = createClient(supabaseUrl, supabaseKey);
