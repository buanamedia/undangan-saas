'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { themesRegistry } from '@/lib/themes';
import { getDemoDataByType, demoWishesMock } from '@/lib/themes/demo-data';
import { createClient } from '@/lib/supabase/client';
import Header from '../user/components/Header'; // ⚡ Menggunakan komponen Header modular
import Footer from '../user/components/Footer'; // ⚡ Menggunakan komponen Footer modular

function InvitationCountdown({ targetDateString, isReception = false, theme }: { targetDateString: string; isReception?: boolean; theme: any }) {
  return (
    <div className={`w-full py-3 px-4 ${theme.countdownBg} border ${theme.countdownBorder} rounded-xl my-2 text-center`}>
      <p className={`text-[10px] font-bold ${theme.countdownNumber} tracking-widest uppercase mb-1.5`}>
        Hitung Mundur {isReception ? "Resepsi" : "Acara"}
      </p>
      <div className="flex justify-center items-center gap-3 font-mono text-xs font-bold text-stone-800">
        <div className="bg-white px-2.5 py-1 rounded border"><span className={`${theme.countdownNumber} text-sm`}>150</span> Hari</div>
        <div className="bg-white px-2.5 py-1 rounded border"><span className={`${theme.countdownNumber} text-sm`}>12</span> Jam</div>
        <div className="bg-white px-2.5 py-1 rounded border"><span className={`${theme.countdownNumber} text-sm`}>45</span> Menit</div>
      </div>
    </div>
  );
}

