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
  const [vouchersList, setVouchersList] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // 🟢 STATE MANAJEMEN SELEKSI & HAPUS
  const [selectedTxIds, setSelectedTxIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

      // 1. Ambil Data User Lengkap (Termasuk is_premium)
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, role, is_premium, created_at, email, username, phone, full_name');
      setUsersList(allUsers || []);

      // 2. Ambil Master Data Vouchers
      try {
        const { data: allVouchers } = await supabase.from('vouchers').select('code, discount_value');
        setVouchersList(allVouchers || []);
      } catch (vErr) {
        console.error("Gagal memuat master data vouchers:", vErr);
      }

      // 3. Ambil Seluruh Transaksi (Diurutkan Terbaru)
      const { data: allTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (txError) {
        console.error("Gagal ambil data transaksi:", txError.message);
      } else {
        setTransactionsList(allTransactions || []);
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

  // 🟢 FUNGSI CENTANG / UNCHECK
  const handleSelectTx = (id: number, isPremiumUser: boolean) => {
    if (isPremiumUser) {
      alert("🔒 Transaksi tidak bisa dipilih/dihapus karena status user masih PREMIUM!\n\nSilakan nonaktifkan lisensi Premium user terlebih dahulu dari Dashboard Admin.");
      return;
    }

    if (selectedTxIds.includes(id)) {
      setSelectedTxIds(selectedTxIds.filter(item => item !== id));
    } else {
      setSelectedTxIds([...selectedTxIds, id]);
    }
  };

  // 🟢 FUNGSI PROSES HAPUS DARI DATABASE
  const handleDeleteSelected = async () => {
    if (selectedTxIds.length === 0) return;

    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus ${selectedTxIds.length} data transaksi yang dipilih dari database?`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', selectedTxIds);

      if (error) {
        throw new Error(error.message);
      }

      alert("✅ Data transaksi berhasil dihapus!");
      setSelectedTxIds([]);
      await loadTransactionsData(); // Reload data

    } catch (err: any) {
      alert(`Gagal menghapus transaksi: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ⚡ FUNGSI BARU: EXPORT KE EXCEL (CSV)
  const exportTransactionsToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Nama User,Email,WhatsApp,No. Invoice,Kode Voucher,Nominal Bayar (Rp),Status Akun,Tanggal Transaksi\n";
    
    transactionsList.forEach((trx) => {
      const user = usersList.find((u) => {
        if (!u.id || !trx.user_id) return false;
        return String(u.id).replace(/[^a-zA-Z0-9]/g, '') === String(trx.user_id).replace(/[^a-zA-Z0-9]/g, '');
      });

      const userName = user?.full_name || user?.username || 'Guest';
      const userEmail = user?.email || '-';
      const userPhone = user?.phone || '-';
      const invoice = trx.invoice || trx.invoice_number || '-';
      const isPremium = user?.is_premium ? 'PREMIUM' : 'FREE';
      const amount = trx.amount ? Number(trx.amount) : 0;
      const tgl = new Date(trx.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' });

      // Cek Voucher fallback
      let displayedVoucher = trx?.voucher || trx?.voucher_code || '-';
      if (displayedVoucher === '-' && trx?.amount) {
        const basePrice = 100000;
        if (amount < basePrice) {
          const discountPct = Math.round(((basePrice - amount) / basePrice) * 100);
          const fVoucher = vouchersList.find(v => Number(v.discount_value) === discountPct);
          if (fVoucher) displayedVoucher = fVoucher.code;
        }
      }

      const row = `"${trx.id}","${userName}","${userEmail}","${userPhone}","${invoice}","${displayedVoucher}","${amount}","${isPremium}","${tgl}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Riwayat_Transaksi_Bisnis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⚡ FUNGSI BARU: EXPORT KE PDF
  const exportTransactionsToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let tableRows = '';
    transactionsList.forEach(trx => {
      const user = usersList.find((u) => {
        if (!u.id || !trx.user_id) return false;
        return String(u.id).replace(/[^a-zA-Z0-9]/g, '') === String(trx.user_id).replace(/[^a-zA-Z0-9]/g, '');
      });

      const userName = user?.full_name || user?.username || 'Guest';
      const invoice = trx.invoice || trx.invoice_number || '-';
      const isPremium = user?.is_premium ? '<span style="color: green; font-weight: bold;">PREMIUM</span>' : 'FREE';
      const amount = trx.amount ? `Rp ${Number(trx.amount).toLocaleString('id-ID')}` : 'Rp 0';
      const tgl = new Date(trx.created_at).toLocaleDateString('id-ID');

      let displayedVoucher = trx?.voucher || trx?.voucher_code || '-';
      if (displayedVoucher === '-' && trx?.amount) {
        const basePrice = 100000;
        const currentAmount = Number(trx.amount);
        if (currentAmount < basePrice) {
          const discountPct = Math.round(((basePrice - currentAmount) / basePrice) * 100);
          const fVoucher = vouchersList.find(v => Number(v.discount_value) === discountPct);
          if (fVoucher) displayedVoucher = fVoucher.code;
        }
      }

      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: 500;">${userName}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 10px;">${invoice}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${tgl}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${displayedVoucher}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #b45309; text-align: right;">${amount}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${isPremium}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Transaksi Bisnis</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            p { font-size: 12px; margin-top: 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
            th { background-color: #f4f4f4; padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>LAPORAN RIWAYAT TRANSAKSI BISNIS</h1>
          <p>Total Transaksi Tercatat: ${transactionsList.length}</p>
          <table>
            <thead>
              <tr>
                <th>Nama Pelanggan</th>
                <th>No. Invoice</th>
                <th>Tanggal Transaksi</th>
                <th style="text-align: center;">Kode Voucher</th>
                <th style="text-align: right;">Total Bayar</th>
                <th style="text-align: center;">Status Akun</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Riwayat Transaksi Bisnis</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">Pantau data invoice masuk beserta total pembayaran lisensi premium pengguna</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 🟢 TOMBOL HAPUS SELEKSI */}
            {selectedTxIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>🗑️</span>
                {isDeleting ? 'Menghapus...' : `Hapus ${selectedTxIds.length} Terpilih`}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          {/* ⚡ HEADER TABEL DENGAN TOMBOL EXCEL & PDF */}
          <div className="p-5 border-b-2 border-slate-300 dark:border-slate-800 flex justify-between items-center flex-wrap gap-3 bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400">Rincian Transaksi & Penggunaan Voucher</h3>
            </div>
            
            {/* TOMBOL EXPORT */}
            {transactionsList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={exportTransactionsToExcel}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  📊 Unduh Excel
                </button>
                <button
                  onClick={exportTransactionsToPDF}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  📄 Cetak PDF
                </button>
              </div>
            )}
          </div>

          <div className="p-5 text-xs space-y-4 text-slate-700 dark:text-slate-300">
            <div className="border-2 border-slate-300 dark:border-slate-800 rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase">
                    {/* 🟢 KOLOM CHECKBOX */}
                    <th className="p-3 w-10 text-center">Pilih</th>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">No. Invoice</th>
                    <th className="p-3">Kode Voucher</th>
                    <th className="p-3 text-center">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-800/50">
                  {transactionsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">Belum ada pesanan premium terdaftar.</td>
                    </tr>
                  ) : (
                    transactionsList.map((trx) => {
                      const user = usersList.find((u) => {
                        if (!u.id || !trx.user_id) return false;
                        const userIdClean = String(u.id).replace(/[^a-zA-Z0-9]/g, '');
                        const txUserIdClean = String(trx.user_id).replace(/[^a-zA-Z0-9]/g, '');
                        return userIdClean === txUserIdClean;
                      });

                      // 🟢 CEK STATUS USER: APAKAH SEDANG PREMIUM?
                      const isUserPremium = user?.is_premium === true;

                      // Logika Voucher
                      let displayedVoucher = trx?.voucher || trx?.voucher_code || null;
                      if (!displayedVoucher && trx?.amount) {
                        const basePrice = 100000;
                        const currentAmount = Number(trx.amount);
                        if (currentAmount < basePrice) {
                          const calculatedDiscountPercent = Math.round(((basePrice - currentAmount) / basePrice) * 100);
                          const foundVoucher = vouchersList.find(v => Number(v.discount_value) === calculatedDiscountPercent);
                          if (foundVoucher) displayedVoucher = foundVoucher.code;
                        }
                      }

                      return (
                        <tr key={trx.id || Math.random()} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/30 transition-colors">
                          
                          {/* 🟢 CHECKBOX DENGAN PROTEKSI AKSES PREMIUM */}
                          <td className="p-3 text-center">
                            {isUserPremium ? (
                              <span 
                                title="🔒 Transaksi terkunci karena status user sedang PREMIUM" 
                                className="cursor-not-allowed opacity-50 text-xs"
                              >
                                🔒
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selectedTxIds.includes(trx.id)}
                                onChange={() => handleSelectTx(trx.id, isUserPremium)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                            )}
                          </td>

                          <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span>{user?.full_name || user?.username || 'Niko'}</span>
                              {isUserPremium && (
                                <span className="bg-amber-500/20 text-amber-500 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  PREMIUM
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">
                            {user?.email || 'niko@gmail.com'}
                          </td>
                          <td className="p-3">
                            {user?.phone ? (
                              <a 
                                href={`https://wa.me/${user.phone?.replace(/[^0-9]/g, '') || ''}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-emerald-600 dark:text-emerald-400 hover:underline text-[10px]"
                              >
                                {user.phone}
                              </a>
                            ) : '083166159757'}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                            {trx.invoice || trx.invoice_number || '-'}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            {displayedVoucher || '-'}
                          </td>
                          <td className="p-3 text-center text-amber-600 dark:text-amber-400 font-bold">
                            {trx.amount ? `Rp.${Number(trx.amount).toLocaleString('id-ID')}` : 'Rp.0'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-t-2 border-slate-300 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 dark:text-slate-500 italic">
              * Transaksi yang terhubung dengan akun status <strong className="text-amber-500">PREMIUM</strong> dikunci (🔒) dan tidak dapat dihapus.
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic font-medium">
              Total: {transactionsList.length} Transaksi Terdaftar
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