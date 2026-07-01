/**
 * VIBE Configuration & Supabase Setup
 * Initializes Supabase client and provides auth utilities
 */

// Get env variables (from window object or injected by build process)
const SUPABASE_URL = window.__ENV__?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.__ENV__?.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

/**
 * Initialize Supabase client
 */
async function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not configured');
    return false;
  }

  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
    
    // Test connection
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    return true;
  } catch (err) {
    console.error('❌ Supabase init failed:', err.message);
    return false;
  }
}

/**
 * Get current authenticated user
 */
async function getCurrentUser() {
  if (!supabase) return null;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (err) {
    console.error('Error fetching user:', err.message);
    return null;
  }
}

/**
 * Sign up user
 */
async function signUpUser(email, password, metadata = {}) {
  if (!supabase) {
    console.error('Supabase not initialized');
    return { error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Sign in user
 */
async function signInUser(email, password) {
  if (!supabase) {
    console.error('Supabase not initialized');
    return { error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Sign out user
 */
async function signOutUser() {
  if (!supabase) return;
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Sign out error:', err.message);
    return false;
  }
}

/**
 * Get Supabase client instance
 */
function getSupabaseClient() {
  return supabase;
}

// Export for use in other modules
window.vibeConfig = {
  initSupabase,
  getCurrentUser,
  signUpUser,
  signInUser,
  signOutUser,
  getSupabaseClient
};
