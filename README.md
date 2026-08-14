<div align="center">

  # 💍 Undangan Digital SaaS (by Buanamedia)

  **Platform Pembuat & Manajemen Undangan Digital Multi-Acara Berbasis Web Modern.**

  [![Next.js](https://img.shields.io/badge/Next.js-13%2B-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## 📌 Tentang Proyek

**Undangan Digital SaaS** adalah aplikasi web yang memungkinkan pengguna untuk membuat, mengelola, dan membagikan undangan digital interaktif untuk berbagai jenis acara (Pernikahan, Lamaran, Khitanan, Akikah, Ulang Tahun, Wisuda, dll). 

Aplikasi ini dilengkapi dengan fitur manajemen ucapan/kado (RSVP), kustomisasi musik latar, unggah galeri foto/video, peta lokasi otomatis, serta generator tautan kirim pesan ke tamu kustom.

---

## ✨ Fitur Utama

- 👤 **Autentikasi & Profil Pengguna:**
  - Login & Register aman terintegrasi dengan Supabase Auth.
  - Peran Pengguna (*Free* & *Premium*).
  - Manajemen Kata Sandi secara langsung dari dashboard.

- 📜 **Manajemen Undangan Multi-Acara:**
  - Pembuatan undangan berformat *Step-by-Step Wizard*.
  - Dukungan kustomisasi Slug URL unik (`/undangan/nama-acara`).
  - Mendukung berbagai kategori acara (*Pernikahan, Lamaran, Khitanan, dll*).
  - Informasi detail akad, resepsi, serta integrasi pencarian lokasi Peta (Google Maps / OpenStreetMap Nominatim).

- 🎨 **Kustomisasi & Media:**
  - Pilihan tema/template undangan (Free vs Premium).
  - Unggah foto sampul, foto profil, dan galeri momen (*Supabase Storage*).
  - Unggah musik latar kustom (MP3) & *embed* video YouTube.
  - Rekening digital/amplop digital kustom untuk kado.

- 💌 **Fitur Tamu & Pesan (RSVP):**
  - Generator tautan kustom per nama tamu & alamat.
  - Panel pesan doa & ucapan dari tamu secara *real-time*.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Framework Front-End:** [Next.js](https://nextjs.org/) (React, App Router)
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/)
- **Styling UI:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication & Storage:** Supabase Auth & Storage Bucket
- **Maps Search Integration:** OpenStreetMap (Nominatim API) & Google Maps

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat System

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (Versi 18.x atau lebih baru)
- `npm` atau `yarn` atau `pnpm`

### 2. Kloning Repositori

```bash
git clone [https://github.com/buanamedia/undangan-saas.git](https://github.com/buanamedia/undangan-saas.git)
cd undangan-saas
