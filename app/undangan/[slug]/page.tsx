// app/undangan/[slug]/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { themesRegistry } from '@/lib/themes'; // ⚡ Import registri tema Anda

function InvitationCountdown({
  targetDateString,
  isReception = false,
  theme, // ⚡ Terima data properti gaya tema aktif
}: {
  targetDateString: string;
  isReception?: boolean;
  theme: any;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDateString) return;

    const calculateTime = () => {
      const numbers = targetDateString.match(/\d+/g);
      if (!numbers || numbers.length < 5) return;

      const year = numbers[0];
      const month = numbers[1].padStart(2, '0');
      const day = numbers[2].padStart(2, '0');
      const hour = numbers[3].padStart(2, '0');
      const minute = numbers[4].padStart(2, '0');
      const second = numbers[5] ? numbers[5].padStart(2, '0') : '00';

      const isoTargetString = `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
      const target = new Date(isoTargetString).getTime();
      const now = Date.now();

      const diff = target - now;

      if (diff <= 0 || isNaN(diff)) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          isExpired: true,
        });
        return;
      }

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const totalHours = Math.floor(totalMinutes / 60);

      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDateString]);

  if (timeLeft.isExpired) {
    return (
      <div className="w-full text-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-xl my-2">
        <p className="text-[11px] font-black tracking-wider text-rose-600 animate-pulse">
          ⚠️ MAAF, WAKTU ACARA SUDAH TERLEWATI (EXPIRED)
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full py-3 px-4 ${theme.countdownBg} border ${theme.countdownBorder} rounded-xl my-2 text-center`}>
      <p className={`text-[10px] font-bold ${theme.countdownNumber} tracking-widest uppercase mb-1.5`}>
        Hitung Mundur {isReception ? "Resepsi" : "Acara"}
      </p>

      <div className="flex justify-center items-center gap-3 font-mono text-xs font-bold text-stone-800">
        <div className="bg-white px-2.5 py-1 rounded border">
          <span className={`${theme.countdownNumber} text-sm`}>{timeLeft.days}</span> Hari
        </div>

        <div className="bg-white px-2.5 py-1 rounded border">
          <span className={`${theme.countdownNumber} text-sm`}>{timeLeft.hours}</span> Jam
        </div>

        <div className="bg-white px-2.5 py-1 rounded border">
          <span className={`${theme.countdownNumber} text-sm`}>{timeLeft.minutes}</span> Menit
        </div>
      </div>
    </div>
  );
}

