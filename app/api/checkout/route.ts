import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, productNames, buyerName, buyerEmail, buyerPhone } = await request.json();

    const va = process.env.IPAYMU_VA;
    const apiKey = process.env.IPAYMU_API_KEY;
    const url = process.env.IPAYMU_URL;

    if (!va || !apiKey || !url) {
      return NextResponse.json(
        { error: 'Kredensial iPaymu belum terpasang di Environment Variables Vercel/.env.local' },
        { status: 500 }
      );
    }

    // 1. Siapkan data body untuk dikirim ke iPaymu
    const body = {
      product: [productNames || 'Paket Premium Undangan'],
      qty: ['1'],
      price: [amount.toString()],
      returnUrl: 'https://undig.buanamedia.my.id/user', // Halaman kembali setelah sukses bayar
      cancelUrl: 'https://undig.buanamedia.my.id/premium', // Halaman jika batal
      notifyUrl: 'https://undig.buanamedia.my.id/api/callback-ipaymu', // Webhook pembaruan database otomatis
      name: buyerName || 'Pembeli Undangan',
      email: buyerEmail || 'customer@mail.com',
      phone: buyerPhone || '08123456789',
    };

    const jsonBody = JSON.stringify(body);
    
    // 2. Format enkripsi Signature SHA256 standar iPaymu
    const bodyHash = crypto.createHash('sha256').update(jsonBody).digest('hex').toLowerCase();
    const stringToSign = `POST:${va}:${bodyHash}:${apiKey}`;
    const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');

    // 3. Kirim data transaksi ke API Server iPaymu
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'va': va,
        'signature': signature,
      },
      body: jsonBody,
    });

    const result = await response.json();

    // Jika iPaymu sukses membuatkan tautan pembayaran
    if (result && result.status === 200) {
      return NextResponse.json({ paymentUrl: result.data.url });
    } else {
      return NextResponse.json({ error: result?.message || 'Gagal dari server iPaymu' }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal internal server' }, { status: 500 });
  }
}