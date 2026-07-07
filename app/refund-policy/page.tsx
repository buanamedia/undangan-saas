'use client';

import { useRouter } from 'next/navigation';

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        <button onClick={() => router.push('/')} className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors">
          ⬅️ Kembali ke Beranda
        </button>

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
            <h2 className="text-base font-bold text-slate-900">3. Proses Pengajuan</h2>
            <p>Untuk mengajukan kendala pembayaran ganda, silakan hubungi tim support admin Buanamedia dengan menyertakan bukti pembayaran resmi, email akun, serta ID transaksi terkait.</p>
          </section>
        </div>

      </div>
    </div>
  );
}