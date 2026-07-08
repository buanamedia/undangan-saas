import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // atau inisialisasi client admin internal Anda

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ambil data nomor invoice dan status pembayaran dari objek JSON DOKU
    const invoiceNumber = body.order?.invoice_number;
    const transactionStatus = body.transaction?.status; // Status sukses bernilai "SUCCESS"

    if (transactionStatus === 'SUCCESS') {
      // ⚡ INISIALISASI SUPABASE CLIENT ADMIN (Gunakan SERVICE_ROLE agar bypass RLS jika diperlukan)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Jalankan skrip update database Anda berdasarkan invoiceNumber / email pembeli
      // Contoh skenario:
      // const { error } = await supabaseAdmin
      //   .from('profiles')
      //   .update({ account_level: 'PREMIUM' }) 
      //   .eq('id', userId_terkait); // sesuaikan dengan arsitektur relasi tabel invoice Anda

      console.log(`Pembaruan database sukses untuk Invoice: ${invoiceNumber}`);
      
      // DOKU mewajibkan respon balik teks string murni "OK" dengan HTTP 200
      return new Response('OK', { status: 200 });
    }

    return new Response('Notification processed without action', { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}