'use client';

import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        <button onClick={() => router.push('/')} className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors">
          ⬅️ Kembali ke Beranda
        </button>

        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Syarat & Ketentuan</h1>
          <p className="text-xs text-slate-400 mt-1">Terakhir diperbarui: Juli 2026</p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Penerimaan Syarat</h2>
            <p>Dengan mengakses dan menggunakan layanan Undangan Digital by Buanamedia, Anda dinyatakan setuju untuk terikat dengan syarat dan ketentuan yang berlaku di bawah ini.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Penggunaan Layanan</h2>
            <p>Pengguna dilarang keras mengunggah konten, foto, teks, atau musik yang mengandung unsur SARA, pornografi, pelanggaran hak cipta, atau hal-hal lain yang melanggar hukum siber di Indonesia.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Akun dan Keamanan</h2>
            <p>Anda bertanggung jawab penuh atas kerahasiaan kata sandi akun Anda dan segala aktivitas yang terjadi di dalam akun tersebut. Buanamedia tidak bertanggung jawab atas kehilangan data akibat kelalaian pengguna.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Perubahan Layanan</h2>
            <p>Kami berhak untuk mengubah, menangguhkan, atau menghentikan bagian layanan tertentu kapan saja tanpa pemberitahuan terlebih dahulu demi kenyamanan pengembangan sistem berkelanjutan.</p>
          </section>
        </div>

      </div>
    </div>
  );
}