export default function PublicInvitationPage() {
  const supabase = createClient();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [customBlock, setCustomBlock] = useState<any>({});
  
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [safeImages, setSafeImages] = useState<string[]>([]);
  const [safeMusic, setSafeMusic] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [guestName, setGuestName] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState('hadir');
  const [sendingWish, setSendingWish] = useState(false);
  const [wishesList, setWishesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.slug) return;
      
      const { data: invData, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('slug', params.slug)
        .single();
        
      if (invData) {
        setInvitation(invData);
        if (invData.title) document.title = invData.title;

        let parsedDetails = {};
        if (invData.custom_details) {
          if (typeof invData.custom_details === 'string') {
            try {
              parsedDetails = JSON.parse(invData.custom_details);
            } catch (e) {
              console.error("Gagal urai custom_details", e);
            }
          } else if (typeof invData.custom_details === 'object') {
            parsedDetails = invData.custom_details;
          }
        }
        setCustomBlock(parsedDetails);

        let imgs: string[] = [];
        if (invData.gallery_images) {
          if (Array.isArray(invData.gallery_images)) {
            imgs = invData.gallery_images;
          } else if (typeof invData.gallery_images === 'string') {
            try {
              const parsedImgs = JSON.parse(invData.gallery_images);
              if (Array.isArray(parsedImgs)) imgs = parsedImgs;
            } catch (e) {
              if (invData.gallery_images.startsWith('http')) {
                imgs = [invData.gallery_images];
              }
            }
          }
        }
        setSafeImages(imgs.filter(url => typeof url === 'string' && url.trim() !== ''));

        let musicUrl = '';
        if (invData.bg_music_url && typeof invData.bg_music_url === 'string') {
          musicUrl = invData.bg_music_url.trim();
        }
        setSafeMusic(musicUrl);

        const { data: wishesData } = await supabase
          .from('rsvps')
          .select('*')
          .eq('invitation_id', invData.id)
          .order('created_at', { ascending: false });
        
        if (wishesData) setWishesList(wishesData);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [params?.slug]);

  // Ambil objek tema dinamis dari database berdasarkan template_id
  const currentTheme = themesRegistry[invitation?.template_id] || themesRegistry.default;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === 0 ? safeImages.length - 1 : lightboxIndex - 1);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === safeImages.length - 1 ? 0 : lightboxIndex + 1);
  };

  const cleanMapEmbedUrl = (rawUrl: string, addressBackup: string) => {
    const targetQuery = rawUrl || addressBackup || "Jakarta";
    if (targetQuery.includes("maps.google") && (targetQuery.includes("embed") || targetQuery.includes("output=embed"))) {
      return targetQuery;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(targetQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const cleanExternalRouteUrl = (rawUrl: string, addressBackup: string) => {
    if (rawUrl && rawUrl.startsWith("http") && !rawUrl.includes("output=embed") && !rawUrl.includes("embed")) {
      return rawUrl;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(addressBackup || rawUrl || "Lokasi Acara")}`;
  };

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (audioRef.current && safeMusic) {
        audioRef.current.muted = false;
        audioRef.current.play().catch(() => {
          audioRef.current?.play();
        });
      }
    }, 200);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !message) return alert("Nama dan Ucapan wajib diisi!");
    setSendingWish(true);
    try {
      const newWish = {
        invitation_id: invitation.id,
        name: guestName,
        relation: relation || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        message: message,
        attendance: attendance
      };

      const { data, error } = await supabase.from('rsvps').insert(newWish).select('*').single();
      if (error) throw error;
      alert("✨ Terima kasih! Doa dan harapan Anda berhasil dikirim.");
      setWishesList((prev) => [data || newWish, ...prev]);
      setGuestName(''); setRelation(''); setEmail(''); setPhone(''); setAddress(''); setMessage('');
    } catch (err: any) {
      alert("Gagal mengirimkan ucapan: " + err.message);
    } finally {
      setSendingWish(false);
    }
  };

  const formatLocalTimeString = (dateStr: string) => {
    if (!dateStr) return '';
    const matches = dateStr.match(/\d+/g);
    if (!matches || matches.length < 5) return '';
    const hh = matches[3].padStart(2, '0');
    const mm = matches[4].padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatLocalDateString = (dateStr: string) => {
    if (!dateStr) return '-';
    const matches = dateStr.match(/\d+/g);
    if (!matches || matches.length < 3) return '-';
    const year = Number(matches[0]);
    const month = Number(matches[1]);
    const day = Number(matches[2]);
    return new Date(year, month - 1, day).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getDynamicDisplayName = () => {
    if (invitation.type === 'pernikahan' || invitation.type === 'lamaran') {
      const groom = invitation.groom_name?.split(',')[0]?.trim() || 'Mempelai Pria';
      const bride = invitation.bride_name?.split(',')[0]?.trim() || 'Mempelai Wanita';
      return `${groom} & ${bride}`;
    }
    return invitation.title || 'Tamu Undangan';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><p className="text-xs font-bold tracking-widest text-amber-700 animate-pulse">MENYIAPKAN DATA UNDANGAN...</p></div>;
  if (!invitation) return <div className="min-h-screen flex items-center justify-center bg-stone-50"><h1 className="text-sm font-bold text-red-600">Maaf, Undangan Tidak Ditemukan</h1></div>;

  const eventDateFormatted = formatLocalDateString(invitation.event_date);
  const eventTimeFormatted = formatLocalTimeString(invitation.event_date);

  const receptionDateFormatted = formatLocalDateString(customBlock.reception_date);
  const receptionTimeFormatted = formatLocalTimeString(customBlock.reception_date);

  return (
    // ⚡ Diubah: Latar belakang menggunakan skema warna dinamis tema aktif
    <div className={`min-h-screen ${currentTheme.bgPage} ${currentTheme.primaryText} flex flex-col items-center relative overflow-x-hidden font-sans ${isOpen ? 'pb-28' : ''} transition-all duration-500`}>
      
      {safeMusic && <audio ref={audioRef} src={safeMusic} loop preload="auto" autoPlay={false} controls={false} style={{ display: 'none' }} />}

      {isOpen && safeMusic && (
        <button onClick={toggleMute} className="fixed bottom-24 right-4 z-50 p-2.5 bg-white/90 hover:bg-white text-stone-800 backdrop-blur-md shadow-md rounded-full border border-stone-200 font-bold text-[10px] flex items-center gap-1 transition-all hover:scale-105 cursor-pointer">
          {isMuted ? "🎵 Play" : "🔇 Mute"}
        </button>
      )}

      {/* COVER UTAMA */}
      {!isOpen ? (
        // ⚡ Diubah: Latar cover mengikuti skema warna tema secara dinamis agar terlihat serasi
        <div className={`fixed inset-0 ${currentTheme.bgPage} text-white flex flex-col items-center justify-center p-6 text-center z-50 animate-in fade-in duration-300`}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-0" />
          {customBlock.cover_photo_url && (
            <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
              <img src={customBlock.cover_photo_url} alt="Cover Background" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="relative z-10 flex flex-col items-center justify-center bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md max-w-sm w-full shadow-2xl">
            <p className="text-[10px] uppercase tracking-widest text-yellow-300 font-bold mb-2">You Are Invited To</p>
            <h1 className="text-2xl font-serif font-bold tracking-wide max-w-sm mb-4 uppercase">{invitation.title}</h1>
            {customBlock.website_desc && <p className="text-xs text-stone-200 max-w-xs mb-6 italic line-clamp-3">{customBlock.website_desc}</p>}
            <button 
              onClick={handleOpenInvitation} 
              className={`px-6 py-3 ${currentTheme.buttonBg} ${currentTheme.buttonHover} text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all cursor-pointer transform active:scale-95`}
            >
               💌 {customBlock.cover_prolog || 'Buka Undangan'}
            </button>
          </div>
        </div>
      ) : (
        // ⚡ Diubah: Container card utama, border, dan teks mengikuti aturan class tema aktif
        <div className={`w-full max-w-md bg-white p-6 md:my-8 border ${currentTheme.cardBorder} rounded-2xl shadow-xl space-y-8 animate-in slide-in-from-bottom duration-500 pb-6`}>
          
          {/* BLOK SECTION 1: PEMBUKA */}
          <div id="pembuka" className="text-center space-y-2 scroll-mt-4">
            <span className={`text-[10px] uppercase font-bold tracking-widest ${currentTheme.badgeText} ${currentTheme.badgeBg} px-2.5 py-0.5 rounded-md border ${currentTheme.badgeBorder}`}>
              Undangan {invitation.type || 'Acara'}
            </span>
            {customBlock.cover_photo_url && (
              <div className="flex justify-center pt-2">
                <img src={customBlock.cover_photo_url} alt="Profil Atas" className="w-24 h-24 object-cover rounded-full border-2 border-stone-100 shadow-sm" />
              </div>
            )}
            <h1 className="text-2xl font-serif font-bold text-stone-900 pt-1 uppercase">{invitation.title}</h1>
          </div>

          <hr className="border-t-2 border-stone-200" />

          {/* BLOK SECTION 2: PROFIL TOKOH */}
          <div id="profil" className="p-4 bg-stone-50/50 border border-stone-200/60 rounded-xl space-y-3 text-center scroll-mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Profil Utama</h3>
            <p className="text-xs text-stone-600 italic">"{customBlock.profile_prolog || 'Sedikit cerita mengenai tokoh utama dalam acara ini.'}"</p>
            
            {(invitation.type === 'pernikahan' || invitation.type === 'lamaran') ? (
              <div className="font-serif text-sm font-bold text-stone-900 space-y-1">
                <p>💍 {invitation.groom_name || 'Mempelai Pria'}</p>
                <p className="text-xs font-sans text-stone-400 font-normal">&</p>
                <p>💍 {invitation.bride_name || 'Mempelai Wanita'}</p>
              </div>
            ) : (
              customBlock.profile_desc && <p className="text-xs text-stone-700 leading-relaxed font-medium bg-white p-2.5 border rounded-lg text-left">{customBlock.profile_desc}</p>
            )}

            {customBlock.profile_bottom_photo_url && (
              <div className="w-full pt-2">
                <img src={customBlock.profile_bottom_photo_url} alt="Profil Bawah" className="w-full h-48 object-cover rounded-xl border border-stone-200/60 shadow-xs" />
              </div>
            )}
          </div>

          <hr className="border-t-2 border-stone-200" />

          {/* BLOK SECTION 3: JADWAL/INFORMASI ACARA */}
          <div id="jadwal" className="space-y-6 pt-2 scroll-mt-4">
            <div className="text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Informasi Pelaksanaan Acara</h3>
              {customBlock.event_prolog && <p className="text-[11px] text-stone-500 mt-1 px-4 text-center">{customBlock.event_prolog}</p>}
            </div>

            {invitation.type === 'pernikahan' ? (
              <div className="space-y-6">
                {/* 1. KOTAK ACARA 1 */}
                <div className="p-4 rounded-xl border border-stone-200/60 bg-stone-50/40 space-y-3">
                  <h4 className={`font-serif font-bold ${currentTheme.accentText} text-sm text-center uppercase`}>
                    ✨ {customBlock.event_block_title || 'Akad Nikah'}
                  </h4>
                  <div className="text-xs text-center space-y-1 text-stone-700">
                    <p className="font-semibold">📆 {eventDateFormatted}</p>
                    {eventTimeFormatted && <p className="font-mono text-stone-600">⏰ Pukul {eventTimeFormatted} WIB s/d Selesai</p>}
                    <p className="text-stone-500 pt-1 border-t border-stone-200/40 mt-1">📍 {invitation.location_address || 'Belum Diatur'}</p>
                  </div>
                  
                  <div className="w-full h-36 rounded-lg overflow-hidden border border-stone-200 bg-white">
                    <iframe width="100%" height="100%" className="border-0" src={cleanMapEmbedUrl(invitation.maps_url, invitation.location_address)} allowFullScreen={true} loading="lazy"></iframe>
                  </div>
                  
                  
                </div>

                {/* 2. KOTAK ACARA 2: RESEPSI PERNIKAHAN */}
                {customBlock.reception_address && (
                  <>
                    <hr className="border-t border-dashed border-stone-200 my-4" />
                    <div className="p-4 rounded-xl border border-stone-200/60 bg-stone-50/40 space-y-3">
                      <h4 className={`font-serif font-bold ${currentTheme.accentText} text-sm text-center uppercase`}>🎉 Acara Resepsi Pernikahan</h4>
                      <div className="text-xs text-center space-y-1 text-stone-700">
                        <p className="font-semibold">📆 {receptionDateFormatted}</p>
                        {receptionTimeFormatted && <p className="font-mono text-stone-600">⏰ Pukul {receptionTimeFormatted} WIB s/d Selesai</p>}
                        <p className="text-stone-500 pt-1 border-t border-stone-200/40 mt-1">📍 {customBlock.reception_address}</p>
                      </div>

                      {/* Kirim currentTheme ke komponen countdown */}
                      {customBlock.reception_date && <InvitationCountdown targetDateString={customBlock.reception_date} isReception={true} theme={currentTheme} />}

                      <div className="w-full h-36 rounded-lg overflow-hidden border border-stone-200 bg-white">
                        <iframe width="100%" height="100%" className="border-0" src={cleanMapEmbedUrl(customBlock.reception_maps_url, customBlock.reception_address)} allowFullScreen={true} loading="lazy"></iframe>
                      </div>
                      
                      
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* SATU ACARA UTAMA STANDAR (NON-PERNIKAHAN) */
              <div className="space-y-4">
                <div className="space-y-3 text-center text-xs bg-stone-50/60 p-4 rounded-xl border border-stone-200/60">
                  <h4 className={`font-serif font-bold ${currentTheme.accentText} text-sm mb-1 uppercase`}>
                    {(!customBlock.event_block_title || customBlock.event_block_title === 'Acara Utama' || customBlock.event_block_title === 'Akad Nikah') 
                      ? `Perayaan ${invitation.type || 'Acara'}` 
                      : customBlock.event_block_title}
                  </h4>
                  <p className="font-semibold text-stone-700">📆 {eventDateFormatted}</p>
                  {eventTimeFormatted && <p className="font-mono text-stone-600">⏰ Pukul {eventTimeFormatted} WIB s/d Selesai</p>}
                  <p className="text-stone-500 px-2 pt-1 border-t border-stone-200/40">📍 {invitation.location_address}</p>
                </div>

                {invitation.event_date && <InvitationCountdown targetDateString={invitation.event_date} isReception={false} theme={currentTheme} />}

                <div className="w-full h-44 rounded-xl overflow-hidden border border-stone-200 bg-white shadow-inner">
                  <iframe width="100%" height="100%" className="border-0" src={cleanMapEmbedUrl(invitation.maps_url, invitation.location_address)} allowFullScreen={true} loading="lazy"></iframe>
                </div>
                
              </div>
            )}
          </div>

          {/* BLOK SECTION 4: GALERI FOTO */}
          {safeImages.length > 0 && invitation.template_id !== 'free' && (
            <div id="galeri" className="scroll-mt-4">
              <hr className="border-t-2 border-stone-200 my-6" />
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Galeri Foto</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">{customBlock.gallery_prolog || 'Momen kebahagiaan kami'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {safeImages.map((imgUrl: string, i: number) => (
                    <div 
                      key={i} 
                      onClick={() => setLightboxIndex(i)} 
                      className="w-full h-32 rounded-xl overflow-hidden border border-stone-200/60 bg-stone-100 cursor-pointer active:scale-95 transition-transform"
                    >
                      <img src={imgUrl} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-300" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* LIGHTBOX SLIDER POPUP */}
              {lightboxIndex !== null && (
                <div onClick={() => setLightboxIndex(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                  <button onClick={() => setLightboxIndex(null)} className="absolute top-6 right-6 text-white text-xl font-bold bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
                  <div className="relative max-w-full max-h-[75vh] flex items-center justify-center">
                    <img src={safeImages[lightboxIndex]} alt="Full Preview" className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()} />
                  </div>
                  <button onClick={handlePrevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-90">◀</button>
                  <button onClick={handleNextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-90">▶</button>
                  <p className="text-stone-400 text-[11px] tracking-widest uppercase font-mono mt-4">Foto {lightboxIndex + 1} dari {safeImages.length}</p>
                </div>
              )}
            </div>
          )}

          {/* GALERI VIDEO */}
          {invitation.video_url && invitation.template_id !== 'free' && (
            <>
              <hr className="border-t-2 border-stone-200 my-6" />
              <div className="space-y-3 pt-2">
                <div className="text-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Galeri Video</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">{customBlock.video_prolog || ''}</p>
                </div>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-stone-200 bg-white">
                  <iframe width="100%" height="100%" src={invitation.video_url.replace("watch?v=", "embed/")} className="border-0" allowFullScreen></iframe>
                </div>
              </div>
            </>
          )}

          {/* BLOK SECTION 5: KADO REKENING DIGITAL */}
          {invitation.gift_accounts && invitation.gift_accounts.length > 0 && invitation.template_id !== 'free' && (
            <div id="kado" className="scroll-mt-4">
              <hr className="border-t-2 border-stone-200 my-6" />
              <div className="space-y-4 pt-2 text-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Digital Gift / Kado</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">{customBlock.gift_prolog || ''}</p>
                  {customBlock.gift_way && <p className="text-[10px] text-stone-500 bg-stone-50 p-2 border rounded-lg mt-2 text-left">{customBlock.gift_way}</p>}
                </div>
                
                <div className="space-y-4 pt-1 max-w-xs mx-auto">
                  {invitation.gift_accounts.map((acc: any, idx: number) => (
                    <div key={idx} className="p-6 bg-white border-2 border-stone-200 rounded-2xl shadow-xs flex flex-col items-center text-center space-y-4">
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
                        onClick={() => { navigator.clipboard.writeText(acc.number); alert('📋 Nomor rekening berhasil disalin!'); }} 
                        className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer active:scale-95"
                      >
                        📋 Copy Rekening
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BLOK CUSTOM TAMBAHAN */}
          {customBlock.custom_content && (
            <>
              <hr className="border-t-2 border-stone-200 my-6" />
              <div className="space-y-2 pt-2 text-center">
                <h3 className="text-sm font-serif font-bold text-stone-900">{customBlock.custom_title || 'Turut Mengundang'}</h3>
                {customBlock.custom_prolog && <p className="text-[11px] text-stone-500 italic mb-2">"{customBlock.custom_prolog}"</p>}
                <div className="text-xs text-stone-700 whitespace-pre-wrap leading-relaxed text-left bg-stone-50/50 p-4 rounded-xl border border-stone-200/60">{customBlock.custom_content}</div>
              </div>
            </>
          )}

          <hr className="border-t-2 border-stone-200 my-6" />

          {/* BLOK SECTION 6: FORM DOA & HARAPAN TAMU */}
          {/* ⚡ Diubah: Elemen form menggunakan bg dan border dari tema dinamis */}
          <div id="ucapan" className={`scroll-mt-4 max-w-md mx-auto my-4 p-6 ${currentTheme.formBg} rounded-2xl border ${currentTheme.cardBorder} text-center font-sans`}>
            <h2 className="text-base font-bold text-stone-800">Doa dan Harapan</h2>
            <p className="text-[11px] text-stone-500 mt-1 mb-5">Saya sangat berterima kasih atas doa dan harapan yang telah Anda berikan</p>

            <form onSubmit={handleSubmitWish} className="space-y-3 text-left" autoComplete="off">
              <input type="text" placeholder="Tulis nama lengkap Anda" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
              <input type="text" placeholder="Hubungan dengan pemilik acara (optional)" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={relation} onChange={(e) => setRelation(e.target.value)} />
              <input type="email" placeholder="Tulis alamat email Anda (optional)" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="tel" placeholder="Tulis nomor handphone Anda (optional)" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input type="text" placeholder="Tulis alamat tinggal Anda" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800" value={address} onChange={(e) => setAddress(e.target.value)} />
              <textarea rows={4} placeholder="Tuliskan ucapan atau doa untuk pemilik acara" className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs resize-none text-stone-800" value={message} onChange={(e) => setMessage(e.target.value)} required />

              <div className="py-2 space-y-2">
                <p className="text-xs font-semibold text-stone-700">Apakah Anda akan hadir menghadiri acara ?</p>
                <div className="flex flex-col gap-2 text-xs text-stone-600">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="attendance" value="hadir" checked={attendance === 'hadir'} onChange={() => setAttendance('hadir')} /> Saya akan hadir</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="attendance" value="tidak_hadir" checked={attendance === 'tidak_hadir'} onChange={() => setAttendance('tidak_hadir')} /> Saya tidak akan hadir</label>
                </div>
              </div>

              {/* ⚡ Diubah: Button form mengikuti class warna tombol tema */}
              <button type="submit" disabled={sendingWish} className={`w-full py-3 ${currentTheme.formBtn} ${currentTheme.formBtnHover} disabled:bg-stone-400 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer`}>
                {sendingWish ? "Mengirim..." : "Kirim"}
              </button>
            </form>

            <hr className="border-t-2 border-stone-200 my-6" />

            <div className="pt-2 text-left space-y-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Ucapan Doa & Kehadiran ({wishesList.length})</h3>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {wishesList.length === 0 ? (
                  <p className="text-center text-stone-400 py-4 italic text-[11px]">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>
                ) : (
                  wishesList.map((wish, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs text-center space-y-3 animate-in fade-in duration-300">
                      <div>
                        <span className="font-bold text-stone-600 text-xs">
                          {wish.name} {wish.address ? ` - ${wish.address}` : ''}
                        </span>
                      </div>
                      <hr className="border-t border-stone-200 my-1 w-full" />
                      <p className="text-stone-600 text-xs leading-relaxed px-2">{wish.message}</p>
                      <div className="text-[10px] text-stone-400 font-medium pt-1">
                        {wish.created_at ? formatLocalDateString(wish.created_at) : formatLocalDateString(new Date().toISOString())}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* FOOTER NAMA TOKOH */}
          <div className="text-center pt-4 border-t border-stone-100">
            <span className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">
              {getDynamicDisplayName()}
            </span>
          </div>

        </div>
      )}

      {/* NAVIGATION FLOATING MENU */}
      {isOpen && (
        <div className="fixed bottom-4 z-40 w-full max-w-md px-4 animate-in slide-in-from-bottom duration-300">
          <div className="w-full bg-white/95 backdrop-blur-md border border-stone-200 rounded-2xl shadow-xl p-3 flex items-center justify-between gap-1">
            <button onClick={() => scrollToSection('pembuka')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Pembuka">🏠</button>
            <button onClick={() => scrollToSection('profil')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Profil">👤</button>
            <button onClick={() => scrollToSection('jadwal')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Jadwal">📅</button>
            {safeImages.length > 0 && invitation.template_id !== 'free' && (
              <button onClick={() => scrollToSection('galeri')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Galeri">🖼️</button>
            )}
            {invitation.gift_accounts && invitation.gift_accounts.length > 0 && invitation.template_id !== 'free' && (
              <button onClick={() => scrollToSection('kado')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Kado">🎁</button>
            )}
            <button onClick={() => scrollToSection('ucapan')} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center justify-center cursor-pointer text-base active:scale-95" title="Ucapan">💬</button>
          </div>
        </div>
      )}

    </div>
  );
}