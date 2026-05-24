import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const FOUNDER_EMAIL = process.env.REACT_APP_FOUNDER_EMAIL;
export const STRIPE_FOUNDER_LINK = process.env.REACT_APP_STRIPE_FOUNDER_LINK;
