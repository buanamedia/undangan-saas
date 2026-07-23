'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import CreateInvitationModal from './components/CreateInvitationModal';
import EditInvitationModal from './components/EditInvitationModal';
import Header from './components/Header';
import Footer from './components/Footer';
import { isPremiumActive, getRemainingDays } from '@/lib/checkPremium'; // 🟢 Import Helper Premium

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

  // POPUP MODAL DETAIL PROFILE & PENGATURAN PASSWORD
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // MANAJEMEN KIRIM UNDANGAN TAMU KUSTOM
  const [selectedInvForShare, setSelectedInvForShare] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestsList, setGuestsList] = useState<{ name: string; address: string }[]>([]);

  // DATA MENTAH YANG AKAN DI-PASS KE LAYER MODAL EDIT
  const [editingInvitationData, setEditingInvitationData] = useState<any>(null);

  // STATE MAPS/ALAMAT UNTUK PENGEDITAN/KREASI
  const [locationAddress, setLocationAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [receptionAddress, setReceptionAddress] = useState('');
  const [receptionMapsUrl, setReceptionMapsUrl] = useState('');

  const [editLocationAddress, setEditLocationAddress] = useState('');
  const [editMapsUrl, setEditMapsUrl] = useState('');
  const [editReceptionAddress, setEditReceptionAddress] = useState('');
  const [editReceptionMapsUrl, setEditReceptionMapsUrl] = useState('');

  // Menangani DOM Origin secara aman untuk SSR
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

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

      if (profileError) console.error(profileError);

      if (profile) {
        setUserProfile({ ...profile, email: session.user.email });
      } else {
        const newProfile = {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          package_plan: 'FREE',
          premium_expires_at: null,
          role: 'user'
        };
        const { error: insertError } = await supabase.from('profiles').insert(newProfile);
        if (!insertError) setUserProfile(newProfile);
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
    if (newPassword.trim().length < 6) return alert('🚨 Gagal: Kata sandi baru minimal harus 6 karakter!');

    setIsUpdatingPassword(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.id, newPassword: newPassword.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal mengubah password.');
      alert('✨ Sukses! Kata sandi akun Anda berhasil diganti secara langsung.');
      setShowProfileModal(false);
    } catch (err: any) {
      alert(`Gagal memperbarui password: ${err.message}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const uploadSingleFile = async (file: File, folder: 'gallery' | 'music' = 'gallery'): Promise<string | null> => {
    const userPrefix = (userProfile?.username || userProfile?.full_name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileExt = file.name.split('.').pop() || (folder === 'music' ? 'mp3' : 'jpg');
    const fileName = `${userPrefix}-${folder}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    
    const { error } = await supabase.storage.from(folder).upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(folder).getPublicUrl(fileName);
      return data?.publicUrl || null;
    }
    console.error(`Upload error pada ${folder}:`, error);
    return null;
  };

  const handleSearchLocation = async (isEdit = false, isReception = false) => {
    let address = isEdit ? (isReception ? editReceptionAddress : editLocationAddress) : (isReception ? receptionAddress : locationAddress);
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
    const { data: wishes, error } = await supabase.from('rsvps').select('*').eq('invitation_id', invitationId).order('created_at', { ascending: false });
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
    setGuestsList(savedGuests ? JSON.parse(savedGuests) : []);
  };

  const handleAddGuestLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !selectedInvForShare) return;
    const newGuests = [...guestsList, { name: guestName.trim(), address: guestAddress.trim() }];
    setGuestsList(newGuests);
    localStorage.setItem(`user_guests_${selectedInvForShare.slug}`, JSON.stringify(newGuests));
    setGuestName(''); setGuestAddress('');
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

  const openEditModal = (inv: any) => {
    setEditingInvitationData(inv);
    const ext = inv.custom_details || {};
    setEditLocationAddress(inv.location_address || '');
    setEditMapsUrl(inv.maps_url || '');
    setEditReceptionAddress(ext.reception_address || '');
    setEditReceptionMapsUrl(ext.reception_maps_url || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteInvitation = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus undangan "${name}" beserta seluruh file fotonya di Storage?`);
    if (!confirmDelete) return;

    try {
      const { data: inv } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      await supabase.from('rsvps').delete().eq('invitation_id', id);
      const { error: deleteDbError } = await supabase.from('invitations').delete().eq('id', id);

      if (deleteDbError) {
        alert(`🚨 Gagal Hapus Database: ${deleteDbError.message}`);
        return;
      }

      setInvitations((prev) => prev.filter((item) => item.id !== id));
      if (selectedInvForShare?.id === id) {
        setSelectedInvForShare(null);
      }

      if (inv) {
        const galleryPathsToDelete: string[] = [];
        const musicPathsToDelete: string[] = [];
        const ext = inv.custom_details || {};

        const getFileNameFromUrl = (publicUrl: string | null, bucketName: string) => {
          if (!publicUrl) return null;
          try {
            const urlObj = new URL(publicUrl);
            const pathname = urlObj.pathname;
            const searchKey = `/${bucketName}/`;
            const index = pathname.indexOf(searchKey);
            if (index !== -1) {
              return decodeURIComponent(pathname.substring(index + searchKey.length));
            }
          } catch (e) {
            const parts = publicUrl.split(`/${bucketName}/`);
            if (parts.length > 1) return decodeURIComponent(parts[1].split('?')[0]);
          }
          return null;
        };

        if (Array.isArray(inv.gallery_images)) {
          inv.gallery_images.forEach((url: string) => {
            const file = getFileNameFromUrl(url, 'gallery');
            if (file) galleryPathsToDelete.push(file);
          });
        }

        const coverFile = getFileNameFromUrl(ext.cover_photo_url, 'gallery');
        if (coverFile) galleryPathsToDelete.push(coverFile);

        const groomFile = getFileNameFromUrl(ext.groom_photo_url, 'gallery');
        if (groomFile) galleryPathsToDelete.push(groomFile);

        const brideFile = getFileNameFromUrl(ext.bride_photo_url, 'gallery');
        if (brideFile) galleryPathsToDelete.push(brideFile);

        const profileBottomFile = getFileNameFromUrl(ext.profile_bottom_photo_url, 'gallery');
        if (profileBottomFile) galleryPathsToDelete.push(profileBottomFile);

        const musicFile = getFileNameFromUrl(inv.bg_music_url, 'music');
        if (musicFile) musicPathsToDelete.push(musicFile);

        if (galleryPathsToDelete.length > 0) {
          const { error: storageErr } = await supabase.storage.from('gallery').remove(galleryPathsToDelete);
          if (storageErr) console.error("Gagal hapus foto dari Storage:", storageErr.message);
        }

        if (musicPathsToDelete.length > 0) {
          const { error: musicErr } = await supabase.storage.from('music').remove(musicPathsToDelete);
          if (musicErr) console.error("Gagal hapus musik dari Storage:", musicErr.message);
        }
      }

      alert('🗑️ Undangan di database dan seluruh file fotonya di Storage berhasil terhapus bersih!');

    } catch (err: any) {
      alert(`🚨 Terjadi kesalahan: ${err.message}`);
    }
  };

  // 🟢 CEK STATUS PREMIUM DENGAN HELPER
  const hasPremiumAccess = userProfile?.is_premium && isPremiumActive(userProfile);
  const remainingDays = getRemainingDays(userProfile?.premium_expires_at);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-xs font-bold text-sky-600 animate-pulse">MEMUAT DASHBOARD...</p></div>;

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased flex flex-col justify-between">
      <Header 
        onLogout={handleLogout}
        onNavigateToPremium={() => router.push('/premium')}
        onNavigateHome={() => router.push('/')}
      />

      <div className="bg-slate-50 border-b border-slate-200/60 px-4 sm:px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
         <h1 onClick={() => setShowProfileModal(true)} className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-3 truncate cursor-pointer hover:opacity-80 transition-opacity select-none">
  <span>Halo, {userProfile?.full_name || userProfile?.username || 'User'} 👤</span>
  
  {/* 🟢 TAMPILAN BADGE & MASA AKTIF SPESIFIK */}
  {hasPremiumAccess ? (
    <div className="flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full shadow-md border border-amber-200">
        PREMIUM
      </span>
      <span className="text-[10px] text-slate-500 font-semibold tracking-tight">
        {userProfile?.package_plan === 'UNLIMITED' || !userProfile?.premium_expires_at 
          ? 'Masa Aktif: Unlimited (Tanpa Batas)' 
          : `Aktif s/d: ${new Date(userProfile.premium_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} (${remainingDays} hr lagi)`}
      </span>
    </div>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase bg-slate-200 text-slate-500 rounded-full tracking-wider border border-slate-300/40">
      FREE
    </span>
  )}
</h1>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap">+ Undangan</button>
            <button onClick={() => router.push('/demo')} className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap">Lihat Tema</button>
          </div>
        </div>
      </div>

      <main className="grow bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide uppercase">Koleksi Undangan Anda ({invitations.length})</h2>
            </div>
            {invitations.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-slate-300 p-12 text-center text-slate-400 text-xs shadow-2xs">Belum ada undangan yang dibuat. Silakan klik tombol "+ Buat Undangan" di atas untuk memulai.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invitations.map((inv) => (
                  <div key={inv.id} onClick={() => triggerActiveSharePanel(inv)} className={`bg-white p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-4 text-xs hover:shadow-md transition-all cursor-pointer ${selectedInvForShare?.id === inv.id ? 'border-2 border-teal-600 ring-2 ring-teal-600/10' : 'border-2 border-slate-300 shadow-2xs'}`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border-2 ${getBadgeColor(inv.type)}`}>{inv.type || 'Lainnya'}</span>
                        {selectedInvForShare?.id === inv.id && <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">Dipilih</span>}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide break-words">{inv.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><span>📍</span> <span className="line-clamp-1">{inv.location_address || 'Belum diatur'}</span></p>
                    </div>
                    <div className="border-t-2 border-slate-100 pt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <a href={`/undangan/${inv.slug}`} target="_blank" className="flex-1 text-center py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] rounded-xl">👁️ Lihat</a>
                      <button onClick={() => handleViewWishes(inv.id)} className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-xl">💬 Doa</button>
                      <button onClick={() => openEditModal(inv)} className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-xl">✏️ Edit</button>
                      <button onClick={() => handleDeleteInvitation(inv.id, inv.title)} className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-xl">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border-2 border-slate-300 shadow-2xs rounded-2xl p-5 space-y-4">
            {!selectedInvForShare ? (
              <div className="text-center text-slate-400 py-12 text-xs">👉 Pilih salah satu kartu undangan di sebelah kiri untuk mengaktifkan generator kirim link tautan tamu kustom.</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">📩 Kirim Undangan</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Undangan aktif: <span className="font-semibold text-slate-600">{selectedInvForShare.title}</span></p>
                </div>

                <form onSubmit={handleAddGuestLocal} className="space-y-3 bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Kirimkan undangan dengan nama penerima agar lebih personal di sini.</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Tamu Undangan</label>
                    <input type="text" required placeholder="Contoh: Agus Saputra" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-teal-600" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat / Keterangan Lokasi</label>
                    <input type="text" placeholder="Contoh: Di Tempat / Jakarta" value={guestAddress} onChange={(e) => setGuestAddress(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-teal-600" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-center">💾 Simpan Data Tamu</button>
                </form>

                <div className="p-3 bg-slate-50/80 rounded-xl border-2 border-slate-200 text-[10px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-700">Catatan:</span><br />
                  Selain anda menggunakan fitur ini, anda juga bisa langsung share URL domain anda yaitu dengan menshare url:<br /><br />
                  <span className="font-bold text-slate-800 break-all select-all">{`${origin}/undangan/${selectedInvForShare.slug}/kepada:NamaTeman-Tempat`}</span>.<br /><br />
                  Anda tinggal mengganti Nama Teman dan Tempat disesuikan dengan tujuan anda.
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Daftar Tautan Tamu ({guestsList.length})</p>
                  <div className="border-2 border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-white">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b-2 border-slate-200">
                          <th className="p-2.5">Nama & Alamat</th>
                          <th className="p-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-100">
                        {guestsList.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="p-6 text-center text-slate-400 italic">Belum ada daftar tamu. Masukkan data pada form di atas.</td>
                          </tr>
                        ) : (
                          guestsList.map((guest, idx) => {
                            const baseUrl = `${origin}/undangan/${selectedInvForShare.slug}`;
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
                                  <button onClick={() => { navigator.clipboard.writeText(customUrl); alert('📋 Tautan sukses disalin ke clipboard!'); }} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[10px]">Salin</button>
                                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-block px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]">🟢 Kirim WA</a>
                                  <button onClick={() => handleRemoveGuestLocal(idx)} className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold text-[10px]">🗑️</button>
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

      <Footer onNavigate={(path) => router.push(path)} />

      {/* MODAL DETAIL PROFILE */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-slate-300 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col text-xs">
            <div className="p-4 border-b-2 border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="font-bold text-slate-800 uppercase tracking-wider">📋 Detail Akun Pengguna</span>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 font-bold bg-slate-200/60 px-2 py-0.5 rounded-md text-[10px]">Tutup</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2.5 border-b-2 border-slate-100 pb-4 text-slate-700">
                <div className="flex flex-col gap-0.5"><span className="font-bold text-slate-900">Nama Akun Lengkap:</span><span className="text-slate-600 bg-slate-50 p-2 rounded-lg border-2">{userProfile?.full_name || '-'}</span></div>
                <div className="flex flex-col gap-0.5"><span className="font-bold text-slate-900">Username Terdaftar:</span><span className="text-slate-600 font-mono bg-slate-50 p-2 rounded-lg border-2">{userProfile?.username || '-'}</span></div>
                <div className="flex flex-col gap-0.5"><span className="font-bold text-slate-900">Alamat Email:</span><span className="text-slate-600 bg-slate-50 p-2 rounded-lg border-2">{userProfile?.email || '-'}</span></div>
                <div className="flex flex-col gap-0.5"><span className="font-bold text-slate-900">Nomor Kontak WhatsApp:</span><span className="text-slate-600 bg-slate-50 p-2 rounded-lg border-2">{userProfile?.phone || '-'}</span></div>
                
                {/* 🟢 INFORMASI MASA AKTIF PAKET */}
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-900">Status Paket:</span>
                  <span className="text-slate-600 bg-slate-50 p-2 rounded-lg border-2 font-bold">
                    {hasPremiumAccess ? (
                      <span className="text-emerald-600">
                        {userProfile?.package_plan === 'UNLIMITED' 
                          ? 'Aktif (Unlimited / Lifetime)' 
                          : `Aktif s/d ${new Date(userProfile.premium_expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (${remainingDays} Hari Lagi)`}
                      </span>
                    ) : (
                      <span className="text-rose-600">Free / Tidak Aktif</span>
                    )}
                  </span>
                </div>
              </div>
              <button type="button" disabled={isUpdatingPassword} onClick={handleUserChangePasswordDirect} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-xs text-center">🔑 {isUpdatingPassword ? 'Mengamankan Server...' : 'Ganti & Reset Password'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 1. MODAL TAMBAH UNDANGAN BARU */}
      <CreateInvitationModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userProfile={userProfile}
        supabase={supabase}
        refreshInvitations={refreshInvitations}
        uploadSingleFile={uploadSingleFile}
        handleSearchLocation={handleSearchLocation}
        locationAddress={locationAddress}
        setLocationAddress={setLocationAddress}
        mapsUrl={mapsUrl}
        setMapsUrl={setMapsUrl}
        receptionAddress={receptionAddress}
        setReceptionAddress={setReceptionAddress}
        receptionMapsUrl={receptionMapsUrl}
        setReceptionMapsUrl={setReceptionMapsUrl}
      />

      {/* 2. MODAL EDIT UNDANGAN LAMA */}
      <EditInvitationModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userProfile={userProfile}
        supabase={supabase}
        refreshInvitations={refreshInvitations}
        uploadSingleFile={uploadSingleFile}
        handleSearchLocation={handleSearchLocation}
        editingInvitationData={editingInvitationData}
        editLocationAddress={editLocationAddress}
        setEditLocationAddress={setEditLocationAddress}
        editMapsUrl={editMapsUrl}
        setEditMapsUrl={setEditMapsUrl}
        editReceptionAddress={editReceptionAddress}
        setEditReceptionAddress={setEditReceptionAddress}
        editReceptionMapsUrl={editReceptionMapsUrl}
        setEditReceptionMapsUrl={setEditReceptionMapsUrl}
        uploadingMusic={false}
      />

      {/* 3. MODAL VIEW HARAPAN / DOA TAMU */}
      {isWishesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 max-w-lg w-full p-4 sm:p-6 space-y-4 my-auto relative text-xs">
            <div className="flex items-center justify-between border-b-2 pb-2">
              <h3 className="text-sm font-bold text-slate-900">💬 Daftar Doa & Harapan Tamu</h3>
              <button type="button" onClick={() => setIsWishesModalOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 bg-slate-50 font-bold">✕</button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedWishes.length === 0 ? (
                <p className="text-center text-slate-400 py-6">Belum ada ucapan doa yang dikirimkan oleh tamu.</p>
              ) : (
                selectedWishes.map((wish, index) => (
                  <div key={index} className="p-3 border-2 rounded-xl bg-slate-50 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-900 break-all">{wish.name} <span className="text-slate-400 font-normal text-[10px]">({wish.relation || 'Tamu'})</span></span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${wish.attendance === 'hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{wish.attendance === 'hadir' ? '✓ Hadir' : '✕ Absen'}</span>
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