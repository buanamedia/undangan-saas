import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Membaca data invoice dan status transaksi dari payload JSON DOKU
    const invoiceNumber = body.order?.invoice_number;
    const transactionStatus = body.transaction?.status; // Nilai sukses dari DOKU adalah "SUCCESS"

    if (transactionStatus === 'SUCCESS') {
      // ⚡ LOGIKA DATABASE ANDA DI SINI
      // Lakukan pembaruan status transaksi / user login menjadi PREMIUM / AKTIF berdasarkan invoiceNumber
      console.log(`Invoice ${invoiceNumber} berhasil dibayar melalui DOKU.`);
      
      // DOKU mewajibkan respons teks "OK" dengan kode HTTP 200 sebagai tanda callback sukses diterima
      return new Response('OK', { status: 200 });
    }

    return new Response('Notification Received but status not success', { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}