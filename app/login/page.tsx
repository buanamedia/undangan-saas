'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // ⚡ PERBAIKAN: Mengubah dari loading(true) menjadi setLoading(true)
    setMessage('');

    // 1. Jalankan autentikasi login ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(`Login Gagal: ${error.message}`);
      setLoading(false);
    } else {
      setMessage('✨ Berhasil masuk!');

      try {
        // 2. Ambil data role dari tabel profiles berdasarkan user ID yang sukses login
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user?.id)
          .single();

        if (profileError) throw profileError;

        // 3. Pengalihan otomatis berdasarkan level hak akses (Role)
        setTimeout(() => {
          if (profile?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/user');
          }
        }, 1000);

      } catch (profileErr: any) {
        // Jika gagal mengambil data profile, default diarahkan ke dashboard user biasa
        setTimeout(() => router.push('/user'), 1000);
      }
    }
  };

  // Fitur Reset Password via WhatsApp Admin
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const adminNumber = '6281414159500'; // Menggunakan format kode negara 62
    const textMessage = encodeURIComponent(
      `Halo Admin, saya ingin mengajukan reset password.\n\n` +
      `Email Akun: ${email || '[Masukkan Email Anda di sini]'}\n\n` +
      `(Mohon pastikan Anda mengirim pesan ini dari nomor telepon yang terdaftar di akun agar Admin dapat memberikan password baru).`
    );
    
    window.open(`https://wa.me/${adminNumber}?text=${textMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* HEADER NAVBAR (HANYA LOGO & BRANDING SELARAS) */}
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
          
          {/* Sisi Kanan Dikosongkan Sesuai Instruksi Hanya Logo */}
          <div />
        </div>
      </header>

      {/* KONTEN UTAMA FORM LOGIN */}
      <main className="grow flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-4 bg-white p-6 rounded-xl shadow-[0_4px_20px_rgba(2,132,199,0.06)] border-2 border-slate-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sky-50 border border-sky-100 mb-2">
              <span className="text-sky-600 text-lg">🔑</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Selamat Datang</h2>
            <p className="mt-0.5 text-xs text-slate-400">Silakan masuk untuk mengelola undangan Anda</p>
          </div>
          
          <form className="space-y-3 mt-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Email</label>
              <input
                type="email"
                required
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs bg-slate-50/50 transition-all"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Password</label>
                <a 
                  href="#" 
                  onClick={handleForgotPassword}
                  className="text-[11px] text-sky-600 hover:underline cursor-pointer"
                >
                  Lupa?
                </a>
              </div>
              <input
                type="password"
                required
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs bg-slate-50/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 flex justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Memvalidasi...' : 'Masuk Sekarang'}
            </button>
          </form>

          {message && (
            <div className="text-center text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-100 p-2 rounded-lg">
              {message}
            </div>
          )}

          <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-3">
            Belum punya akun?{' '}
            <button onClick={() => router.push('/register')} className="text-sky-600 font-semibold hover:underline cursor-pointer">
              Daftar Akun Baru
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER NAVIGASI (IDENTIK SESUAI GAMBAR REFERENSI) */}
      <footer className="border-t border-slate-100 py-8 bg-white text-center text-xs text-slate-400 w-full mt-auto">
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
            <button onClick={() => router.push('/syarat-ketentuan')} className="hover:text-blue-700 transition-colors cursor-pointer">syarat-ketentuan</button>
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