'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TermsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* NAVBAR (IDENTIK & SELARAS DENGAN HALAMAN LAINNYA) */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LOGO BRANDING */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
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

          {/* ⚡ PERBAIKAN DINAMIS: Tombol atas kanan menyesuaikan status login dengan skema warna konsisten */}
          <div className="flex items-center gap-3">
            {checkingAuth ? (
              <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-xl" />
            ) : isLoggedIn ? (
              <button 
                onClick={() => router.push('/user')} 
                className="px-[18px] py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer tracking-wide"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => router.push('/login')} 
                  className="px-[18px] py-2.5 bg-[#2d3d51] hover:bg-[#23303f] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs tracking-wide"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => router.push('/register')} 
                  className="px-[18px] py-2.5 bg-[#1d4ed8] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer tracking-wide"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA SYARAT & KETENTUAN */}
      <main className="grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
        
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Syarat & Ketentuan</h1>
            <p className="text-xs text-slate-400 mt-1">Terakhir diperbarui: Juli 2026</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Penerimaan Syarat</h2>
              <p>Dengan accessing dan menggunakan layanan Undangan Digital by Buanamedia, Anda dinyatakan setuju untuk terikat dengan syarat dan ketentuan yang berlaku di bawah ini.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Penggunaan Layanan</h2>
              <p>Pengguna dilarang keras mengunggah konten, foto, teks, atau musik yang mengandung unsur SARA, pornografi, pelanggaran hak cipta, atau hal-hal lain yang melanggar hukum siber di Indonesia.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Akun dan Keamanan</h2>
              <p>Anda bertanggung jawab penuh atas kerahasiaan kata sandi akun Anda dan segala aktivitas yang terjadi di dalam akun tersebut. Buanamedia tidak bertanggung jawab atas kehilangan data akibat kelalaian pengguna.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Perubahan Layanan</h2>
              <p>Kami berhak untuk mengubah, menangguhkan, atau menghentikan bagian layanan tertentu kapan saja tanpa pemberitahuan terlebih dahulu demi kenyamanan pengembangan sistem berkelanjutan.</p>
            </section>
          </div>

        </div>
      </main>

      {/* FOOTER (IDENTIK DENGAN BERANDA & HALAMAN LAINNYA) */}
      <footer className="border-t border-slate-100 py-8 bg-white text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          
          {/* MENU NAVIGASI FOOTER */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-semibold text-[11px] sm:text-xs">
            <button onClick={() => router.push('/tentang-kami')} className="hover:text-blue-700 transition-colors cursor-pointer">Tentang Kami</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/demo')} className="hover:text-blue-700 transition-colors cursor-pointer">Tema</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/refund-policy')} className="hover:text-blue-700 transition-colors cursor-pointer">refund-policy</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/faq')} className="hover:text-blue-700 transition-colors cursor-pointer">FAQ</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/syarat-ketentuan')} className="text-blue-700 transition-colors cursor-pointer">syarat-ketentuan</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/kontak')} className="hover:text-blue-700 transition-colors cursor-pointer">kontak</button>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 border-t border-slate-50 pt-4">
            <p className="font-bold text-slate-700">Undangan Digital &copy; 2026</p>
            <p className="text-[10px] text-slate-400">by Buanamedia</p>
          </div>
          <p className="text-[11px] text-slate-400">Solusi Undangan Digital Elegan, Praktis, dan Tanpa Batas.</p>
        </div>
      </footer>

    </div>
  );
}