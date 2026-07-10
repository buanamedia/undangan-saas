import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// WAJIB menggunakan huruf besar 'POST' agar dikenali Next.js App Router
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY belum terpasang di .env.local' },
        { status: 500 }
      );
    }

    // Inisialisasi menggunakan Service Role untuk bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { userId, currentStatus } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID Pengguna tidak valid' }, { status: 400 });
    }

    // Menghitung status baru yang akan diset
    const nextStatus = !currentStatus;

    // ⚡ LOGIKA OTOMATISASI: Jika status dikembalikan ke FALSE (Free User), hapus data transaksinya
    if (nextStatus === false) {
      console.log(`Mengembalikan ke Free User. Menghapus riwayat transaksi untuk user: ${userId}`);
      
      const { error: deleteTxError } = await supabaseAdmin
        .from('transactions')
        .delete()
        .eq('user_id', userId);

      if (deleteTxError) {
        console.error("Gagal menghapus data transaksi pendukung:", deleteTxError);
        // Catatan: Anda bisa melempar error di sini jika penghapusan transaksi wajib sukses
      }
    }

    // Eksekusi update langsung ke tabel profiles berdasarkan ID (Sesuai kode asli Anda)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_premium: nextStatus })
      .eq('id', userId)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Status lisensi berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal internal server' }, { status: 500 });
  }
}