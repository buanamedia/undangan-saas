'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminTransactionsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [vouchersList, setVouchersList] = useState<any[]>([]); // ⚡ BARU: Menyimpan referensi kode voucher dari DB
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  const loadTransactionsData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert('Akses Ditolak!');
        router.push('/user');
        return;
      }

      // 1. Ambil Data User Lengkap
      const { data: allUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, role, is_premium, created_at, email, username, phone, full_name')
        .order('created_at', { ascending: false });

      if (userError) {
        console.error("Error fetching users:", userError);
      } else {
        setUsersList(allUsers || []);
      }

      // 2. BARU: Ambil Master Data dari tabel vouchers untuk pencocokan fallback voucher
      try {
        const { data: allVouchers } = await supabase
          .from('vouchers')
          .select('code, discount_value');
        setVouchersList(allVouchers || []);
      } catch (vErr) {
        console.error("Gagal memuat master data vouchers:", vErr);
      }

      // 3. Query Sinkronisasi Transaksi
      try {
        console.log("Mencoba mengambil data transaksi...");
        const { data: allTransactions, error: txError } = await supabase
          .from('transactions')
          .select('user_id, amount, status, invoice, voucher');

        if (txError) {
          console.error("Gagal ambil data transaksi utama:", txError);
          const { data: fallbackRes } = await supabase
            .from('transactions')
            .select('*');
          
          setTransactionsList(fallbackRes || []);
        } else {
          console.log("Data transaksi berhasil didapat:", allTransactions);
          setTransactionsList(allTransactions || []);
        }
      } catch (e) {
        console.error("Error pada query transaksi:", e);
      }

    } catch (error) {
      console.error('Gagal memuat rincian transaksi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactionsData();
  }, []);

  // Filter berpatokan pada tabel transactions agar sinkron saat dihapus
  const premiumUsersOnly = usersList.filter(u => 
    transactionsList.some(t => {
      if (!u.id || !t.user_id) return false;
      const userIdClean = String(u.id).replace(/[^a-zA-Z0-9]/g, '').trim();
      const txUserIdClean = String(t.user_id).replace(/[^a-zA-Z0-9]/g, '').trim();
      return userIdClean === txUserIdClean;
    })
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-800 dark:text-white">
        <p className="text-xs font-semibold tracking-widest text-sky-500 dark:text-sky-400 animate-pulse">MEMUAT RINCIAN TRANSAKSI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col justify-between transition-colors duration-200">
      
      {/* HEADER NAVBAR */}
      <header className="border-b-2 border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo/Logo.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm sm:text-base">
                Undangan <span className="text-blue-700 dark:text-blue-500">Digital</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">by Buanamedia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border-2 border-slate-300 dark:border-slate-700"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              onClick={() => router.push('/admin')}
              className="text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 px-[14px] py-2 rounded-xl transition-all cursor-pointer tracking-wide"
            >
              Kembali ke Admin
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Riwayat Transaksi Bisnis</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Pantau data invoice masuk beserta total pembayaran lisensi premium pengguna</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b-2 border-slate-300 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400">Rincian Transaksi & Penggunaan Voucher</h3>
            </div>
          </div>

          <div className="p-5 text-xs space-y-4 text-slate-700 dark:text-slate-300">
            <div className="border-2 border-slate-300 dark:border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">No. Invoice</th>
                    <th className="p-3">Kode Voucher</th>
                    <th className="p-3 text-center">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-800/50">
                  {premiumUsersOnly.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">Belum ada pesanan premium terdaftar.</td>
                    </tr>
                  ) : (
                    premiumUsersOnly.map((user) => {
                      const matchTx = transactionsList.find((t) => {
                        if (!user.id || !t.user_id) return false;
                        const userIdClean = String(user.id).replace(/[^a-zA-Z0-9]/g, '');
                        const txUserIdClean = String(t.user_id).replace(/[^a-zA-Z0-9]/g, '');
                        return userIdClean === txUserIdClean;
                      });

                      // ⚡ LOGIKA FALLBACK FILTER VOUCHER LINTAS TABEL:
                      // Jika kolom voucher di tabel transaksi null, hitung potongan harga asli (Base Rp.100.000)
                      // Cocokkan persentase diskon yang sesuai dengan data voucher dari database Anda.
                      let displayedVoucher = matchTx?.voucher || matchTx?.voucher_code || null;
                      
                      if (!displayedVoucher && matchTx?.amount) {
                        const basePrice = 100000;
                        const currentAmount = Number(matchTx.amount);
                        if (currentAmount < basePrice) {
                          const calculatedDiscountPercent = Math.round(((basePrice - currentAmount) / basePrice) * 100);
                          const foundVoucher = vouchersList.find(v => Number(v.discount_value) === calculatedDiscountPercent);
                          if (foundVoucher) {
                            displayedVoucher = foundVoucher.code;
                          }
                        }
                      }

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">
                            {user.full_name || user.username || 'User'}
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{user.email}</td>
                          <td className="p-3">
                            {user.phone ? (
                              <a 
                                href={`https://wa.me/${user.phone?.replace(/[^0-9]/g, '') || ''}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10px]"
                              >
                                {user.phone}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                            {matchTx?.invoice || matchTx?.invoice_number || '-'}
                          </td>
                          {/* ⚡ PERBAIKAN: Menampilkan kode voucher hasil filter validasi lintas tabel */}
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {displayedVoucher || '-'}
                          </td>
                          <td className="p-3 text-center text-amber-600 dark:text-amber-400 font-bold">
                            {matchTx?.amount ? `Rp.${Number(matchTx.amount).toLocaleString('id-ID')}` : 'Rp.100.000'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-t-2 border-slate-300 dark:border-slate-800 text-right">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">
              Total: {premiumUsersOnly.length} Pengguna Premium Terverifikasi
            </span>
          </div>
        </div>
      </main>

      {/* FOOTER NAVIGASI */}
      <footer className="border-t-2 border-slate-300 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-center text-xs text-slate-400 w-full transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-semibold text-[11px] sm:text-xs">
            <button onClick={() => router.push('/tentang-kami')} className="hover:text-blue-700 transition-colors cursor-pointer">Tentang Kami</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/demo')} className="hover:text-blue-700 transition-colors cursor-pointer">Tema</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/refund-policy')} className="hover:text-blue-700 transition-colors cursor-pointer">refund-policy</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/faq')} className="hover:text-blue-700 transition-colors cursor-pointer">FAQ</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/syarat-ketentuan')} className="hover:text-blue-700 transition-colors cursor-pointer">syarat-ketentuan</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/kontak')} className="hover:text-blue-700 transition-colors cursor-pointer">kontak</button>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 border-t border-slate-50 dark:border-slate-800 pt-4">
            <p className="font-bold text-slate-700 dark:text-slate-300">Undangan Digital &copy; 2026</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">by Buanamedia</p>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Solusi Undangan Digital Elegan, Praktis, dan Tanpa Batas.</p>
        </div>
      </footer>
    </div>
  );
}