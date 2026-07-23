import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const invoiceNumber = body.order?.invoice_number;
    const transactionStatus = body.transaction?.status || body.transaction_status;

    console.log(`[DOKU WEBHOOK] Invoice: ${invoiceNumber} | Status: ${transactionStatus}`);

    if (transactionStatus === 'SUCCESS' || transactionStatus === 'success' || transactionStatus === 'SUCCESSFUL') {
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      if (!invoiceNumber) {
        return new Response('Invoice missing', { status: 400 });
      }

      // 1. CARI TRANSAKSI DARI DATABASE
      const { data: existingTrx } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('invoice', invoiceNumber)
        .maybeSingle();

      // Ekstraksi User ID
      let targetUserId = existingTrx?.user_id;

      if (!targetUserId && invoiceNumber.startsWith('INV-')) {
        const cleanStr = invoiceNumber.replace('INV-', ''); 
        const lastDashIndex = cleanStr.lastIndexOf('-'); 
        targetUserId = cleanStr.substring(0, lastDashIndex);
      }

      if (!targetUserId) {
        return new Response('User ID not found', { status: 404 });
      }

      // 🟢 2. PENENTUAN PAKET & DURASI BULAN (DENGAN STRICT MAPPING)
      let rawPackageId = existingTrx?.package_id || '1_YEAR';
      let durationMonths: number | null = existingTrx?.duration_months !== undefined && existingTrx?.duration_months !== null
        ? Number(existingTrx.duration_months)
        : null;

      // Jika durationMonths tidak terbaca dari transaksi, petakan paksa dari package_id
      if (durationMonths === null) {
        if (rawPackageId === '1_YEAR') durationMonths = 12;
        else if (rawPackageId === '6_MONTHS') durationMonths = 6;
        else if (rawPackageId === '3_MONTHS') durationMonths = 3;
        else if (rawPackageId === '1_MONTH') durationMonths = 1;
        else if (rawPackageId === 'UNLIMITED') durationMonths = null;
        else durationMonths = 12; // Default jika dari frontend '1_YEAR'
      }

      // 🟢 3. AMBIL PROFIL USER SAAT INI
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('package_plan, premium_expires_at')
        .eq('id', targetUserId)
        .maybeSingle();

      // 🟢 4. HITUNG TANGGAL EXPIRED (TIDAK BOLEH NULL UNTUK 12 BULAN)
      let expiresAtIso: string | null = null;

      if (durationMonths && durationMonths > 0) {
        let baseDate = new Date();

        // Jika akun masih aktif, akumulasi dari tanggal kadaluarsa lama
        if (currentProfile?.premium_expires_at) {
          const oldExpiry = new Date(currentProfile.premium_expires_at);
          if (oldExpiry > baseDate) {
            baseDate = oldExpiry;
          }
        }

        baseDate.setMonth(baseDate.getMonth() + durationMonths);
        expiresAtIso = baseDate.toISOString();
      } else {
        expiresAtIso = null; // Khusus Unlimited
      }

      // 🟢 5. UPDATE PROFILES DENGAN NAMA PAKET & EXPIRED DATE PERSISI
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_premium: true,
          package_plan: rawPackageId, // misal '1_YEAR'
          premium_expires_at: expiresAtIso // Tanggal 12 bulan ke depan
        })
        .eq('id', targetUserId); 

      if (updateError) {
        console.error("[DOKU WEBHOOK] Update Profile Error:", updateError.message);
        return new Response(`Update Error: ${updateError.message}`, { status: 500 });
      }

      // 6. UPDATE TRANSAKSI JADI SUCCESS
      await supabaseAdmin
        .from('transactions') 
        .update({ status: 'SUCCESS' })
        .eq('invoice', invoiceNumber);

      console.log(`✅ [SUKSES WEBHOOK] User ${targetUserId} diperbarui ke ${rawPackageId}. Expired: ${expiresAtIso}`);

      return new Response('OK', { status: 200 });
    }

    return new Response('Processed', { status: 200 });

  } catch (error: any) {
    console.error("💥 Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}