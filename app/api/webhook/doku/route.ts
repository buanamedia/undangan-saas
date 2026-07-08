import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const invoiceNumber = body.order?.invoice_number; // Format: INV-[USER_ID]-[TIMESTAMP]
    const transactionStatus = body.transaction?.status || body.transaction_status;

    console.log(`Menerima Webhook DOKU. Invoice: ${invoiceNumber} | Status: ${transactionStatus}`);

    if (transactionStatus === 'SUCCESS' || transactionStatus === 'success') {
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // ⚡ PERBAIKAN: Mengambil User ID dari pemotongan string invoiceNumber
      if (!invoiceNumber || !invoiceNumber.includes('-')) {
        console.error("Format invoice tidak valid untuk ekstraksi ID.");
        return new Response('Invalid Invoice Format', { status: 400 });
      }

      const parts = invoiceNumber.split('-');
      const targetUserId = parts[1]; // Mengambil [USER_ID] dari struktur string

      console.log(`Mengeksekusi upgrade premium di Supabase untuk User ID: ${targetUserId}`);

      // ⚡ EKSEKUSI DATABASE: Mengubah level akun langsung tepat sasaran pada ID pengguna
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          account_level: 'PREMIUM', 
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId); // Pencocokan primary-key 'id' tabel profiles

      if (error) {
        console.error("Gagal mengupdate database via Webhook:", error.message);
        return new Response('Database Update Error', { status: 500 });
      }

      console.log(`[SUKSES] User ID ${targetUserId} berhasil bermutasi menjadi paket PREMIUM.`);

      return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response('Processed', { status: 200 });

  } catch (error: any) {
    console.error("💥 Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}