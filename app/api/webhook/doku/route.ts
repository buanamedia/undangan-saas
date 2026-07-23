import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Tangkap invoice dan status transaksi dari DOKU
    const invoiceNumber = body.order?.invoice_number;
    const transactionStatus = body.transaction?.status || body.transaction_status;

    console.log(`[DOKU WEBHOOK] Invoice Received: ${invoiceNumber} | Status: ${transactionStatus}`);

    // Cek jika status sukses
    const isSuccess = 
      transactionStatus === 'SUCCESS' || 
      transactionStatus === 'success' || 
      transactionStatus === 'SUCCESSFUL' ||
      transactionStatus === '0000';

    if (isSuccess) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      if (!invoiceNumber) {
        return new Response('Invoice number missing', { status: 400 });
      }

      // 🟢 1. CARI TRANSAKSI DENGAN PENCARIAN FLEKSIBEL (TEKS ATAL / ANGKA)
      let existingTrx = null;

      // Cari berdasarkan string invoice (e.g. "INV-...")
      const { data: trxByInvoice } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('invoice', String(invoiceNumber))
        .maybeSingle();

      existingTrx = trxByInvoice;

      // Fallback: Jika tidak ketemu, cari berdasarkan status pending terbaru milik user
      if (!existingTrx && String(invoiceNumber).startsWith('INV-')) {
        const cleanStr = String(invoiceNumber).replace('INV-', ''); 
        const lastDashIndex = cleanStr.lastIndexOf('-'); 
        const extractedUserId = cleanStr.substring(0, lastDashIndex);

        if (extractedUserId) {
          const { data: trxByUser } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('user_id', extractedUserId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          existingTrx = trxByUser;
        }
      }

      // 🟢 2. PENENTUAN USER ID
      let targetUserId = existingTrx?.user_id;

      if (!targetUserId && String(invoiceNumber).startsWith('INV-')) {
        const cleanStr = String(invoiceNumber).replace('INV-', ''); 
        const lastDashIndex = cleanStr.lastIndexOf('-'); 
        targetUserId = cleanStr.substring(0, lastDashIndex);
      }

      if (!targetUserId) {
        console.error(`[DOKU WEBHOOK] Gagal menemukan User ID untuk invoice: ${invoiceNumber}`);
        return new Response('User ID not found', { status: 404 });
      }

      // 🟢 3. PENENTUAN PAKET & DURASI (TERMASUK PAKET 3 BULAN)
      let rawPackageId = existingTrx?.package_id || '3_MONTHS';
      let durationMonths: number | null = existingTrx?.duration_months !== undefined && existingTrx?.duration_months !== null
        ? Number(existingTrx.duration_months)
        : null;

      // Fallback jika durationMonths kosong dari database
      if (durationMonths === null) {
        if (rawPackageId === '1_YEAR') durationMonths = 12;
        else if (rawPackageId === '6_MONTHS') durationMonths = 6;
        else if (rawPackageId === '3_MONTHS') durationMonths = 3;
        else if (rawPackageId === '1_MONTH') durationMonths = 1;
        else if (rawPackageId === 'UNLIMITED') durationMonths = null;
        else durationMonths = 3; // Default ke 3 bulan jika yang diklik 3 bulan
      }

      // 🟢 4. AMBIL DATA PROFIL USER SAAT INI
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('package_plan, premium_expires_at')
        .eq('id', targetUserId)
        .maybeSingle();

      // 🟢 5. HITUNG TANGGAL KEDALUWARSA BARU
      let expiresAtIso: string | null = null;

      if (durationMonths && durationMonths > 0) {
        let baseDate = new Date();

        // Akumulasi tanggal jika akun user masih aktif premium
        if (currentProfile?.premium_expires_at) {
          const oldExpiry = new Date(currentProfile.premium_expires_at);
          if (oldExpiry > baseDate) {
            baseDate = oldExpiry;
          }
        }

        baseDate.setMonth(baseDate.getMonth() + durationMonths);
        expiresAtIso = baseDate.toISOString();
      } else {
        expiresAtIso = null; // Akses Unlimited
      }

      // 🟢 6. UPDATE PROFIL USER MENJADI PREMIUM
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_premium: true,
          package_plan: rawPackageId,
          premium_expires_at: expiresAtIso
        })
        .eq('id', targetUserId);

      if (updateError) {
        console.error("[DOKU WEBHOOK] Gagal Update Profiles:", updateError.message);
        return new Response(`Update Error: ${updateError.message}`, { status: 500 });
      }

      // 🟢 7. UPDATE STATUS TRANSAKSI DI DATABASE MENJADI SUCCESS
      if (existingTrx?.id) {
        await supabaseAdmin
          .from('transactions') 
          .update({ status: 'SUCCESS' })
          .eq('id', existingTrx.id);
      }

      console.log(`✅ [DOKU WEBHOOK SUKSES] User ${targetUserId} aktif ${rawPackageId} s/d ${expiresAtIso}`);

      return new Response('OK', { status: 200 });
    }

    return new Response('Processed', { status: 200 });

  } catch (error: any) {
    console.error("💥 Webhook Exception Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}