import {createBrowserClient} from '@supabase/ssr';

// Same Supabase project the iOS app uses (~/code/insider-trading-app). The
// publishable key is safe to embed client-side — RLS, not key secrecy,
// protects data (insider-trading-app DESIGN.md §3.4b).
//
// createBrowserClient (not plain createClient) stores the session -- and,
// critically, the PKCE code_verifier used mid-OAuth-redirect -- in a cookie
// instead of localStorage. Safari's Intelligent Tracking Prevention can evict
// localStorage written just before a redirect through a shared domain like
// supabase.co, which silently broke Google sign-in on Safari (the code
// exchange had nothing to read the verifier back from). Cookies set during a
// top-level navigation aren't subject to that restriction. No backend
// required -- this works in a plain client-rendered page, not just SSR
// frameworks.
export const supabase = createBrowserClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
