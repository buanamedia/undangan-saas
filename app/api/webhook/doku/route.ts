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

      if (!invoiceNumber || !invoiceNumber.startsWith('INV-')) {
        console.error("Format invoice tidak valid.");
        return new Response('Invalid Invoice Format', { status: 400 });
      }

      // ⚡ PERBAIKAN LOGIKA: Ekstraksi UUID Supabase secara utuh (menghapus awalan 'INV-' dan akhiran timestamp)
      // Contoh string: INV-561652b6-b55b-435e-86dc-0f3a3552a0ba-1783485371060
      const cleanStr = invoiceNumber.replace('INV-', ''); // Menghilangkan 'INV-'
      const lastDashIndex = cleanStr.lastIndexOf('-'); // Mencari batas timestamp terakhir
      const targetUserId = cleanStr.substring(0, lastDashIndex); // Mengambil UUID penuh

      console.log(`Mengeksekusi upgrade premium di Supabase untuk User ID: ${targetUserId}`);

      // ⚡ PERBAIKAN KOLOM DATABASE: Mengubah 'is_premium' menjadi true sesuai skema tabel Supabase Anda
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_premium: true
        })
        .eq('id', targetUserId); 

      if (error) {
        console.error("Gagal mengupdate database via Webhook:", error.message);
        return new Response(`Database Update Error: ${error.message}`, { status: 500 });
      }

      console.log(`[SUKSES] User ID ${targetUserId} berhasil diperbarui menjadi PREMIUM (is_premium = true).`);

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