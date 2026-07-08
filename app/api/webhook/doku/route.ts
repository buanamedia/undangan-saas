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

      // 1. Ekstraksi UUID Supabase secara utuh
      const cleanStr = invoiceNumber.replace('INV-', ''); 
      const lastDashIndex = cleanStr.lastIndexOf('-'); 
      const targetUserId = cleanStr.substring(0, lastDashIndex); 

      console.log(`Mengeksekusi upgrade premium di Supabase untuk User ID: ${targetUserId}`);

      // 2. UPDATE STATUS USER MENJADI PREMIUM PADA TABEL PROFILES
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_premium: true
        })
        .eq('id', targetUserId); 

      if (updateError) {
        console.error("Gagal mengupdate database via Webhook:", updateError.message);
        return new Response(`Database Update Error: ${updateError.message}`, { status: 500 });
      }

      // 3. AMBIL NOMINAL DAN CONVERT KE ANGKA AMAN
      const amountPaid = Number(body.order?.amount);

      // Ambil angka timestamp di paling belakang invoice untuk disimpan ke kolom invoice_number yang bertipe bigint
      const invoiceParts = invoiceNumber.split('-');
      const numericInvoice = Number(invoiceParts[invoiceParts.length - 1]); // Mengambil angka timestamp murni (misal: 1783485371060)

      // 4. MASUKKAN LOG RIWAYAT BARU KE TABEL TRANSACTIONS 
      const { error: logError } = await supabaseAdmin
        .from('transactions') 
        .insert({
          user_id: targetUserId,
          invoice_number: numericInvoice, // Menggunakan angka murni agar tidak memicu eror syntax bigint
          amount: amountPaid,             // Nominal angka asli (misal: 25000)
          status: 'SUCCESS',
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.error("Gagal mencatat log transaksi ke tabel admin:", logError.message);
      }

      console.log(`[SUKSES] User ID ${targetUserId} diperbarui ke PREMIUM & nominal Rp ${amountPaid} tercatat.`);

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