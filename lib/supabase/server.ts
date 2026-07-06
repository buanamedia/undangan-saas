// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    'https://kxdkhujoydqeuwbjtrbz.supabase.co',
    'sb_publishable_B-01rD6N2IpN-zOcFEodSw_ypwj2Sl2',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch {
            // Ditangani oleh middleware
          }
        },
      },
    }
  );
}