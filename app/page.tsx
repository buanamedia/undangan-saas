// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    { icon: '🎨', title: 'Desain Premium & Elegan', desc: 'Banyak pilihan tema modern dan minimalis yang bisa disesuaikan dengan konsep acara Anda.' },
    { icon: '🎵', title: 'Musik Latar Belakang', desc: 'Tambahkan musik romantis atau lagu favorit pilihan Anda untuk menghidupkan suasana undangan.' },
    { icon: '📩', title: 'Tautan Nama Kustom', desc: 'Kirim undangan dengan mencantumkan nama penerima secara otomatis agar terasa lebih personal.' },
    { icon: '📍', title: 'Peta Lokasi Interaktif', desc: 'Integrasi langsung dengan Google Maps memudahkan para tamu mencari rute terbaik menuju lokasi.' },
    { icon: '💬', title: 'Buku Tamu & RSVP', desc: 'Pantau konfirmasi kehadiran serta kumpulkan doa/harapan terbaik langsung dari para undangan.' },
    { icon: '🎁', title: 'Kado Digital (Angpao)', desc: 'Sediakan rekening digital atau QR code e-wallet untuk mempermudah tamu memberikan tanda kasih.' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      
      {/* NAVBAR */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LOGO BRANDING BARU */}
          <div className="flex items-center gap-2">
            <img 
              src="/logo/Logo.png" 
              alt="Logo Undangan Digital" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">
                Undangan <span className="text-blue-700">Digital</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-wider mt-0.5">
                by Buanamedia
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/login')} 
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Masuk
            </button>
            <button 
              onClick={() => router.push('/user')} 
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Buat Undangan
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-50/40 via-white to-white py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-800 bg-blue-100/60 rounded-full border border-blue-200">
            ✨ Platform Undangan Digital No. 1 di Indonesia
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Buat Undangan Digital <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-sky-500">Mudah, Cepat & Elegan</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
            Bagikan kebahagiaan momen spesial Anda mulai dari Pernikahan, Ulang Tahun, Akikah, hingga Syukuran dalam hitungan menit dengan fitur terlengkap.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button 
              onClick={() => router.push('/user')} 
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer tracking-wide uppercase"
            >
              Mulai Buat Gratis
            </button>
            <button 
              onClick={() => router.push('/demo')} 
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs"
            >
              Lihat Katalog Demo
            </button>
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHTS */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fitur Canggih Untuk Momen Spesial Anda</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Semua kelengkapan yang Anda butuhkan untuk mempermudah distribusi undangan.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg select-none">
                  {feat.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-linear-to-r from-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-700/40 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">Siap Untuk Menyebarkan Kebahagiaan?</h2>
          <p className="text-blue-100/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Bergabunglah bersama ribuan pengguna lainnya yang telah mempercayakan momen terbaik mereka kepada platform kami.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => router.push('/user')} 
              className="px-8 py-3 bg-white hover:bg-slate-50 text-blue-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all tracking-wider uppercase cursor-pointer"
            >
              Mulai Sekarang Juga
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-8 bg-white text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex flex-col items-center justify-center gap-0.5">
            <p className="font-bold text-slate-700">Undangan Digital &copy; 2026</p>
            <p className="text-[10px] text-slate-400">by Buanamedia</p>
          </div>
          <p className="pt-1">Solusi Undangan Digital Elegan, Praktis, dan Tanpa Batas.</p>
        </div>
      </footer>

    </div>
  );
}