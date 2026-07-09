'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  // State Kontrol Jendela Popup Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWishesModalOpen, setIsWishesModalOpen] = useState(false);
  const [selectedWishes, setSelectedWishes] = useState<any[]>([]);

  // ⚡ STATE BARU: POPUP MODAL DETAIL PROFILE & PENGATURAN PASSWORD
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ==========================================
  // STATE BARU: MANAJEMEN KIRIM UNDANGAN TAMU KUSTOM
  // ==========================================
  const [selectedInvForShare, setSelectedInvForShare] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestsList, setGuestsList] = useState<{ name: string; address: string }[]>([]);

  // ==========================================
  // STATE FORM TAMBAH UNDANGAN BARU
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
  const [locationAddress, setLocationAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');

  // STATE FOTO BAGIAN 1 & BAGIAN 3 (TAMBAH)
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [profileBottomPhotoUrl, setProfileBottomPhotoUrl] = useState('');

  // STATE TAMBAHAN: KHUSUS RESEPSI PERNIKAHAN (TAMBAH)
  const [receptionDate, setReceptionDate] = useState('');
  const [receptionAddress, setReceptionAddress] = useState('');
  const [receptionMapsUrl, setReceptionMapsUrl] = useState('');

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [galleryProlog, setGalleryProlog] = useState('Momen-momen yang berhasil kami abadikan...');
  const [videoProlog, setVideoProlog] = useState('Mari saksikan cuplikan video kebahagiaan kami.');
  const [videoUrl, setVideoUrl] = useState('');
  const [giftProlog, setGiftProlog] = useState('Terima kasih atas doa yang telah Anda berikan...');
  const [giftWay, setGiftWay] = useState('Kado dapat dikirimkan melalui rekening digital di bawah ini.');
  const [giftAccounts, setGiftAccounts] = useState<{name: string, bank: string, number: string}[]>([{name:'', bank:'', number:''}]);
  const [bgMusicUrl, setBgMusicUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('Turut Mengundang');
  const [customProlog, setCustomProlog] = useState('Keluarga besar, sahabat karib, hingga teman-teman semua');
  const [customContent, setCustomContent] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // ==========================================
  // STATE MODAL EDIT UNDANGAN
  // ==========================================
  const [editingId, setEditingId] = useState('');
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
  const [editLocationAddress, setEditLocationAddress] = useState('');
  const [editMapsUrl, setEditMapsUrl] = useState('');

  // STATE FOTO BAGIAN 1 & BAGIAN 3 (EDIT - TERKUNCI)
  const [editCoverPhotoUrl, setEditCoverPhotoUrl] = useState('');
  const [editProfileProlog, setEditProfileProlog] = useState('');
  const [editProfileDesc, setEditProfileDesc] = useState('');
  const [editProfileBottomPhotoUrl, setEditProfileBottomPhotoUrl] = useState('');

  // STATE TAMBAHAN: KHUSUS RESEPSI PERNIKAHAN (EDIT)
  const [editReceptionDate, setEditReceptionDate] = useState('');
  const [editReceptionAddress, setEditReceptionAddress] = useState('');
  const [editReceptionMapsUrl, setEditReceptionMapsUrl] = useState('');

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
  const [editUploadingImage, setEditUploadingImage] = useState(false);

  const refreshInvitations = async (userId: string) => {
    const { data: invList, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error) {
      setInvitations(invList || []);
      if (invList && invList.length > 0 && !selectedInvForShare) {
        triggerActiveSharePanel(invList[0]);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) { 
        router.push('/login'); 
        return; 
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Gagal mengambil data profiles dari DB:", profileError);
      }

      if (profile) {
        setUserProfile({
          ...profile,
          email: session.user.email
        });
      } else {
        const newProfile = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          is_premium: false,
          role: 'user'
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (!insertError) {
          setUserProfile(newProfile);
        } else {
          setUserProfile({
            full_name: session.user.email?.split('@')[0],
            is_premium: false,
            role: 'user',
            email: session.user.email
          });
        }
      }
      
      await refreshInvitations(session.user.id);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUserChangePasswordDirect = async () => {
    if (!userProfile?.id) return;

    const newPassword = prompt('Masukkan Password Baru Anda (Minimal 6 karakter):', '');
    if (newPassword === null) return; 

    if (newPassword.trim().length < 6) {
      return alert('🚨 Gagal: Kata sandi baru minimal harus berisi 6 karakter!');
    }

    setIsUpdatingPassword(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          newPassword: newPassword.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengubah password.');
      }

      alert('✨ Sukses! Kata sandi akun Anda berhasil diganti secara langsung.');
      setShowProfileModal(false);
    } catch (err: any) {
      alert(`Gagal memperbarui password: ${err.message}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    const { error } = await supabase.storage.from('gallery').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (!error) {
      const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);
      return data?.publicUrl || null;
    }
    return null;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditForm = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (isEditForm) setEditUploadingImage(true); else setUploadingImage(true);
    
    const files = Array.from(e.target.files);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadSingleFile(file);
      if (url) urls.push(url);
    }
    
    if (isEditForm) {
      setEditUploadedPhotos((prev) => [...prev, ...urls]);
      setEditUploadingImage(false);
    } else {
      setUploadedPhotos((prev) => [...prev, ...urls]);
      setUploadingImage(false);
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditForm = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (isEditForm) setEditLoading(true); else setUploadingMusic(true);
    
    const file = e.target.files[0];
    const fileName = `${Date.now()}.mp3`;
    const { error } = await supabase.storage.from('music').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (!error) {
      const { data } = supabase.storage.from('music').getPublicUrl(fileName);
      if (data?.publicUrl) {
        if (isEditForm) setEditBgMusicUrl(data.publicUrl); else setBgMusicUrl(data.publicUrl);
      }
    }
    if (isEditForm) setEditLoading(false); else setUploadingMusic(false);
  };

  const handleSearchLocation = async (isEdit = false, isReception = false) => {
    let address = "";
    if (isEdit) {
      address = isReception ? editReceptionAddress : editLocationAddress;
    } else {
      address = isReception ? receptionAddress : locationAddress;
    }
    
    if (!address) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&limit=1&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const url = `https://www.google.com/maps?q=${data[0].lat},${data[0].lon}`;
        if (isEdit) {
          if (isReception) setEditReceptionMapsUrl(url); else setEditMapsUrl(url);
        } else {
          if (isReception) setReceptionMapsUrl(url); else setMapsUrl(url);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleViewWishes = async (invitationId: string) => {
    const { data: wishes, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });
    
    if (!error) {
      setSelectedWishes(wishes || []);
      setIsWishesModalOpen(true);
    } else {
      alert("Gagal memuat ucapan.");
    }
  };

  const triggerActiveSharePanel = (inv: any) => {
    setSelectedInvForShare(inv);
    setGuestName('');
    setGuestAddress('');
    const savedGuests = localStorage.getItem(`user_guests_${inv.slug}`);
    if (savedGuests) {
      setGuestsList(JSON.parse(savedGuests));
    } else {
      setGuestsList([]);
    }
  };

  const handleAddGuestLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !selectedInvForShare) return;

    const newGuests = [...guestsList, { name: guestName.trim(), address: guestAddress.trim() }];
    setGuestsList(newGuests);
    localStorage.setItem(`user_guests_${selectedInvForShare.slug}`, JSON.stringify(newGuests));
    setGuestName('');
    setGuestAddress('');
  };

  const handleRemoveGuestLocal = (index: number) => {
    if (!selectedInvForShare) return;
    const updated = guestsList.filter((_, i) => i !== index);
    setGuestsList(updated);
    localStorage.setItem(`user_guests_${selectedInvForShare.slug}`, JSON.stringify(updated));
  };

  const getBadgeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pernikahan': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'lamaran': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'akikah': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'khitanan': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ulang-tahun': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'halalbihalal': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'wisuda': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const resetForm = () => {
    setSlug(''); setInvitationType(''); setEventTitle(''); setGroomName(''); setBrideName('');
    setEventDate(''); setLocationAddress(''); setMapsUrl(''); setUploadedPhotos([]); setVideoUrl('');
    setBgMusicUrl(''); setGiftAccounts([{name:'', bank:'', number:''}]); setWebsiteDesc(''); setKeywords('');
    setCustomContent(''); setEventBlockTitle('Akad Nikah');
    setReceptionDate(''); setReceptionAddress(''); setReceptionMapsUrl('');
    setCoverPhotoUrl(''); setProfileBottomPhotoUrl('');
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
      setIsCreateModalOpen(false);
      resetForm();
      await refreshInvitations(session.user.id);
    } catch (err: any) { setFormMessage(`Gagal: ${err.message}`); }
    finally { setFormLoading(false); }
  };

  const openEditModal = (inv: any) => {
    setEditingId(inv.id);
    setEditSlug(inv.slug || '');
    setEditInvitationType(inv.type || '');
    setEditEventTitle(inv.title || '');

    if (!userProfile?.is_premium) {
      setEditSelectedTemplate('free');
    } else {
      setEditSelectedTemplate(inv.template_id || 'default');
    }

    setEditGroomName(inv.groom_name || '');
    setEditBrideName(inv.bride_name || '');
    setEditLocationAddress(inv.location_address || '');
    setEditMapsUrl(inv.maps_url || '');
    setEditVideoUrl(inv.video_url || '');
    setEditUploadedPhotos(inv.gallery_images || []);
    setEditBgMusicUrl(inv.bg_music_url || '');
    setEditGiftAccounts(inv.gift_accounts || [{name:'', bank:'', number:''}]);

    const ext = inv.custom_details || {};
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
    setEditCustomProlog(ext.custom_prolog || 'Keluarga besar, sahabat karib, hingga teman-teman semua');
    setEditCustomContent(ext.custom_content || '');
    
    if (inv.event_date) {
      setEditEventDate(String(inv.event_date).replace(' ', 'T').substring(0, 16));
    } else {
      setEditEventDate('');
    }

    if (ext.reception_date) {
      setEditReceptionDate(String(ext.reception_date).replace(' ', 'T').substring(0, 16));
    } else {
      setEditReceptionDate('');
    }

    setEditStep(1);
    setIsEditModalOpen(true);
  };

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
        .eq('id', editingId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      await refreshInvitations(session.user.id);
      alert('✨ Undangan berhasil diperbarui!');
    } catch (err: any) { 
      alert(`Gagal: ${err.message}`); 
    } finally { 
      setEditLoading(false); 
    }
  };

  const handleDeleteInvitation = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Hapus permanen undangan "${name}"?`);
    if (!confirmDelete) return;
    try {
      await supabase.from('rsvps').delete().eq('invitation_id', id);
      const { error } = await supabase.from('invitations').delete().eq('id', id);
      if (!error) {
        setInvitations(invitations.filter((inv) => inv.id !== id));
        alert('🗑️ Undangan berhasil dihapus.');
      }
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-xs font-bold text-sky-600 animate-pulse">MEMUAT DASHBOARD...</p></div>;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      
      {/* ========================================== */}
      {/* HEADER NAVBAR GLOBAL (BARU & SELARAS) */}
      {/* ========================================== */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LOGO BRANDING */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <img 
              src="/logo/Logo.png" 
              alt="Logo Undangan Digital" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">
                Undangan <span className="text-blue-700">Digital</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-wider mt-0.5">
                by Buanamedia
              </span>
            </div>
          </div>

          {/* ⚡ PERBAIKAN: Tombol atas kanan disesuaikan ukuran, warna, dan posisinya agar 100% sama dengan halaman tentang-kami */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/premium')} 
              className="px-[18px] py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer tracking-wide"
            >
              Upgrade
            </button>
            <button 
              onClick={handleLogout}
              className="px-[18px] py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer tracking-wide"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* AREA UTAMA SUB-NAVBAR CONTEXT DASHBOARD */}
      {/* ========================================== */}
      <div className="bg-slate-50 border-b border-slate-200/60 px-4 sm:px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          
          {/* AREA USER PROFILE CLICKER */}
          <h1 
            onClick={() => setShowProfileModal(true)}
            className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate cursor-pointer hover:opacity-80 transition-opacity select-none"
          >
            <span>Halo, {userProfile?.full_name || userProfile?.username || 'User'} 👤</span>
            {userProfile?.is_premium ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-950 bg-linear-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full shadow-md border border-amber-200">
                PREMIUM
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase bg-slate-200 text-slate-500 rounded-full tracking-wider border border-slate-300/40">
                FREE
              </span>
            )}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              + Undangan
            </button>
            <button 
              onClick={() => router.push('/demo')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              Lihat Tema
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* GRID BODY MAIN KONTEN */}
      {/* ========================================== */}
      <main className="grow bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* KOLOM 1 & 2: LIST KARTU UNDANGAN */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide uppercase">
                Koleksi Undangan Anda ({invitations.length})
              </h2>
            </div>
            
            {invitations.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 text-xs shadow-2xs">
                Belum ada undangan yang dibuat. Silakan klik tombol "+ Buat Undangan" di atas untuk memulai.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invitations.map((inv) => (
                  <div 
                    key={inv.id} 
                    onClick={() => triggerActiveSharePanel(inv)}
                    className={`bg-white p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-4 text-xs hover:shadow-md transition-all cursor-pointer ${selectedInvForShare?.id === inv.id ? 'border-teal-600 ring-2 ring-teal-600/10' : 'border-slate-200/70 shadow-2xs'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getBadgeColor(inv.type)}`}>
                          {inv.type || 'Lainnya'}
                        </span>
                        {selectedInvForShare?.id === inv.id && (
                          <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Dipilih</span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide break-words">{inv.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <span>📍</span> <span className="line-clamp-1">{inv.location_address || 'Belum diatur'}</span>
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <a href={`/undangan/${inv.slug}`} target="_blank" className="flex-1 text-center py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] rounded-xl transition-colors">👁️ Lihat</a>
                      <button onClick={() => handleViewWishes(inv.id)} className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-xl transition-colors">💬 Doa</button>
                      <button onClick={() => openEditModal(inv)} className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-xl transition-colors">✏️ Edit</button>
                      <button onClick={() => handleDeleteInvitation(inv.id, inv.title)} className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-xl transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KOLOM 3 (SISI KANAN): PANEL KELOLA DATA TAMU */}
          <div className="bg-white border border-slate-200/70 shadow-2xs rounded-2xl p-5 space-y-4">
            {!selectedInvForShare ? (
              <div className="text-center text-slate-400 py-12 text-xs">
                👉 Pilih salah satu kartu undangan di sebelah kiri untuk mengaktifkan generator kirim link tautan tamu kustom.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">📩 Kirim Undangan</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Undangan aktif: <span className="font-semibold text-slate-600">{selectedInvForShare.title}</span></p>
                </div>

                <form onSubmit={handleAddGuestLocal} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">Kirimkan undangan dengan nama penerima agar lebih personal di sini.</p>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Tamu Undangan</label>
                      <input 
                        type="text"
                        required
                        placeholder="Contoh: Agus Saputra"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat / Keterangan Lokasi</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Di Tempat / Jakarta"
                      value={guestAddress}
                      onChange={(e) => setGuestAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    💾 Simpan Data Tamu
                  </button>
                </form>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-700">Catatan:</span> 
                  <br></br>Selain anda menggunakan fitur ini, anda juga bisa langsung share URL domain anda yaitu dengan menshare url:
                  <br></br>
                  <br></br><span className="font-bold text-slate-800 break-all select-all">{`${window.location.origin}/undangan/${selectedInvForShare.slug}/kepada:NamaTeman-Tempat`}</span>.
                  <br></br>
                  <br></br>Anda tinggal mengganti Nama Teman dan Tempat disesuikan dengan tujuan anda.
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Daftar Tautan Tamu ({guestsList.length})</p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-white">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-2.5">Nama & Alamat</th>
                          <th className="p-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {guestsList.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="p-6 text-center text-slate-400 italic">Belum ada daftar tamu. Masukkan data pada form di atas.</td>
                          </tr>
                        ) : (
                          guestsList.map((guest, idx) => {
                            const baseUrl = `${window.location.origin}/undangan/${selectedInvForShare.slug}`;
                            const customUrl = `${baseUrl}?to=${encodeURIComponent(guest.name)}${guest.address ? `&addr=${encodeURIComponent(guest.address)}` : ''}`;
                            const waText = `Halo *${guest.name}*, Kami mengundang Anda untuk menghadiri acara kami. Silakan buka tautan undangan digital resmi berikut untuk informasi lengkap: ${customUrl}`;
                            const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-2.5">
                                  <p className="font-bold text-slate-800">{guest.name}</p>
                                  <p className="text-[10px] text-slate-400">📍 {guest.address || 'Di Tempat'}</p>
                                </td>
                                <td className="p-2.5 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(customUrl);
                                      alert('📋 Tautan sukses disalin ke clipboard!');
                                    }}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[10px]"
                                  >
                                    Salin
                                  </button>
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                                  >
                                    🟢 Kirim WA
                                  </a>
                                  <button
                                    onClick={() => handleRemoveGuestLocal(idx)}
                                    className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold text-[10px]"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ========================================== */}
      {/* FOOTER NAVIGASI EKSTERNAL (BARU & SELARAS) */}
      {/* ========================================== */}
      <footer className="border-t border-slate-100 py-8 bg-white text-center text-xs text-slate-400 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          
          {/* MENU LINK TAUTAN INTERNAL */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-semibold text-[11px] sm:text-xs">
            <button onClick={() => router.push('/tentang-kami')} className="hover:text-blue-700 transition-colors cursor-pointer">Tentang Kami</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/demo')} className="hover:text-blue-700 transition-colors cursor-pointer">Tema</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/refund-policy')} className="hover:text-blue-700 transition-colors cursor-pointer">refund-policy</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/faq')} className="hover:text-blue-700 transition-colors cursor-pointer">FAQ</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/syarat-ketentuan')} className="hover:text-blue-700 transition-colors cursor-pointer">syarat-ketentuan</button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button onClick={() => router.push('/kontak')} className="hover:text-blue-700 transition-colors cursor-pointer">kontak</button>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 border-t border-slate-50 pt-4">
            <p className="font-bold text-slate-700">Undangan Digital © 2026</p>
            <p className="text-[10px] text-slate-400">by Buanamedia</p>
          </div>
          <p className="text-[11px] text-slate-400">Solusi Undangan Digital Elegan, Praktis, dan Tanpa Batas.</p>
        </div>
      </footer>

      {/* MODAL MODULAR RETAINERS (DIBAWAH ELEMENT VISUAL UTAMA) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase tracking-wider">📋 Detail Akun Pengguna</span>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 font-bold bg-slate-200/60 px-2 py-0.5 rounded-md cursor-pointer text-[10px]">Tutup</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2.5 border-b border-slate-100 pb-4 text-slate-700">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Nama Akun Lengkap:</span>
                  <span className="text-slate-600 bg-slate-50 p-2 rounded-lg border">{userProfile?.full_name || '-'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Username Terdaftar:</span>
                  <span className="text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border">{userProfile?.username || '-'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Alamat Email:</span>
                  <span className="text-slate-600 bg-slate-50 p-2 rounded-lg border">{userProfile?.email || '-'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Nomor Kontak WhatsApp:</span>
                  <span className="text-slate-600 bg-slate-50 p-2 rounded-lg border">{userProfile?.phone || '-'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <button type="button" disabled={isUpdatingPassword} onClick={handleUserChangePasswordDirect} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-xs text-center cursor-pointer">🔑 {isUpdatingPassword ? 'Mengamankan Server...' : 'Ganti & Reset Password'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL MODULAR: TAMBAH UNDANGAN BARU */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-4 sm:p-6 space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150 text-xs">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 font-bold text-sm z-10">✕</button>
            <div className="flex items-center justify-between border-b pb-2 text-[10px] font-bold text-slate-400 pr-6 overflow-x-auto whitespace-nowrap scrollbar-none">
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
                    <select className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" value={invitationType} onChange={(e) => setInvitationType(e.target.value)}>
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
                    <input type="text" placeholder="Tuliskan judul undangan di sini" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                    <textarea rows={2} placeholder="Tuliskan deskripsi di sini" className="w-full p-2 border rounded-lg resize-none" value={websiteDesc} onChange={(e) => setWebsiteDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kata Kunci</label>
                    <input type="text" placeholder="Undangan Nikah, Undangan Akikah" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Link Undangan</label>
                    <div className="flex rounded-lg shadow-sm overflow-hidden">
                      <span className="px-2 sm:px-3 border border-r-0 border-slate-300 bg-slate-50 text-slate-400 flex items-center text-[10px] sm:text-xs shrink-0">/undangan/</span>
                      <input type="text" placeholder="nama-link" className="w-full px-3 py-2 border border-slate-300 rounded-r-lg min-w-0" value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-teal-50/40 border-teal-200 space-y-1.5">
                    <label className="block font-bold text-teal-800 text-[10px] uppercase">📸 Foto Profil / Halaman Pembuka (Sampul)</label>
                    <input type="file" accept="image/*" className="w-full text-xs" onChange={async (e) => {
                      if(e.target.files && e.target.files[0]) {
                        setFormMessage('Mengunggah foto sampul...');
                        const url = await uploadSingleFile(e.target.files[0]);
                        if(url) { setCoverPhotoUrl(url); setFormMessage('✓ Foto sampul terpasang'); }
                      }
                    }} />
                    {coverPhotoUrl && <img src={coverPhotoUrl} className="w-16 h-16 object-cover rounded border border-teal-200 mt-1" />}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                    <button type="button" disabled={!slug || !invitationType || !eventTitle} onClick={() => { setFormMessage(''); setCurrentStep(2); }} className="flex-1 py-2 bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold">Lanjut Pilih Tema</button>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Bagian 2: Tema & Cover</h3>
                  <div>
                    <label className="block font-semibold mb-1">Tulisan Tombol Sampul Cover</label>
                    <input type="text" className="w-full p-2 border rounded-lg" value={coverProlog} onChange={(e) => setCoverProlog(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template (Tema Undangan)</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500" value={selectedTemplate} onChange={(e) => {
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
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
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
                      <select className="block w-full p-2 border border-slate-300 rounded-lg bg-white font-bold" value={eventBlockTitle === 'Acara Utama' ? 'Akad Nikah' : eventBlockTitle} onChange={(e) => setEventBlockTitle(e.target.value)}>
                        <option value="Akad Nikah">Akad Nikah</option>
                        <option value="Pemberkatan">Pemberkatan</option>
                      </select>
                    ) : (
                      <input type="text" className="w-full p-2 border rounded-lg font-bold bg-slate-50 uppercase text-slate-700" value={eventBlockTitle === 'Acara Utama' || eventBlockTitle === 'Akad Nikah' ? `PERAYAAN ${invitationType?.toUpperCase()}` : eventBlockTitle} onChange={(e) => setEventBlockTitle(e.target.value)} />
                    )}
                  </div>
                  <textarea rows={2} placeholder="Prolog Informasi Acara" className="w-full p-2 border rounded-lg resize-none" value={eventProlog} onChange={(e) => setEventProlog(e.target.value)} />
                  {(invitationType === 'pernikahan' || invitationType === 'lamaran') ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Mempelai Pria" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg" value={groomName} onChange={(e) => setGroomName(e.target.value)} />
                      <input type="text" placeholder="Mempelai Wanita" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg" value={brideName} onChange={(e) => setBrideName(e.target.value)} />
                    </div>
                  ) : (
                    <div>
                      <input type="text" placeholder="Prolog Teks Profil Tokoh" className="w-full p-2 border rounded-lg mb-2" value={profileProlog} onChange={(e) => setProfileProlog(e.target.value)} />
                      <textarea rows={2} placeholder="Rincian Profil Tokoh Lengkap" className="w-full p-2 border rounded-lg resize-none" value={profileDesc} onChange={(e) => setProfileDesc(e.target.value)} />
                    </div>
                  )}
                  <div className="p-3 border rounded-xl bg-teal-50/40 border-teal-200 space-y-1.5">
                    <label className="block font-bold text-teal-800 text-[10px] uppercase">📸 Foto Tambahan (Di Bawah Profil Utama)</label>
                    <input type="file" accept="image/*" className="w-full text-xs" onChange={async (e) => {
                      if(e.target.files && e.target.files[0]) {
                        setFormMessage('Mengunggah foto profil bawah...');
                        const url = await uploadSingleFile(e.target.files[0]);
                        if(url) { setProfileBottomPhotoUrl(url); setFormMessage('✓ Foto bawah profil terpasang'); }
                      }
                    }} />
                    {profileBottomPhotoUrl && <img src={profileBottomPhotoUrl} className="w-16 h-16 object-cover rounded border border-teal-200 mt-1" />}
                  </div>
                  {invitationType === 'pernikahan' ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2">
                        <span className="font-bold text-rose-800 text-[10px] block uppercase">💍 Acara 1: Akad / Pemberkatan</span>
                        <input type="datetime-local" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                        <div className="flex gap-1">
                          <textarea rows={2} placeholder="Alamat Lengkap Tempat Akad" className="w-full p-2 border border-slate-300 rounded-lg resize-none bg-white" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
                          <button type="button" onClick={() => handleSearchLocation(false, false)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                        </div>
                        <input type="url" placeholder="Link Google Maps Akad" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-[10px]" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
                        <div className="w-full h-28 rounded-lg overflow-hidden relative border bg-white mt-1">
                          <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${mapsUrl ? encodeURIComponent(mapsUrl) : (locationAddress ? encodeURIComponent(locationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                        </div>
                      </div>
                      <div className="p-3 bg-sky-50/40 border border-sky-200 rounded-xl space-y-2">
                        <span className="font-bold text-sky-800 text-[10px] block uppercase">🎉 Acara 2: Resepsi Pernikahan</span>
                        <input type="datetime-local" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white" value={receptionDate} onChange={(e) => setReceptionDate(e.target.value)} />
                        <div className="flex gap-1">
                          <textarea rows={2} placeholder="Alamat Lengkap Tempat Resepsi" className="w-full p-2 border border-slate-300 rounded-lg resize-none bg-white" value={receptionAddress} onChange={(e) => setReceptionAddress(e.target.value)} />
                          <button type="button" onClick={() => handleSearchLocation(false, true)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                        </div>
                        <input type="url" placeholder="Link Google Maps Resepsi" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-[10px]" value={receptionMapsUrl} onChange={(e) => setReceptionMapsUrl(e.target.value)} />
                        <div className="w-full h-28 rounded-lg overflow-hidden relative border bg-white mt-1">
                          <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${receptionMapsUrl ? encodeURIComponent(receptionMapsUrl) : (receptionAddress ? encodeURIComponent(receptionAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input type="datetime-local" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                      <div className="flex gap-1">
                        <textarea rows={2} placeholder="Alamat Gedung Lengkap" className="w-full p-2 border border-slate-300 rounded-lg resize-none" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
                        <button type="button" onClick={() => handleSearchLocation(false, false)} className="px-3 bg-slate-800 text-white font-bold rounded-lg cursor-pointer">Cari</button>
                      </div>
                      <input type="url" placeholder="Atau tempel Link Google Maps manual (Pin Titik):" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
                      <div className="w-full h-36 rounded-xl border border-slate-200 overflow-hidden relative bg-slate-50">
                        <iframe width="100%" height="100%" className="border-0" loading="lazy" src={`https://maps.google.com/maps?q=${mapsUrl ? encodeURIComponent(mapsUrl) : (locationAddress ? encodeURIComponent(locationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
                    <button type="button" onClick={() => setCurrentStep(2)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                    <button type="button" onClick={() => { setFormMessage(''); setCurrentStep(4); }} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Media →</button>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <h3 className="text-sm font-bold text-slate-900">Bagian 4: Galeri, Kado, Musik & Custom Blok</h3>
                  <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1.5">
                    <label className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">📁 1. Tambah Foto Galeri</label>
                    <input type="text" placeholder="Momen-momen yang berhasil kami abadikan..." className="w-full p-2 border rounded-lg bg-white" value={galleryProlog} onChange={(e) => setGalleryProlog(e.target.value)} />
                    <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, false)} className="w-full text-xs" />
                    {uploadingImage && <p className="text-teal-600 animate-pulse text-[10px]">Mengunggah berkas gambar...</p>}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 mt-1">
                      {uploadedPhotos.map((url, i) => <img key={i} src={url} className="w-8 h-8 object-cover rounded border border-teal-200 shadow-2xs" />)}
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">🎬 2. Galeri Video Youtube</label>
                    <input type="text" placeholder="Mari saksikan cuplikan video kebahagiaan kami." className="w-full p-2 border rounded-lg bg-white" value={videoProlog} onChange={(e) => setVideoProlog(e.target.value)} />
                    <input type="url" placeholder="Link Video YouTube" className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white mt-1" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-50/50 space-y-1.5">
                    <label className="block text-[10px] font-bold text-teal-700 uppercase tracking-wider">🎵 3. Upload Musik Latar Belakang (.mp3)</label>
                    <input type="file" accept="audio/mp3,audio/*" onChange={(e) => handleMusicUpload(e, false)} className="w-full text-xs" />
                    {uploadingMusic && <p className="text-teal-600 animate-pulse text-[10px]">Mengunggah berkas suara...</p>}
                    {bgMusicUrl && <p className="text-emerald-600 text-[10px] font-bold">✓ Musik Latar Terpasang</p>}
                  </div>
                  <div className="p-3 border rounded-xl border-slate-200 space-y-2">
                    <span className="font-bold text-teal-700 block">Kado Digital</span>
                    <input type="text" placeholder="Terima kasih atas doa yang telah Anda berikan..." className="w-full p-2 border rounded bg-white" value={giftProlog} onChange={(e) => setGiftProlog(e.target.value)} />
                    {giftAccounts.map((acc, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
                        <input type="text" placeholder="Bank / E-Wallet" value={acc.bank} onChange={(e) => { const n = [...giftAccounts]; n[index].bank = e.target.value; setGiftAccounts(n); }} className="p-1.5 border rounded text-xs bg-white" />
                        <input type="text" placeholder="Nama" value={acc.name} onChange={(e) => { const n = [...giftAccounts]; n[index].name = e.target.value; setGiftAccounts(n); }} className="p-1.5 border rounded text-xs bg-white" />
                        <input type="text" placeholder="Nomor" value={acc.number} onChange={(e) => { const n = [...giftAccounts]; n[index].number = e.target.value; setGiftAccounts(n); }} className="p-1.5 border rounded text-xs bg-white" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setGiftAccounts([...giftAccounts, {name:'', bank:'', number:''}])} className="text-[11px] text-teal-600 font-bold hover:underline">+ Rekening</button>
                  </div>
                  <div className="p-3 border rounded-xl border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Blok Custom</span>
                    <input type="text" placeholder="Turut Mengundang" className="w-full p-2 border rounded bg-white" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
                    <input type="text" placeholder="Prolog Teks Turut Mengundang" className="w-full p-2 border rounded bg-white" value={customProlog} onChange={(e) => setCustomProlog(e.target.value)} />
                    <textarea rows={2} placeholder="Isi Konten Custom" className="w-full p-2 border rounded resize-none bg-white" value={customContent} onChange={(e) => setCustomContent(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                    <button type="button" onClick={() => setCurrentStep(3)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                    <button type="submit" disabled={formLoading || uploadingImage || uploadingMusic} className="flex-1 py-2 bg-sky-600 disabled:bg-slate-400 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer">🚀 Terbitkan</button>
                  </div>
                </div>
              )}
            </form>
            {formMessage && <div className="p-2 text-[10px] font-medium text-center bg-sky-50 text-sky-700 border border-sky-100 rounded-lg animate-in fade-in">{formMessage}</div>}
          </div>
        </div>
      )}

      {/* POPUP MODAL MODULAR: EDIT UNDANGAN LAMA */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-4 sm:p-6 space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150 text-xs">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 font-bold text-sm z-10">✕</button>
            <div className="flex items-center justify-between border-b pb-2 text-[10px] font-bold text-slate-400 pr-6 overflow-x-auto whitespace-nowrap scrollbar-none">
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
                    <select disabled className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed font-medium text-slate-500" value={editInvitationType}>
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
                    <input type="text" placeholder="Tuliskan judul undangan di sini" className="w-full p-2 border rounded-lg bg-white" value={editEventTitle} onChange={(e) => setEditEventTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                    <textarea rows={2} placeholder="Tuliskan deskripsi di sini" className="w-full p-2 border rounded-lg resize-none" value={editWebsiteDesc} onChange={(e) => setEditWebsiteDesc(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kata Kunci</label>
                    <input type="text" placeholder="Keywords" className="w-full p-2 border rounded-lg" value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} />
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                    <label className="block font-bold text-slate-500 text-[10px] uppercase">📸 Foto Profil / Halaman Pembuka (Sampul) [KUNCI]</label>
                    <input disabled type="file" accept="image/*" className="w-full text-xs cursor-not-allowed text-slate-400" />
                    {editCoverPhotoUrl && <img src={editCoverPhotoUrl} className="w-16 h-16 object-cover rounded border border-slate-300 mt-1 grayscale" />}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                    <button type="button" onClick={() => { setFormMessage(''); setEditStep(2); }} className="flex-1 py-2 bg-teal-700 text-white font-bold rounded-lg">Lanjut Tema →</button>
                  </div>
                </div>
              )}
              {editStep === 2 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 2: Tema & Cover</h3>
                  <div>
                    <label className="block font-semibold mb-1">Tulisan Tombol Sampul Cover</label>
                    <input type="text" placeholder="Tulisan Tombol Cover" className="w-full p-2 border rounded-lg" value={editCoverProlog} onChange={(e) => setEditCoverProlog(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template (Tema Undangan)</label>
                    <select className="w-full p-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500" value={editSelectedTemplate} onChange={(e) => {
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
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto py-2 px-3 bg-slate-100 text-slate-600 font-bold rounded-lg">Batal</button>
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
                      <select className="block w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-800" value={editEventBlockTitle === 'Acara Utama' ? 'Akad Nikah' : editEventBlockTitle} onChange={(e) => setEditEventBlockTitle(e.target.value)}>
                        <option value="Akad Nikah">Akad Nikah</option>
                        <option value="Pemberkatan">Pemberkatan</option>
                      </select>
                    ) : (
                      <input type="text" className="w-full p-2 border rounded-lg font-bold bg-slate-50 uppercase text-slate-700" value={editEventBlockTitle === 'Acara Utama' || editEventBlockTitle === 'Akad Nikah' ? `PERAYAAN ${editInvitationType?.toUpperCase()}` : editEventBlockTitle} onChange={(e) => setEditEventBlockTitle(e.target.value)} />
                    )}
                  </div>
                  <textarea rows={2} placeholder="Prolog Acara" className="w-full p-2 border rounded-lg resize-none" value={editEventProlog} onChange={(e) => setEditEventProlog(e.target.value)} />
                  {(editInvitationType === 'pernikahan' || editInvitationType === 'lamaran') ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Pria" className="w-full p-2 border rounded-lg" value={editGroomName} onChange={(e) => setEditGroomName(e.target.value)} />
                      <input type="text" placeholder="Wanita" className="w-full p-2 border rounded-lg" value={editBrideName} onChange={(e) => setEditBrideName(e.target.value)} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input type="text" placeholder="Prolog Profil" className="w-full p-2 border rounded-lg" value={editProfileProlog} onChange={(e) => setEditProfileProlog(e.target.value)} />
                      <textarea rows={2} placeholder="Deskripsi Profil Tokoh" className="w-full p-2 border rounded-lg resize-none" value={editProfileDesc} onChange={(e) => setEditProfileDesc(e.target.value)} />
                    </div>
                  )}
                  <div className="p-3 border rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                    <label className="block font-bold text-slate-500 text-[10px] uppercase">📸 Foto Tambahan (Di Bawah Profil Utama) [KUNCI]</label>
                    <input disabled type="file" accept="image/*" className="w-full text-xs cursor-not-allowed text-slate-400" />
                    {editProfileBottomPhotoUrl && <img src={editProfileBottomPhotoUrl} className="w-16 h-16 object-cover rounded border border-slate-300 mt-1 grayscale" />}
                  </div>
                  {editInvitationType === 'pernikahan' ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-rose-50/20 border border-rose-100 rounded-xl space-y-2">
                        <span className="font-bold text-rose-800 text-[10px] block uppercase">💍 Acara 1: Akad / Pemberkatan</span>
                        <input disabled type="datetime-local" className="w-full p-2 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" value={editEventDate} />
                        <div className="flex gap-1">
                          <textarea rows={2} className="w-full p-2 border rounded-lg resize-none bg-white" value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)} />
                          <button type="button" onClick={() => handleSearchLocation(true, false)} className="px-2 bg-slate-800 text-white font-bold rounded-lg">Cari</button>
                        </div>
                        <input type="url" placeholder="Link Google Maps Akad" className="w-full p-2 border rounded-lg bg-white text-[10px]" value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} />
                        <div className="w-full h-28 rounded-lg overflow-hidden relative border bg-white mt-1">
                          <iframe width="100%" height="100%" className="border-0" src={`https://maps.google.com/maps?q=${editMapsUrl ? encodeURIComponent(editMapsUrl) : (editLocationAddress ? encodeURIComponent(editLocationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                        </div>
                      </div>
                      <div className="p-3 bg-sky-50/20 border border-sky-100 rounded-xl space-y-2">
                        <span className="font-bold text-sky-800 text-[10px] block uppercase">🎉 Acara 2: Resepsi Pernikahan</span>
                        <input disabled type="datetime-local" className="w-full p-2 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" value={editReceptionDate} />
                        <div className="flex gap-1">
                          <textarea rows={2} className="w-full p-2 border rounded-lg resize-none bg-white" value={editReceptionAddress} onChange={(e) => setEditReceptionAddress(e.target.value)} />
                          <button type="button" onClick={() => handleSearchLocation(true, true)} className="px-2 bg-slate-800 text-white font-bold rounded-lg">Cari</button>
                        </div>
                        <input type="url" placeholder="Link Google Maps Resepsi" className="w-full p-2 border rounded-lg bg-white text-[10px]" value={editReceptionMapsUrl} onChange={(e) => setEditReceptionMapsUrl(e.target.value)} />
                        <div className="w-full h-28 rounded-lg overflow-hidden relative border bg-white mt-1">
                          <iframe width="100%" height="100%" className="border-0" src={`https://maps.google.com/maps?q=${editReceptionMapsUrl ? encodeURIComponent(editReceptionMapsUrl) : (editReceptionAddress ? encodeURIComponent(editReceptionAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input disabled type="datetime-local" className="w-full p-2 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" value={editEventDate} />
                      <div className="flex gap-1">
                        <textarea rows={2} className="w-full p-2 border rounded-lg resize-none" value={editLocationAddress} onChange={(e) => setEditLocationAddress(e.target.value)} />
                        <button type="button" onClick={() => handleSearchLocation(true, false)} className="px-2 bg-slate-800 text-white font-bold rounded-lg">Cari</button>
                      </div>
                      <input type="url" placeholder="Link Google Maps manual (Pin Titik):" className="w-full p-2 border rounded-lg bg-white" value={editMapsUrl} onChange={(e) => setEditMapsUrl(e.target.value)} />
                      <div className="w-full h-36 rounded-xl border border-slate-200 overflow-hidden relative bg-slate-50 mt-1">
                        <iframe width="100%" height="100%" className="border-0" src={`https://maps.google.com/maps?q=${editMapsUrl ? encodeURIComponent(editMapsUrl) : (editLocationAddress ? encodeURIComponent(editLocationAddress) : 'Jakarta')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}></iframe>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                    <button type="button" onClick={() => setEditStep(2)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                    <button type="button" onClick={() => { setFormMessage(''); setEditStep(4); }} className="flex-1 py-2 bg-teal-700 text-white rounded-lg font-bold">Lanjut Media →</button>
                  </div>
                </div>
              )}
              {editStep === 4 && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <h3 className="text-sm font-bold text-slate-900">Ubah Bagian 4: Galeri, Kado, Musik & Custom Blok</h3>
                  <div className="p-3 border rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">📁 1. Tambah Foto Galeri [KUNCI]</label>
                    <input type="text" placeholder="Prolog Galeri Foto" className="w-full p-2 border rounded-lg bg-white" value={editGalleryProlog} onChange={(e) => setEditGalleryProlog(e.target.value)} />
                    <input disabled type="file" accept="image/*" multiple className="w-full text-xs cursor-not-allowed text-slate-400" />
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 mt-1">
                      {editUploadedPhotos && editUploadedPhotos.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} className="w-8 h-8 object-cover rounded border border-slate-300 shadow-2xs grayscale" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">🎬 2. Galeri Video Youtube [KUNCI]</label>
                    <input type="text" placeholder="Prolog Video" className="w-full p-2 border rounded-lg bg-white" value={editVideoProlog} onChange={(e) => setEditVideoProlog(e.target.value)} />
                    <input disabled type="url" placeholder="Link Video YouTube" className="w-full p-2 border rounded-lg bg-slate-200 text-slate-500 cursor-not-allowed mt-1" value={editVideoUrl} />
                  </div>
                  <div className="p-3 border rounded-xl bg-slate-100 border-slate-300 opacity-75 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">🎵 3. Upload Musik Latar Belakang (.mp3) [KUNCI]</label>
                    <input disabled type="file" accept="audio/mp3,audio/*" className="w-full text-xs cursor-not-allowed text-slate-400" />
                    {editBgMusicUrl && <p className="text-slate-500 text-[10px] font-bold">✓ Musik Latar Terpasang</p>}
                  </div>
                  <div className="p-3 border rounded-xl border-slate-200 space-y-2">
                    <span className="font-bold text-teal-700 block">Kado Digital</span>
                    <input type="text" placeholder="Prolog Kado" className="w-full p-2 border rounded bg-white" value={editGiftProlog} onChange={(e) => setEditGiftProlog(e.target.value)} />
                    {editGiftAccounts.map((acc, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 border-b sm:border-b-0 pb-2 sm:pb-0">
                        <input type="text" placeholder="Bank / E-Wallet" value={acc.bank} onChange={(e) => { const n = [...editGiftAccounts]; n[index].bank = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border rounded text-xs bg-white" />
                        <input type="text" placeholder="Nama" value={acc.name} onChange={(e) => { const n = [...editGiftAccounts]; n[index].name = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border rounded text-xs bg-white" />
                        <input type="text" placeholder="Nomor" value={acc.number} onChange={(e) => { const n = [...editGiftAccounts]; n[index].number = e.target.value; setEditGiftAccounts(n); }} className="p-1.5 border rounded text-xs bg-white" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setEditGiftAccounts([...editGiftAccounts, {name:'', bank:'', number:''}])} className="text-[10px] text-teal-600 font-bold">+ Rekening</button>
                  </div>
                  <div className="p-3 border rounded-xl border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 block">Blok Custom</span>
                    <input type="text" placeholder="Judul Custom" className="w-full p-2 border rounded bg-white" value={editCustomTitle} onChange={(e) => setEditCustomTitle(e.target.value)} />
                    <input type="text" placeholder="Prolog Teks Turut Mengundang" className="w-full p-2 border rounded bg-white" value={editCustomProlog} onChange={(e) => setEditCustomProlog(e.target.value)} />
                    <textarea rows={2} placeholder="Isi Konten Custom" className="w-full p-2 border rounded resize-none bg-white" value={editCustomContent} onChange={(e) => setEditCustomContent(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/3 py-2 bg-slate-100 rounded-lg">Batal</button>
                    <button type="button" onClick={() => setEditStep(3)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg">← Kembali</button>
                    <button type="submit" disabled={editLoading || editUploadingImage} className="flex-1 py-2 bg-sky-600 disabled:bg-slate-400 text-white rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer">Simpan</button>
                  </div>
                </div>
              )}
            </form>
            {formMessage && <div className="p-2 text-[10px] font-medium text-center bg-sky-50 text-sky-700 border border-sky-100 rounded-lg animate-in fade-in">{formMessage}</div>}
          </div>
        </div>
      )}

      {/* MODAL: VIEW LIST DOA & HARAPAN TAMU */}
      {isWishesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 space-y-4 my-auto relative text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900">💬 Daftar Doa & Harapan Tamu</h3>
              <button type="button" onClick={() => setIsWishesModalOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 font-bold">✕</button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedWishes.length === 0 ? (
                <p className="text-center text-slate-400 py-6">Belum ada ucapan doa yang dikirimkan oleh tamu.</p>
              ) : (
                selectedWishes.map((wish, index) => (
                  <div key={index} className="p-3 border rounded-xl bg-slate-50 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-900 break-all">{wish.name} <span className="text-slate-400 font-normal text-[10px]">({wish.relation || 'Tamu'})</span></span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${wish.attendance === 'hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {wish.attendance === 'hadir' ? '✓ Hadir' : '✕ Absen'}
                      </span>
                    </div>
                    {wish.address && <p className="text-[10px] text-slate-400">📍 {wish.address}</p>}
                    <p className="text-slate-700 italic pt-1 text-xs break-words">"{wish.message}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}