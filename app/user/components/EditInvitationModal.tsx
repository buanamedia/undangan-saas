'use client';

import { useState, useEffect } from 'react';

interface EditInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  supabase: any;
  refreshInvitations: (userId: string) => Promise<void>;
  uploadSingleFile?: (file: File) => Promise<string | null>;
  handleMusicUpload?: (e: React.ChangeEvent<HTMLInputElement>, isEditForm?: boolean) => Promise<string | null | void>;
  handleSearchLocation: (isEdit?: boolean, isReception?: boolean) => Promise<void>;
  editingInvitationData: any;

  editLocationAddress: string;
  setEditLocationAddress: (val: string) => void;
  editMapsUrl: string;
  setEditMapsUrl: (val: string) => void;
  editReceptionAddress: string;
  setEditReceptionAddress: (val: string) => void;
  editReceptionMapsUrl: string;
  setEditReceptionMapsUrl: (val: string) => void;
  uploadingMusic: boolean;
}

export default function EditInvitationModal({
  isOpen,
  onClose,
  userProfile,
  supabase,
  refreshInvitations,
  uploadSingleFile,
  handleMusicUpload,
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
  uploadingMusic,
}: EditInvitationModalProps) {
  const [editStep, setEditStep] = useState(1);
  const [editSlug, setEditSlug] = useState('');
  const [editInvitationType, setEditInvitationType] = useState('');
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editSelectedTemplate, setEditSelectedTemplate] = useState('free');
  const [editWebsiteDesc, setEditWebsiteDesc] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editCoverProlog, setEditCoverProlog] = useState('Buka Undangan');
  const [editGroomName, setEditGroomName] = useState('');
  const [editBrideName, setEditBrideName] = useState('');
  const [editProfileProlog, setEditProfileProlog] = useState('Sedikit cerita mengenai tokoh utama dalam acara ini.');
  const [editProfileDesc, setEditProfileDesc] = useState('');
  const [editEventBlockTitle, setEditEventBlockTitle] = useState('Akad Nikah');
  const [editEventProlog, setEditEventProlog] = useState('Kami mengundang Anda untuk menghadiri acara kami...');
  const [editEventDate, setEditEventDate] = useState('');

  const [editGroomFullName, setEditGroomFullName] = useState('');
  const [editGroomChildOf, setEditGroomChildOf] = useState('');
  const [editGroomFather, setEditGroomFather] = useState('');
  const [editGroomMother, setEditGroomMother] = useState('');
  const [editGroomIg, setEditGroomIg] = useState('');
  const [editGroomFb, setEditGroomFb] = useState('');

  const [editBrideFullName, setEditBrideFullName] = useState('');
  const [editBrideChildOf, setEditBrideChildOf] = useState('');
  const [editBrideFather, setEditBrideFather] = useState('');
  const [editBrideMother, setEditBrideMother] = useState('');
  const [editBrideIg, setEditBrideIg] = useState('');
  const [editBrideFb, setEditBrideFb] = useState('');

  const [editCoverPhotoUrl, setEditCoverPhotoUrl] = useState('');
  const [editProfileBottomPhotoUrl, setEditProfileBottomPhotoUrl] = useState('');
  const [editGroomPhotoUrl, setEditGroomPhotoUrl] = useState('');
  const [editBridePhotoUrl, setEditBridePhotoUrl] = useState('');

  const [editUploadedPhotos, setEditUploadedPhotos] = useState<string[]>([]);
  const [editBgMusicUrl, setEditBgMusicUrl] = useState('');

  const [uploadingSingle, setUploadingSingle] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [editReceptionDate, setEditReceptionDate] = useState('');

  const [editGalleryProlog, setEditGalleryProlog] = useState('Momen-momen yang berhasil kami abadikan...');
  const [editVideoProlog, setEditVideoProlog] = useState('Mari saksikan cuplikan video kebahagiaan kami.');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editGiftProlog, setEditGiftProlog] = useState('Terima kasih atas doa yang telah Anda berikan...');
  const [editGiftWay, setEditGiftWay] = useState('Kado dapat dikirimkan melalui rekening digital di bawah ini.');
  const [editGiftAccounts, setEditGiftAccounts] = useState<{name: string, bank: string, number: string}[]>([{name:'', bank:'', number:''}]);
  const [editCustomTitle, setEditCustomTitle] = useState('Turut Mengundang');
  const [editCustomProlog, setEditCustomProlog] = useState('Keluarga besar, sahabat karib, hingga teman-teman semua');
  const [editCustomContent, setEditCustomContent] = useState('');

  const [editFormMessage, setEditFormMessage] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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
      setEditGroomPhotoUrl(ext.groom_photo_url || '');
      setEditBridePhotoUrl(ext.bride_photo_url || '');
      setEditGroomFullName(ext.groom_full_name || '');
      setEditGroomChildOf(ext.groom_child_of || '');
      setEditGroomFather(ext.groom_father || '');
      setEditGroomMother(ext.groom_mother || '');
      setEditGroomIg(ext.groom_ig || '');
      setEditGroomFb(ext.groom_fb || '');
      setEditBrideFullName(ext.bride_full_name || '');
      setEditBrideChildOf(ext.bride_child_of || '');
      setEditBrideFather(ext.bride_father || '');
      setEditBrideMother(ext.bride_mother || '');
      setEditBrideIg(ext.bride_ig || '');
      setEditBrideFb(ext.bride_fb || '');
      setEditEventBlockTitle(ext.event_block_title || 'Akad Nikah');
      setEditEventProlog(ext.event_prolog || '');
      setEditReceptionAddress(ext.reception_address || '');
      setEditReceptionMapsUrl(ext.reception_maps_url || '');
      setEditGalleryProlog(ext.gallery_prolog || 'Momen-momen yang berhasil kami abadikan...');
      setEditVideoProlog(ext.video_prolog || '');
      setEditGiftProlog(ext.gift_prolog || '');
      setEditGiftWay(ext.gift_way || '');
      setEditCustomTitle(ext.custom_title || 'Turut Mengundang');
      setEditCustomProlog(ext.custom_prolog || '');
      setEditCustomContent(ext.custom_content || '');
      
      setEditEventDate(editingInvitationData.event_date ? String(editingInvitationData.event_date).replace(' ', 'T').substring(0, 16) : '');
      setEditReceptionDate(ext.reception_date ? String(ext.reception_date).replace(' ', 'T').substring(0, 16) : '');
      setEditStep(1);
      setEditFormMessage('');
    }
  }, [editingInvitationData, isOpen, userProfile, setEditLocationAddress, setEditMapsUrl, setEditReceptionAddress, setEditReceptionMapsUrl]);

  const handleSinglePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, setPhotoState: (url: string) => void, label: string) => {
    if (e.target.files && e.target.files[0]) {
      if (typeof uploadSingleFile !== 'function') {
        setEditFormMessage(`Fungsi uploadSingleFile belum terpasang dari Dashboard.`);
        return;
      }
      setUploadingSingle(true);
      setEditFormMessage(`Mengunggah ${label}...`);
      try {
        const url = await uploadSingleFile(e.target.files[0]);
        if (url) {
          setPhotoState(url);
          setEditFormMessage(`✓ ${label} berhasil dipasang`);
        } else {
          setEditFormMessage(`Gagal mengunggah ${label}`);
        }
      } catch (err: any) {
        setEditFormMessage(`Gagal unggah ${label}: ${err.message}`);
      } finally {
        setUploadingSingle(false);
      }
    }
  };

  const handleMultiplePhotoUploadEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (typeof uploadSingleFile !== 'function') {
      setEditFormMessage(`Fungsi uploadSingleFile belum terpasang dari Dashboard.`);
      return;
    }

    setUploadingGallery(true);
    setEditFormMessage('Mengunggah foto galeri...');

    try {
      const uploadPromises = Array.from(files).map((file) => uploadSingleFile(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      setEditUploadedPhotos((prev) => [...prev, ...validUrls]);
      setEditFormMessage('✓ Foto galeri berhasil ditambahkan');
    } catch (err: any) {
      setEditFormMessage(`Gagal unggah foto galeri: ${err.message}`);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemovePhotoEdit = (indexToRemove: number) => {
    setEditUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMusicUploadEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handleMusicUpload) {
      const res = await handleMusicUpload(e, true);
      if (typeof res === 'string') {
        setEditBgMusicUrl(res);
      }
    }
  };

  const handleUpdateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editStep !== 4) return;
    setEditLoading(true);
    setEditFormMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const cleanSlug = editSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const formattedGiftAccounts = editGiftAccounts.filter(acc => acc.bank || acc.name || acc.number);

      const { error } = await supabase
        .from('invitations')
        .update({
          title: editEventTitle,
          template_id: editSelectedTemplate,
          slug: cleanSlug,
          type: editInvitationType,
          groom_name: editGroomName || null,
          bride_name: editBrideName || null,
          event_date: editEventDate ? editEventDate.replace('T', ' ') : null,
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
            groom_photo_url: editGroomPhotoUrl || '',
            bride_photo_url: editBridePhotoUrl || '',
            groom_full_name: editGroomFullName || '',
            groom_child_of: editGroomChildOf || '',
            groom_father: editGroomFather || '',
            groom_mother: editGroomMother || '',
            groom_ig: editGroomIg || '',
            groom_fb: editGroomFb || '',
            bride_full_name: editBrideFullName || '',
            bride_child_of: editBrideChildOf || '',
            bride_father: editBrideFather || '',
            bride_mother: editBrideMother || '',
            bride_ig: editBrideIg || '',
            bride_fb: editBrideFb || '',
            event_block_title: editEventBlockTitle || 'Akad Nikah',
            event_prolog: editEventProlog || '',
            reception_date: editReceptionDate ? editReceptionDate.replace('T', ' ') : null,
            reception_address: editReceptionAddress || '',
            reception_maps_url: editReceptionMapsUrl || '',
            gallery_prolog: editGalleryProlog || 'Momen-momen yang berhasil kami abadikan...',
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
      alert('✨ Undangan berhasil diperbarui!');
      await refreshInvitations(session.user.id);
      onClose();
    } catch (err: any) { 
      setEditFormMessage(`Gagal: ${err.message}`); 
    } finally { 
      setEditLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 max-w-md w-full p-4 sm:p-6 space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150 text-xs">
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
                <input type="text" placeholder="Tuliskan judul undangan di sini" className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white" value={editEventTitle} onChange={(e) => setEditEventTitle(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                <textarea rows={2} placeholder="Tuliskan deskripsi di sini" className="w-full p-2 border-2 rounded-lg resize-none" value={editWebsiteDesc} onChange={(e) => setEditWebsiteDesc(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Kunci</label>
                <input type="text" placeholder="Undangan Nikah, Undangan Akikah" className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg" value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Link Undangan</label>
                <div className="flex rounded-lg shadow-sm overflow-hidden">
                  <span className="px-2 sm:px-3 border-2 border-r-0 border-slate-300 bg-slate-50 text-slate-400 flex items-center text-[10px] sm:text-xs shrink-0">/undangan/</span>
                  <input type="text" placeholder="nama-link" className="w-full px-3 py-2 border-2 border-slate-300 rounded-r-lg min-w-0" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
                </div>
              </div>

              <div className="p-3 border-2 rounded-xl bg-teal-50/40 border-teal-200 space-y-1.5">
                <label className="block font-bold text-teal-800 text-[10px] uppercase">📸 Foto Profil / Halaman Pembuka (Sampul)</label>
                <input type="file" accept="image/*" className="w-full text-xs" onChange={(e) => handleSinglePhotoChange(e, setEditCoverPhotoUrl, 'Foto sampul')} />
                {editCoverPhotoUrl && (
                  <div className="relative w-16 h-16 mt-1">
                    <img src={editCoverPhotoUrl} className="w-16 h-16 object-cover rounded border-2 border-teal-200" />
                    <button type="button" onClick={() => setEditCoverPhotoUrl('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full w-5 h-5 text-[10px] flex items-center justify-center shadow hover:bg-rose-700">✕</button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" disabled={!editSlug || !editInvitationType || !editEventTitle} onClick={() => { setEditFormMessage(''); setEditStep(2); }} className="flex-1 py-2 bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold">Lanjut Pilih Tema</button>
              </div>
            </div>
          )}

          {editStep === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 2: Tema & Cover</h3>
              <div>
                <label className="block font-semibold mb-1">Tulisan Tombol Sampul Cover</label>
                <input type="text" className="w-full p-2 border-2 rounded-lg" value={editCoverProlog} onChange={(e) => setEditCoverProlog(e.target.value)} />
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
              <textarea rows={2} placeholder="Prolog Informasi Acara" className="w-full p-2 border-2 rounded-lg resize-none" value={editEventProlog} onChange={(e) => setEditEventProlog(e.target.value)} />
              
              {(editInvitationType === 'pernikahan' || editInvitationType === 'lamaran') ? (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-700 text-[10px] block uppercase text-teal-700">👨 Data Mempelai Pria</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nama Panggilan Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={editGroomName} onChange={(e) => setEditGroomName(e.target.value)} />
                      <input type="text" placeholder="Nama Lengkap Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={editGroomFullName} onChange={(e) => setEditGroomFullName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Putra ke- (cth: Putra Pertama)" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editGroomChildOf} onChange={(e) => setEditGroomChildOf(e.target.value)} />
                      <input type="text" placeholder="Nama Ayah" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editGroomFather} onChange={(e) => setEditGroomFather(e.target.value)} />
                      <input type="text" placeholder="Nama Ibu" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editGroomMother} onChange={(e) => setEditGroomMother(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="url" placeholder="Link Instagram Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editGroomIg} onChange={(e) => setEditGroomIg(e.target.value)} />
                      <input type="url" placeholder="Link Facebook Pria" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editGroomFb} onChange={(e) => setEditGroomFb(e.target.value)} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-slate-700 text-[10px] block uppercase text-rose-700">👩 Data Mempelai Wanita</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Nama Panggilan Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={editBrideName} onChange={(e) => setEditBrideName(e.target.value)} />
                      <input type="text" placeholder="Nama Lengkap Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={editBrideFullName} onChange={(e) => setEditBrideFullName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Putri ke- (cth: Putri Kedua)" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editBrideChildOf} onChange={(e) => setEditBrideChildOf(e.target.value)} />
                      <input type="text" placeholder="Nama Ayah" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editBrideFather} onChange={(e) => setEditBrideFather(e.target.value)} />
                      <input type="text" placeholder="Nama Ibu" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editBrideMother} onChange={(e) => setEditBrideMother(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="url" placeholder="Link Instagram Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editBrideIg} onChange={(e) => setEditBrideIg(e.target.value)} />
                      <input type="url" placeholder="Link Facebook Wanita" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editBrideFb} onChange={(e) => setEditBrideFb(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border-2 border-dashed rounded-xl bg-slate-50/60">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 text-[10px] uppercase">📸 Foto Mempelai Pria</label>
                      <input type="file" accept="image/*" className="w-full text-[10px]" onChange={(e) => handleSinglePhotoChange(e, setEditGroomPhotoUrl, 'Foto pria')} />
                      {editGroomPhotoUrl && (
                        <div className="relative w-12 h-16 mt-1">
                          <img src={editGroomPhotoUrl} className="w-12 h-16 object-cover rounded-xl border shadow-2xs" style={{aspectRatio: '3/4'}} />
                          <button type="button" onClick={() => setEditGroomPhotoUrl('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full w-4 h-4 text-[9px] flex items-center justify-center shadow hover:bg-rose-700">✕</button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 text-[10px] uppercase">📸 Foto Mempelai Wanita</label>
                      <input type="file" accept="image/*" className="w-full text-[10px]" onChange={(e) => handleSinglePhotoChange(e, setEditBridePhotoUrl, 'Foto wanita')} />
                      {editBridePhotoUrl && (
                        <div className="relative w-12 h-16 mt-1">
                          <img src={editBridePhotoUrl} className="w-12 h-16 object-cover rounded-xl border shadow-2xs" style={{aspectRatio: '3/4'}} />
                          <button type="button" onClick={() => setEditBridePhotoUrl('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full w-4 h-4 text-[9px] flex items-center justify-center shadow hover:bg-rose-700">✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="text" placeholder="Prolog Teks Profil Tokoh" className="w-full p-2 border-2 rounded-lg" value={editProfileProlog} onChange={(e) => setEditProfileProlog(e.target.value)} />
                  <textarea rows={2} placeholder="Rincian Profil Tokoh Lengkap" className="w-full p-2 border-2 rounded-lg resize-none" value={editProfileDesc} onChange={(e) => setEditProfileDesc(e.target.value)} />
                  
                  <div className="p-3 border-2 rounded-xl bg-teal-50/40 border-teal-200 space-y-1.5">
                    <label className="block font-bold text-teal-800 text-[10px] uppercase">📸 Foto Tambahan (Di Bawah Profil Utama)</label>
                    <input type="file" accept="image/*" className="w-full text-xs" onChange={(e) => handleSinglePhotoChange(e, setEditProfileBottomPhotoUrl, 'Foto profil bawah')} />
                    {editProfileBottomPhotoUrl && (
                      <div className="relative w-16 h-16 mt-1">
                        <img src={editProfileBottomPhotoUrl} className="w-16 h-16 object-cover rounded border-2 border-teal-200" />
                        <button type="button" onClick={() => setEditProfileBottomPhotoUrl('')} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full w-5 h-5 text-[10px] flex items-center justify-center shadow hover:bg-rose-700">✕</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {editInvitationType === 'pernikahan' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50/40 border-2 border-rose-200 rounded-xl space-y-2">
                    <span className="font-bold text-rose-800 text-[10px] block uppercase">💍 Acara 1: Akad / Pemberkatan</span>
                    <input type="datetime-local" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={editEventDate} onChange={(e) => setEditEventDate(e.target.value)} />
                    <div className="flex gap-1">
                      <textarea rows={2} placeholder="Alamat Lengkap Tempat Akad" className="w-full p-2 border-2 border-slate-300 rounded-lg resize-none bg-white" value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)} />
                      <button type="button" onClick={() => handleSearchLocation(true, false)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                    </div>
                    <input type="url" placeholder="Link Google Maps Akad" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} />
                    <div className="w-full h-28 rounded-lg overflow-hidden relative border-2 bg-white mt-1">
                      <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${editMapsUrl ? encodeURIComponent(editMapsUrl) : (editLocationAddress ? encodeURIComponent(editLocationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  </div>
                  <div className="p-3 bg-sky-50/40 border-2 border-sky-200 rounded-xl space-y-2">
                    <span className="font-bold text-sky-800 text-[10px] block uppercase">🎉 Acara 2: Resepsi Pernikahan</span>
                    <input type="datetime-local" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white" value={editReceptionDate} onChange={(e) => setEditReceptionDate(e.target.value)} />
                    <div className="flex gap-1">
                      <textarea rows={2} placeholder="Alamat Lengkap Tempat Resepsi" className="w-full p-2 border-2 border-slate-300 rounded-lg resize-none bg-white" value={editReceptionAddress} onChange={(e) => setEditReceptionAddress(e.target.value)} />
                      <button type="button" onClick={() => handleSearchLocation(true, true)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                    </div>
                    <input type="url" placeholder="Link Google Maps Resepsi" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white text-[10px]" value={editReceptionMapsUrl} onChange={(e) => setEditReceptionMapsUrl(e.target.value)} />
                    <div className="w-full h-28 rounded-lg overflow-hidden relative border-2 bg-white mt-1">
                      <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${editReceptionMapsUrl ? encodeURIComponent(editReceptionMapsUrl) : (editReceptionAddress ? encodeURIComponent(editReceptionAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <input type="datetime-local" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg" value={editEventDate} onChange={(e) => setEditEventDate(e.target.value)} />
                  <div className="flex gap-1">
                    <textarea rows={2} placeholder="Alamat Gedung Lengkap" className="w-full p-2 border-2 border-slate-300 rounded-lg resize-none" value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)} />
                    <button type="button" onClick={() => handleSearchLocation(true, false)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                  </div>
                  <input type="url" placeholder="Atau tempel Link Google Maps manual (Pin Titik):" className="w-full p-2 border-2 rounded-lg bg-white" value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} />
                  <div className="w-full h-36 rounded-xl border-2 border-slate-200 overflow-hidden relative bg-slate-50 mt-1">
                    <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${editMapsUrl ? encodeURIComponent(editMapsUrl) : (editLocationAddress ? encodeURIComponent(editLocationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <button type="button" onClick={onClose} className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
                <button type="button" onClick={() => setEditStep(2)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="button" onClick={() => { setEditFormMessage(''); setEditStep(4); }} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Media →</button>
              </div>
            </div>
          )}

          {editStep === 4 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 4: Galeri, Kado, Musik & Custom Blok</h3>
              
              <div className="p-3 border-2 rounded-xl bg-slate-50/50 space-y-1.5">
                <label className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">📁 1. Tambah Foto Galeri</label>
                <input type="text" placeholder="Momen-momen yang berhasil kami abadikan..." className="w-full p-2 border-2 rounded-lg bg-white" value={editGalleryProlog} onChange={(e) => setEditGalleryProlog(e.target.value)} />
                <input type="file" accept="image/*" multiple onChange={handleMultiplePhotoUploadEdit} className="w-full text-xs" />
                {uploadingGallery && <p className="text-teal-600 animate-pulse text-[10px]">Mengunggah berkas gambar...</p>}
                
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                  {editUploadedPhotos.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} className="w-12 h-12 object-cover rounded-lg border-2 border-teal-200 shadow-2xs" />
                      <button type="button" onClick={() => handleRemovePhotoEdit(i)} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-bold rounded-full w-4 h-4 text-[9px] flex items-center justify-center shadow hover:bg-rose-700">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 border-2 rounded-xl bg-slate-50/50 space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">🎬 2. Galeri Video Youtube</label>
                <input type="text" placeholder="Mari saksikan cuplikan video kebahagiaan kami." className="w-full p-2 border-2 rounded-lg bg-white" value={editVideoProlog} onChange={(e) => setEditVideoProlog(e.target.value)} />
                <input type="url" placeholder="Link Video YouTube" className="w-full px-2 py-1.5 border-2 border-slate-300 rounded-lg bg-white mt-1" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)} />
              </div>

              <div className="p-3 border-2 rounded-xl bg-slate-50/50 space-y-1.5">
                <label className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">🎵 3. Upload Musik Latar Belakang (.mp3)</label>
                <input type="file" accept="audio/mp3,audio/*" onChange={handleMusicUploadEdit} className="w-full text-xs" />
                {uploadingMusic && <p className="text-teal-600 animate-pulse text-[10px]">Mengunggah berkas suara...</p>}
                {editBgMusicUrl && (
                  <div className="flex items-center justify-between text-[10px] bg-emerald-50 text-emerald-700 p-1.5 rounded border border-emerald-200 font-bold">
                    <span>✓ Musik Latar Terpasang</span>
                    <button type="button" onClick={() => setEditBgMusicUrl('')} className="text-rose-600 font-bold hover:underline">Hapus Musik</button>
                  </div>
                )}
              </div>

              <div className="p-3 border-2 rounded-xl border-slate-200 space-y-2">
                <span className="font-bold text-teal-700 block">Kado Digital</span>
                <input type="text" placeholder="Terima kasih atas doa yang telah Anda berikan..." className="w-full p-2 border-2 rounded bg-white" value={editGiftProlog} onChange={(e) => setEditGiftProlog(e.target.value)} />
                {editGiftAccounts.map((acc, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
                    <input type="text" placeholder="Bank / E-Wallet" value={acc.bank} onChange={(e) => { const n = [...editGiftAccounts]; n[index].bank = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                    <input type="text" placeholder="Nama" value={acc.name} onChange={(e) => { const n = [...editGiftAccounts]; n[index].name = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                    <input type="text" placeholder="Nomor" value={acc.number} onChange={(e) => { const n = [...editGiftAccounts]; n[index].number = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border-2 rounded text-xs bg-white" />
                  </div>
                ))}
                <button type="button" onClick={() => setEditGiftAccounts([...editGiftAccounts, {name:'', bank:'', number:''}])} className="text-[11px] text-teal-600 font-bold hover:underline">+ Rekening</button>
              </div>

              <div className="p-3 border-2 rounded-xl border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Blok Custom</span>
                <input type="text" placeholder="Turut Mengundang" className="w-full p-2 border-2 rounded bg-white" value={editCustomTitle} onChange={(e) => setEditCustomTitle(e.target.value)} />
                <input type="text" placeholder="Prolog Teks Turut Mengundang" className="w-full p-2 border-2 rounded bg-white" value={editCustomProlog} onChange={(e) => setEditCustomProlog(e.target.value)} />
                <textarea rows={2} placeholder="Isi Konten Custom" className="w-full p-2 border-2 rounded resize-none bg-white" value={editCustomContent} onChange={(e) => setEditCustomContent(e.target.value)} />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                <button type="button" onClick={() => setEditStep(3)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                <button type="submit" disabled={editLoading || uploadingSingle || uploadingGallery || uploadingMusic} className="flex-1 py-2 bg-sky-600 disabled:bg-slate-400 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer">Simpan</button>
              </div>
            </div>
          )}
        </form>
        {editFormMessage && <div className="p-2 text-[10px] font-medium text-center bg-sky-50 text-sky-700 border border-sky-100 rounded-lg animate-in fade-in">{editFormMessage}</div>}
      </div>
    </div>
  );
}