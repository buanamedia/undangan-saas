import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Jangan di-cache oleh Vercel

export async function GET() {
  const supabase = createClient();
  // Kueri ringan ke tabel profiles
  await supabase.from('profiles').select('id').limit(1);
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
