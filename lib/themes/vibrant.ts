import { ThemeConfig } from './theme';

export const vibrantTheme: ThemeConfig = {
  id: 'vibrant',
  name: 'Vibrant Luxury',
  // 🌌 LATAR BELAKANG: Gradasi ungu beludru gelap ke fuchsia malam yang sangat kaya, mewah, dan hidup
  bgPage: 'bg-gradient-to-br from-[#0F051D] via-[#2A0845] to-[#640D5F]',
  
  // 💎 KOTAK UNDANGAN: Efek kaca mika transparan mewah (Glassmorphism) dengan kilau border pink neon tipis
  cardBorder: 'border border-pink-500/30 bg-[#0F051D]/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-pink-950/40',
  
  // 🏷️ BADGE: Perpaduan emas mewah di atas latar transparan pekat
  badgeBg: 'bg-amber-400/10 text-amber-300',
  badgeText: 'text-amber-300 font-black uppercase tracking-widest text-[9px] border border-amber-500/30 px-2.5 py-0.5 rounded-md',
  badgeBorder: 'border-amber-500/30',
  
  // ✍️ TEKS UTAMA: Menggunakan warna putih kristal cerah agar sangat tajam dan mudah dibaca di atas kartu gelap
  primaryText: 'text-purple-50 font-serif',
  
  // ✨ AKSEN TEKS: Warna Emas Kemilau khusus untuk nama tokoh atau penanda penting
  accentText: 'text-amber-300 font-extrabold tracking-wide',
  
  // 🎯 TOMBOL UTAMA: Gradasi warna Hot Pink ke Velvet Purple dengan bayangan glow neon yang megah
  buttonBg: 'bg-gradient-to-r from-[#FF007A] to-[#7000FF] text-white font-bold tracking-wider uppercase rounded-xl',
  buttonHover: 'hover:brightness-110 shadow-lg shadow-pink-500/40 transition-all active:scale-95',
  
  // ⏳ HITUNG MUNDUR: Latar belakang hitam legam dengan angka emas murni yang menyala kontras
  countdownBg: 'bg-[#05010C]/90 border border-purple-500/20',
  countdownBorder: 'border-purple-500/20',
  countdownNumber: 'text-amber-300 font-mono font-black drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]',
  
  // 📝 FORM UCAPAN: Kotak gelap eksklusif yang sangat elegan
  formBg: 'bg-[#140A24] border border-purple-900/40 text-purple-100 rounded-xl',
  formBtn: 'bg-gradient-to-r from-[#FF007A] to-[#7000FF] text-white font-black tracking-wide',
  formBtnHover: 'hover:opacity-90 transition-opacity'
};