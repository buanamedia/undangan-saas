import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase keys' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const body = await request.json();
    const { userId, currentStatus, packagePlan = '1_MONTH', durationMonths = 1 } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID Pengguna tidak valid' }, { status: 400 });
    }

    const nextStatus = !currentStatus;

    let updateData: any = {};

    if (nextStatus) {
      // 🟢 JIKA DI-UPGRADE KE PREMIUM
      let expiresAt: string | null = null;
      if (durationMonths && durationMonths > 0) {
        const now = new Date();
        now.setMonth(now.getMonth() + durationMonths);
        expiresAt = now.toISOString();
      }

      updateData = {
        is_premium: true,
        package_plan: packagePlan,
        premium_expires_at: expiresAt,
      };
    } else {
      // 🔴 JIKA DIBATALKAN KE FREE
      updateData = {
        is_premium: false,
        package_plan: 'FREE',
        premium_expires_at: null,
      };
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Status berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}