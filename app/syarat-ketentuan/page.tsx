'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '../user/components/Header'; // ⚡ Menggunakan komponen Header modular
import Footer from '../user/components/Footer'; // ⚡ Menggunakan komponen Footer modular

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

  // Aksi Klik Tombol Utama Kiri (Dinamis Biru di Halaman Publik)
  const handlePrimaryAction = () => {
    if (isLoggedIn) {
      router.push('/user'); // Kembali ke Dashboard
    } else {
      router.push('/login'); // Pergi ke halaman Masuk
    }
  };

  // Aksi Klik Tombol Sekunder Kanan (Merah)
  const handleSecondaryAction = async () => {
    if (isLoggedIn) {
      const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
      if (!confirmLogout) return;
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      router.push('/');
    } else {
      router.push('/register'); // Pergi ke halaman Daftar
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* ⚡ NAVBAR DENGAN LOGIKA DINAMIS PADA TEKS & WARNA LABEL HEADER */}
      {checkingAuth ? (
        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 h-16 flex items-center justify-between max-w-7xl mx-auto px-4 w-full">
          <div className="w-32 h-6 bg-slate-100 animate-pulse rounded-lg" />
          <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-xl" />
        </div>
      ) : (
        <Header 
          onLogout={handleSecondaryAction}
          onNavigateToPremium={handlePrimaryAction}
          onNavigateHome={() => router.push('/')}
          premiumLabel={isLoggedIn ? "Dashboard" : "Masuk"}
          logoutLabel={isLoggedIn ? "Keluar" : "Daftar"}
          premiumBgColor="bg-[#1d4ed8] hover:bg-blue-700" // ⚡ Menggunakan warna biru untuk keselarasan halaman publik
        />
      )}

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

      {/* ⚡ PANGGIL COMPONENT FOOTER MODULAR YANG BERSIH DI SINI */}
      <Footer onNavigate={(path) => router.push(path)} />

    </div>
  );
}