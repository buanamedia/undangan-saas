// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    'https://kxdkhujoydqeuwbjtrbz.supabase.co',
    'sb_publishable_B-01rD6N2IpN-zOcFEodSw_ypwj2Sl2'
  );