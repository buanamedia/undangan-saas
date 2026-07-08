import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Fungsi helper pembuat Signature resmi DOKU Checkout
function generateDokuSignature(clientId: string, requestId: string, timestamp: string, targetPath: string, bodyPayload: string, secretKey: string) {
  const digest = crypto.createHash('sha256').update(bodyPayload).digest('base64');
  const rawSignature = 
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${targetPath}\n` +
    `Digest:${digest}`;

  return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('base64');
}

export async function POST(request: Request) {
  try {
    const { orderId, amount, customerName, customerEmail } = await request.json();

    const clientId = process.env.DOKU_CLIENT_ID!;
    const secretKey = process.env.DOKU_SECRET_KEY!;
    const isProd = process.env.DOKU_IS_PRODUCTION === 'true';
    
    const baseUrl = isProd ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
    const targetPath = '/checkout/v1/payment';
    
    const timestamp = new Date().toISOString().slice(0, 19) + 'Z';
    const requestId = `REQ-${orderId}-${Date.now()}`;

    // Pemetaan data ke struktur JSON DOKU Checkout
    const bodyPayload = JSON.stringify({
      order: {
        invoice_number: orderId,
        amount: amount,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/user`, // Mengarahkan kembali ke dashboard /user setelah bayar sukses
      },
      customer: {
        name: customerName,
        email: customerEmail,
      },
      payment: {
        payment_due_date: 60, // Batas waktu bayar (menit)
      }
    });

    const signature = generateDokuSignature(clientId, requestId, timestamp, targetPath, bodyPayload, secretKey);

    const response = await fetch(`${baseUrl}${targetPath}`, {
      method: 'POST',
      headers: {
        'Client-Id': clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        'Signature': `HMACSHA256=${signature}`,
        'Content-Type': 'application/json',
      },
      body: bodyPayload,
    });

    const data = await response.json();

    // Mengambil payment URL untuk di-redirect di sisi frontend
    if (data.response?.payment?.url) {
      return NextResponse.json({ success: true, url: data.response.payment.url });
    } else {
      return NextResponse.json({ success: false, message: 'Gagal mendapatkan link pembayaran dari DOKU' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}