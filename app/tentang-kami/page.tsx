'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';

export default function TentangKamiPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const nilaiUtama = [
    { icon: '⚡', title: 'Pembuatan Instan', desc: 'Hanya perlu hitungan menit, undangan impian Anda siap dibagikan secara live.' },
    { icon: '🎨', title: 'Desain Premium', desc: 'Pilihan tema eksklusif yang responsif and memukau di perangkat ponsel maupun komputer.' },
    { icon: '💬', title: 'Manajemen Tamu', desc: 'Fitur kustom nama penerima untuk pesan jabat erat WhatsApp yang lebih personal.' }
  ];

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

  const handlePrimaryAction = () => {
    if (isLoggedIn) {
      router.push('/user');
    } else {
      router.push('/login');
    }
  };

  const handleSecondaryAction = async () => {
    if (isLoggedIn) {
      const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
      if (!confirmLogout) return;
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      router.push('/');
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      
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
          premiumBgColor="bg-[#1d4ed8] hover:bg-blue-700" // ⚡ SEKARANG SUDAH BERUBAH MENJADI BIRU
        />
      )}

      {/* MAIN CONTENT CONTAINER */}
      <main className="grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-linear-to-b from-blue-50/40 via-white to-white py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-wide text-blue-800 bg-blue-100/60 rounded-full border border-blue-200">
              ✨ Platform Undangan Digital No. 1 di Indonesia
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Tentang <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-sky-500">Kami</span>
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
              Menyediakan solusi pembuatan undangan digital instan yang elegan, praktis, dan ramah lingkungan untuk momen spesial kebersamaan Anda.
            </p>
          </div>
        </section>

        {/* VISI & MISI SEKSI */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm select-none">🎯</div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Visi Kami</h2>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Menjadi platform generator undangan digital terdepan di Indonesia yang membantu jutaan orang merayakan kebahagiaan dengan cara yang lebih modern, efisien, dan berkelanjutan.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm select-none">💎</div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Misi Kami</h2>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Menyediakan teknologi desain mutakhir yang mudah digunakan oleh siapa saja, menyajikan performa loading undangan secepat kilat, serta menjaga keamanan data personal pengguna.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MENGAPA MEMILIH LAYANAN KAMI */}
        <section className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase text-center">Mengapa Memilih Layanan Kami?</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Komitmen kami untuk memberikan pengalaman digital terbaik di setiap momen berharga.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {nilaiUtama.map((feat, index) => (
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
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">Punya Pertanyaan atau Butuh Bantuan?</h2>
            <p className="text-blue-100/80 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Hubungi tim layanan bantuan kami atau mulai buat undangan gratis pertama Anda secara langsung sekarang juga.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a 
                href="https://wa.me/6281414159500"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer tracking-wider uppercase inline-flex items-center gap-2"
              >
                🟢 Hubungi Admin via WA
              </a>
              <button 
                onClick={() => router.push(isLoggedIn ? '/user' : '/login')} 
                className="px-6 py-3 bg-white hover:bg-slate-50 text-blue-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all tracking-wider uppercase cursor-pointer"
              >
                Mulai Sekarang Juga
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer onNavigate={(path) => router.push(path)} />

    </div>
  );
}