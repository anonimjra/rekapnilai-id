# 🎓 RekapNilai.id — Otomasi Hitung Nilai Rapor Kurikulum Merdeka

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Website-10B981?style=for-the-badge&logo=vercel)](https://anonimjra.github.io/rekapnilai-id/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Local First](https://img.shields.io/badge/Architecture-Local--First%20%2F%20Zero--DB-6366F1?style=for-the-badge)](https://github.com/anonimjra/rekapnilai-id)
[![Data Privacy](https://img.shields.io/badge/Data%20Privacy-100%25%20Client--Side-059669?style=for-the-badge)](https://github.com/anonimjra/rekapnilai-id)

> **Solusi cepat, privat, dan bebas ribet untuk guru mengolah nilai rapor dan menyusun kalimat deskripsi capaian pembelajaran Kurikulum Merdeka secara otomatis tanpa login.**

🌐 **Live Website:** [https://anonimjra.github.io/rekapnilai-id/](https://anonimjra.github.io/rekapnilai-id/)

---

## 💡 Latar Belakang & Masalah Guru

Dalam Kurikulum Merdeka, guru di Indonesia seringkali menghadapi beban kerja administratif yang repetitif menjelang akhir semester:
- **Ratusan Nilai:** Mengolah nilai dari 30–40 siswa × 4–6 Tujuan Pembelajaran (TP) per mata pelajaran.
- **Deskripsi Naratif Panjang:** Wajib menulis kalimat capaian kompetensi per siswa (menyebut materi yang dikuasai dan yang butuh bimbingan).
- **Server Pemerintah Sering Down:** Aplikasi e-Rapor resmi kerap lambat saat masa pembagian rapor serentak.
- **Kekhawatiran Privasi Data:** Takut mengunggah identitas siswa ke website sembarangan.

**RekapNilai.id** hadir memotong friksi tersebut: **buka web ➔ masukkan data ➔ nilai dan deskripsi rapor langsung jadi seketika.**

---

## ✨ Fitur Unggulan (Dirancang untuk Guru Gaptek)

- ⚡ **Tombol Coba Data Contoh (1-Klik):** Guru tidak perlu menyiapkan file dulu. Cukup klik satu tombol, 30 data siswa contoh langsung tampil lengkap dengan nilai dan grafik.
- 📝 **Auto-Generator Deskripsi Rapor:** Algoritma otomatis menyusun kalimat naratif rapor yang mengidentifikasi TP dengan capaian tertinggi (*kekuatan*) dan TP terendah (*perlu bimbingan*).
- 🧮 **Perhitungan Nilai Real-Time:** Rata-rata, status ketuntasan KKTP, dan predikat langsung berubah otomatis begitu angka di tabel diedit.
- 📁 **Import & Export Excel (.xlsx):** Tarik dan lepas file Excel nilai yang sudah ada, lalu download hasil olahan rapor yang rapi hanya dengan 1 klik.
- 📊 **Panel Analisis & Remedial:** Histogram sebaran nilai kelas dan daftar siswa yang membutuhkan bimbingan remedial langsung terlihat jelas.
- 🔒 **100% Client-Side & Bebas Bocor Data:** Seluruh pengolahan data terjadi di memori browser pengguna. Tidak ada data nama siswa maupun nilai yang dikirim ke server internet (Aman UU PDP & bisa digunakan secara offline).

---

## 🛠️ Tech Stack Modern

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Static Export)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Spreadsheet Engine:** [SheetJS (xlsx)](https://sheetjs.com/) — Membaca dan menulis Excel murni di browser
- **Icons:** [Lucide React](https://lucide.dev/)
- **Hosting:** GitHub Pages (Static Hosting Rp 0 / Tanpa Database Server)

---

## 🚀 Menjalankan Project Secara Lokal

Pastikan Node.js (v18+) sudah terinstall di komputer Anda:

```bash
# 1. Clone repository ini
git clone https://github.com/anonimjra/rekapnilai-id.git

# 2. Masuk ke direktori project
cd rekapnilai-id

# 3. Install dependencies
npm install

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## 📦 Build & Deploy ke GitHub Pages

Project ini dikonfigurasi untuk diekspor sebagai website statis:

```bash
# Build static export
npm run build

# Deploy ke branch gh-pages
npx gh-pages -d out -b gh-pages --dotfiles
```

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT. Bebas digunakan dan dikembangkan untuk memajukan pendidikan di Indonesia.
