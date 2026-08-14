<div align="center">

  # 💍 Undangan Digital SaaS (by Buanamedia)

  **Platform Software-as-a-Service (SaaS) Pembuat & Manajemen Undangan Digital Multi-Acara Berbasis Web Modern.**

  [![Next.js](https://img.shields.io/badge/Next.js-13%2B%20App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📋 Daftar Isi

1. [Tentang Proyek](#-tentang-proyek)
2. [Fitur Utama & Fitur Unggulan](#-fitur-utama--fitur-unggulan)
3. [Arsitektur Sistem & Integrasi Web Eksternal](#-arsitektur-sistem--integrasi-web-eksternal)
4. [Tumpukan Teknologi (Tech Stack)](#-tumpukan-teknologi-tech-stack)
5. [Skema Database & Supabase Storage](#-skema-database--supabase-storage)
6. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
7. [Panduan Instalasi & Pengembangan Lokal](#-panduan-instalasi--pengembangan-lokal)
8. [Panduan Deployment ke Vercel](#-panduan-deployment-ke-vercel)
9. [Hak Cipta & Pengembang](#-hak-cipta--pengembang)

---

## 📌 Tentang Proyek

**Undangan Digital SaaS** adalah platform aplikasi web berbasis cloud yang memungkinkan pengguna (*user*) untuk membuat, memodifikasi, dan mengelola undangan digital interaktif secara mandiri untuk berbagai jenis momen istimewa. 

Aplikasi ini dirancang dengan pendekatan **Multi-Tenant / SaaS**, memisahkan akses antara tingkatan akun gratis (*Free*) dan berbayar (*Premium*), serta dilengkapi generator kustomisasi tautan penerima undangan, pengiriman ucapan/doa interaktif (RSVP), hingga pengunggahan media galeri foto dan musik latar secara mandiri.

---

## ✨ Fitur Utama & Fitur Unggulan

### 1. 🛡️ Autentikasi & Manajemen Akun
* **Sistem Autentikasi Supabase:** Registrasi dan login aman menggunakan Supabase Auth dengan penanganan sesi (*Session Management*).
* **Role & Tingkatan Akun:** Pembedaan fitur dan akses template antara pengguna **Free** dan **Premium**.
* **Direct Password Update:** Fitur pembaruan kata sandi pengguna secara langsung melalui panggilan API terintegrasi (`/api/user/change-password`).

### 2. 📝 Pembuat Undangan Interaktif (Step-by-Step Wizard)
* **Pilihan Kategori Acara:** Mendukung *Pernikahan, Lamaran, Khitanan, Akikah, Ulang Tahun, Halalbihalal, Wisuda*, dan acara kustom lainnya.
* **Kustom Slug URL Unik:** Pengguna dapat menentukan URL khusus untuk undangannya (`/undangan/nama-acara`).
* **Multi-Detail Acara:** Pengaturan tanggal & lokasi terpisah untuk acara utama (e.g. Akad Nikah) dan acara pendukung (e.g. Resepsi).
* **Kustomisasi Teks & Prolog:** Fleksibilitas dalam mengisi kata sambutan, cerita pasangan, hingga catatan tambahan ("Turut Mengundang").

### 3. 🖼️ Pengelolaan Media & Amplop Digital
* **Penyimpanan Media Mandiri:** Pengunggahan foto sampul, foto profil, dan banyak foto galeri sekaligus ke Supabase Storage.
* **Audio Background Musik:** Pengunggahan file audio (.mp3) kustom untuk musik latar saat undangan dibuka.
* **Embed Video YouTube:** Integrasi pemutaran video cuplikan momen acara melalui URL YouTube.
* **Amplop & Kado Digital:** Pengaturan banyak rekening bank / dompet digital (*E-Wallet*) untuk penerimaan kado/amplop digital.

### 4. 💌 Generator Undangan Tamu (Share Panel)
* **Kustomisasi Nama & Alamat Tamu:** Pengaturan tautan khusus untuk setiap penerima undangan.
* **Penyimpanan Tamu Lokal:** Menyimpan daftar nama tamu yang telah dibuat ke dalam *LocalStorage* per-undangan.
* **Salin Tautan Otomatis:** Menghasilkan format pesan terstruktur siap kirim untuk aplikasi pesan instan (WhatsApp/Telegram).

### 5. 💬 Sistem Ucapan & Doa (RSVP)
* Tab ucapan dan doa yang dapat diisi oleh tamu undangan dan dipantau langsung oleh pemilik undangan secara *real-time*.

---

## 🌐 Arsitektur Sistem & Integrasi Web Eksternal

Aplikasi ini terhubung dengan berbagai penyedia layanan web dan API pihak ketiga:
