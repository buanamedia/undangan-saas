// lib/themes/demo-data.ts

export const getDemoDataByType = (type: string) => {
  const isDualGroom = type === 'pernikahan' || type === 'lamaran';

  // Base data multimedia & kado yang seragam
  const baseData = {
    id: `demo-${type}`,
    type: type,
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    gallery_images: [
      'https://picsum.photos/id/1015/400/300',
      'https://picsum.photos/id/1016/400/300',
      'https://picsum.photos/id/1018/400/300',
      'https://picsum.photos/id/1019/400/300'
    ],
    gift_accounts: [
      { bank: 'BCA', number: '1234567890', name: 'Fitri Handayani' },
      { bank: 'Mandiri', number: '0987654321', name: 'Jaka Prasetya' }
    ]
  };

  if (isDualGroom) {
    return {
      ...baseData,
      title: `${type === 'pernikahan' ? 'Walimatul Ursy' : 'Lamaran Khitbah'}: Fitri & Jaka`,
      groom_name: 'Jaka Prasetya, S.T.',
      bride_name: 'Fitri Handayani, S.Kom.',
      event_date: '2027-12-25 09:00:00',
      location_address: 'Gedung Serbaguna Jakarta, Jl. Jend. Sudirman No. 12, Jakarta Selatan',
      custom_details: {
        website_desc: `Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di momen bahagia ${type} kami.`,
        cover_prolog: 'Buka Undangan Spesial',
        cover_photo_url: 'https://picsum.photos/id/1006/600/800',
        profile_prolog: 'Kisah kasih yang tumbuh atas dasar restu dan doa tulus dari kedua belah pihak keluarga.',
        profile_bottom_photo_url: 'https://picsum.photos/id/1005/500/350',
        event_block_title: type === 'pernikahan' ? 'Akad Nikah' : 'Acara Lamaran',
        event_prolog: `Dengan memohon rahmat Allah SWT, kami bermaksud menyelenggarakan acara ${type} kami.`,
        reception_date: type === 'pernikahan' ? '2027-12-25 11:00:00' : null,
        reception_address: type === 'pernikahan' ? 'Ballroom Utama Lt. 3, Gedung Serbaguna Jakarta' : '',
        reception_maps_url: '',
        gallery_prolog: 'Momen berharga yang berhasil terekam dalam perjalanan kami.',
        video_prolog: 'Saksikan cuplikan kebahagiaan kami.',
        gift_prolog: 'Bagi keluarga dan kerabat yang ingin memberikan tanda kasih digital.',
        gift_way: 'Silakan transfer langsung ke nomor rekening tertera di bawah.',
        custom_title: 'Turut Mengundang',
        custom_prolog: 'Seluruh keluarga besar',
        custom_content: '- Keluarga Besar Kedua Mempelai\n- Sahabat & Rekan Kerja'
      }
    };
  }

  // Fallback Otomatis untuk Seluruh Acara Lain di Gambar (Akikah, Ultah, Haji, Wisuda, dll)
  const formatTitle = () => {
    switch(type) {
      case 'akikah': return 'Tasyakuran Aqiqah: Muhammad Al-Fatih';
      case 'ulang-tahun': return 'Birthday Party: Sweet 17th Rian';
      case 'wisuda': return 'Syukuran Wisuda: Rian Hidayat, S.Kom';
      case 'halalbihalal': return 'Halalbihalal & Silaturahmi Akbar';
      case 'khitanan': return 'Tasyakuran Khitanan: Ade Irma';
      case 'peresmian': return 'Grand Opening & Peresmian Kantor';
      case 'syukuran': return 'Syukuran Keberangkatan Umrah / Haji';
      default: return `Acara Acara: ${type.toUpperCase()}`;
    }
  };

  return {
    ...baseData,
    title: formatTitle(),
    groom_name: '',
    bride_name: '',
    event_date: '2027-12-25 09:00:00',
    location_address: 'Grand Ballroom Resto & Cafe Green Garden, Blok C No. 7, Jakarta',
    custom_details: {
      website_desc: `Kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri momentum khidmat perayaan ${type} yang kami selenggarakan.`,
      cover_prolog: 'Buka Undangan',
      cover_photo_url: 'https://picsum.photos/id/1024/600/800',
      profile_prolog: `Ungkapan syukur yang mendalam atas terselenggaranya momentum ${type} ini.`,
      profile_bottom_photo_url: 'https://picsum.photos/id/1062/500/350',
      event_block_title: `PERAYAAN ${type.toUpperCase()}`,
      event_prolog: 'Berikut adalah rincian informasi waktu dan lokasi pelaksanaan acara:',
      reception_date: null,
      reception_address: '',
      reception_maps_url: '',
      gallery_prolog: 'Dokumentasi momen berharga.',
      video_prolog: '',
      gift_prolog: 'Tanda kasih digital dapat disalurkan melalui rekening di bawah ini.',
      gift_way: 'Transfer dana kado digital.',
      custom_title: 'Informasi Tambahan',
      custom_prolog: 'Catatan untuk tamu undangan',
      custom_content: 'Kehadiran dan doa restu Bapak/Ibu/Saudara/i merupakan kehormatan besar bagi kami.'
    }
  };
};

export const demoWishesMock = [
  { name: 'Fitri', relation: 'Teman Kantor', address: 'Jakarta Selatan', message: 'Selamat. Semoga acaranya berjalan dengan lancar dan penuh berkah.', attendance: 'hadir', created_at: '2026-02-19 14:00:00' },
  { name: 'Budi Santoso', relation: 'Keluarga', address: 'Bandung', message: 'Selamat ya! Doa terbaik dari kami sekeluarga untuk kelancaran acaranya.', attendance: 'hadir', created_at: '2026-06-15 09:30:00' }
];