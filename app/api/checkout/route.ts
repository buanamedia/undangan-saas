import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function generateDokuSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  targetPath: string,
  bodyPayload: string,
  secretKey: string
) {
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
    const bodyData = await request.json();
    const directUserId = bodyData.userId || null;
    const amount = bodyData.amount;
    const customerName = bodyData.customerName;
    const customerEmail = bodyData.customerEmail;
    const targetVoucherCode = bodyData.voucherCode ? String(bodyData.voucherCode).trim() : null;

    // 🟢 1. FORMAT INVOICE SELALU UNIK (GABUNGAN USER ID & TIMESTAMP)
    const orderId = bodyData.orderId || `INV-${directUserId || 'GUEST'}-${Date.now()}`;

    // 🟢 2. PENENTUAN PAKET & DURASI SEBERSIH MUNGKIN
    const packageId = bodyData.packageId || '1_YEAR'; 
    let durationMonths: number | null = null;

    if (bodyData.durationMonths !== undefined && bodyData.durationMonths !== null) {
      durationMonths = Number(bodyData.durationMonths);
    } else {
      if (packageId === '1_YEAR') durationMonths = 12;
      else if (packageId === '6_MONTHS') durationMonths = 6;
      else if (packageId === '3_MONTHS') durationMonths = 3;
      else if (packageId === '1_MONTH') durationMonths = 1;
      else durationMonths = null; // UNLIMITED
    }

    const clientId = process.env.DOKU_CLIENT_ID!;
    const secretKey = process.env.DOKU_SECRET_KEY!;
    const isProd = process.env.DOKU_IS_PRODUCTION === 'true';
    
    const baseUrl = isProd ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
    const targetPath = '/checkout/v1/payment';
    
    const timestamp = new Date().toISOString().slice(0, 19) + 'Z';
    const requestId = `REQ-${orderId}-${Date.now()}`;

    const bodyPayload = JSON.stringify({
      order: { 
        invoice_number: orderId, 
        amount: amount, 
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/user` 
      },
      customer: { name: customerName, email: customerEmail },
      payment: { payment_due_date: 60 }
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

    if (data.response?.payment?.url) {
      if (directUserId) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });

        // 🟢 3. CATAT BARIS TRANSAKSI BARU (TIDAK ADA PENGHAPUSAN KODE LAMA)
        const { error: insertError } = await supabaseAdmin
          .from('transactions')
          .insert([
            {
              user_id: directUserId,
              amount: amount,
              status: 'pending',
              invoice: orderId,
              voucher: targetVoucherCode,
              package_id: packageId,           // e.g. '1_YEAR'
              duration_months: durationMonths, // e.g. 12
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error("💥 Gagal mencatat log transaksi baru:", insertError.message);
        }

        // 🟢 4. UPDATE HITUNGAN PENGGUNAAN VOUCHER
        if (targetVoucherCode && targetVoucherCode !== "") {
          const { data: currentVoucher } = await supabaseAdmin
            .from('vouchers')
            .select('uses_count')
            .eq('code', targetVoucherCode)
            .maybeSingle();

          if (currentVoucher) {
            const baseCount = Number(currentVoucher.uses_count) || 0;
            await supabaseAdmin
              .from('vouchers')
              .update({ uses_count: baseCount + 1 })
              .eq('code', targetVoucherCode);
          }
        }
      }

      return NextResponse.json({ success: true, url: data.response.payment.url });
    } else {
      return NextResponse.json({ success: false, message: 'Gagal mendapatkan link pembayaran dari DOKU' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}