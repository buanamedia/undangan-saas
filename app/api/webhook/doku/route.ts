import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ⚡ PEMETAAN DATA PAYLOAD JOKUL DOKU V2
    const invoiceNumber = body.order?.invoice_number;
    const transactionStatus = body.transaction?.status || body.transaction_status;
    const customerEmail = body.customer?.email;

    console.log(`Menerima webhook DOKU untuk invoice: ${invoiceNumber} | Email: ${customerEmail} | Status: ${transactionStatus}`);

    // Pastikan status transaksi mutlak bernilai SUCCESS
    if (transactionStatus === 'SUCCESS' || transactionStatus === 'success') {
      
      // 1. INISIALISASI SUPABASE CLIENT DENGAN SERVICE ROLE KEY (BYPASS RLS)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      if (!customerEmail) {
        console.error("Gagal memproses webhook: Email pelanggan tidak ditemukan pada payload DOKU.");
        return new Response('Missing Customer Email', { status: 400 });
      }

      // 2. EKSEKUSI UPDATE DATABASE (AKTIF TANPA KOMENTAR)
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          account_level: 'PREMIUM', // Memperbarui kolom status akun Anda menjadi PREMIUM
          updated_at: new Date().toISOString()
        })
        .eq('email', customerEmail); // Mencocokkan data baris profil berdasarkan email login user

      if (error) {
        console.error("Gagal mengupdate profile user di Supabase:", error.message);
        return new Response('Database Update Error', { status: 500 });
      }

      console.log(`[SUKSES] Akun dengan email ${customerEmail} berhasil diperbarui ke Premium.`);

      // Balasan teks murni wajib untuk DOKU
      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response('Notification processed with non-success status', { status: 200 });

  } catch (error: any) {
    console.error("💥 Batasan Fatal Webhook Error DOKU:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}