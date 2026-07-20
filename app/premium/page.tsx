'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Header from '../user/components/Header'; // ⚡ Menggunakan komponen Header modular
import Footer from '../user/components/Footer'; // ⚡ Menggunakan komponen Footer modular

export default function PremiumUpgradePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [step, setStep] = useState(1); // Step 1: Pricelist, Step 2: Confirmation Checkout
  const [isProcessing, setIsProcessing] = useState(false);

  // State Manajemen Voucher & Harga Dinamis
  const basePrice = 100000; // Harga dasar promo Rp.100.000
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [finalAmount, setFinalAmount] = useState(basePrice);
  const [voucherError, setVoucherError] = useState('');

  // Menyimpan daftar voucher aktif dari database
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
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
      
      // AMBIL DAFTAR VOUCHER AKTIF SECARA OTOMATIS DARI DATABASE
      try {
        const { data: vouchers, error } = await supabase
          .from('vouchers')
          .select('*');
        
        if (error) {
          console.error("Gagal fetch tabel vouchers. Cek RLS Supabase Anda!", error);
          setDbError(`Database Error: ${error.message}`);
          throw error;
        }

        if (vouchers) {
          setAvailableVouchers(vouchers);
        }
      } catch (err) {
        console.error("Error catch block:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fungsi memvalidasi voucher dari database (Mendukung Rupiah & Persentase)
  const handleApplyVoucher = async (forcedCode?: string) => {
    setVoucherError('');
    const code = (forcedCode || voucherCode).trim().toUpperCase();

    if (!code) {
      setAppliedVoucher('');
      setDiscountPercent(0);
      setFinalAmount(basePrice);
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
        
        // Cek tipe diskon dari database Anda
        const isRupiah = voucherData.type === 'fixed' || voucherData.discount_type === 'fixed' || String(voucherData.type).toLowerCase().includes('rupiah');

        if (isRupiah) {
          // Jika potongan Rupiah (e.g., Rp 50.000)
          setDiscountPercent(0); 
          const calculatedAmount = basePrice - discountValue;
          setFinalAmount(calculatedAmount < 0 ? 0 : calculatedAmount);
          setAppliedVoucher(`${code}_FIXED_${discountValue}`); 
        } else {
          // Jika potongan Persentase (e.g., 50%)
          setDiscountPercent(discountValue);
          setFinalAmount(basePrice - (basePrice * discountValue) / 100);
          setAppliedVoucher(code);
        }

        if (forcedCode) setVoucherCode(code); 
      } else {
        setVoucherError('Kode voucher tidak ditemukan atau salah penulisan.');
        setAppliedVoucher('');
        setDiscountPercent(0);
        setFinalAmount(basePrice);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderInvoiceId, 
          amount: finalAmount,         
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

  const handleLogoutAction = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xs font-bold text-blue-700 animate-pulse">MENYIAPKAN HALAMAN PREMIUM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between transition-colors duration-200">
      
      {/* ⚡ NAVBAR UTUH: Mengirim parameter warna premiumBgColor agar menjadi biru khusus untuk Dashboard */}
      <Header 
        onLogout={handleLogoutAction}
        onNavigateToPremium={() => router.push('/user')} 
        onNavigateHome={() => router.push('/')}
        premiumLabel="Dashboard"
        logoutLabel="Keluar"
        premiumBgColor="bg-[#1d4ed8] hover:bg-blue-700" // ⚡ Kustom warna tombol dashboard menjadi Biru
      />

      {/* ================= AREA UTAMA KONTEN TENGAH ================= */}
      <main className="grow flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full transition-all duration-300">
          
          {/* STEP 1: KARTU PRICELIST */}
          {step === 1 && (
            <div className="bg-white border-2 border-slate-300 shadow-xl rounded-2xl overflow-hidden max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 space-y-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Undangan Digital Premium</h2>
                <p className="text-xs text-slate-500 leading-relaxed px-4">
                  Disediakan khusus untuk Anda yang ingin memiliki undangan untuk acara apa saja dengan fitur yang lengkap.
                </p>
              </div>
              <div className="bg-black text-white py-4 space-y-0.5">
                <p className="text-xs line-through text-slate-400 font-medium tracking-wide">Rp.250 Ribu</p>
                <p className="text-lg font-black tracking-wider text-blue-500">Rp.100 Ribu</p>
              </div>
              <div className="p-6 bg-slate-50/50 border-b-2 border-slate-300 text-slate-600 text-xs leading-loose space-y-1 font-medium text-center">
                <p className="text-blue-700 font-extrabold bg-blue-50 py-1 px-3 rounded-full inline-block text-[11px] mb-2 border border-blue-200/50">
                  ⭐ BISA BUAT UNDANGAN UNLIMITED (TANPA BATAS JUMLAH)
                </p>
                <p>Pilihan Template Premium</p>
                <p>Fitur Mempelai (untuk lamaran dan pernikahan)</p>
                <p>Profil Tokoh Lengkap</p>
                <p>Informasi Rincian Acara</p>
                <p>Blok Acara Tambahan</p>
                <p>Lokasi Acara (Dynamic Google Maps)</p>
                <p>Kolom Konfirmasi Doa dan Harapan</p>
                <p>Foto Latar Belakang Kustom</p>
                <p>Latar Belakang Musik (.mp3)</p>
                <p>Kirim Undangan Menggunakan Nama Personal</p>
                <p>Unggah Foto Galeri</p>
                <p>Sematkan Video Galeri YouTube</p>
                <p>Kado Acara (Rekening Digital/E-Wallet)</p>
                <p>Kustom Blok Informasi Tambahan</p>
              </div>
              <div className="p-4 bg-white">
                <button onClick={() => setStep(2)} className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md text-xs uppercase tracking-wider cursor-pointer">
                  Upgrade Sekarang
                </button>
                <button onClick={() => router.push('/user')} className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 font-semibold text-xs transition-colors cursor-pointer">
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
                  Silakan periksa kembali informasi undangan anda sebelum melakukan upgrade.
                </p>
              </div>

              <div className="space-y-4 border-y-2 border-slate-300 py-5 text-slate-700 leading-relaxed">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-bold text-slate-900 min-w-[120px]">Nama Akun / User :</span>
                  <span className="text-slate-600">{userProfile?.full_name} ({userProfile?.email})</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-bold text-slate-900 min-w-[120px]">Nama Paket :</span>
                  <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">Undangan Digital Premium (Akses Unlimited)</span>
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
                      <button type="button" onClick={() => handleApplyVoucher()} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer">
                        Gunakan
                      </button>
                    </div>
                    {voucherError && <p className="text-[11px] text-red-600 font-medium">{voucherError}</p>}
                    {appliedVoucher && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 animate-pulse">
                        ✓ Voucher {appliedVoucher.split('_FIXED_')[0]} berhasil digunakan! {' '}
                        {appliedVoucher.includes('_FIXED_') 
                          ? `Potongan Rp.${Number(appliedVoucher.split('_FIXED_')[1]).toLocaleString('id-ID')}.`
                          : `Potongan ${discountPercent}%.`
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* NOTIFIKASI ERROR DATABASE */}
                {dbError && (
                  <div className="p-2 bg-red-50 text-red-700 rounded border border-red-200 text-[11px]">
                    {dbError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 pt-3 border-t-2 border-slate-300 text-sm">
                  <span className="font-bold text-slate-900 min-w-[120px]">Harga :</span>
                  <div className="flex items-center gap-2">
                    {discountPercent > 0 && (
                      <span className="text-xs line-through text-slate-400 font-medium">
                        Rp.{(100000).toLocaleString('id-ID')}
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
                <button type="button" disabled={isProcessing} onClick={handleUpgradeAccount} className="w-full flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer">
                  {isProcessing ? (
                    <span className="animate-pulse">Memproses Transaksi...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/xl">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Bayar Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER MODULAR */}
      <Footer onNavigate={(path) => router.push(path)} />

    </div>
  );
}