import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { userId } = await request.json();
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invs } = await supabaseAdmin
    .from('invitations')
    .select('gallery_images, bg_music_url, custom_details')
    .eq('user_id', userId);

  if (invs) {
    for (const inv of invs) {
      const filesToDelete: string[] = [];

      // 1. Kumpulkan file dari galeri
      if (inv.gallery_images && Array.isArray(inv.gallery_images)) {
        inv.gallery_images.forEach(url => filesToDelete.push(url.split('/').pop()!));
      }
      
      // 2. Kumpulkan file musik
      if (inv.bg_music_url) {
        filesToDelete.push(inv.bg_music_url.split('/').pop()!);
      }

      // 3. Kumpulkan file dari custom_details (COVER & FOTO BAWAH)
      if (inv.custom_details) {
        const cd = inv.custom_details;
        if (cd.cover_photo_url) filesToDelete.push(cd.cover_photo_url.split('/').pop()!);
        if (cd.profile_bottom_photo_url) filesToDelete.push(cd.profile_bottom_photo_url.split('/').pop()!);
      }

      // Hapus semua file yang terkumpul sekaligus
      if (filesToDelete.length > 0) {
        await supabaseAdmin.storage.from('gallery').remove(filesToDelete.filter(f => !f.includes('.mp3')));
        await supabaseAdmin.storage.from('music').remove(filesToDelete.filter(f => f.includes('.mp3')));
      }
    }
  }

  return NextResponse.json({ success: true });
}