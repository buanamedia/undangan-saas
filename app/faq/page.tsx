'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FAQPage() {
  const router = useRouter();
  
  const faqData = [
    { q: 'Apakah saya bisa mencoba membuat undangan secara gratis?', a: 'Ya, tentu saja! Kami menyediakan paket Free untuk mencoba membuat undangan dengan fitur-fitur dasar secara gratis tanpa batasan waktu pembuatan.' },
    { q: 'Berapa lama proses pengerjaan undangan digital ini?', a: 'Sistem kami sepenuhnya otomatis (SaaS). Setelah Anda mendaftar dan mengisi data formulir acara di dashboard, undangan Anda langsung jadi dan siap disebarkan saat itu juga.' },
    { q: 'Apakah musik latar belakang bisa diganti sesuai keinginan?', a: 'Bisa. Pada paket premium, Anda dibebaskan untuk memasukkan tautan lagu mp3 favorit atau memilih dari daftar instrumen lagu yang telah kami sediakan di dashboard.' },
    { q: 'Bagaimana cara membagikan undangan ke WhatsApp tamu?', a: 'Di bagian menu dashboard user, kami menyediakan generator tautan otomatis. Anda cukup memasukkan daftar nama tamu, klik tombol salin, lalu kirimkan langsung via chat WhatsApp.' },
    { q: 'Apakah ada batasan jumlah tamu yang diundang?', a: 'Tidak ada batasan sama sekali. Anda bebas membagikan link undangan digital kustom Anda ke ratusan atau bahkan ribuan tamu tanpa biaya tambahan.' }
  ];

  // State untuk melacak item FAQ mana saja yang sedang terbuka accordion-nya
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        <button onClick={() => router.push('/')} className="text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors">
          ⬅️ Kembali ke Beranda
        </button>

        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions (FAQ)</h1>
          <p className="text-xs text-slate-400 mt-1">Punya pertanyaan? Cari jawabannya di sini.</p>
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="space-y-3 pt-2">
          {faqData.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 pr-4">{item.q}</span>
                  <span className="text-blue-700 font-bold text-xs">{isOpen ? '▲' : '▼'}</span>
                </button>
                
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-50 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}