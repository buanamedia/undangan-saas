'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '../user/components/Header'; // ⚡ Menggunakan komponen Header modular
import Footer from '../user/components/Footer'; // ⚡ Menggunakan komponen Footer modular

export default function ContactPage() {
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

      {/* KONTEN UTAMA HUBUNGI KAMI */}
      <main className="grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
          
          {/* Header Halaman */}
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hubungi Kami</h1>
            <p className="text-xs text-slate-400 mt-1">Punya pertanyaan atau butuh bantuan teknis? Tim support Buanamedia siap membantu Anda.</p>
          </div>

          {/* Grid Informasi Kontak & Operasional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Sisi Kiri: Detail Kontak Utama */}
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Informasi Kontak</h2>
              
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-700 shrink-0">✉️</span>
                  <div>
                    <p className="font-bold text-slate-999">Surat Elektronik (Email)</p>
                    <a href="mailto:support@buanamedia.my.id" className="text-blue-700 hover:underline">
                      support@buanamedia.my.id
                    </a>
                  </div>
                </div>

                {/* Telepon / WhatsApp */}
                <div className="flex items-start gap-3">
                  <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-700 shrink-0">📞</span>
                  <div>
                    <p className="font-bold text-slate-900">Telepon / WhatsApp Support</p>
                    <a href="https://wa.me/6281414159500" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                      +62 814-1415-9500
                    </a>
                  </div>
                </div>

                {/* Alamat Usaha */}
                <div className="flex items-start gap-3">
                  <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-700 shrink-0">📍</span>
                  <div>
                    <p className="font-bold text-slate-900">Alamat Kantor Usaha</p>
                    <p className="text-slate-600 leading-relaxed mt-0.5 text-xs">
                      Buanamedia Studio <br />
                      Jl. Buana Perkasa II Blok C4 No.35 <br />
                      RT.005 RW.004, Kel. Pinang,<br />
                      Kec. Pinang, Kota Tangerang, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Jam Operasional Pelayanan */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">⏰ Jam Operasional Support</h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>Tim dukungan teknis kami melayani operasional pada waktu-waktu berikut:</p>
                <div className="pt-2 border-t border-slate-200/60 space-y-1 font-medium text-xs">
                  <p className="flex justify-between"><span>Senin - Jumat:</span> <span className="text-slate-900">09:00 - 17:00 WIB</span></p>
                  <p className="flex justify-between"><span>Sabtu:</span> <span className="text-slate-900">09:00 - 13:00 WIB</span></p>
                  <p className="flex justify-between text-slate-400"><span>Minggu / Hari Libur:</span> <span>Tutup</span></p>
                </div>
                <p className="text-[11px] text-slate-400 italic pt-2">
                  *Pertanyaan yang masuk di luar jam kerja akan direspons pada hari kerja berikutnya.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ⚡ PANGGIL COMPONENT FOOTER MODULAR YANG BERSIH DI SINI */}
      <Footer onNavigate={(path) => router.push(path)} />

    </div>
  );
}