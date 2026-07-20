'use client';

import { useState } from 'react';

interface CreateInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  supabase: any;
  refreshInvitations: (userId: string) => Promise<void>;
  uploadSingleFile: (file: File) => Promise<string | null>;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>, isEditForm?: boolean) => Promise<void>;
  handleMusicUpload: (e: React.ChangeEvent<HTMLInputElement>, isEditForm?: boolean) => Promise<void>;
  handleSearchLocation: (isEdit?: boolean, isReception?: boolean) => Promise<void>;
  
  locationAddress: string;
  setLocationAddress: (val: string) => void;
  mapsUrl: string;
  setMapsUrl: (val: string) => void;
  receptionAddress: string;
  setReceptionAddress: (val: string) => void;
  receptionMapsUrl: string;
  setReceptionMapsUrl: (val: string) => void;
  uploadedPhotos: string[];
  bgMusicUrl: string;
  uploadingImage: boolean;
  uploadingMusic: boolean;
}

export default function CreateInvitationModal({
  isOpen,
  onClose,
  userProfile,
  supabase,
  refreshInvitations,
  uploadSingleFile,
  handlePhotoUpload,
  handleMusicUpload,
  handleSearchLocation,
  locationAddress,
  setLocationAddress,
  mapsUrl,
  setMapsUrl,
  receptionAddress,
  setReceptionAddress,
  receptionMapsUrl,
  setReceptionMapsUrl,
  uploadedPhotos,
  bgMusicUrl,
  uploadingImage,
  uploadingMusic,
}: CreateInvitationModalProps) {
  // ==========================================
  // STATE LOCAL FORM TAMBAH UNDANGAN BARU
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [slug, setSlug] = useState('');
  const [invitationType, setInvitationType] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('free');
  const [websiteDesc, setWebsiteDesc] = useState('');
  const [keywords, setKeywords] = useState('');
  const [coverProlog, setCoverProlog] = useState('Buka Undangan');
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [profileProlog, setProfileProlog] = useState('Sedikit cerita mengenai tokoh utama dalam acara ini.');
  const [profileDesc, setProfileDesc] = useState('');
  const [eventBlockTitle, setEventBlockTitle] = useState('Akad Nikah');
  const [eventProlog, setEventProlog] = useState('Kami mengundang Anda untuk menghadiri acara kami...');
  const [eventDate, setEventDate] = useState('');

  // ⚡ STATE STRUKTUR BARU DETIL IDENTITAS MEMPELAI
  const [groomFullName, setGroomFullName] = useState('');
  const [groomChildOf, setGroomChildOf] = useState('');
  const [groomFather, setGroomFather] = useState('');
  const [groomMother, setGroomMother] = useState('');
  const [groomIg, setGroomIg] = useState('');
  const [groomFb, setGroomFb] = useState('');

  const [brideFullName, setBrideFullName] = useState('');
  const [brideChildOf, setBrideChildOf] = useState('');
  const [brideFather, setBrideFather] = useState('');
  const [brideMother, setBrideMother] = useState('');
  const [brideIg, setBrideIg] = useState('');
  const [brideFb, setBrideFb] = useState('');

  // STATE BERKAS MEDIA / FOTO
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [profileBottomPhotoUrl, setProfileBottomPhotoUrl] = useState('');
  const [groomPhotoUrl, setGroomPhotoUrl] = useState('');
  const [bridePhotoUrl, setBridePhotoUrl] = useState('');

  // STATE TAMBAHAN: KHUSUS RESEPSI PERNIKAHAN
  const [receptionDate, setReceptionDate] = useState('');

  const [galleryProlog, setGalleryProlog] = useState('Momen-momen yang berhasil kami abadikan...');
  const [videoProlog, setVideoProlog] = useState('Mari saksikan cuplikan video kebahagiaan kami.');
  const [videoUrl, setVideoUrl] = useState('');
  const [giftProlog, setGiftProlog] = useState('Terima kasih atas doa yang telah Anda berikan...');
  const [giftWay, setGiftWay] = useState('Kado dapat dikirimkan melalui rekening digital di bawah ini.');
  const [giftAccounts, setGiftAccounts] = useState<{name: string, bank: string, number: string}[]>([{name:'', bank:'', number:''}]);
  const [customTitle, setCustomTitle] = useState('Turut Mengundang');
  const [customProlog, setCustomProlog] = useState('Keluarga besar, sahabat karib, hingga teman-teman semua');
  const [customContent, setCustomContent] = useState('');

  const [formMessage, setFormMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setSlug(''); setInvitationType(''); setEventTitle(''); setGroomName(''); setBrideName('');
    setEventDate(''); setLocationAddress(''); setMapsUrl(''); setVideoUrl('');
    setGiftAccounts([{name:'', bank:'', number:''}]); setWebsiteDesc(''); setKeywords('');
    setCustomContent(''); setEventBlockTitle('Akad Nikah');
    setReceptionDate(''); setReceptionAddress(''); setReceptionMapsUrl('');
    setCoverPhotoUrl(''); setProfileBottomPhotoUrl('');
    setGroomPhotoUrl(''); setBridePhotoUrl('');
    setGroomFullName(''); setGroomChildOf(''); setGroomFather(''); setGroomMother(''); setGroomIg(''); setGroomFb('');
    setBrideFullName(''); setBrideChildOf(''); setBrideFather(''); setBrideMother(''); setBrideIg(''); setBrideFb('');
    setSelectedTemplate('free');
    setCurrentStep(1); setFormMessage('');
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== 4) return; 
    setFormLoading(true);
    setFormMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const formattedGiftAccounts = giftAccounts.filter(acc => acc.bank || acc.name || acc.number);

      const { error } = await supabase.from('invitations').insert({
        user_id: session.user.id,
        slug: cleanSlug,
        type: invitationType,
        title: eventTitle,
        template_id: selectedTemplate,
        groom_name: groomName || null,
        bride_name: brideName || null,
        event_date: eventDate ? eventDate.replace('T', ' ') : null,
        location_address: locationAddress,
        maps_url: mapsUrl,
        gallery_images: uploadedPhotos, 
        bg_music_url: bgMusicUrl,
        video_url: videoUrl,
        gift_accounts: formattedGiftAccounts.length > 0 ? formattedGiftAccounts : null,
        custom_details: {
          website_desc: websiteDesc || '',
          keywords: keywords || '',
          cover_prolog: coverProlog || 'Buka Undangan',
          cover_photo_url: coverPhotoUrl || '',
          profile_prolog: profileProlog || '',
          profile_desc: profileDesc || '',
          profile_bottom_photo_url: profileBottomPhotoUrl || '',
          groom_photo_url: groomPhotoUrl || '', 
          bride_photo_url: bridePhotoUrl || '', 
          groom_full_name: groomFullName || '',
          groom_child_of: groomChildOf || '',
          groom_father: groomFather || '',
          groom_mother: groomMother || '',
          groom_ig: groomIg || '',
          groom_fb: groomFb || '',
          bride_full_name: brideFullName || '',
          bride_child_of: brideChildOf || '',
          bride_father: brideFather || '',
          bride_mother: brideMother || '',
          bride_ig: brideIg || '',
          bride_fb: brideFb || '',
          event_block_title: eventBlockTitle || 'Akad Nikah',
          event_prolog: eventProlog || '',
          reception_date: receptionDate ? receptionDate.replace('T', ' ') : null,
          reception_address: receptionAddress || '',
          reception_maps_url: receptionMapsUrl || '',
          gallery_prolog: galleryProlog || 'Momen-momen yang berhasil kami abadikan...',
          video_prolog: videoProlog || '',
          gift_prolog: giftProlog || '',
          gift_way: giftWay || '',
          custom_title: customTitle || 'Turut Mengundang',
          custom_prolog: customProlog || '',
          custom_content: customContent || ''
        }
      });

      if (error) throw error;
      alert('✨ Undangan berhasil diterbitkan!');
      resetForm();
      await refreshInvitations(session.user.id);
      onClose();
    } catch (err: any) { 
      setFormMessage(`Gagal: ${err.message}`); 
    } finally { 
      setFormLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 max-w-md w-full p-4 sm:p-6 space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150 text-xs">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 font-bold text-sm z-10">✕</button>
        <div className="flex items-center justify-between border-b-2 pb-2 text-[10px] font-bold text-slate-400 pr-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className={currentStep === 1 ? 'text-teal-600' : ''}>1. Tipe</span>
          <span className="mx-1">→</span>
          <span className={currentStep === 2 ? 'text-teal-600' : ''}>2. Tema</span>
          <span className="mx-1">→</span>
          <span className={currentStep === 3 ? 'text-teal-600' : ''}>3. Detail</span>
          <span className="mx-1">→</span>
          <span className={currentStep === 4 ? 'text-teal-600 font-bold' : ''}>4. Media</span>
        </div>
        
        <form onSubmit={handleCreateInvitation} className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">+ Undangan Baru</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Undangan</label>
                <select className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white" value={invitationType} onChange={(e) => setInvitationType(e.target.value)}>
                  <option value="">- Pilih Tipe -</option>
                  <option value="akikah">Akikah</option>
                  <option value="halalbihalal">Halalbihalal</option>
                  <option value="khitanan">Khitanan</option>
                  <option value="lamaran">Lamaran</option>
                  <option value="peresmian">Peresmian</option>
                  <option value="pernikahan">Pernikahan</option>
                  <option value="syukuran">Syukuran Umrah / Haji</option>
                  <option value="ulang-tahun">Ulang Tahun</option>
                  <option value="wisuda">Wisuda</option>
                  <option value="lainnya">Undangan Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Undangan</label>
                <input type="text" placeholder="Tuliskan judul undangan di sini" className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea rows={2} placeholder="Tuliskan deskripsi di sini" className="w-full p-2 border-2 rounded-lg resize-none" value={websiteDesc} onChange={(e) => setWebsiteDesc(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Kunci</label>
                <input type="text" placeholder="Undangan Nikah, Undangan Akikah" className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Link Undangan</label>
                <div className="flex rounded-lg shadow-sm overflow-hidden">
                  <span className="px-2 sm:px-3 border-2 border-r-0 border-slate-300 bg-slate-50 text-slate-400 flex items-center text-[10px] sm:text-xs shrink-0">/undangan/</span>
                  <input type="text" placeholder="nama-link" className="w-full px-3 py-2 border-2 border-slate-300 rounded-r-lg min-w-0" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>
              <div className="p-3 border-2 rounded-xl bg-teal-50/40 border-teal-200 space-y-1.5">
                <label className="block font-bold text-teal-800 text-[10px] uppercase">📸 Foto Profil / Halaman Pembuka (Sampul)</label>
                <input type="file" accept="image/*" className="w-full text-xs" onChange={async (e) => {
                  if(e.target.files && e.target.files[0]) {
                    setFormMessage('Mengunggah foto sampul...');
                    const url = await uploadSingleFile(e.target.files[0]);
                    if(url) { setCoverPhotoUrl(url); setFormMessage('✓ Foto sampul terpasang'); }
                  }
                }} />
                {coverPhotoUrl && <img src={coverPhotoUrl} className="w-16 h-16 object-cover rounded border-2 border-teal-200 mt-1" />}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" disabled={!slug || !invitationType || !eventTitle} onClick={() => { setFormMessage(''); setCurrentStep(2); }} className="flex-1 py-2 bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold">Lanjut Pilih Tema</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Bagian 2: Tema & Cover</h3>
              <div>
                <label className="block font-semibold mb-1">Tulisan Tombol Sampul Cover</label>
                <input type="text" className="w-full p-2 border-2 rounded-lg" value={coverProlog} onChange={(e) => setCoverProlog(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template (Tema Undangan)</label>
                <select className="w-full p-2.5 border-2 border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500" value={selectedTemplate} onChange={(e) => {
                  if (!userProfile?.is_premium && e.target.value !== 'free') {
                    alert('Tema ini khusus untuk pengguna Premium!');
                    setSelectedTemplate('free');
                  } else {
                    setSelectedTemplate(e.target.value);
                  }
                }}>
                  <option value="free">Minimalist Free (Essential Only)</option>
                  <option value="default" disabled={!userProfile?.is_premium}>Elegant Amber {!userProfile?.is_premium && '🔒'}</option>
                  <option value="pink" disabled={!userProfile?.is_premium}>Romantic Pink {!userProfile?.is_premium && '🔒'}</option>
                  <option value="blue" disabled={!userProfile?.is_premium}>Ocean Blue {!userProfile?.is_premium && '🔒'}</option>
                  <option value="green" disabled={!userProfile?.is_premium}>Emerald Green {!userProfile?.is_premium && '🔒'}</option>
                  <option value="vibrant" disabled={!userProfile?.is_premium}>Vibrant Full Color {!userProfile?.is_premium && '🔒'}</option>
                </select>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <button type="button" onClick={onClose} className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
                <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="button" onClick={() => setCurrentStep(3)} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Detail →</button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <h3 className="text-sm font-bold text-slate-900">Bagian 3: Detail Tokoh & Informasi Acara</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Acara 1</label>
                {(invitationType === 'pernikahan' || invitationType === 'lamaran') ? (
                  <select className="block w-full p-2 border-2 border-slate-300 rounded-lg bg-white font-bold" value={eventBlockTitle === 'Acara Utama' ? 'Akad Nikah' : eventBlockTitle} onChange={(e) => setEventBlockTitle(e.target.value)}>
                    <option value="Akad Nikah">Akad Nikah</option>
                    <option value="Pemberkatan">Pemberkatan</option>
                  </select>
                ) : (
                  <input type="text" className="w-full p-2 border-2 rounded-lg font-bold bg-slate-50 uppercase text-slate-700" value={eventBlockTitle === 'Acara Utama' || eventBlockTitle === 'Akad Nikah' ? `PERAYAAN ${invitationType?.toUpperCase()}` : eventBlockTitle} onChange={(e) => setEventBlockTitle(e.target.value)} />
                )}
              </div>
              <textarea rows={2} placeholder="Prolog Informasi Acara" className="w-full p-2 border-2 rounded-lg resize-none" value={eventProlog} onChange={(e) => setEventProlog(e.target.value)} />
              
              {(invitationType === 'pernikahan' || invitationType === 'lamaran') ? (
                /* ⚡ STRUKTUR TAMPILAN PREMIUM BARU: PERNIKAHAN & LAMARAN */
                <div className="space-y-4">
                  {/* DETAIL TOKOH MEMPELAI PRIA */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-700 text-[10px] block uppercase text-teal-700">👨 Data Mempelai Pria</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nama Panggilan Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={groomName} onChange={(e) => setGroomName(e.target.value)} />
                      <input type="text" placeholder="Nama Lengkap Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={groomFullName} onChange={(e) => setGroomFullName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Putra ke- (cth: Putra Pertama)" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={groomChildOf} onChange={(e) => setGroomChildOf(e.target.value)} />
                      <input type="text" placeholder="Nama Ayah" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={groomFather} onChange={(e) => setGroomFather(e.target.value)} />
                      <input type="text" placeholder="Nama Ibu" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={groomMother} onChange={(e) => setGroomMother(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="url" placeholder="Link Instagram Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={groomIg} onChange={(e) => setGroomIg(e.target.value)} />
                      <input type="url" placeholder="Link Facebook Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={groomFb} onChange={(e) => setGroomFb(e.target.value)} />
                    </div>
                  </div>

                  {/* DETAIL TOKOH MEMPELAI WANITA */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-700 text-[10px] block uppercase text-rose-700">👩 Data Mempelai Wanita</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nama Panggilan Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={brideName} onChange={(e) => setBrideName(e.target.value)} />
                      <input type="text" placeholder="Nama Lengkap Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={brideFullName} onChange={(e) => setBrideFullName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Putri ke- (cth: Putri Kedua)" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={brideChildOf} onChange={(e) => setBrideChildOf(e.target.value)} />
                      <input type="text" placeholder="Nama Ayah" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={brideFather} onChange={(e) => setBrideFather(e.target.value)} />
                      <input type="text" placeholder="Nama Ibu" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={brideMother} onChange={(e) => setBrideMother(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="url" placeholder="Link Instagram Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={brideIg} onChange={(e) => setBrideIg(e.target.value)} />
                      <input type="url" placeholder="Link Facebook Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={brideFb} onChange={(e) => setBrideFb(e.target.value)} />
                    </div>
                  </div>
                  
                  {/* UPLOAD BERKAS FOTO KEDUA MEMPELAI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-2 border-dashed rounded-xl bg-slate-50/60">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 text-[10px] uppercase">📸 Foto Mempelai Pria</label>
                      <input type="file" accept="image/*" className="w-full text-[10px]" onChange={async (e) => {
                        if(e.target.files && e.target.files[0]) {
                          setFormMessage('Mengunggah foto pria...');
                          const url = await uploadSingleFile(e.target.files[0]);
                          if(url) { setGroomPhotoUrl(url); setFormMessage('✓ Foto pria terpasang'); }
                        }
                      }} />
                      {groomPhotoUrl && <img src={groomPhotoUrl} className="w-12 h-16 object-cover rounded-xl border shadow-2xs mt-1" style={{aspectRatio: '3/4'}} />}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 text-[10px] uppercase">📸 Foto Mempelai Wanita</label>
                      <input type="file" accept="image/*" className="w-full text-[10px]" onChange={async (e) => {
                        if(e.target.files && e.target.files[0]) {
                          setFormMessage('Mengunggah foto wanita...');
                          const url = await uploadSingleFile(e.target.files[0]);
                          if(url) { setBridePhotoUrl(url); setFormMessage('✓ Foto wanita terpasang'); }
                        }
                      }} />
                      {bridePhotoUrl && <img src={bridePhotoUrl} className="w-12 h-16 object-cover rounded-xl border shadow-2xs mt-1" style={{aspectRatio: '3/4'}} />}
                    </div>
                  </div>
                </div>
              ) : (
                /* TAMPILAN PROFIL UNDANGAN NON-PERNIKAHAN (UMUM) */
                <div className="space-y-2">
                  <input type="text" placeholder="Prolog Teks Profil Tokoh" className="w-full p-2 border-2 rounded-lg" value={profileProlog} onChange={(e) => setProfileProlog(e.target.value)} />
                  <textarea rows={2} placeholder="Rincian Profil Tokoh Lengkap" className="w-full p-2 border-2 rounded-lg resize-none" value={profileDesc} onChange={(e) => setProfileDesc(e.target.value)} />
                  
                  <div className="p-3 border-2 rounded-xl bg-teal-50/40 border-teal-200 space-y-1.5">
                    <label className="block font-bold text-teal-800 text-[10px] uppercase">📸 Foto Tambahan (Di Bawah Profil Utama)</label>
                    <input type="file" accept="image/*" className="w-full text-xs" onChange={async (e) => {
                      if(e.target.files && e.target.files[0]) {
                        setFormMessage('Mengunggah foto profil bawah...');
                        const url = await uploadSingleFile(e.target.files[0]);
                        if(url) { setProfileBottomPhotoUrl(url); setFormMessage('✓ Foto bawah profil terpasang'); }
                      }
                    }} />
                    {profileBottomPhotoUrl && <img src={profileBottomPhotoUrl} className="w-16 h-16 object-cover rounded border-2 border-teal-200 mt-1" />}
                  </div>
                </div>
              )}

              {invitationType === 'pernikahan' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50/40 border-2 border-rose-200 rounded-xl space-y-2">
                    <span className="font-bold text-rose-800 text-[10px] block uppercase">💍 Acara 1: Akad / Pemberkatan</span>
                    <input type="datetime-local" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                    <div className="flex gap-1">
                      <textarea rows={2} placeholder="Alamat Lengkap Tempat Akad" className="w-full p-2 border-2 border-slate-300 rounded-lg resize-none bg-white" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
                      <button type="button" onClick={() => handleSearchLocation(false, false)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                    </div>
                    <input type="url" placeholder="Link Google Maps Akad" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
                    <div className="w-full h-28 rounded-lg overflow-hidden relative border-2 bg-white mt-1">
                      <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${mapsUrl ? encodeURIComponent(mapsUrl) : (locationAddress ? encodeURIComponent(locationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50/40 border-2 border-sky-200 rounded-xl space-y-2">
                    <span className="font-bold text-sky-800 text-[10px] block uppercase">🎉 Acara 2: Resepsi Pernikahan</span>
                    <input type="datetime-local" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={receptionDate} onChange={(e) => setReceptionDate(e.target.value)} />
                    <div className="flex gap-1">
                      <textarea rows={2} placeholder="Alamat Lengkap Tempat Resepsi" className="w-full p-2 border-2 border-slate-300 rounded-lg resize-none bg-white" value={receptionAddress} onChange={(e) => setReceptionAddress(e.target.value)} />
                      <button type="button" onClick={() => handleSearchLocation(false, true)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                    </div>
                    <input type="url" placeholder="Link Google Maps Resepsi" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={receptionMapsUrl} onChange={(e) => setReceptionMapsUrl(e.target.value)} />
                    <div className="w-full h-28 rounded-lg overflow-hidden relative border-2 bg-white mt-1">
                      <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${receptionMapsUrl ? encodeURIComponent(receptionMapsUrl) : (receptionAddress ? encodeURIComponent(receptionAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="datetime-local" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  <div className="flex gap-1">
                    <textarea rows={2} placeholder="Alamat Gedung Lengkap" className="w-full p-2 border-2 border-slate-300 rounded-lg resize-none" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
                    <button type="button" onClick={() => handleSearchLocation(false, false)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                  </div>
                  <input type="url" placeholder="Atau tempel Link Google Maps manual (Pin Titik):" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
                  <div className="w-full h-36 rounded-xl border-2 border-slate-200 overflow-hidden relative bg-slate-50">
                    <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${mapsUrl ? encodeURIComponent(mapsUrl) : (locationAddress ? encodeURIComponent(locationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <button type="button" onClick={onClose} className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
                <button type="button" onClick={() => setCurrentStep(2)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="button" onClick={() => { setFormMessage(''); setCurrentStep(4); }} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Media →</button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <h3 className="text-sm font-bold text-slate-900">Bagian 4: Galeri, Kado, Musik & Custom Blok</h3>
              <div className="p-3 border-2 rounded-xl bg-slate-50/50 space-y-1.5">
                <label className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">📁 1. Tambah Foto Galeri</label>
                <input type="text" placeholder="Momen-momen yang berhasil kami abadikan..." className="w-full p-2 border-2 rounded-lg bg-white" value={galleryProlog} onChange={(e) => setGalleryProlog(e.target.value)} />
                <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, false)} className="w-full text-xs" />
                {uploadingImage && <p className="text-teal-600 animate-pulse text-[10px]">Mengunggah berkas gambar...</p>}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 mt-1">
                  {uploadedPhotos.map((url, i) => <img key={i} src={url} className="w-8 h-8 object-cover rounded border-2 border-teal-200 shadow-2xs" />)}
                </div>
              </div>
              <div className="p-3 border-2 rounded-xl bg-slate-50/50 space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">🎬 2. Galeri Video Youtube</label>
                <input type="text" placeholder="Mari saksikan cuplikan video kebahagiaan kami." className="w-full p-2 border-2 rounded-lg bg-white" value={videoProlog} onChange={(e) => setVideoProlog(e.target.value)} />
                <input type="url" placeholder="Link Video YouTube" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white mt-1" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              </div>
              <div className="p-3 border-2 rounded-xl bg-slate-50/50 space-y-1.5">
                <label className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">🎵 3. Upload Musik Latar Belakang (.mp3)</label>
                <input type="file" accept="audio/mp3,audio/*" onChange={(e) => handleMusicUpload(e, false)} className="w-full text-xs" />
                {uploadingMusic && <p className="text-teal-600 animate-pulse text-[10px]">Mengunggah berkas suara...</p>}
                {bgMusicUrl && <p className="text-emerald-600 text-[10px] font-bold">✓ Musik Latar Terpasang</p>}
              </div>
              <div className="p-3 border-2 rounded-xl border-slate-200 space-y-2">
                <span className="font-bold text-teal-700 block">Kado Digital</span>
                <input type="text" placeholder="Terima kasih atas doa yang telah Anda berikan..." className="w-full p-2 border-2 rounded bg-white" value={giftProlog} onChange={(e) => setGiftProlog(e.target.value)} />
                {giftAccounts.map((acc, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
                    <input type="text" placeholder="Bank / E-Wallet" value={acc.bank} onChange={(e) => { const n = [...giftAccounts]; n[index].bank = e.target.value; setGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                    <input type="text" placeholder="Nama" value={acc.name} onChange={(e) => { const n = [...giftAccounts]; n[index].name = e.target.value; setGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                    <input type="text" placeholder="Nomor" value={acc.number} onChange={(e) => { const n = [...giftAccounts]; n[index].number = e.target.value; setGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                  </div>
                ))}
                <button type="button" onClick={() => setGiftAccounts([...giftAccounts, {name:'', bank:'', number:''}])} className="text-[11px] text-teal-600 font-bold hover:underline">+ Rekening</button>
              </div>
              <div className="p-3 border-2 rounded-xl border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Blok Custom</span>
                <input type="text" placeholder="Turut Mengundang" className="w-full p-2 border-2 rounded bg-white" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
                <input type="text" placeholder="Prolog Teks Turut Mengundang" className="w-full p-2 border-2 rounded bg-white" value={customProlog} onChange={(e) => setCustomProlog(e.target.value)} />
                <textarea rows={2} placeholder="Isi Konten Custom" className="w-full p-2 border-2 rounded resize-none bg-white" value={customContent} onChange={(e) => setCustomContent(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" onClick={() => setCurrentStep(3)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="submit" disabled={formLoading || uploadingImage || uploadingMusic} className="flex-1 py-2 bg-sky-600 disabled:bg-slate-400 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer">🚀 Terbitkan</button>
              </div>
            </div>
          )}
        </form>
        {formMessage && <div className="p-2 text-[10px] font-medium text-center bg-sky-50 text-sky-700 border border-sky-100 rounded-lg animate-in fade-in">{formMessage}</div>}
      </div>
    </div>
  );
}