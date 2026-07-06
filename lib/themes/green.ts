import { ThemeConfig } from './theme';

export const greenTheme: ThemeConfig = {
  id: 'green',
  name: 'Forest Nature Green',
  // Latar belakang hijau sage redup ke krem hangat alami
  bgPage: 'bg-gradient-to-tr from-emerald-100 via-zinc-100 to-[#F4EFE6]',
  cardBorder: 'border border-emerald-200 bg-[#FAF8F5] rounded-2xl shadow-md shadow-emerald-900/5',
  badgeBg: 'bg-emerald-50 text-emerald-700',
  badgeText: 'text-emerald-700 font-extrabold uppercase tracking-widest text-[9px]',
  badgeBorder: 'border-emerald-200/50',
  primaryText: 'text-stone-800 font-serif',
  accentText: 'text-emerald-600 font-bold',
  buttonBg: 'bg-emerald-600 text-white font-bold tracking-wide rounded-xl',
  buttonHover: 'hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95',
  countdownBg: 'bg-emerald-50/60 border border-emerald-100',
  countdownBorder: 'border-emerald-200/30',
  countdownNumber: 'text-emerald-700 font-mono font-black',
  formBg: 'bg-[#F4EFE6] border border-stone-200 text-stone-800 rounded-xl',
  formBtn: 'bg-emerald-600 text-white font-bold',
  formBtnHover: 'hover:bg-emerald-700 transition-colors'
};