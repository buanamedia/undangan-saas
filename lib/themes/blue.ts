import { ThemeConfig } from './theme';

export const blueTheme: ThemeConfig = {
  id: 'blue',
  name: 'Ocean Breeze Blue',
  // Latar belakang biru langit cerah yang segar
  bgPage: 'bg-gradient-to-tr from-sky-200 via-blue-50 to-white',
  cardBorder: 'border border-sky-200 bg-white/95 rounded-2xl shadow-lg shadow-sky-100',
  badgeBg: 'bg-sky-50 text-sky-600',
  badgeText: 'text-sky-600 font-extrabold uppercase tracking-widest text-[9px]',
  badgeBorder: 'border-sky-200/50',
  primaryText: 'text-slate-900 font-serif',
  accentText: 'text-sky-600 font-bold',
  buttonBg: 'bg-sky-500 text-white font-bold tracking-wide rounded-xl',
  buttonHover: 'hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all active:scale-95',
  countdownBg: 'bg-sky-50/70 border border-sky-100',
  countdownBorder: 'border-sky-200/40',
  countdownNumber: 'text-sky-600 font-mono font-black',
  formBg: 'bg-slate-50 border border-slate-200 text-slate-800 rounded-xl',
  formBtn: 'bg-sky-500 text-white font-bold',
  formBtnHover: 'hover:bg-sky-600 transition-colors'
};