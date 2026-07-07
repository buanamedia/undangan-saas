export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
    }

    // Eksekusi perubahan password langsung via service role admin key agar instan bypass email
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Password berhasil diperbarui secara instan!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal server internal' }, { status: 500 });
  }
}