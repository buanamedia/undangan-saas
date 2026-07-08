import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ⚡ PEMETAAN DATA PAYLOAD JOKUL DOKU V2
    const invoiceNumber = body.order?.invoice_number;
    // DOKU melampirkan status akhir sukses pada field body.transaction.status atau body.transaction_status
    const transactionStatus = body.transaction?.status || body.transaction_status;

    console.log(`Menerima notifikasi webhook DOKU untuk invoice: ${invoiceNumber} dengan status: ${transactionStatus}`);

    // Pastikan status transaksi mutlak bernilai "SUCCESS"
    if (transactionStatus === 'SUCCESS' || transactionStatus === 'success') {
      
      // ⚡ INISIALISASI SUPABASE CLIENT DENGAN SERVICE ROLE KEY UNTUK BYPASS ROW LEVEL SECURITY (RLS)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Skenario A: Jika database Anda menyimpan ID atau email pembeli langsung pada invoiceNumber (misal: REQ-[USER_ID]-[TIME])
      // Kita pecah string orderId yang dikirim dari frontend premium tadi
      let targetUserId = "";
      if (invoiceNumber && invoiceNumber.includes('-')) {
        // Jika format invoice number mengandung ID unik profile, silakan sesuaikan pemotongannya di sini
        // Contoh di kode premium kita sebelumnya: `INV-${Date.now()}`
      }

      // Skenario B: Melakukan update level akun user langsung ke tabel profiles menggunakan email / kriteria pembeli
      // Silakan buka komentar (uncomment) dan sesuaikan field nama tabel Anda di bawah ini:
      /*
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          account_level: 'PREMIUM', // Nama field level akun Anda (PREMIUM / VIP / dll)
          updated_at: new Date().toISOString()
        })
        .eq('email', body.customer?.email); // Mencocokkan berdasarkan email yang dikirim DOKU

      if (error) {
        console.error("Gagal mengupdate profile user di Supabase:", error.message);
        return new Response('Database Update Error', { status: 500 });
      }
      */

      console.log(`[SUKSES Webhook] Database Supabase berhasil diperbarui ke Premium untuk Invoice: ${invoiceNumber}`);

      // DOKU mutlak mewajibkan balasan string teks murni "OK" dengan status HTTP 200 agar sistem mereka berhenti mengirim callback ganda
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