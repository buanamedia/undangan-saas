'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Waktu tunggu tidak aktif: 5 menit (5 * 60 * 1000 ms)
  const TIMEOUT_IN_MS = 5 * 60 * 1000; 

  // Kumpulan halaman bebas login supaya tidak bentrok redirect
  const publicPaths = ['/login', '/register', '/undangan'];

  const handleLogout = async () => {
    // 1. Hapus sesi resmi dari server Supabase & hapus Cookie
    await supabase.auth.signOut();
    
    // 2. Bersihkan paksa semua penyimpanan lokal yang tersisa
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
      window.localStorage.clear();
      
      // 3. Hapus Cookie secara manual lewat JavaScript untuk keamanan ganda
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }

    router.refresh();
    router.push('/login');
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
    if (isPublicPath) return;

    timeoutRef.current = setTimeout(() => {
      alert('🔒 Sesi Anda telah berakhir karena tidak ada aktivitas selama 5 menit. Silakan login kembali.');
      handleLogout();
    }, TIMEOUT_IN_MS);
  };

  useEffect(() => {
    const checkStrictSession = async () => {
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      // 🟢 PERBAIKAN UTAMA: Jika user sedang di halaman login/register, 
      // pasang penanda aktif agar saat login sukses tidak langsung tertendang logout.
      if (isPublicPath) {
        if (typeof window !== 'undefined' && !window.sessionStorage.getItem('tab_session_active')) {
          window.sessionStorage.setItem('tab_session_active', 'true');
        }
        return;
      }

      // Deteksi apakah ini jendela/tab baru yang dibuka kembali dari luar
      const hasActiveTabSession = window.sessionStorage.getItem('tab_session_active');

      if (!hasActiveTabSession) {
        // Jika penanda tidak ada, berarti browser baru dibuka kembali setelah ditutup.
        window.sessionStorage.setItem('tab_session_active', 'true');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await handleLogout();
          return;
        }
      }
    };

    checkStrictSession();
  }, [pathname]);

  useEffect(() => {
    // LOGIKA AUTO LOGOUT 5 MENIT JIKA DIAM
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return <>{children}</>;
}