import { ThemeConfig } from './theme';

export const pinkTheme: ThemeConfig = {
  id: 'pink',
  name: 'Romantic Pink',
  // Latar belakang merah muda buah beri yang merona cerah
  bgPage: 'bg-gradient-to-tr from-pink-200 via-rose-50 to-white',
  cardBorder: 'border border-pink-200 bg-white/95 rounded-2xl shadow-lg shadow-pink-200/40',
  badgeBg: 'bg-pink-500/10 text-pink-600',
  badgeText: 'text-pink-600 font-black uppercase tracking-widest text-[9px]',
  badgeBorder: 'border-pink-300/40',
  primaryText: 'text-slate-900 font-serif',
  accentText: 'text-pink-600 font-bold',
  buttonBg: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold tracking-wide rounded-xl',
  buttonHover: 'hover:from-pink-600 hover:to-rose-500 shadow-lg shadow-pink-500/30 transition-all active:scale-95',
  countdownBg: 'bg-pink-50/80 border border-pink-100',
  countdownBorder: 'border-pink-200/50',
  countdownNumber: 'text-pink-600 font-mono font-black',
  formBg: 'bg-slate-50 border border-pink-100 text-slate-800 rounded-xl',
  formBtn: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold',
  formBtnHover: 'hover:opacity-90 transition-opacity'
};