import {createClient} from '@supabase/supabase-js';

// Same Supabase project the iOS app uses (~/code/insider-trading-app). The
// publishable key is safe to embed client-side — RLS, not key secrecy,
// protects data (insider-trading-app DESIGN.md §3.4b).
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
