'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, invitations: 0, rsvp: 0, premiumOrders: 0 });
  
  // State Data Manajemen
  const [usersList, setUsersList] = useState<any[]>([]);
  const [invitationsList, setInvitationsList] = useState<any[]>([]);
  const [rsvpsList, setRsvpsList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // State Kontrol Modal/Fitur Klik Pesanan
  const [showOrderModal, setShowOrderModal] = useState(false);

  // ⚡ PENAMBAHAN STATE BARU (HANYA MENAMBAHKAN, TANPA MENGHAPUS YANG ADA):
  // Untuk menyimpan data riwayat nominal transaksi dari Supabase
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

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

      // 1. Ambil Statistik Ringkasan Utama
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: invCount } = await supabase.from('invitations').select('*', { count: 'exact', head: true });
      const { count: rsvpCount } = await supabase.from('rsvps').select('*', { count: 'exact', head: true });
      
      const { count: premiumCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true);
      
      setStats({ 
        users: userCount || 0, 
        invitations: invCount || 0, 
        rsvp: rsvpCount || 0,
        premiumOrders: premiumCount || 0
      });

      // 2. Ambil Data User Lengkap (KODE ASLI ANDA UTUH 100% - TIDAK DIGANTI/DIEDIT)
      const { data: allUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, role, is_premium, created_at, email, username, phone, full_name')
        .order('created_at', { ascending: false });

      if (userError) {
        console.error("Error fetching users:", userError);
      } else {
        setUsersList(allUsers || []);
        if (allUsers && allUsers.length > 0) {
          setSelectedUserId(allUsers[0].id);
        }
      }

      // 3. Ambil Undangan
      const { data: allInvitations } = await supabase
        .from('invitations')
        .select('id, title, slug, type, created_at, user_id')
        .order('created_at', { ascending: false });
      if (allInvitations) setInvitationsList(allInvitations);

      // 4. Ambil Buku Tamu / RSVP
      const { data: allRsvps } = await supabase
        .from('rsvps')
        .select('id, name, message, attendance, created_at, invitation_id, invitations(user_id)')
        .order('created_at', { ascending: false });
      if (allRsvps) setRsvpsList(allRsvps);

      // ⚡ QUERY SINKRONISASI TRANSAKSI BARU (DENGAN RE-CHECK TOLERANSI CASING):
      const { data: allTransactions, error: txError } = await supabase
        .from('transactions')
        .select('user_id, amount, status')
        .ilike('status', 'success'); 

      if (txError) {
        console.error("Error fetching transactions:", txError);
      } else if (allTransactions) {
        setTransactionsList(allTransactions);
      }

    } catch (error) {
      console.error('Gagal memuat data admin:', error);
    } finally {
      setLoading(false);
    }
  }; // 🟢 SEKARANG STRUKTUR PENUTUP SUDAH SEIMBANG SEMPURNA TANPA ERROR SEMICOLON

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fungsi mengubah status premium lewat API Backend Route
  const handleTogglePremium = async (user: any) => {
    try {
      if (!user.id) {
        alert("🚨 Gagal: ID Pengguna kosong!");
        return;
      }

      const response = await fetch('/api/admin/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentStatus: user.is_premium }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan pada server');

      alert(`✨ ${result.message}`);
      setUsersList((prevUsers) =>
        prevUsers.map((u: any) => u.id === user.id ? { ...u, is_premium: !user.is_premium } : u)
      );
      setStats(prev => ({ ...prev, premiumOrders: user.is_premium ? prev.premiumOrders - 1 : prev.premiumOrders + 1 }));
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  // 🔥 UPDATE FITUR: Reset Password Secara Instan dari Sisi Admin (Tanpa Kirim Email)
  const handleResetPasswordInstan = async (userId: string, email: string) => {
    if (!userId) return;
    
    const newPassword = prompt(`Masukkan Password Baru untuk Akun (${email || 'User'}):`, 'buanamedia123');
    if (newPassword === null) return; // Batal klik cancel
    
    if (newPassword.trim().length < 6) {
      return alert('🚨 Gagal: Password baru minimal harus berisi 6 karakter!');
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPassword.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengubah kata sandi pada server backend.');
      }

      alert(`✓ Sukses! ${result.message}`);
    } catch (err: any) {
      alert(`Gagal mereset password: ${err.message}`);
    }
  };

  // Fungsi Aksi: Hapus Akun dari Database profiles
  const handleDecreaseAccount = async (userId: string) => {
    if (!userId) return;
    const konfirmasi = confirm('⚠️ PERINGATAN: Menghapus akun ini akan melenyapkan profile pengguna secara permanen dari database. Lanjutkan?');
    if (!konfirmasi) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      alert('✓ Akun pengguna berhasil dihapus dari tabel profiles!');
      setUsersList(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(`Gagal menghapus data: ${err.message}`);
    }
  };

  const filteredInvitations = invitationsList.filter(inv => inv.user_id === selectedUserId);
  const filteredRsvps = rsvpsList.filter(rsvp => {
    const parentUserId = (rsvp.invitations as any)?.user_id || rsvp.user_id;
    return parentUserId === selectedUserId;
  });

  const premiumUsersOnly = usersList.filter(u => u.is_premium);

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
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-xs text-slate-400">Pantau performa server dan manajemen data aplikasi Anda secara terpusat</p>
        </div>

        {/* ROW STATISTIK TERMASUK MENU PESANAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Pengguna Terdaftar</p>
            <p className="text-3xl font-extrabold text-white mt-1">{stats.users} <span className="text-xs font-normal text-slate-400">Orang</span></p>
          </div>

          <div 
            onClick={() => setShowOrderModal(true)}
            className="bg-slate-900 p-5 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group shadow-lg"
          >
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 group-hover:text-blue-300">🛒 Total Pesanan Premium</p>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">Lihat Detail</span>
            </div>
            <p className="text-3xl font-extrabold text-white mt-1">{stats.premiumOrders} <span className="text-xs font-normal text-slate-400">Transaksi</span></p>
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
                  <th className="p-3">Username</th>
                  <th className="p-3">Nomor WhatsApp</th>
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
                    <td className="p-3 text-slate-300 font-mono">
                      {user.username || <span className="text-slate-600 italic">Belum diset</span>}
                    </td>
                    <td className="p-3 text-slate-300">
                      {user.phone ? (
                        <a 
                          href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🟢 {user.phone}
                        </a>
                      ) : (
                        <span className="text-slate-600 italic">Tidak ada</span>
                      )}
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
                      <div className="flex justify-end items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        <button 
                          onClick={() => handleTogglePremium(user)}
                          className={`px-2 py-1 font-bold text-[10px] rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            user.is_premium 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-900' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {user.is_premium ? '🔒 Free' : '👑 Premium'}
                        </button>
                        
                        {/* AKSI BARU: RESET PASSWORD SECARA INSTAN */}
                        <button 
                          onClick={() => handleResetPasswordInstan(user.id, user.email)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer whitespace-nowrap"
                          title="Ganti password langsung dari admin"
                        >
                          🔄 Reset Pass
                        </button>

                        <button 
                          onClick={() => handleDecreaseAccount(user.id)}
                          className="px-2 py-1 bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
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
            Sub-Panel Data Komunitas Pengguna: <span className="text-white underline font-mono">{usersList.find(u => u.id === selectedUserId)?.email || 'Belum Dipilih'}</span>
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

      {/* MODAL INTERAKTIF DAFTAR PESANAN PREMIUM */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400">Rincian Transaksi & Penggunaan Voucher</h3>
              </div>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
              <p className="text-slate-400 leading-relaxed">
                Berikut data pengguna terkonfirmasi aktif mengupgrade akun melalui modul gerbang iPaymu atau sistem admin internal:
              </p>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                      <th className="p-3">Nama Pengguna</th>
                      <th className="p-3">Email Akun</th>
                      <th className="p-3 text-center">Estimasi Bayar</th>
                      <th className="p-3 text-right">Catatan Akses / Kupon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
  {premiumUsersOnly.length === 0 ? (
    <tr>
      <td colSpan={4} className="p-8 text-center text-slate-500 italic">Belum ada pesanan premium terdaftar.</td>
    </tr>
  ) : (
    premiumUsersOnly.map((user) => {
      // ⚡ PERBAIKAN: Gunakan .trim() dan .toLowerCase() agar pencarian ID string dari DB akurat 100%
      const matchTx = transactionsList.find(
        (t) => t.user_id?.toString().trim().toLowerCase() === user.id?.toString().trim().toLowerCase()
      );
      
      const displayAmount = matchTx?.amount 
        ? `Rp.${Number(matchTx.amount).toLocaleString('id-ID')}`
        : 'Rp.100.000';

      return (
        <tr key={user.id} className="hover:bg-slate-950/30">
          <td className="p-3 font-semibold text-slate-200">
            {user.full_name || user.username || <span className="text-slate-600">-</span>}
          </td>
          <td className="p-3 text-slate-400 font-mono">{user.email}</td>
          <td className="p-3 text-center text-amber-400 font-bold">
            {displayAmount}
          </td>
          <td className="p-3 text-right">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold">
              LIVE CHECKOUT
            </span>
          </td>
        </tr>
      );
    })
  )}
</tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-right">
              <span className="text-[11px] text-slate-500 italic mr-4">Total: {premiumUsersOnly.length} Pengguna Premium Terverifikasi</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}