// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    'https://kxdkhujoydqeuwbjtrbz.supabase.co',
    'sb_publishable_B-01rD6N2IpN-zOcFEodSw_ypwj2Sl2',
    {
      auth: {
        flowType: 'pkce',
        storageKey: 'sb-buanamedia-auth-token',
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined, // Wajib sessionStorage
        persistSession: true,
      },
      cookieOptions: {
        // Menyetel agar cookie otomatis kedaluwarsa begitu browser ditutup (Max-Age kosong / Session Cookie)
        maxAge: undefined, 
        path: '/',
      }
    }
  );