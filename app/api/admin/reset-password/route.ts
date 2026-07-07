export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'ID Pengguna dan Password Baru wajib diisi.' }, { status: 400 });
    }

    // Menggunakan Service Role Key agar bypass aturan kebijakan keamanan (RLS/Auth) khusus admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Pastikan Key ini ada di .env Vercel Anda
    );

    // Eksekusi pembaruan password user secara instan di Auth Storage Supabase
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: `Password pengguna berhasil diubah secara instan menjadi: ${newPassword}` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal internal server' }, { status: 500 });
  }
}