export default function DemoThemesPage() {
  const router = useRouter(); 
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [activeThemeId, setActiveThemeId] = useState<string>('default');
  const [activeType, setActiveType] = useState<string>('pernikahan'); 
  
  const [isOpen, setIsOpen] = useState(false); 
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTheme = themesRegistry[activeThemeId] || themesRegistry.default;
  const inv = getDemoDataByType(activeType);
  const ext = inv.custom_details;

  const demoMusicUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const availableThemesInCard = [
    { id: 'default', title: 'Elegant Amber', label: 'Khusus Pernikahan & Acara' },
    { id: 'pink', title: 'Romantic Pink', label: 'Khusus Pernikahan & Acara' },
    { id: 'blue', title: 'Ocean Blue', label: 'Khusus Pernikahan & Acara' },
    { id: 'green', title: 'Emerald Green', label: 'Khusus Pernikahan & Acara' },
    { id: 'vibrant', title: 'Vibrant Full Color', label: 'Khusus Pernikahan & Acara' },
  ];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, [supabase]);

  const cleanMapEmbedUrl = (rawUrl: string) => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const handleOpenDemoTheme = (themeId: string) => {
    setActiveThemeId(themeId);
    setIsOpen(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.play().catch((err) => console.log("Autoplay dicegah: ", err));
      }
    }, 200);
  };

  const handleBackToCatalog = () => {
    setIsOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getDynamicDisplayName = () => {
    if (activeType === 'pernikahan' || activeType === 'lamaran') {
      return "Fitri & Jaka";
    }
    if (activeType === 'akikah') {
      return "Muhammad Al-Fatih";
    }
    if (activeType === 'ulang-tahun' || activeType === 'wisuda') {
      return "Rian Hidayat";
    }
    return inv.title.split(":")[0] || "Tamu Undangan";
  };

  // Aksi Klik Tombol Utama Kiri pada Header
  const handlePrimaryAction = () => {
    if (isLoggedIn) {
      router.push('/user');
    } else {
      router.push('/login');
    }
  };

  // Aksi Klik Tombol Sekunder Kanan pada Header
  const handleSecondaryAction = async () => {
    if (isLoggedIn) {
      const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
      if (!confirmLogout) return;
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      router.push('/');
    } else {
      router.push('/register');
    }
  };

  return (
    <div className={`h-screen w-screen text-stone-800 flex flex-col justify-between relative overflow-hidden font-sans antialiased`}>
       
      <audio ref={audioRef} src={demoMusicUrl} loop preload="auto" />

      {/* ⚡ NAVBAR GLOBAL MODULAR DINAMIS (Hanya muncul saat pratinjau tema belum dibuka) */}
      {!isOpen && (
        checkingAuth ? (
          <div className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md w-full flex items-center justify-between max-w-7xl mx-auto px-4">
            <div className="w-32 h-6 bg-slate-100 animate-pulse rounded-lg" />
            <div className="w-20 h-8 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        ) : (
          <Header 
            onLogout={handleSecondaryAction}
            onNavigateToPremium={handlePrimaryAction}
            onNavigateHome={() => router.push('/')}
            premiumLabel={isLoggedIn ? "Dashboard" : "Masuk"}
            logoutLabel={isLoggedIn ? "Keluar" : "Daftar"}
            premiumBgColor="bg-[#1d4ed8] hover:bg-blue-700" // ⚡ Menggunakan warna biru untuk keselarasan halaman publik
          />
        )
      )}

      {/* BUTTON FLOATING MUTING (Hanya muncul saat pratinjau tema dibuka) */}
      {isOpen && (
        <button 
          onClick={toggleMute} 
          className="fixed bottom-24 right-4 z-50 p-2.5 bg-white/90 hover:bg-white text-stone-800 backdrop-blur-md shadow-md rounded-full border border-stone-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
        >
          {isMuted ? "🎵 Play" : "🔇 Mute"}
        </button>
      )}

      {/* KONTEN UTAMA */}
      <main className={`grow w-full flex flex-col items-center overflow-y-auto ${isOpen ? (currentTheme.bgPage) : 'bg-slate-50 pt-16'}`}>
         
        {/* TAMPILAN 1: KATALOG KARTU UTAMA */}
        {!isOpen ? (
          <div className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
             
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-slate-600">
                Tersedia berbagai desain menarik yang dapat Anda gunakan.
              </p>
              <p className="text-sm font-medium text-slate-600">
                Diantaranya seperti di bawah ini.
              </p>
            </div>

            {/* Filter Tipe Acara */}
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {[
                { id: 'pernikahan', label: 'Pernikahan' },
                { id: 'lainnya', label: 'Undangan Lainnya' },
                { id: 'khitanan', label: 'Khitanan' },
                { id: 'akikah', label: 'Akikah' },
                { id: 'lamaran', label: 'Lamaran' },
                { id: 'wisuda', label: 'Wisuda' },
                { id: 'peresmian', label: 'Peresmian' },
                { id: 'syukuran', label: 'Syukuran Umrah / Haji' },
                { id: 'ulang-tahun', label: 'Ulang Tahun' },
                { id: 'halalbihalal', label: 'Halalbihalal' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveType(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                    activeType === cat.id
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid Katalog Bertipe Kartu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {availableThemesInCard.map((theme) => (
                <div 
                  key={theme.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="p-4 text-center border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">{theme.title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{theme.label}</p>
                  </div>

                  {/* Frame Miniatur Sampul / Preview */}
                  <div className="bg-stone-900/10 min-h-64 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center border-b">
                    {ext.cover_photo_url && (
                      <img src={ext.cover_photo_url} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    )}
                    <div className="relative z-10 p-4 rounded-xl bg-white/80 border backdrop-blur-xs w-full max-w-[200px] shadow-xs space-y-2">
                      <p className="text-[9px] font-bold text-amber-700 tracking-wider uppercase">PREVIEW</p>
                      <h4 className="text-[11px] font-bold uppercase tracking-wide truncate">{inv.title.split(":")[0]}</h4>
                    </div>
                  </div>

                  {/* Tombol Demo Biru */}
                  <div className="p-4 bg-white">
                    <button
                      onClick={() => handleOpenDemoTheme(theme.id)}
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wider rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                      Demo
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ⚡ PANGGIL FOOTER MODULAR YANG BERSIH DI SINI DI DALAM MAIN CONTAINER */}
            <Footer onNavigate={(path) => router.push(path)} />
             
          </div>
        ) : (
          /* TAMPILAN 2: INTEGRASI ISI MATERI TEMA KUSTOM LENGKAP SAAT TOMBOL DEMO DIKLIK */
          <div className="w-full max-w-md flex flex-col gap-4 px-4 sm:px-0 py-6">
             
            <button 
              onClick={handleBackToCatalog}
              className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs tracking-wide uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              ⚙️ Kembali ke Katalog Desain Tema Acara
            </button>

            <div className={`w-full bg-white p-6 border ${currentTheme.cardBorder} rounded-2xl shadow-sm space-y-8 pb-20 animate-in fade-in duration-300`}>
               
              {/* SECTION 1: PEMBUKA */}
              <div id="pembuka" className="text-center space-y-2 scroll-mt-4">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${currentTheme.badgeText} ${currentTheme.badgeBg} px-2.5 py-0.5 rounded-md border ${currentTheme.badgeBorder}`}>
                  Undangan {inv.type}
                </span>
                {ext.cover_photo_url && (
                  <div className="flex justify-center pt-2">
                    <img src={ext.cover_photo_url} alt="Profil" className="w-24 h-24 object-cover rounded-full border-2 border-stone-100 shadow-sm" />
                  </div>
                )}
                <h1 className="text-xl font-serif font-bold text-stone-900 pt-1">{inv.title}</h1>
              </div>

              <hr className="border-t-2 border-stone-300" />

              {/* SECTION 2: PROFIL TOKOH */}
              <div id="profil" className="p-4 bg-stone-50 border rounded-xl space-y-3 text-center scroll-mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Profil Utama</h3>
                <p className="text-xs text-stone-600 italic">"{ext.profile_prolog}"</p>
                 
                {activeType === 'pernikahan' || activeType === 'lamaran' ? (
                  <div className="font-serif text-sm font-bold text-stone-900 space-y-1">
                    <p>💍 {inv.groom_name}</p>
                    <p className="text-xs font-sans text-stone-400 font-normal">&</p>
                    <p>💍 {inv.bride_name}</p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-700 leading-relaxed font-semibold bg-white p-2.5 border rounded-lg text-center uppercase tracking-wide">{inv.title.split(":")[1] || inv.title}</p>
                )}

                {ext.profile_bottom_photo_url && (
                  <div className="w-full pt-2">
                    <img src={ext.profile_bottom_photo_url} alt="Profil Bawah" className="w-full h-48 object-cover rounded-xl border border-stone-200/60 shadow-xs" />
                  </div>
                )}
              </div>

              <hr className="border-t-2 border-stone-300" />

              {/* SECTION 3: JADWAL PELAKSANAAN */}
              <div id="jadwal" className="space-y-6 scroll-mt-4">
                <div className="text-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Informasi Pelaksanaan</h3>
                  <p className="text-[11px] text-stone-500 mt-1 px-4 text-center">{ext.event_prolog}</p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-stone-200/60 bg-stone-50/30 space-y-3">
                    <h4 className={`font-serif font-bold ${currentTheme.accentText} text-sm text-center uppercase`}>✨ {ext.event_block_title}</h4>
                    <div className="text-xs text-center space-y-1 text-stone-700">
                      <p className="font-semibold">📆 Sabtu, 25 Desember 2027</p>
                      <p className="font-mono text-stone-600">⏰ Pukul 09:00 WIB s/d Selesai</p>
                      <p className="text-stone-500 pt-1 border-t mt-1">📍 {inv.location_address}</p>
                    </div>
                    {!ext.reception_address && <InvitationCountdown targetDateString={inv.event_date} theme={currentTheme} />}
                    <div className="w-full h-36 rounded-lg overflow-hidden border">
                      <iframe width="100%" height="100%" className="border-0" src={cleanMapEmbedUrl(inv.location_address)}></iframe>
                    </div>
                  </div>

                  {ext.reception_address && (
                    <div className="p-4 rounded-xl border border-stone-200/60 bg-stone-50/30 space-y-3">
                      <h4 className={`font-serif font-bold ${currentTheme.accentText} text-sm text-center`}>🎉 Acara Resepsi</h4>
                      <div className="text-xs text-center space-y-1 text-stone-700">
                        <p className="font-semibold">📆 Sabtu, 25 Desember 2027</p>
                        <p className="font-mono text-stone-600">⏰ Pukul 11:00 WIB s/d Selesai</p>
                        <p className="text-stone-500 pt-1 border-t mt-1">📍 {ext.reception_address}</p>
                      </div>
                      <InvitationCountdown targetDateString={inv.event_date} theme={currentTheme} />
                      <div className="w-full h-36 rounded-lg overflow-hidden border">
                        <iframe width="100%" height="100%" className="border-0" src={cleanMapEmbedUrl(ext.reception_address)}></iframe>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: GALERI FOTO */}
              {inv.gallery_images.length > 0 && (
                <div id="galeri" className="scroll-mt-4">
                  <hr className="border-t-2 border-stone-300 mb-8" />
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Galeri Foto</h3>
                      <p className="text-[10px] text-stone-400 mt-0.5">{ext.gallery_prolog}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {inv.gallery_images.map((imgUrl: string, i: number) => (
                        <div key={i} onClick={() => setLightboxIndex(i)} className="w-full h-32 rounded-xl overflow-hidden border border-stone-100 bg-stone-100 cursor-pointer transition-transform active:scale-95">
                          <img src={imgUrl} alt={`Galeri ${i+1}`} className="w-full h-full object-cover hover:opacity-90" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LIGHTBOX SLIDER */}
                  {lightboxIndex !== null && (
                    <div onClick={() => setLightboxIndex(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
                      <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white text-xl font-bold bg-white/10 w-10 h-10 rounded-full flex items-center justify-center">✕</button>
                      <img src={inv.gallery_images[lightboxIndex]} alt="Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" onClick={(e)=>e.stopPropagation()} />
                      <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex === 0 ? inv.gallery_images.length - 1 : lightboxIndex - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 px-4 py-3 rounded-xl font-bold">◀</button>
                      <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex === inv.gallery_images.length - 1 ? 0 : lightboxIndex + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 px-4 py-3 rounded-xl font-bold">▶</button>
                      <p className="text-stone-400 text-[11px] font-mono mt-4">Foto {lightboxIndex + 1} dari {inv.gallery_images.length}</p>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5 KADO DIGITAL */}
              <div id="kado" className="scroll-mt-4">
                <hr className="border-t-2 border-stone-300 mb-8" />
                <div className="space-y-4 pt-2 text-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Digital Gift / Kado</h3>
                    <p className="text-[10px] text-stone-400">{ext.gift_prolog}</p>
                    {ext.gift_way && <p className="text-[10px] text-stone-500 bg-stone-50 p-2 border rounded-lg mt-2 text-left">{ext.gift_way}</p>}
                  </div>
                   
                  <div className="space-y-4 pt-1 max-w-xs mx-auto">
                    {inv.gift_accounts.map((acc: any, idx: number) => (
                      <div key={idx} className="p-6 bg-white border-2 border-stone-300 rounded-2xl shadow-xs flex flex-col items-center text-center space-y-4">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-stone-700 text-xs uppercase tracking-wide">Nama Bank / E-Wallet</span>
                          <p className="text-stone-600 text-sm font-semibold">{acc.bank}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block font-bold text-stone-700 text-xs uppercase tracking-wide">Nomor Rekening</span>
                          <p className="font-mono font-black text-stone-900 text-base tracking-wider">{acc.number}</p>
                          <p className="text-[10px] text-stone-400 italic">a.n. {acc.name}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => alert('📋 Nomor akun berhasil disalin!')} 
                          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
                        >
                          📋 Copy Rekening
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOK CUSTOM */}
              <hr className="border-t-2 border-stone-300" />
              <div className="space-y-2 text-center">
                <h3 className="text-sm font-serif font-bold text-stone-900">{ext.custom_title}</h3>
                <p className="text-[11px] text-stone-500 italic">"{ext.custom_prolog}"</p>
                <div className="text-xs text-stone-700 whitespace-pre-wrap text-left bg-stone-50/50 p-4 rounded-xl border border-stone-100">{ext.custom_content}</div>
              </div>

              {/* SECTION 6: LIST KARTU DOA RAPI */}
              <div id="ucapan" className="scroll-mt-4">
                <hr className="border-t-2 border-stone-300 mb-8" />
                <div className="space-y-2.5 text-left">
                  {demoWishesMock.map((wish, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs text-center space-y-3">
                      <div>
                        <span className="font-bold text-stone-600 text-xs">
                          {wish.name} {wish.address ? ` - ${wish.address}` : ''}
                        </span>
                      </div>
                      <hr className="border-t border-stone-300/80 my-1 w-full" />
                      <p className="text-stone-600 text-xs leading-relaxed px-2">{wish.message}</p>
                      <div className="text-[10px] text-stone-400 font-medium pt-1">Senin, 19 Februari 2024</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NAMA TOKOH STATIS DI BAWAH KARTU */}
              <div className="text-center pt-5 border-t border-stone-100">
                <span className="text-stone-500 font-bold tracking-wider text-[11px] uppercase">
                  {getDynamicDisplayName()}
                </span>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* FOOTER FLOATING NAVIGATION (Hanya muncul ketika demo undangan aktif dibuka) */}
      {isOpen && (
        <div className="fixed bottom-4 z-40 w-full max-w-md left-1/2 -translate-x-1/2 px-4 animate-in slide-in-from-bottom duration-300">
          <div className="w-full bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-xl p-3 flex items-center justify-between gap-1">
            <button onClick={() => scrollToSection('pembuka')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Pembuka">🏠</button>
            <button onClick={() => scrollToSection('profil')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Profil">👤</button>
            <button onClick={() => scrollToSection('jadwal')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Jadwal">📅</button>
            <button onClick={() => scrollToSection('galeri')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Galeri">🖼️</button>
            <button onClick={() => scrollToSection('kado')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Kado">🎁</button>
            <button onClick={() => scrollToSection('ucapan')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Ucapan">💬</button>
          </div>
        </div>
      )}

    </div>
  );
}