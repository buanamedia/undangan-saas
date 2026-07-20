'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '../user/components/Header'; // ⚡ Menggunakan komponen Header modular
import Footer from '../user/components/Footer'; // ⚡ Menggunakan komponen Footer modular

export default function FAQPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  const faqData = [
    { q: 'Apakah saya bisa mencoba membuat undangan secara gratis?', a: 'Ya, tentu saja! Kami menyediakan paket Free untuk mencoba membuat undangan dengan fitur-fitur dasar secara gratis tanpa batasan waktu pembuatan.' },
    { q: 'Berapa lama proses pengerjaan undangan digital ini?', a: 'Sistem kami sepenuhnya otomatis (SaaS). Setelah Anda mendaftar dan mengisi data formulir acara di dashboard, undangan Anda langsung jadi dan siap disebarkan saat itu juga.' },
    { q: 'Apakah musik latar belakang bisa diganti sesuai keinginan?', a: 'Bisa. Pada paket premium, Anda dibebaskan untuk memasukkan tautan lagu mp3 favorit atau memilih dari daftar instrumen lagu yang telah kami sediakan di dashboard.' },
    { q: 'Bagaimana cara membagikan undangan ke WhatsApp tamu?', a: 'Di bagian menu dashboard user, kami menyediakan generator tautan otomatis. Anda cukup memasukkan daftar nama tamu, klik tombol salin, lalu kirimkan langsung via chat WhatsApp.' },
    { q: 'Apakah ada batasan jumlah tamu yang diundang?', a: 'Tidak ada batasan sama sekali. Anda bebas membagikan link undangan digital kustom Anda ke ratusan atau bahkan ribuan tamu tanpa biaya tambahan.' }
  ];

  // State untuk melacak item FAQ mana saja yang sedang terbuka accordion-nya
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      {/* KONTEN UTAMA FAQ */}
      <main className="grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions (FAQ)</h1>
            <p className="text-xs text-slate-400 mt-1">Punya pertanyaan? Cari jawabannya di sini.</p>
          </div>

          {/* FAQ ACCORDION LIST */}
          <div className="space-y-3 pt-2">
            {faqData.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden transition-all bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 pr-4">{item.q}</span>
                    <span className="text-blue-700 font-bold text-xs">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  
                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-50 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* ⚡ PANGGIL COMPONENT FOOTER MODULAR YANG BERSIH DI SINI */}
      <Footer onNavigate={(path) => router.push(path)} />

    </div>
  );
}