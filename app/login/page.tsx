// app/login/page.tsx
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
    setLoading(true);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-6 font-sans">
      {/* DIUBAH DI SINI: Menjadi border-2 border-slate-200 agar pembungkus kartu luar terlihat tebal & jelas */}
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
              <a href="#" className="text-[11px] text-sky-600 hover:underline">Lupa?</a>
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
    </div>
  );
}