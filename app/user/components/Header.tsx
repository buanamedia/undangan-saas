'use client';

interface HeaderProps {
  onLogout: () => void;
  onNavigateToPremium: () => void;
  onNavigateHome: () => void;
  premiumLabel?: string;
  logoutLabel?: string;
  premiumBgColor?: string; 
}

export default function Header({ 
  onLogout, 
  onNavigateToPremium, 
  onNavigateHome,
  premiumLabel = "Upgrade",
  logoutLabel = "Keluar",
  premiumBgColor = "bg-amber-600 hover:bg-amber-700" 
}: HeaderProps) {
  return (
    // ⚡ PERBAIKAN: Menambahkan bg & border khusus dark mode
    <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO BRANDING */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
          <img 
            src="/logo/Logo.png" 
            alt="Logo Undangan Digital" 
            className="w-8 h-8 object-contain shrink-0" 
          />
          {/* ⚡ PERBAIKAN: Text color dark mode */}
          <div className="flex flex-col leading-none">
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm sm:text-base">
              Undangan <span className="text-blue-700 dark:text-blue-500">Digital</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">
              by Buanamedia
            </span>
          </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToPremium} 
            className={`px-[18px] py-2.5 ${premiumBgColor} text-white text-xs font-bold rounded-xl shadow-xs transition-all tracking-wide cursor-pointer`}
          >
            {premiumLabel}
          </button>
          <button 
            onClick={onLogout}
            className="px-[18px] py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all tracking-wide cursor-pointer"
          >
            {logoutLabel}
          </button>
        </div>
      </div>
    </header>
  );
}