'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminVouchersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vouchersList, setVouchersList] = useState<any[]>([]);

  // Form States
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // States: Masa Berlaku Voucher
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      // Validasi sesi admin terlebih dahulu
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

      // Ambil data voucher diskon dari Supabase
      const { data: vouchers, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Gagal mengambil voucher:', error.message);
      } else {
        setVouchersList(vouchers || []);
      }
    } catch (err) {
      console.error('Error voucher panel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) {
      alert('Mohon isi kode voucher dan nilai diskon dengan benar!');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('vouchers').insert([
        {
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          max_uses: Number(maxUses),
          uses_count: 0,
          is_active: isActive,
          valid_from: validFrom ? validFrom.replace('T', ' ') : null,
          valid_until: validUntil ? validUntil.replace('T', ' ') : null,
        },
      ]);

      if (error) throw error;

      alert('✨ Voucher baru berhasil dibuat!');
      // Reset Form
      setCode('');
      setDiscountValue(0);
      setMaxUses(100);
      setIsActive(true);
      setValidFrom('');
      setValidUntil('');
      
      // Refresh Data List
      fetchVouchers();
    } catch (err: any) {
      alert(`Gagal membuat voucher: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVoucherStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setVouchersList((prev) =>
        prev.map((v) => (v.id === id ? { ...v, is_active: !currentStatus } : v))
      );
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher diskon ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('vouchers').delete().eq('id', id);
      if (error) throw error;

      setVouchersList((prev) => prev.filter((v) => v.id !== id));
      alert('✓ Voucher berhasil dihapus!');
    } catch (err: any) {
      alert(`Gagal menghapus voucher: ${err.message}`);
    }
  };

  // ⚡ FUNGSI BARU: EXPORT EXCEL (CSV)
  const exportVouchersToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Kode Voucher,Tipe Diskon,Nilai Potongan,Kuota Terpakai,Kuota Maksimal,Status Aktif\n";
    vouchersList.forEach((v) => {
      const potongan = v.discount_type === 'percentage' ? `${v.discount_value}%` : `Rp ${v.discount_value}`;
      const row = `"${v.code}","${v.discount_type}","${potongan}","${v.uses_count}","${v.max_uses}","${v.is_active ? 'Aktif' : 'Nonaktif'}"`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Daftar_Voucher_Tersedia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ⚡ FUNGSI BARU: EXPORT PDF
  const exportVouchersToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let tableRows = '';
    vouchersList.forEach(v => {
      const potongan = v.discount_type === 'percentage' ? `${v.discount_value}%` : `Rp ${Number(v.discount_value).toLocaleString('id-ID')}`;
      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-weight: bold; color: #1d4ed8;">${v.code}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-transform: capitalize;">${v.discount_type}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${potongan}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${v.uses_count} / ${v.max_uses}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${v.is_active ? 'Aktif' : 'Mati'}</td>
        </tr>
      `;
    });
    printWindow.document.write(`
      <html>
        <head>
          <title>Daftar Voucher Tersedia</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f4f4f4; padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>DAFTAR VOUCHER TERSEDIA DI SYSTEM</h1>
          <p>Total Promosi Aktif: ${vouchersList.length} Item Voucher</p>
          <table>
            <thead>
              <tr>
                <th>Kode Voucher</th>
                <th>Tipe Diskon</th>
                <th>Besar Potongan</th>
                <th>Kuota Penggunaan</th>
                <th>Status</th>
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
        <p className="text-xs font-semibold tracking-widest text-sky-500 dark:text-sky-400 animate-pulse">MEMUAT MANAJEMEN VOUCHER...</p>
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
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20 transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Manajemen Voucher Diskon</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Tambahkan dan kelola kode promo diskon untuk memotong biaya pembayaran user</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* KOLOM FORM INPUT VOUCHER */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-800 p-5 space-y-4 transition-colors">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Buat Voucher Baru</h2>
            
            <form onSubmit={handleCreateVoucher} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Kode Voucher</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DISKON2026"
                  className="block w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs bg-slate-50/50 dark:bg-slate-950/50 uppercase"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Tipe Diskon</label>
                <select
                  className="block w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs bg-slate-50/50 dark:bg-slate-950/50"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                >
                  <option value="fixed">Potongan Tetap (Rupiah)</option>
                  <option value="percentage">Persentase (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                  Nilai Potongan {discountType === 'percentage' ? '(%)' : '(Rp)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder={discountType === 'percentage' ? 'Contoh: 10' : 'Contoh: 25000'}
                  className="block w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs bg-slate-50/50 dark:bg-slate-950/50"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Kuota Maksimal Pemakaian</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 100"
                  className="block w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs bg-slate-50/50 dark:bg-slate-950/50"
                  value={maxUses || ''}
                  onChange={(e) => setMaxUses(Number(e.target.value))}
                />
              </div>

              {/* INPUT MASA BERLAKU VOUCHER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Berlaku Dari</label>
                  <input
                    type="datetime-local"
                    className="block w-full px-2 py-1.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-[11px] bg-slate-50/50 dark:bg-slate-950/50"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Sampai Dengan</label>
                  <input
                    type="datetime-local"
                    className="block w-full px-2 py-1.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-[11px] bg-slate-50/50 dark:bg-slate-950/50"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheckbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActiveCheckbox" className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  Aktifkan voucher ini langsung setelah dibuat
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Voucher'}
              </button>
            </form>
          </div>

          {/* KOLOM DAFTAR LIST VOUCHER */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-800 p-5 space-y-4 transition-colors">
            
            {/* ⚡ HEADER TABEL DENGAN SELEKSI TOMBOL EKSPOR */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
                Daftar Voucher Tersedia ({vouchersList.length})
              </h2>
              {vouchersList.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={exportVouchersToExcel}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    📊 Excel
                  </button>
                  <button
                    onClick={exportVouchersToPDF}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    📄 PDF
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto border-2 border-slate-300 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Potongan</th>
                    <th className="p-3 text-center">Pemakaian (Kuota)</th>
                    <th className="p-3">Masa Berlaku</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {vouchersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">Belum ada voucher diskon yang dibuat.</td>
                    </tr>
                  ) : (
                    vouchersList.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-500/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                          {voucher.code}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">
                          {voucher.discount_type === 'percentage' 
                            ? `${voucher.discount_value}%` 
                            : `Rp ${Number(voucher.discount_value).toLocaleString('id-ID')}`
                          }
                        </td>
                        <td className="p-3 text-center font-mono">
                          {voucher.uses_count} / <span className="text-slate-400">{voucher.max_uses}</span>
                        </td>
                        <td className="p-3 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                          {voucher.valid_from ? (
                            <div><span className="text-emerald-600 dark:text-emerald-400 font-medium">Mulai:</span> {new Date(voucher.valid_from).toLocaleDateString('id-ID', { dateStyle: 'short' })}</div>
                          ) : (
                            <div><span className="text-slate-400 font-medium">Mulai:</span> -</div>
                          )}
                          {voucher.valid_until ? (
                            <div><span className="text-rose-600 dark:text-rose-400 font-medium">Selesai:</span> {new Date(voucher.valid_until).toLocaleDateString('id-ID', { dateStyle: 'short' })}</div>
                          ) : (
                            <div><span className="text-slate-400 font-medium">Selesai:</span> Tanpa Batas</div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${voucher.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                            {voucher.is_active ? 'Aktif' : 'Mati'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => handleToggleVoucherStatus(voucher.id, voucher.is_active)}
                              className={`px-2 py-1 font-bold text-[10px] rounded-md transition-all cursor-pointer ${voucher.is_active ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                              {voucher.is_active ? 'Matikan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => handleDeleteVoucher(voucher.id)}
                              className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-600 hover:text-white font-bold text-[10px] rounded-md transition-all cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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