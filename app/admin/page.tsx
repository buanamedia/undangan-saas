'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, invitations: 0, rsvp: 0 });
  
  // State Data Manajemen
  const [usersList, setUsersList] = useState<any[]>([]);
  const [invitationsList, setInvitationsList] = useState<any[]>([]);
  const [rsvpsList, setRsvpsList] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // State filter interaktif per pengguna yang dipilih
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert('Akses Ditolak!');
        router.push('/user');
        return;
      }

      // 1. Ambil Statistik
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: invCount } = await supabase.from('invitations').select('*', { count: 'exact', head: true });
      const { count: rsvpCount } = await supabase.from('rsvps').select('*', { count: 'exact', head: true });
      setStats({ users: userCount || 0, invitations: invCount || 0, rsvp: rsvpCount || 0 });

      // 2. AMBIL DATA USER DENGAN EMAIL
      const { data: allUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, role, is_premium, created_at, email')
        .order('created_at', { ascending: false });

      if (userError) {
        console.error("Error fetching users:", userError);
      } else {
        setUsersList(allUsers || []);
        // Set default filter ke user pertama jika ada data tersedia
        if (allUsers && allUsers.length > 0) {
          setSelectedUserId(allUsers[0].id);
        }
      }

      // 3. Ambil Undangan (Sertakan kolom user_id untuk filter relasi)
      const { data: allInvitations } = await supabase
        .from('invitations')
        .select('id, title, slug, type, created_at, user_id')
        .order('created_at', { ascending: false });
      if (allInvitations) setInvitationsList(allInvitations);

      // 4. Ambil Buku Tamu / RSVP (Sertakan relasi kueri internal invitations untuk mencocokkan user_id)
      const { data: allRsvps } = await supabase
        .from('rsvps')
        .select('id, name, message, attendance, created_at, invitation_id, invitations(user_id)')
        .order('created_at', { ascending: false });
      if (allRsvps) setRsvpsList(allRsvps);

    } catch (error) {
      console.error('Gagal memuat data admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fungsi untuk mengubah status premium lewat API Backend Route
  const handleTogglePremium = async (user: any) => {
    try {
      if (!user.id) {
        alert("🚨 Gagal: ID Pengguna (UUID) kosong di baris data tabel ini!");
        return;
      }

      const response = await fetch('/api/admin/toggle-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          currentStatus: user.is_premium
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan pada server');
      }

      alert(`✨ ${result.message}`);
      
      setUsersList((prevUsers) =>
        prevUsers.map((u: any) => u.id === user.id ? { ...u, is_premium: !user.is_premium } : u)
      );
      
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  // Filter internal data array real-time berdasarkan user tersemat
  const filteredInvitations = invitationsList.filter(inv => inv.user_id === selectedUserId);
  const filteredRsvps = rsvpsList.filter(rsvp => {
    const parentUserId = (rsvp.invitations as any)?.user_id || rsvp.user_id;
    return parentUserId === selectedUserId;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-xs font-semibold tracking-widest text-sky-400 animate-pulse">MEMUAT PANEL ADMIN...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* NAVIGASI ADMIN PANEL */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-sm tracking-wider uppercase text-sky-400">Dashboard Admin</span>
          </div>
          <button 
            onClick={() => { supabase.auth.signOut(); router.push('/login'); }}
            className="text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Keluar Panel
          </button>
        </div>
      </nav>

      {/* ISI UTAMA DASHBOARD */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-xs text-slate-400">Pantau performa server dan manajemen data aplikasi Anda secara terpusat</p>
        </div>

        {/* ROW STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Pengguna Terdaftar</p>
            <p className="text-3xl font-extrabold text-white mt-1">{stats.users} <span className="text-xs font-normal text-slate-400">Orang</span></p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Undangan Dibuat</p>
            <p className="text-3xl font-extrabold text-sky-400 mt-1">{stats.invitations} <span className="text-xs font-normal text-slate-400">Tautan</span></p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Interaksi Buku Tamu</p>
            <p className="text-3xl font-extrabold text-green-400 mt-1">{stats.rsvp} <span className="text-xs font-normal text-slate-400">Pesan</span></p>
          </div>
        </div>

        {/* SECTION 1: TABEL MANAJEMEN USER */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Daftar Pengguna Aplikasi</h2>
            <p className="text-[11px] text-slate-500">💡 Klik pada baris pengguna untuk menyaring data detail undangan & rsvp di bawah</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">Email Pengguna</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-center">Status Lisensi</th>
                  <th className="p-3 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUserId(user.id)}
                    className={`transition-colors cursor-pointer ${selectedUserId === user.id ? 'bg-sky-500/10 hover:bg-sky-500/15 border-l-2 border-sky-400' : 'hover:bg-slate-950/40'}`}
                  >
                    <td className="p-3 font-medium text-slate-200">
                      {user.email || <span className="text-slate-500 italic font-mono">{user.id}</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${user.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.is_premium ? 'bg-amber-400/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {user.is_premium ? '⭐️ Premium' : 'Free User'}
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleTogglePremium(user)}
                        className={`px-3 py-1.5 font-bold text-[10px] sm:text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap ${
                          user.is_premium 
                            ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                        }`}
                      >
                        {user.is_premium ? '🔒 Turunkan ke Free' : '👑 Jadikan Premium'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEPARATOR JUDUL FILTER AKTIF */}
        <div className="border-t border-slate-800 pt-4">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            📂 Menampilkan Data Dari Pengguna: <span className="text-white underline font-mono">{usersList.find(u => u.id === selectedUserId)?.email || 'Belum Dipilih'}</span>
          </p>
        </div>

        {/* SECTION 2 & 3: GRID DAFTAR UNDANGAN & BUKU TAMU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400">Daftar Undangan Terbit ({filteredInvitations.length})</h2>
              <p className="text-[11px] text-slate-500">Klik tombol aksi untuk melihat langsung halaman publik undangan</p>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold sticky top-0 z-10">
                    <th className="p-3">Judul Acara</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 italic">Tidak ada undangan untuk pengguna ini.</td>
                    </tr>
                  ) : (
                    filteredInvitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="p-3 font-medium text-slate-200 truncate max-w-[160px]" title={inv.title}>{inv.title}</td>
                        <td className="p-3 capitalize text-slate-400">{inv.type || 'Acara'}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => window.open(`/undangan/${inv.slug}`, '_blank')}
                            className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 rounded border border-sky-500/20 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            🔗 Lihat
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-green-400">Interaksi Buku Tamu (RSVP) ({filteredRsvps.length})</h2>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold sticky top-0 z-10">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Pesan</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRsvps.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500 italic">Tidak ada rsvp untuk pengguna ini.</td>
                    </tr>
                  ) : (
                    filteredRsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-slate-950/40">
                        <td className="p-3 font-semibold text-slate-200">{rsvp.name}</td>
                        <td className="p-3 text-slate-300">{rsvp.message}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rsvp.attendance === 'hadir' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {rsvp.attendance === 'hadir' ? 'Hadir' : 'Absen'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}