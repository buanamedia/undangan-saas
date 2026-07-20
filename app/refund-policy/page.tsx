'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '../user/components/Header'; // ⚡ Menggunakan komponen Header modular
import Footer from '../user/components/Footer'; // ⚡ Menggunakan komponen Footer modular

export default function RefundPolicyPage() {
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

      {/* KONTEN UTAMA KEBIJAKAN REFUND */}
      <main className="grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
        
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Kebijakan Refund</h1>
            <p className="text-xs text-slate-400 mt-1">Terakhir diperbarui: Juli 2026</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Skema Pembelian Produk Digital</h2>
              <p>Karena produk yang kami sediakan bersifat digital dan instan (SaaS di mana fitur langsung aktif setelah pembayaran), semua bentuk transaksi pembelian paket premium adalah bersifat **final dan tidak dapat dibatalkan**.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Kondisi Khusus Pengembalian Dana</h2>
              <p>Refund atau pengembalian dana hanya akan dipertimbangkan dan disetujui jika terjadi kondisi-kondisi teknis internal berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Terjadi kegagalan pembayaran ganda akibat kendala sistem payment gateway (dana terpotong dua kali untuk tagihan yang sama).</li>
                <li>Fitur premium tidak aktif sama sekali dalam kurun waktu 2x24 jam setelah konfirmasi pembayaran yang sah, meskipun tim support teknis kami telah mencoba melakukan perbaikan manual.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Process Pengajuan</h2>
              <p>Untuk mengajukan kendala pembayaran ganda, silakan hubungi tim support admin Buanamedia dengan menyertakan bukti pembayaran resmi, email akun, serta ID transaksi terkait.</p>
            </section>
          </div>

        </div>
      </main>

      {/* ⚡ PANGGIL COMPONENT FOOTER MODULAR YANG BERSIH DI SINI */}
      <Footer onNavigate={(path) => router.push(path)} />

    </div>
  );
}