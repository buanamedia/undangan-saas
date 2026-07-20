'use client';

import { useState, useEffect } from 'react';

interface EditInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  supabase: any;
  refreshInvitations: (userId: string) => Promise<void>;
  handleSearchLocation: (isEdit?: boolean, isReception?: boolean) => Promise<void>;
  editingInvitationData: any; // Menerima data mentah undangan yang sedang diedit dari parent

  // State maps & address kustom yang dikontrol bersama dengan parent
  editLocationAddress: string;
  setEditLocationAddress: (val: string) => void;
  editMapsUrl: string;
  setEditMapsUrl: (val: string) => void;
  editReceptionAddress: string;
  setEditReceptionAddress: (val: string) => void;
  editReceptionMapsUrl: string;
  setEditReceptionMapsUrl: (val: string) => void;
}

export default function EditInvitationModal({
  isOpen,
  onClose,
  userProfile,
  supabase,
  refreshInvitations,
  handleSearchLocation,
  editingInvitationData,
  editLocationAddress,
  setEditLocationAddress,
  editMapsUrl,
  setEditMapsUrl,
  editReceptionAddress,
  setEditReceptionAddress,
  editReceptionMapsUrl,
  setEditReceptionMapsUrl,
}: EditInvitationModalProps) {
  // ==========================================
  // STATE FORM EDIT UNDANGAN (100% UTUH)
  // ==========================================
  const [editStep, setEditStep] = useState(1);
  const [editSlug, setEditSlug] = useState('');
  const [editInvitationType, setEditInvitationType] = useState('');
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editSelectedTemplate, setEditSelectedTemplate] = useState('default');
  const [editWebsiteDesc, setEditWebsiteDesc] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editCoverProlog, setEditCoverProlog] = useState('');
  const [editGroomName, setEditGroomName] = useState('');
  const [editBrideName, setEditBrideName] = useState('');
  const [editEventBlockTitle, setEditEventBlockTitle] = useState('Akad Nikah');
  const [editEventProlog, setEditEventProlog] = useState('');
  const [editEventDate, setEditEventDate] = useState('');

  // STATE FOTO BAGIAN 1 & BAGIAN 3 (EDIT - TERKUNCI)
  const [editCoverPhotoUrl, setEditCoverPhotoUrl] = useState('');
  const [editProfileProlog, setEditProfileProlog] = useState('');
  const [editProfileDesc, setEditProfileDesc] = useState('');
  const [editProfileBottomPhotoUrl, setEditProfileBottomPhotoUrl] = useState('');

  // STATE TAMBAHAN: KHUSUS RESEPSI PERNIKAHAN (EDIT)
  const [editReceptionDate, setEditReceptionDate] = useState('');

  const [editGalleryProlog, setEditGalleryProlog] = useState('');
  const [editUploadedPhotos, setEditUploadedPhotos] = useState<string[]>([]);
  const [editVideoProlog, setEditVideoProlog] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editGiftProlog, setEditGiftProlog] = useState('');
  const [editGiftWay, setEditGiftWay] = useState('');
  const [editGiftAccounts, setEditGiftAccounts] = useState<{name: string, bank: string, number: string}[]>([]);
  const [editBgMusicUrl, setEditBgMusicUrl] = useState('');
  const [editCustomTitle, setEditCustomTitle] = useState('');
  const [editCustomProlog, setEditCustomProlog] = useState('');
  const [editCustomContent, setEditCustomContent] = useState('');
  
  const [editLoading, setEditLoading] = useState(false);

  // Sync data ketika modal dibuka atau data undangan dari parent berubah
  useEffect(() => {
    if (editingInvitationData && isOpen) {
      setEditSlug(editingInvitationData.slug || '');
      setEditInvitationType(editingInvitationData.type || '');
      setEditEventTitle(editingInvitationData.title || '');
      setEditSelectedTemplate(!userProfile?.is_premium ? 'free' : editingInvitationData.template_id || 'default');
      setEditGroomName(editingInvitationData.groom_name || '');
      setEditBrideName(editingInvitationData.bride_name || '');
      setEditLocationAddress(editingInvitationData.location_address || '');
      setEditMapsUrl(editingInvitationData.maps_url || '');
      setEditVideoUrl(editingInvitationData.video_url || '');
      setEditUploadedPhotos(editingInvitationData.gallery_images || []);
      setEditBgMusicUrl(editingInvitationData.bg_music_url || '');
      setEditGiftAccounts(editingInvitationData.gift_accounts || [{name:'', bank:'', number:''}]);

      const ext = editingInvitationData.custom_details || {};
      setEditWebsiteDesc(ext.website_desc || '');
      setEditKeywords(ext.keywords || '');
      setEditCoverProlog(ext.cover_prolog || 'Buka Undangan');
      setEditCoverPhotoUrl(ext.cover_photo_url || '');
      setEditProfileProlog(ext.profile_prolog || '');
      setEditProfileDesc(ext.profile_desc || '');
      setEditProfileBottomPhotoUrl(ext.profile_bottom_photo_url || '');
      setEditEventBlockTitle(ext.event_block_title || 'Akad Nikah');
      setEditEventProlog(ext.event_prolog || '');
      setEditReceptionAddress(ext.reception_address || '');
      setEditReceptionMapsUrl(ext.reception_maps_url || '');
      setEditGalleryProlog(ext.gallery_prolog || '');
      setEditVideoProlog(ext.video_prolog || '');
      setEditGiftProlog(ext.gift_prolog || '');
      setEditGiftWay(ext.gift_way || '');
      setEditCustomTitle(ext.custom_title || 'Turut Mengundang');
      setEditCustomProlog(ext.custom_prolog || '');
      setEditCustomContent(ext.custom_content || '');
      
      setEditEventDate(editingInvitationData.event_date ? String(editingInvitationData.event_date).replace(' ', 'T').substring(0, 16) : '');
      setEditReceptionDate(ext.reception_date ? String(ext.reception_date).replace(' ', 'T').substring(0, 16) : '');
      setEditStep(1);
    }
  }, [editingInvitationData, isOpen, userProfile]);

  const handleUpdateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const formattedGiftAccounts = editGiftAccounts.filter(acc => acc.bank || acc.name || acc.number);

      const { error } = await supabase
        .from('invitations')
        .update({
          title: editEventTitle,
          template_id: editSelectedTemplate,
          slug: editSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
          type: editInvitationType,
          groom_name: editGroomName || null,
          bride_name: editBrideName || null,
          location_address: editLocationAddress,
          maps_url: editMapsUrl,
          video_url: editVideoUrl,
          gallery_images: editUploadedPhotos,
          bg_music_url: editBgMusicUrl,
          gift_accounts: formattedGiftAccounts.length > 0 ? formattedGiftAccounts : null,
          custom_details: {
            website_desc: editWebsiteDesc || '',
            keywords: editKeywords || '',
            cover_prolog: editCoverProlog || 'Buka Undangan',
            cover_photo_url: editCoverPhotoUrl || '',
            profile_prolog: editProfileProlog || '',
            profile_desc: editProfileDesc || '',
            profile_bottom_photo_url: editProfileBottomPhotoUrl || '',
            event_block_title: editEventBlockTitle || 'Akad Nikah',
            event_prolog: editEventProlog || '',
            reception_address: editReceptionAddress || '',
            reception_maps_url: editReceptionMapsUrl || '',
            gallery_prolog: editGalleryProlog || '',
            video_prolog: editVideoProlog || '',
            gift_prolog: editGiftProlog || '',
            gift_way: editGiftWay || '',
            custom_title: editCustomTitle || 'Turut Mengundang',
            custom_prolog: editCustomProlog || '',
            custom_content: editCustomContent || ''
          }
        })
        .eq('id', editingInvitationData.id)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await refreshInvitations(session.user.id);
      alert('✨ Undangan berhasil diperbarui!');
      onClose();
    } catch (err: any) { 
      alert(`Gagal: ${err.message}`); 
    } finally { 
      setEditLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 max-w-md w-full p-4 sm:p-6 space-y-4 my-auto relative text-xs">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 font-bold text-sm z-10">✕</button>
        <div className="flex items-center justify-between border-b-2 pb-2 text-[10px] font-bold text-slate-400 pr-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className={editStep === 1 ? 'text-teal-600' : ''}>1. Tipe</span>
          <span className="mx-1">→</span>
          <span className={editStep === 2 ? 'text-teal-600' : ''}>2. Tema</span>
          <span className="mx-1">→</span>
          <span className={editStep === 3 ? 'text-teal-600' : ''}>3. Detail</span>
          <span className="mx-1">→</span>
          <span className={editStep === 4 ? 'text-teal-600 font-bold' : ''}>4. Media</span>
        </div>
        
        <form onSubmit={handleUpdateInvitation} className="space-y-4">
          {editStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 1</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Undangan (Terkunci)</label>
                <select disabled className="block w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed font-medium" value={editInvitationType}>
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
                <input type="text" placeholder="Tuliskan judul undangan di sini" className="w-full p-2 border-2 rounded-lg bg-white" value={editEventTitle} onChange={(e) => setEditEventTitle(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea rows={2} placeholder="Tuliskan deskripsi di sini" className="w-full p-2 border-2 rounded-lg resize-none" value={editWebsiteDesc} onChange={(e) => setEditWebsiteDesc(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Kunci</label>
                <input type="text" placeholder="Keywords" className="w-full p-2 border-2 rounded-lg" value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} />
              </div>
              <div className="p-3 border-2 rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                <label className="block font-bold text-slate-500 text-[10px] uppercase">📸 Foto Profil / Halaman Pembuka (Sampul) [KUNCI]</label>
                <input disabled type="file" accept="image/*" className="w-full text-xs cursor-not-allowed text-slate-400" />
                {editCoverPhotoUrl && <img src={editCoverPhotoUrl} className="w-16 h-16 object-cover rounded border-2 border-slate-300 mt-1 grayscale" />}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" onClick={() => setEditStep(2)} className="flex-1 py-2 bg-teal-700 text-white font-bold rounded-lg">Lanjut Tema →</button>
              </div>
            </div>
          )}

          {editStep === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 2: Tema & Cover</h3>
              <div>
                <label className="block font-semibold mb-1">Tulisan Tombol Sampul Cover</label>
                <input type="text" placeholder="Tulisan Tombol Cover" className="w-full p-2 border-2 rounded-lg" value={editCoverProlog} onChange={(e) => setEditCoverProlog(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template (Tema Undangan)</label>
                <select className="w-full p-2.5 border-2 border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500" value={editSelectedTemplate} onChange={(e) => {
                  if (!userProfile?.is_premium && e.target.value !== 'free') {
                    alert('Tema ini khusus untuk pengguna Premium!');
                    setEditSelectedTemplate('free');
                  } else {
                    setEditSelectedTemplate(e.target.value);
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
                <button type="button" onClick={() => setEditStep(1)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="button" onClick={() => setEditStep(3)} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Detail →</button>
              </div>
            </div>
          )}

          {editStep === 3 && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 3: Detail Tokoh & Informasi Acara</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Acara 1</label>
                {(editInvitationType === 'pernikahan' || editInvitationType === 'lamaran') ? (
                  <select className="block w-full p-2 border-2 border-slate-300 rounded-lg bg-white font-bold text-slate-800" value={editEventBlockTitle === 'Acara Utama' ? 'Akad Nikah' : editEventBlockTitle} onChange={(e) => setEditEventBlockTitle(e.target.value)}>
                    <option value="Akad Nikah">Akad Nikah</option>
                    <option value="Pemberkatan">Pemberkatan</option>
                  </select>
                ) : (
                  <input type="text" className="w-full p-2 border-2 rounded-lg font-bold bg-slate-50 uppercase text-slate-700" value={editEventBlockTitle === 'Acara Utama' || editEventBlockTitle === 'Akad Nikah' ? `PERAYAAN ${editInvitationType?.toUpperCase()}` : editEventBlockTitle} onChange={(e) => setEditEventBlockTitle(e.target.value)} />
                )}
              </div>
              <textarea rows={2} placeholder="Prolog Acara" className="w-full p-2 border-2 rounded-lg resize-none" value={editEventProlog} onChange={(e) => setEditEventProlog(e.target.value)} />
              {(editInvitationType === 'pernikahan' || editInvitationType === 'lamaran') ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input type="text" placeholder="Pria" className="w-full p-2 border-2 rounded-lg" value={editGroomName} onChange={(e) => setEditGroomName(e.target.value)} />
                  <input type="text" placeholder="Wanita" className="w-full p-2 border-2 rounded-lg" value={editBrideName} onChange={(e) => setEditBrideName(e.target.value)} />
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="text" placeholder="Prolog Profil" className="w-full p-2 border-2 rounded-lg" value={editProfileProlog} onChange={(e) => setEditProfileProlog(e.target.value)} />
                  <textarea rows={2} placeholder="Deskripsi Profil Tokoh" className="w-full p-2 border-2 rounded-lg resize-none" value={editProfileDesc} onChange={(e) => setEditProfileDesc(e.target.value)} />
                </div>
              )}
              <div className="p-3 border-2 rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                <label className="block font-bold text-slate-500 text-[10px] uppercase">📸 Foto Tambahan (Di Bawah Profil Utama) [KUNCI]</label>
                <input disabled type="file" accept="image/*" className="w-full text-xs cursor-not-allowed text-slate-400" />
                {editProfileBottomPhotoUrl && <img src={editProfileBottomPhotoUrl} className="w-16 h-16 object-cover rounded border-2 border-slate-300 mt-1 grayscale" />}
              </div>
              {editInvitationType === 'pernikahan' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50/20 border-2 border-rose-100 rounded-xl space-y-2">
                    <span className="font-bold text-rose-800 text-[10px] block uppercase">💍 Acara 1: Akad / Pemberkatan</span>
                    <input disabled type="datetime-local" className="w-full p-2 border-2 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" value={editEventDate} />
                    <div className="flex gap-1">
                      <textarea rows={2} className="w-full p-2 border-2 rounded-lg resize-none bg-white" value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)} />
                      <button type="button" onClick={() => handleSearchLocation(true, false)} className="px-2 bg-slate-800 text-white font-bold rounded-lg">Cari</button>
                    </div>
                    <input type="url" placeholder="Link Google Maps Akad" className="w-full p-2 border-2 rounded-lg bg-white text-[10px]" value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} />
                    <div className="w-full h-28 rounded-lg overflow-hidden relative border-2 bg-white mt-1">
                      <iframe width="100%" height="100%" className="border-0" src={`https://maps.google.com/maps?q=${editMapsUrl ? encodeURIComponent(editMapsUrl) : (editLocationAddress ? encodeURIComponent(editLocationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50/20 border-2 border-sky-100 rounded-xl space-y-2">
                    <span className="font-bold text-sky-800 text-[10px] block uppercase">🎉 Acara 2: Resepsi Pernikahan</span>
                    <input disabled type="datetime-local" className="w-full p-2 border-2 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" value={editReceptionDate} />
                    <div className="flex gap-1">
                      <textarea rows={2} className="w-full p-2 border-2 rounded-lg resize-none bg-white" value={editReceptionAddress} onChange={(e) => setEditReceptionAddress(e.target.value)} />
                      <button type="button" onClick={() => handleSearchLocation(true, true)} className="px-2 bg-slate-800 text-white font-bold rounded-lg">Cari</button>
                    </div>
                    <input type="url" placeholder="Link Google Maps Resepsi" className="w-full p-2 border-2 rounded-lg bg-white text-[10px]" value={editReceptionMapsUrl} onChange={(e) => setEditReceptionMapsUrl(e.target.value)} />
                    <div className="w-full h-28 rounded-lg overflow-hidden relative border-2 bg-white mt-1">
                      <iframe width="100%" height="100%" className="border-0" src={`https://maps.google.com/maps?q=${editReceptionMapsUrl ? encodeURIComponent(editReceptionMapsUrl) : (editReceptionAddress ? encodeURIComponent(editReceptionAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input disabled type="datetime-local" className="w-full p-2 border-2 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" value={editEventDate} />
                  <div className="flex gap-1">
                    <textarea rows={2} className="w-full p-2 border-2 rounded-lg resize-none" value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)} />
                    <button type="button" onClick={() => handleSearchLocation(true, false)} className="px-2 bg-slate-800 text-white font-bold rounded-lg">Cari</button>
                  </div>
                  <input type="url" placeholder="Link Google Maps manual (Pin Titik):" className="w-full p-2 border-2 rounded-lg bg-white" value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} />
                  <div className="w-full h-36 rounded-xl border-2 border-slate-200 overflow-hidden relative bg-slate-50 mt-1">
                    <iframe width="100%" height="100%" className="border-0" src={`https://maps.google.com/maps?q=${editMapsUrl ? encodeURIComponent(editMapsUrl) : (editLocationAddress ? encodeURIComponent(editLocationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" onClick={() => setEditStep(2)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="button" onClick={() => setEditStep(4)} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Media →</button>
              </div>
            </div>
          )}

          {editStep === 4 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 4: Galeri, Kado, Musik & Custom Blok</h3>
              <div className="p-3 border-2 rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">📁 1. Tambah Foto Galeri [KUNCI]</label>
                <input type="text" placeholder="Prolog Galeri Foto" className="w-full p-2 border-2 rounded-lg bg-white" value={editGalleryProlog} onChange={(e) => setEditGalleryProlog(e.target.value)} />
                <input disabled type="file" accept="image/*" multiple className="w-full text-xs cursor-not-allowed text-slate-400" />
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 mt-1">
                  {editUploadedPhotos && editUploadedPhotos.map((url, i) => <img key={i} src={url} className="w-8 h-8 object-cover rounded border-2 border-slate-300 shadow-2xs grayscale" />)}
                </div>
              </div>
              <div className="p-3 border-2 rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">🎬 2. Galeri Video Youtube [KUNCI]</label>
                <input type="text" placeholder="Prolog Video" className="w-full p-2 border-2 rounded-lg bg-white" value={editVideoProlog} onChange={(e) => setEditVideoProlog(e.target.value)} />
                <input disabled type="url" placeholder="Link Video YouTube" className="w-full p-2 border-2 rounded-lg bg-slate-200 text-slate-500 cursor-not-allowed mt-1" value={editVideoUrl} />
              </div>
              <div className="p-3 border-2 rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">🎵 3. Upload Musik Latar Belakang (.mp3) [KUNCI]</label>
                <input disabled type="file" accept="audio/mp3,audio/*" className="w-full text-xs cursor-not-allowed text-slate-400" />
                {editBgMusicUrl && <p className="text-slate-500 text-[10px] font-bold">✓ Musik Latar Terpasang</p>}
              </div>
              <div className="p-3 border-2 rounded-xl border-slate-200 space-y-2">
                <span className="font-bold text-teal-700 block">Kado Digital</span>
                <input type="text" placeholder="Prolog Kado" className="w-full p-2 border-2 rounded bg-white" value={editGiftProlog} onChange={(e) => setEditGiftProlog(e.target.value)} />
                {editGiftAccounts.map((acc, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
                    <input type="text" placeholder="Bank / E-Wallet" value={acc.bank} onChange={(e) => { const n = [...editGiftAccounts]; n[index].bank = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                    <input type="text" placeholder="Nama" value={acc.name} onChange={(e) => { const n = [...editGiftAccounts]; n[index].name = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                    <input type="text" placeholder="Nomor" value={acc.number} onChange={(e) => { const n = [...editGiftAccounts]; n[index].number = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                  </div>
                ))}
                <button type="button" onClick={() => setEditGiftAccounts([...editGiftAccounts, {name:'', bank:'', number:''}])} className="text-[10px] text-teal-600 font-bold">+ Rekening</button>
              </div>
              <div className="p-3 border-2 rounded-xl border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Blok Custom</span>
                <input type="text" placeholder="Judul Custom" className="w-full p-2 border-2 rounded bg-white" value={editCustomTitle} onChange={(e) => setEditCustomTitle(e.target.value)} />
                <input type="text" placeholder="Prolog Teks Turut Mengundang" className="w-full p-2 border-2 rounded bg-white" value={editCustomProlog} onChange={(e) => setEditCustomProlog(e.target.value)} />
                <textarea rows={2} placeholder="Isi Konten Custom" className="w-full p-2 border-2 rounded resize-none bg-white" value={editCustomContent} onChange={(e) => setEditCustomContent(e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" onClick={() => setEditStep(3)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="submit" disabled={editLoading} className="flex-1 py-2 bg-sky-600 disabled:bg-slate-400 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer">Simpan</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}