// Supabase Configuration
// Replace these with your new Supabase project details

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "your-project-id"
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key"

// Debug logging
console.log('🔧 Supabase Config Debug:');
console.log('Project ID:', projectId);
console.log('Anon Key:', publicAnonKey ? `${publicAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('Environment variables loaded:', {
  VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING'
});