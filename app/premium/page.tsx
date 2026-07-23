'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';

// Tipe Data Paket
interface PackagePlan {
  id: string;
  name: string;
  duration_months: number | null;
  price: number;
  original_price: number;
  description: string;
}

export default function PremiumUpgradePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // State Paket yang Dipilih (Default ke 1 Bulan atau Unlimited)
  const [packages, setPackages] = useState<PackagePlan[]>([
  { id: '1_MONTH', name: 'Paket 1 Bulan', duration_months: 1, price: 35000, original_price: 50000, description: 'Masa aktif 1 Bulan' },
  { id: '3_MONTHS', name: 'Paket 3 Bulan', duration_months: 3, price: 75000, original_price: 100000, description: 'Masa aktif 3 Bulan' },
  { id: '6_MONTHS', name: 'Paket 6 Bulan', duration_months: 6, price: 120000, original_price: 180000, description: 'Masa aktif 6 Bulan' },
  { id: '1_YEAR', name: 'Paket 1 Tahun', duration_months: 12, price: 200000, original_price: 300000, description: 'Masa aktif 1 Tahun' }, // 👈 12 BULAN
  { id: 'UNLIMITED', name: 'Akses Unlimited', duration_months: null, price: 300000, original_price: 500000, description: 'Tanpa Batas Waktu' },
]);

  const [selectedPackage, setSelectedPackage] = useState<PackagePlan>(packages[0]);

  // State Manajemen Voucher & Harga Dinamis
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [finalAmount, setFinalAmount] = useState(packages[0].price);
  const [voucherError, setVoucherError] = useState('');
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
      }

      // Ambil daftar paket dari database jika ada
      try {
        const { data: pkgData } = await supabase.from('packages').select('*');
        if (pkgData && pkgData.length > 0) {
          setPackages(pkgData);
          setSelectedPackage(pkgData[0]);
          setFinalAmount(pkgData[0].price);
        }
      } catch (err) {
        console.error("Gagal fetch packages:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Update harga saat paket berubah
  const handleSelectPackage = (pkg: PackagePlan) => {
    setSelectedPackage(pkg);
    recalculatePrice(pkg.price, appliedVoucher, discountPercent);
  };

  const recalculatePrice = (base: number, voucher: string, percent: number) => {
    if (voucher.includes('_FIXED_')) {
      const discVal = Number(voucher.split('_FIXED_')[1]) || 0;
      const res = base - discVal;
      setFinalAmount(res < 0 ? 0 : res);
    } else if (percent > 0) {
      setFinalAmount(base - (base * percent) / 100);
    } else {
      setFinalAmount(base);
    }
  };

  // Validasi Voucher
  const handleApplyVoucher = async (forcedCode?: string) => {
    setVoucherError('');
    const code = (forcedCode || voucherCode).trim().toUpperCase();

    if (!code) {
      setAppliedVoucher('');
      setDiscountPercent(0);
      setFinalAmount(selectedPackage.price);
      return;
    }

    try {
      const { data: voucherData, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        setVoucherError(`Gagal memeriksa database: ${error.message}`);
        return;
      }

      if (voucherData) {
        const discountValue = Number(voucherData.discount_value) || 0;
        const isRupiah = voucherData.type === 'fixed' || voucherData.discount_type === 'fixed' || String(voucherData.type).toLowerCase().includes('rupiah');

        if (isRupiah) {
          setDiscountPercent(0);
          const calculatedAmount = selectedPackage.price - discountValue;
          setFinalAmount(calculatedAmount < 0 ? 0 : calculatedAmount);
          setAppliedVoucher(`${code}_FIXED_${discountValue}`);
        } else {
          setDiscountPercent(discountValue);
          setFinalAmount(selectedPackage.price - (selectedPackage.price * discountValue) / 100);
          setAppliedVoucher(code);
        }

        if (forcedCode) setVoucherCode(code);
      } else {
        setVoucherError('Kode voucher tidak ditemukan.');
        setAppliedVoucher('');
        setDiscountPercent(0);
        setFinalAmount(selectedPackage.price);
      }
    } catch (err: any) {
      setVoucherError('Terjadi kesalahan sistem saat memeriksa voucher.');
    }
  };

  const handleUpgradeAccount = async () => {
    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const orderInvoiceId = `INV-${session.user.id}-${Date.now()}`;
      const voucherToSend = appliedVoucher || voucherCode || null;

      const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: orderInvoiceId,
    amount: finalAmount,
    packageId: selectedPackage.id,               // Mengirim '1_YEAR'
    durationMonths: selectedPackage.duration_months, // Mengirim 12
    customerName: userProfile?.full_name || 'Pembeli',
    customerEmail: userProfile?.email || session.user.email,
    userId: session.user.id,
    voucherCode: voucherToSend ? voucherToSend.trim().toUpperCase() : null
  }),
});

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Gagal mendapatkan tautan pembayaran.');
      }
    } catch (err: any) {
      alert(`Gagal memproses pembayaran: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs font-bold text-blue-700 animate-pulse">MENYIAPKAN HALAMAN PREMIUM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <Header 
        onLogout={async () => { await supabase.auth.signOut(); router.push('/'); }}
        onNavigateToPremium={() => router.push('/user')} 
        onNavigateHome={() => router.push('/')}
        premiumLabel="Dashboard"
        logoutLabel="Keluar"
        premiumBgColor="bg-[#1d4ed8] hover:bg-blue-700"
      />

      <main className="grow flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          
          {/* STEP 1: PILIHAN PAKET DURASI */}
          {step === 1 && (
            <div className="bg-white border-2 border-slate-300 shadow-xl rounded-2xl overflow-hidden max-w-xl mx-auto p-6 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Pilih Paket Undangan Digital</h2>
                <p className="text-xs text-slate-500">
                  Pilih durasi masa aktif yang sesuai dengan kebutuhan acara Anda.
                </p>
              </div>

              {/* LIST PILIHAN PAKET */}
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    onClick={() => handleSelectPackage(pkg)}
                    className={`p-4 border-2 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                      selectedPackage.id === pkg.id 
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="package_selection" 
                        checked={selectedPackage.id === pkg.id}
                        onChange={() => handleSelectPackage(pkg)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{pkg.name}</p>
                        <p className="text-[11px] text-slate-500">{pkg.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {pkg.original_price && (
                        <p className="text-[10px] line-through text-slate-400 font-medium">
                          Rp.{pkg.original_price.toLocaleString('id-ID')}
                        </p>
                      )}
                      <p className="text-sm font-black text-blue-700">
                        Rp.{pkg.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FITUR UNGGULAN */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs space-y-1.5 font-medium">
                <p className="text-blue-700 font-extrabold bg-blue-100/60 py-1 px-3 rounded-full inline-block text-[11px] mb-1">
                  ⭐ BISA BUAT UNDANGAN UNLIMITED (TANPA BATAS JUMLAH)
                </p>
                <p>✓ Akses Semua Template Premium & Custom Background</p>
                <p>✓ Fitur Musik MP3, Galeri Foto, Video YouTube & Kado Digital</p>
                <p>✓ Fitur Mempelai, Buku Tamu (Konfirmasi Doa) & Google Maps</p>
              </div>

              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => setStep(2)} 
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer"
                >
                  Lanjut Pembayaran ({selectedPackage.name})
                </button>
                <button 
                  onClick={() => router.push('/user')} 
                  className="w-full py-2 text-slate-400 hover:text-slate-600 font-semibold text-xs text-center block cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: KONFIRMASI CHECKOUT */}
          {step === 2 && (
            <div className="bg-white border-2 border-slate-300 shadow-xl rounded-2xl p-6 sm:p-8 space-y-6 text-xs animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-slate-900">Upgrade Paket Undangan Website</h2>
                <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Silakan periksa kembali informasi tagihan Anda sebelum melanjutkan pembayaran.
                </p>
              </div>

              <div className="space-y-4 border-y-2 border-slate-300 py-5 text-slate-700 leading-relaxed">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-bold text-slate-900 min-w-[120px]">Nama Akun / User :</span>
                  <span className="text-slate-600">{userProfile?.full_name} ({userProfile?.email})</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-bold text-slate-900 min-w-[120px]">Nama Paket :</span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {selectedPackage.name}
                  </span>
                </div>

                {/* INPUT VOUCHER */}
                <div className="pt-2 border-t-2 border-slate-300">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-slate-900">Punya Kode Voucher?</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan kode voucher"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 bg-white rounded-xl focus:outline-none focus:border-blue-500 text-xs font-mono uppercase text-slate-800"
                      />
                      <button type="button" onClick={() => handleApplyVoucher()} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-white cursor-pointer">
                        Gunakan
                      </button>
                    </div>
                    {voucherError && <p className="text-[11px] text-red-600 font-medium">{voucherError}</p>}
                    {appliedVoucher && (
                      <p className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                        ✓ Voucher {appliedVoucher.split('_FIXED_')[0]} berhasil digunakan!
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 pt-3 border-t-2 border-slate-300 text-sm">
                  <span className="font-bold text-slate-900 min-w-[120px]">Total Bayar :</span>
                  <div className="flex items-center gap-2">
                    {finalAmount < selectedPackage.price && (
                      <span className="text-xs line-through text-slate-400 font-medium">
                        Rp.{selectedPackage.price.toLocaleString('id-ID')}
                      </span>
                    )}
                    <span className="font-black text-slate-900 text-base">
                      Rp.{finalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="button" onClick={() => setStep(1)} className="w-full sm:w-1/3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold rounded-xl cursor-pointer">
                  Kembali
                </button>
                <button type="button" disabled={isProcessing} onClick={handleUpgradeAccount} className="w-full flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-300 cursor-pointer">
                  {isProcessing ? 'Memproses Transaksi...' : 'Bayar Sekarang'}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer onNavigate={(path) => router.push(path)} />
    </div>
  );
}