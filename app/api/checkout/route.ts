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
    
    // Ambil kode murni (bersihkan dari flag internal _FIXED_ jika ada)
    let rawVoucher = bodyData.voucherCode ? String(bodyData.voucherCode).trim() : null;
    if (rawVoucher && rawVoucher.includes('_FIXED_')) {
      rawVoucher = rawVoucher.split('_FIXED_')[0];
    }
    const targetVoucherCode = rawVoucher ? rawVoucher.toUpperCase() : null;

    // 🟢 Invoice Unik dengan Timestamp Angka Murni untuk invoice_number
    const currentTimestamp = Date.now();
    const orderId = bodyData.orderId || `INV-${directUserId || 'GUEST'}-${currentTimestamp}`;

    // 🟢 Tangkap Paket & Durasi
    const packageId = bodyData.packageId || '6_MONTHS'; 
    let durationMonths: number | null = 6;

    if (bodyData.durationMonths !== undefined && bodyData.durationMonths !== null) {
      durationMonths = Number(bodyData.durationMonths);
    } else {
      if (packageId === '1_YEAR') durationMonths = 12;
      else if (packageId === '6_MONTHS') durationMonths = 6;
      else if (packageId === '3_MONTHS') durationMonths = 3;
      else if (packageId === '1_MONTH') durationMonths = 1;
      else durationMonths = null;
    }

    const clientId = process.env.DOKU_CLIENT_ID!;
    const secretKey = process.env.DOKU_SECRET_KEY!;
    const isProd = process.env.DOKU_IS_PRODUCTION === 'true';
    
    const baseUrl = isProd ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
    const targetPath = '/checkout/v1/payment';
    
    const timestamp = new Date().toISOString().slice(0, 19) + 'Z';
    const requestId = `REQ-${orderId}-${currentTimestamp}`;

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

        // 🟢 1. SIMPAN TRANSAKSI BARU KE DATABASE
        const { error: insertError } = await supabaseAdmin
          .from('transactions')
          .insert([
            {
              user_id: directUserId,
              amount: amount,
              status: 'pending',
              invoice: orderId,                          // e.g. "INV-uuid-1234567"
              invoice_number: currentTimestamp,          // e.g. 1234567 (int8)
              voucher: targetVoucherCode,
              package_id: packageId,                     // e.g. '6_MONTHS'
              duration_months: durationMonths,           // e.g. 6
              created_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error("💥 GAGAL INSERT TRANSAKSI TO SUPABASE:", insertError.message);
        } else {
          console.log("✅ TRANSAKSI BERHASIL DICATAT KE DATABASE!");
        }

        // 🟢 2. PENINGKATAN AMAN PEMAKAIAN VOUCHER (MEMERIKSA KUOTA TERLEBIH DAHULU)
        if (targetVoucherCode && targetVoucherCode !== "") {
          const { data: voucherData, error: voucherFetchError } = await supabaseAdmin
            .from('vouchers')
            .select('uses_count, max_uses, is_active')
            .eq('code', targetVoucherCode)
            .maybeSingle();

          if (!voucherFetchError && voucherData) {
            const currentUses = Number(voucherData.uses_count) || 0;
            const maxUses = Number(voucherData.max_uses) || 0;
            const isActive = voucherData.is_active !== false;

            // Hanya tambah hitungan jika voucher AKTIF dan KUOTA MASIH TERSEDIA
            if (isActive && (maxUses === 0 || currentUses < maxUses)) {
              await supabaseAdmin
                .from('vouchers')
                .update({ uses_count: currentUses + 1 })
                .eq('code', targetVoucherCode);

              console.log(`✅ Voucher ${targetVoucherCode} berhasil diupdate: ${currentUses + 1}/${maxUses}`);
            } else {
              console.warn(`⚠️ Voucher ${targetVoucherCode} tidak diupdate karena kuota penuh atau tidak aktif.`);
            }
          }
        }
      }

      return NextResponse.json({ success: true, url: data.response.payment.url });
    } else {
      return NextResponse.json({ success: false, message: 'Gagal mendapatkan link pembayaran DOKU' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}