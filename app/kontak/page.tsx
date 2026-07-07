'use client';

import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* NAVBAR (IDENTIK & SELARAS DENGAN BERANDA) */}
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

          {/* ⚡ PERBAIKAN: Mengganti tombol atas kanan menjadi satu tombol Dashboard yang selaras */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/user')} 
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* KONTEN UTAMA HUBUNGI KAMI */}
      <main className="grow bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl w-full mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/60 shadow-xs space-y-6">
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
                    <p className="text-slate-600 leading-relaxed mt-0.5 text-xs">
                      Buanamedia Studio <br />
                      Jl. Buana Perkasa II Blok C4 No.35 <br />
                      RT.005 RW.004, Kel. Pinang,<br />
                      Kec. Pinang, Kota Tangerang, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sisi Rangan: Jam Operasional Pelayanan */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">⏰ Jam Operasional Support</h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>Tim dukungan teknis kami melayani operasional pada waktu-waktu berikut:</p>
                <div className="pt-2 border-t border-slate-200/60 space-y-1 font-medium text-xs">
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
      </main>

      {/* FOOTER (IDENTIK DENGAN HALAMAN UTAMA & TENTANG KAMI) */}
      <footer className="border-t border-slate-100 py-8 bg-white text-center text-xs text-slate-400">
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
            <button onClick={() => router.push('/kontak')} className="text-blue-700 transition-colors cursor-pointer">kontak</button>
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