import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const invoiceNumber = body.order?.invoice_number; // Format: INV-[USER_ID]-[TIMESTAMP]
    const transactionStatus = body.transaction?.status || body.transaction_status;

    console.log(`Menerima Webhook DOKU. Invoice: ${invoiceNumber} | Status: ${transactionStatus}`);

    if (transactionStatus === 'SUCCESS' || transactionStatus === 'success' || transactionStatus === 'SUCCESSFUL') {
      
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

      // 2. AMBIL DATA TRANSAKSI AWAL UNTUK BACA DURASI PAKET
      const { data: existingTrx, error: trxFetchError } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('invoice', invoiceNumber)
        .maybeSingle();

      let durationMonths: number | null = null;
      let packagePlan: string = 'PREMIUM';

      if (existingTrx) {
        durationMonths = existingTrx.duration_months !== undefined ? existingTrx.duration_months : null;
        packagePlan = existingTrx.package_id || 'PREMIUM';
      }

      // 🟢 3. AMBIL PROFIL USER SAAT INI UNTUK AKUMULASI TANGGAL
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('package_plan, premium_expires_at')
        .eq('id', targetUserId)
        .maybeSingle();

      // 🟢 4. HITUNG TANGGAL KADALUARSA (SMART EXPIRY CALCULATION)
      let expiresAtIso: string | null = null;
      const durationNum = Number(durationMonths);

      if (durationMonths !== null && durationNum > 0) {
        let baseDate = new Date();

        // Jika user masih punya tanggal kadaluarsa aktif, tambahkan dari tanggal kadaluarsa lama tersebut
        if (currentProfile?.premium_expires_at) {
          const oldExpiry = new Date(currentProfile.premium_expires_at);
          if (oldExpiry > baseDate) {
            baseDate = oldExpiry;
          }
        }

        baseDate.setMonth(baseDate.getMonth() + durationNum);
        expiresAtIso = baseDate.toISOString();
      } else {
        // Jika UNLIMITED / LIFETIME (durationMonths === null atau 0)
        expiresAtIso = null;
      }

      // 5. UPDATE PROFIL USER (is_premium, package_plan, & premium_expires_at)
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          is_premium: true,
          package_plan: packagePlan,
          premium_expires_at: expiresAtIso
        })
        .eq('id', targetUserId); 

      if (updateError) {
        console.error("Gagal mengupdate database via Webhook:", updateError.message);
        return new Response(`Database Update Error: ${updateError.message}`, { status: 500 });
      }

      // 6. UPDATE STATUS TRANSAKSI MENJADI 'SUCCESS'
      const { error: logError } = await supabaseAdmin
        .from('transactions') 
        .update({
          status: 'SUCCESS',
        })
        .eq('invoice', invoiceNumber);

      // Backup jika transaksi belum ada di DB (Insert log baru)
      if (logError || !existingTrx) {
        const amountPaid = Number(body.order?.amount);
        const invoiceParts = invoiceNumber.split('-');
        const numericInvoice = Number(invoiceParts[invoiceParts.length - 1]);

        await supabaseAdmin
          .from('transactions') 
          .insert({
            user_id: targetUserId,
            invoice: invoiceNumber,
            invoice_number: numericInvoice, 
            amount: amountPaid,             
            status: 'SUCCESS',
            package_id: packagePlan,
            duration_months: durationMonths,
            created_at: new Date().toISOString()
          });
      }

      console.log(`[SUKSES] User ID ${targetUserId} diperbarui ke ${packagePlan}. Expired: ${expiresAtIso || 'Lifetime'}`);

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