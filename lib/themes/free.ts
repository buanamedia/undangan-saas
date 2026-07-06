import { ThemeConfig } from './theme';

export const freeTheme: ThemeConfig = {
  id: 'free',
  name: 'Minimalist Free (Essential)',
  
  // 1. BLOK COVER & PROFIL (Tetap Ditampilkan Menarik)
  bgPage: 'bg-gradient-to-b from-slate-100 via-white to-slate-50',
  cardBorder: 'border border-slate-200 bg-white rounded-xl shadow-sm',
  badgeBg: 'bg-slate-100 text-slate-600',
  badgeText: 'text-slate-600 font-bold uppercase tracking-wider text-[9px]',
  badgeBorder: 'border-slate-200',
  primaryText: 'text-slate-900 font-serif',
  
  // 2. BLOK INFORMASI & LOKASI ACARA (Tetap Ditampilkan)
  accentText: 'text-slate-800 font-bold uppercase',
  buttonBg: 'bg-slate-800 text-white font-bold rounded-lg',
  buttonHover: 'hover:bg-slate-900 transition-all active:scale-95',
  countdownBg: 'bg-slate-50 border border-slate-200',
  countdownBorder: 'border-slate-200/60',
  countdownNumber: 'text-slate-800 font-mono font-bold',
  
  // 3. BLOK DOA & HARAPAN (Tetap Ditampilkan)
  formBg: 'bg-slate-50 border border-slate-200 text-slate-800 rounded-xl',
  formBtn: 'bg-slate-800 text-white font-bold',
  formBtnHover: 'hover:bg-slate-900 transition-colors'
};