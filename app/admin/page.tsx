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
  
  // ⚡ STATE BARU UNTUK SELEKSI JUDUL ACARA & EKSPOR
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);

  // ⚡ STATE TRANSAKSI & TEMA TETAP DIPERTAHANKAN
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // ⚡ STATE BARU UNTUK MENGHITUNG JUMLAH DINAMIS VOUCHER DARI DATABASE
  const [vouchersCount, setVouchersCount] = useState<number>(0);

  // Efek Sinkronisasi Pilihan Mode Tema Dokumen
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

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
      
      // ⚡ QUERY TAMBAHAN: Menghitung total data voucher yang ada di database public.vouchers
      const { count: vCount } = await supabase.from('vouchers').select('*', { count: 'exact', head: true });
      setVouchersCount(vCount || 0);

      setStats({ 
        users: userCount || 0, 
        invitations: invCount || 0, 
        rsvp: rsvpCount || 0,
        premiumOrders: premiumCount || 0
      });

      // 2. Ambil Data User Lengkap
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

      // Query Sinkronisasi Transaksi
      try {
        const { data: allTransactions, error: txError } = await supabase
          .from('transactions')
          .select('user_id, amount, status');
        if (!txError && allTransactions) setTransactionsList(allTransactions);
      } catch (e) {
        console.error("Error pada query transaksi:", e);
      }

    } catch (error) {
      console.error('Gagal memuat data admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Reset filter acara saat user utama diganti
  useEffect(() => {
    setSelectedInvitationId(null);
  }, [selectedUserId]);

  const handleTogglePremium = async (user: any) => {
    try {
      if (!user.id) { alert("🚨 Gagal: ID Pengguna kosong!"); return; }
      
      // LOGIKA BARU: Jika dari Premium ke Free, hapus file
      if (user.is_premium) {
        const konfirmasi = confirm('⚠️ PERINGATAN: Menurunkan status ke FREE akan menghapus semua file foto & musik user ini secara permanen. Lanjutkan?');
        if (!konfirmasi) return;
        await cleanupUserMedia(user.id);
      }

      const response = await fetch('/api/admin/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentStatus: user.is_premium }),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan');

      alert(`✨ ${result.message}`);
      setUsersList((prevUsers) =>
        prevUsers.map((u: any) => u.id === user.id ? { ...u, is_premium: !user.is_premium } : u)
      );
      setStats(prev => ({ ...prev, premiumOrders: user.is_premium ? prev.premiumOrders - 1 : prev.premiumOrders + 1 }));
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  //ini untuk membersihkan musik dan poto user free//
  const cleanupUserMedia = async (userId: string) => {
    await fetch('/api/admin/cleanup-user-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  };

  const handleResetPasswordInstan = async (userId: string, email: string) => {
    if (!userId) return;
    const newPassword = prompt(`Masukkan Password Baru untuk Akun (${email || 'User'}):`, 'buanamedia123');
    if (newPassword === null) return;
    if (newPassword.trim().length < 6) return alert('🚨 Gagal: Password baru minimal harus berisi 6 karakter!');

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPassword.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal mengubah kata sandi');
      alert(`✓ Sukses! ${result.message}`);
    } catch (err: any) {
      alert(`Gagal mereset password: ${err.message}`);
    }
  };

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

  // ⚡ EKSPOR TABEL PENGGUNA APLIKASI (EXCEL & PDF)
  const exportUsersToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Email,Username,Nomor WhatsApp,Role,Status Lisensi\n";
    usersList.forEach((u) => {
      const row = `"${u.email || u.id}","${u.username || ''}","${u.phone || ''}","${u.role || 'user'}","${u.is_premium ? 'Premium' : 'Free'}"`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Daftar_Pengguna_Aplikasi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUsersToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let tableRows = '';
    usersList.forEach(u => {
      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${u.email || u.id}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${u.username || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${u.phone || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-transform: uppercase;">${u.role || 'user'}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${u.is_premium ? 'Premium' : 'Free'}</td>
        </tr>
      `;
    });
    printWindow.document.write(`
      <html>
        <head>
          <title>Daftar Pengguna Aplikasi</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f4f4f4; padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>DAFTAR PENGGUNA APLIKASI</h1>
          <p>Total Terdaftar: ${usersList.length} Pengguna</p>
          <table>
            <thead>
              <tr>
                <th>Email / ID</th>
                <th>Username</th>
                <th>WhatsApp</th>
                <th>Role</th>
                <th>Lisensi</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ⚡ EKSPOR TABEL UNDANGAN TERBIT (EXCEL & PDF)
  const exportInvitationsToExcel = () => {
    const activeUserEmail = usersList.find(u => u.id === selectedUserId)?.email || 'User';
    let csvContent = `data:text/csv;charset=utf-8,Judul Acara,Tipe Acara,Slug Link\n`;
    filteredInvitations.forEach((inv) => {
      const row = `"${inv.title}","${inv.type || 'Acara'}","${inv.slug}"`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daftar_Undangan_${activeUserEmail.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInvitationsToPDF = () => {
    const activeUserEmail = usersList.find(u => u.id === selectedUserId)?.email || 'User';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let tableRows = '';
    filteredInvitations.forEach(inv => {
      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${inv.title}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-transform: capitalize;">${inv.type || 'Acara'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; font-mono">/undangan/${inv.slug}</td>
        </tr>
      `;
    });
    printWindow.document.write(`
      <html>
        <head>
          <title>Daftar Undangan - ${activeUserEmail}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f4f4f4; padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>DAFTAR UNDANGAN DIGITAL USER</h1>
          <p><strong>Pemilik Akun:</strong> ${activeUserEmail}</p>
          <p><strong>Total Tautan:</strong> ${filteredInvitations.length} Undangan</p>
          <table>
            <thead>
              <tr>
                <th>Judul Acara</th>
                <th>Tipe Acara</th>
                <th>Slug URL</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ⚡ EKSPOR DATA BUKU TAMU / RSVP (EXCEL & PDF)
  const exportToExcel = () => {
    const activeInv = invitationsList.find(i => i.id === selectedInvitationId);
    const titleAcara = activeInv ? activeInv.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Buku_Tamu';
    
    let csvContent = "data:text/csv;charset=utf-8,Nama,Pesan,Status Kehadiran,Tanggal Dibuat\n";
    finalFilteredRsvps.forEach((r) => {
      const row = `"${r.name}","${r.message.replace(/"/g, '""')}","${r.attendance}","${new Date(r.created_at).toLocaleDateString('id-ID')}"`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Buku_Tamu_${titleAcara}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const activeInv = invitationsList.find(i => i.id === selectedInvitationId);
    const titleAcara = activeInv ? activeInv.title : 'Acara';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableRows = '';
    finalFilteredRsvps.forEach(r => {
      tableRows += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${r.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${r.message}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-transform: capitalize;">${r.attendance}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Buku Tamu - ${titleAcara}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background-color: #f4f4f4; padding: 8px; border: 1px solid #ddd; text-align: left; }
          </style>
        </head>
        <body>
          <h1>DATA BUKU TAMU / RSVP</h1>
          <p><strong>Nama Acara:</strong> ${titleAcara}</p>
          <p><strong>Total Pesan:</strong> ${finalFilteredRsvps.length}</p>
          <table>
            <thead>
              <tr>
                <th>Nama Tamu</th>
                <th>Isi Doa / Pesan</th>
                <th>Konfirmasi</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredInvitations = invitationsList.filter(inv => inv.user_id === selectedUserId);
  
  // ⚡ FILTER DUA TINGKAT: Saring berdasarkan User Utama dulu, lalu saring berdasarkan Judul Acara jika dipilih
  const finalFilteredRsvps = rsvpsList.filter(rsvp => {
    const parentUserId = (rsvp.invitations as any)?.user_id || rsvp.user_id;
    const matchesUser = parentUserId === selectedUserId;
    
    if (selectedInvitationId) {
      return matchesUser && rsvp.invitation_id === selectedInvitationId;
    }
    return matchesUser;
  });

  // Pemfilteran daftar user premium untuk pencocokan data modal/transaksi eksternal jika dibutuhkan
  const premiumUsersOnly = usersList.filter(u => 
    u.is_premium === true || 
    transactionsList.some(t => {
      const userIdClean = String(u.id).replace(/[^a-zA-Z0-9]/g, '');
      const txUserIdClean = String(t.user_id).replace(/[^a-zA-Z0-9]/g, '');
      return userIdClean === txUserIdClean;
    })
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-800 dark:text-white">
        <p className="text-xs font-semibold tracking-widest text-sky-500 dark:text-sky-400 animate-pulse">MEMUAT PANEL ADMIN...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col justify-between transition-colors duration-200">
      
      {/* HEADER NAVBAR */}
      <header className="border-b-2 border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo/Logo.png" alt="Logo Undangan Digital" className="w-8 h-8 object-contain shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm sm:text-base">
                Undangan <span className="text-blue-700 dark:text-blue-500">Digital</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">by Buanamedia</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border-2 border-slate-300 dark:border-slate-700"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button 
              onClick={() => { supabase.auth.signOut(); router.push('/login'); }}
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-[14px] py-2 rounded-xl shadow-xs transition-all cursor-pointer tracking-wide"
            >
              Keluar Panel
            </button>
          </div>
        </div>
      </header>

      {/* ISI UTAMA DASHBOARD */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/20 transition-colors">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Ringkasan Bisnis</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Pantau performa server dan manajemen data aplikasi Anda secara terpusat</p>
        </div>

        {/* ROW STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Total Pengguna */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-slate-300 dark:border-slate-800 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Pengguna Terdaftar</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.users} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Orang</span></p>
          </div>

          {/* 2. Total Pesanan Premium */}
          <div 
            onClick={() => router.push('/admin/transactions')}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-blue-300 dark:border-blue-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">🛒 Total Pesanan Premium</p>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">Buka</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.premiumOrders} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Transaksi</span></p>
          </div>

          {/* 3. PERBAIKAN KARTU MANAJEMEN VOUCHER (MENAMPILKAN JUMLAH NOMINAL VOUCHER DINAMIS) */}
          <div 
            onClick={() => router.push('/admin/vouchers')}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-sky-300 dark:border-sky-900 hover:border-sky-500 dark:hover:border-sky-500 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex justify-between items-start">
              <p className="text-[11px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300">🎟️ Manajemen Voucher</p>
              <span className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">Kelola</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {vouchersCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Voucher</span>
            </p>
          </div>

          {/* 4. Total Undangan */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-slate-300 dark:border-slate-800 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Undangan Dibuat</p>
            <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">{stats.invitations} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Tautan</span></p>
          </div>

          {/* 5. Total RSVP */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-slate-300 dark:border-slate-800 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Interaksi Buku Tamu</p>
            <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-1">{stats.rsvp} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Pesan</span></p>
          </div>
        </div>

        {/* SECTION 1: TABEL MANAJEMEN USER */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-800 p-5 space-y-4 transition-colors">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">Daftar Pengguna Aplikasi</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">💡 Klik pada baris pengguna untuk menyaring data detail undangan & rsvp di bawah</p>
            </div>
            
            {/* ⚡ TOMBOL EKSPOR UNTUK DAFTAR PENGGUNA APLIKASI */}
            {usersList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={exportUsersToExcel}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  📊 Excel
                </button>
                <button
                  onClick={exportUsersToPDF}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  📄 PDF
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border-2 border-slate-300 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="p-3">Email Pengguna</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Nomor WhatsApp</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-center">Status Lisensi</th>
                  <th className="p-3 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {usersList.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUserId(user.id)}
                    className={`transition-colors cursor-pointer ${selectedUserId === user.id ? 'bg-sky-500/10 dark:bg-sky-500/15 border-l-2 border-sky-500 dark:border-sky-400' : 'hover:bg-slate-50/50 dark:hover:bg-slate-500/5'}`}
                  >
                    <td className="p-3 font-medium text-slate-900 dark:text-slate-200">
                      {user.email || <span className="text-slate-400 italic font-mono">{user.id}</span>}
                    </td>
                    <td className="p-3 font-mono">
                      {user.username || <span className="text-slate-400 italic">Belum diset</span>}
                    </td>
                    <td className="p-3">
                      {user.phone ? (
                        <a 
                          href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🟢 {user.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${user.is_premium ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {user.is_premium ? '⭐️ Premium' : 'Free User'}
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        <button 
                          onClick={() => handleTogglePremium(user)}
                          className={`px-2 py-1 font-bold text-[10px] rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                            user.is_premium 
                              ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-500 hover:text-white dark:hover:text-slate-900' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {user.is_premium ? '🔒 Free' : '👑 Premium'}
                        </button>
                        <button 
                          onClick={() => handleResetPasswordInstan(user.id, user.email)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          🔄 Reset Pass
                        </button>
                        <button 
                          onClick={() => handleDecreaseAccount(user.id)}
                          className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-600 hover:text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer whitespace-nowrap"
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
        <div className="border-t-2 border-slate-300 dark:border-slate-800 pt-4">
          <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
            Sub-Panel Data Komunitas Pengguna: <span className="text-slate-900 dark:text-white underline font-mono">{usersList.find(u => u.id === selectedUserId)?.email || 'Belum Dipilih'}</span>
          </p>
        </div>

        {/* SECTION 2 & 3: GRID DAFTAR UNDANGAN & BUKU TAMU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* DAFTAR UNDANGAN TERBIT */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-800 p-5 space-y-4 transition-colors">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Daftar Undangan Terbit ({filteredInvitations.length})</h2>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">🎯 Klik judul acara untuk menyaring Buku Tamu di kanan</p>
              </div>

              {/* ⚡ TOMBOL EKSPOR UNTUK DAFTAR UNDANGAN TERBIT */}
              {filteredInvitations.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={exportInvitationsToExcel}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    📊 Excel
                  </button>
                  <button
                    onClick={exportInvitationsToPDF}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    📄 PDF
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto border-2 border-slate-300 dark:border-slate-800 rounded-lg max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10">
                    <th className="p-3">Judul Acara</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-950 text-slate-700 dark:text-slate-300">
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">Tidak ada undangan untuk pengguna ini.</td>
                    </tr>
                  ) : (
                    filteredInvitations.map((inv) => (
                      <tr 
                        key={inv.id} 
                        onClick={() => setSelectedInvitationId(inv.id)}
                        className={`transition-colors cursor-pointer ${selectedInvitationId === inv.id ? 'bg-blue-500/10 dark:bg-blue-500/25 font-bold border-l-2 border-blue-600' : 'hover:bg-slate-50/50 dark:hover:bg-slate-950/40'}`}
                      >
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-200 truncate max-w-[160px]">{inv.title}</td>
                        <td className="p-3 capitalize text-slate-500 dark:text-slate-400">{inv.type || 'Acara'}</td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => window.open(`/undangan/${inv.slug}`, '_blank')}
                            className="px-2.5 py-1 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-600 text-sky-600 dark:text-sky-400 hover:text-white rounded border border-sky-200 dark:border-sky-500/20 text-[10px] font-bold transition-all cursor-pointer"
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

          {/* INTERAKSI BUKU TAMU (RSVP) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-300 dark:border-slate-800 p-5 space-y-4 transition-colors">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  Interaksi Buku Tamu (RSVP) ({finalFilteredRsvps.length})
                </h2>
                {selectedInvitationId && (
                  <p className="text-[10px] text-blue-500 font-medium">
                    📍 Memfilter Acara: {invitationsList.find(i => i.id === selectedInvitationId)?.title}
                  </p>
                )}
              </div>
              
              {/* ⚡ TOMBOL EXCEL & PDF HANYA KELUAR SAAT JUDUL ACARA DIPILIH */}
              {selectedInvitationId && finalFilteredRsvps.length > 0 && (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={exportToExcel}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    📊 Excel
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    📄 PDF
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto border-2 border-slate-300 dark:border-slate-800 rounded-lg max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Pesan</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {finalFilteredRsvps.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-400 dark:text-slate-500 italic">
                        {selectedInvitationId 
                          ? 'Tidak ada rsvp untuk acara yang dipilih ini.' 
                          : 'Silakan pilih judul acara di sebelah kiri untuk melihat detail.'}
                      </td>
                    </tr>
                  ) : (
                    finalFilteredRsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">{rsvp.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{rsvp.message}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rsvp.attendance === 'hadir' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
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

      {/* FOOTER NAVIGASI */}
      <footer className="border-t-2 border-slate-300 dark:border-slate-800 py-8 bg-white dark:bg-slate-900 text-center text-xs text-slate-400 w-full transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-500 font-semibold text-[11px] sm:text-xs">
            <button onClick={() => router.push('/tentang-kami')} className="hover:text-blue-700 transition-colors">Tentang Kami</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/demo')} className="hover:text-blue-700 transition-colors">Tema</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/refund-policy')} className="hover:text-blue-700 transition-colors">refund-policy</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/faq')} className="hover:text-blue-700 transition-colors">FAQ</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/syarat-ketentuan')} className="hover:text-blue-700 transition-colors">syarat-ketentuan</button>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
            <button onClick={() => router.push('/kontak')} className="hover:text-blue-700 transition-colors">kontak</button>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 border-t border-slate-50 dark:border-slate-800 pt-4">
            <p className="font-bold text-slate-700 dark:text-slate-300">Undangan Digital &copy; 2026</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">by Buanamedia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}