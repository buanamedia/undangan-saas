'use client';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    // ⚡ PERBAIKAN: Menambahkan bg & border khusus dark mode pada kontainer footer luar
    <footer className="border-t border-slate-100 dark:border-slate-800 py-8 bg-white dark:bg-slate-950 text-center text-xs text-slate-400 w-full transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        
        {/* MENU NAVIGASI FOOTER */}
        {/* ⚡ PERBAIKAN: Teks link disesuaikan dark mode */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 dark:text-slate-400 font-semibold text-[11px] sm:text-xs">
          <button onClick={() => onNavigate('/tentang-kami')} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">Tentang Kami</button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <button onClick={() => onNavigate('/demo')} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">Tema</button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <button onClick={() => onNavigate('/refund-policy')} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">refund-policy</button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <button onClick={() => onNavigate('/faq')} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">FAQ</button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <button onClick={() => onNavigate('/syarat-ketentuan')} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">syarat-ketentuan</button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <button onClick={() => onNavigate('/kontak')} className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer">kontak</button>
        </div>

        {/* BRANDING FOOTER */}
        {/* ⚡ PERBAIKAN: Teks utama disesuaikan dark mode */}
        <div className="flex flex-col items-center justify-center gap-0.5 border-t border-slate-50 dark:border-slate-900/60 pt-4">
          <p className="font-bold text-slate-700 dark:text-slate-300">Undangan Digital &copy; 2026</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">by Buanamedia</p>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">Solusi Undangan Digital Elegan, Praktis, dan Tanpa Batas.</p>
      </div>
    </footer>
  );
}