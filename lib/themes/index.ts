import { pinkTheme } from './pink';
import { blueTheme } from './blue';
import { greenTheme } from './green';
import { ThemeConfig } from './theme';
import { freeTheme } from './free';


// Sediakan fallback tema default bawaan (Amber/Cokelat lama Anda)
export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default Clean',
  bgPage: 'bg-stone-50',
  cardBorder: 'border-stone-200/60',
  badgeBg: 'bg-amber-50',
  badgeText: 'text-amber-600',
  badgeBorder: 'border-amber-100',
  primaryText: 'text-stone-900',
  accentText: 'text-amber-600',
  buttonBg: 'bg-amber-500',
  buttonHover: 'hover:bg-amber-600',
  countdownBg: 'bg-amber-50/60',
  countdownBorder: 'border-amber-200/70',
  countdownNumber: 'text-amber-700',
  formBg: 'bg-[#FAF2F2]',
  formBtn: 'bg-[#BC6C4D]',
  formBtnHover: 'hover:bg-[#a65d3f]'
};

// ⚡ TEMA BARU: VIBRANT FULL COLOR (RETRO / FUN / POP)
export const vibrantTheme: ThemeConfig = {
  id: 'vibrant',
  name: 'Vibrant Full Color',
  bgPage: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900', // Background gradasi full color cerah
  cardBorder: 'border-cyan-400/40',
  badgeBg: 'bg-yellow-400',
  badgeText: 'text-purple-950 font-black',
  badgeBorder: 'border-yellow-300',
  primaryText: 'text-white',
  accentText: 'text-yellow-300',
  buttonBg: 'bg-gradient-to-r from-pink-500 to-purple-600',
  buttonHover: 'hover:from-pink-600 hover:to-purple-700 shadow-md shadow-pink-500/20',
  countdownBg: 'bg-black/40 backdrop-blur-md',
  countdownBorder: 'border-pink-500/50',
  countdownNumber: 'text-cyan-300 font-extrabold',
  formBg: 'bg-white/95 shadow-xl',
  formBtn: 'bg-[#FF007A]', // Hot Pink Neon
  formBtnHover: 'hover:bg-[#e6006f]'
};

export const themesRegistry: Record<string, ThemeConfig> = {
  default: defaultTheme,
  pink: pinkTheme,
  blue: blueTheme,
  green: greenTheme,
  vibrant: vibrantTheme,
  free: freeTheme,
  };