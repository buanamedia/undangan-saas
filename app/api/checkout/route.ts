export const dynamic = 'force-dynamic'; // Mencegah Vercel meng-cache API Route ini

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, productNames, buyerName, buyerEmail, buyerPhone } = await request.json();

    const va = process.env.IPAYMU_VA;
    const apiKey = process.env.IPAYMU_API_KEY;
    const url = process.env.IPAYMU_URL || 'https://my.ipaymu.com/api/v2/payment';

    if (!va || !apiKey) {
      return NextResponse.json(
        { error: 'Kredensial iPaymu (VA / API Key) belum terpasang di Environment Variables Vercel.' },
        { status: 500 }
      );
    }

    // ⚡ PERBAIKAN VALIDASI EMAIL: Memastikan email pembeli bersih dari spasi dan menggunakan email asli user
    const cleanedEmail = buyerEmail ? buyerEmail.trim() : '';
    
    // Pola pengecekan format email standar regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanedEmail || !emailRegex.test(cleanedEmail)) {
      return NextResponse.json(
        { error: `Format email pembeli tidak valid (${buyerEmail || 'Kosong'}). Silakan perbarui profil akun Anda.` },
        { status: 400 }
      );
    }

    // Bersihkan juga nomor telepon (iPaymu meminta format string angka bersih)
    const cleanedPhone = buyerPhone ? buyerPhone.replace(/[^0-9]/g, '') : '08123456789';

    // 1. Siapkan data body persis seperti standarisasi iPaymu API v2
    const body = {
      product: [productNames || 'Paket Premium Undangan'],
      qty: ['1'],
      price: [amount.toString()],
      returnUrl: 'https://undig.buanamedia.my.id/user',
      cancelUrl: 'https://undig.buanamedia.my.id/premium',
      notifyUrl: 'https://undig.buanamedia.my.id/api/callback-ipaymu',
      name: buyerName || 'Pembeli Undangan',
      email: cleanedEmail, // Menggunakan email asli yang sudah divalidasi bersih
      phone: cleanedPhone.length >= 9 ? cleanedPhone : '08123456789',
    };

    const jsonBody = JSON.stringify(body);
    
    // 2. Format enkripsi Signature SHA256 murni standar iPaymu (Bukan HMAC)
    const bodyHash = crypto.createHash('sha256').update(jsonBody).digest('hex').toLowerCase();
    
    // Format rumus gabungan: va + ":" + bodyHash + ":" + apiKey
    const stringToSign = `${va}:${bodyHash}:${apiKey}`;
    
    // Hasil akhir signature dalam bentuk string lowercase
    const signature = crypto.createHash('sha256').update(stringToSign).digest('hex').toLowerCase();

    // 3. Kirim request transaksi ke Server iPaymu
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'va': String(va),
        'signature': String(signature),
      },
      body: jsonBody,
    });

    const result = await response.json();

    // Jika iPaymu sukses membuatkan tautan sesi transaksi
    if (result && result.status === 200) {
      return NextResponse.json({ paymentUrl: result.data.url });
    } else {
      return NextResponse.json(
        { error: result?.message || 'Ditolak atau gagal dari sistem iPaymu' }, 
        { status: response.status }
      );
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal internal server' }, { status: 500 });
  }
}