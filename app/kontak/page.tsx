'use client';

import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-8">
        
        {/* Navigasi Kembali */}
        <button onClick={() => router.push('/')} className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors">
          ⬅️ Kembali ke Beranda
        </button>

        {/* Header Halaman */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hubungi Kami</h1>
          <p className="text-xs text-slate-400 mt-1">Punya pertanyaan atau butuh bantuan teknis? Tim support Buanamedia siap membantu Anda.</p>
        </div>

        {/* Grid Informasi Kontak & Operasional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Sisi Kiri: Detail Kontak Utama */}
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Informasi Kontak</h2>
            
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Email */}
              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-700 shrink-0">✉️</span>
                <div>
                  <p className="font-bold text-slate-900">Surat Elektronik (Email)</p>
                  <a href="mailto:support@buanamedia.my.id" className="text-blue-700 hover:underline">
                    support@buanamedia.my.id
                  </a>
                </div>
              </div>

              {/* Telepon / WhatsApp */}
              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-700 shrink-0">📞</span>
                <div>
                  <p className="font-bold text-slate-900">Telepon / WhatsApp Support</p>
                  <a href="https://wa.me/6281414159500" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                    +62 814-1415-9500
                  </a>
                </div>
              </div>

              {/* Alamat Usaha */}
              <div className="flex items-start gap-3">
                <span className="text-lg bg-blue-50 p-2 rounded-lg text-blue-700 shrink-0">📍</span>
                <div>
                  <p className="font-bold text-slate-900">Alamat Kantor Usaha</p>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    Buanamedia Studio <br />
                    Jl. Buana Perkasa II Blok C4 No.35 <br />
                    RT.005 RW.004, Kel. Pinang,<br />
                    Kec. Pinang, Kota Tangerang, Indonesia
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Jam Operasional Pelayanan */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">⏰ Jam Operasional Support</h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>Tim dukungan teknis kami melayani operasional pada waktu-waktu berikut:</p>
              <div className="pt-2 border-t border-slate-200/60 space-y-1 font-medium">
                <p className="flex justify-between"><span>Senin - Jumat:</span> <span className="text-slate-900">09:00 - 17:00 WIB</span></p>
                <p className="flex justify-between"><span>Sabtu:</span> <span className="text-slate-900">09:00 - 13:00 WIB</span></p>
                <p className="flex justify-between text-slate-400"><span>Minggu / Hari Libur:</span> <span>Tutup</span></p>
              </div>
              <p className="text-[11px] text-slate-400 italic pt-2">
                *Pertanyaan yang masuk di luar jam kerja akan direspons pada hari kerja berikutnya.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
