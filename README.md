# 🎯 Gameloka - Platform Pelestarian Bahasa Betawi

Platform edukasi interaktif berbasis gamifikasi untuk melestarikan bahasa dan budaya Betawi.

## 🎮 Fitur Utama

### 1. 🥋 Arena Jawara
Mini-game kuis cepat untuk menguji kemampuan bahasa Betawi:
- 5 soal acak per permainan
- Timer 10 detik per soal
- +20 poin untuk setiap jawaban benar
- Hasil otomatis tersimpan ke Leaderboard

### 2. 🏆 Leaderboard
Papan peringkat untuk melihat para jawara terbaik:
- Filter: Semua Waktu, Minggu Ini, Hari Ini
- Podium Top 3 dengan animasi
- Statistik peserta dan skor

### 3. 🧭 Kompas Belajar
Panduan pembelajaran bahasa Betawi bertahap:
- 4 Level: Dasar, Menengah, Lanjut, Budaya
- 12 topik pembelajaran dengan contoh
- Progress tracking menggunakan localStorage
- Modal detail untuk setiap topik

### 4. 📚 Pustaka Belajar
Koleksi artikel tentang budaya Betawi:
- 12 artikel dalam 4 kategori (Bahasa, Sejarah, Tradisi, Kuliner)
- Fitur pencarian dan filter
- Sistem like untuk artikel favorit
- Modal baca lengkap

### 5. 🌍 Peta Budaya
Peta interaktif menggunakan Leaflet.js:
- 3 lokasi budaya Betawi:
  - **Setu Babakan** - Pusat Budaya
  - **Condet** - Tradisi & Kuliner
  - **Kemayoran** - Festival & Sejarah
- Marker interaktif dengan popup info
- Akses langsung ke Sekilas Kisah Game

### 6. 🎭 Sekilas Kisah Game
Mode naratif interaktif ala visual novel:
- 3 cerita interaktif:
  - **Legenda Si Pitung** (Setu Babakan)
  - **Warung Mak Nani** (Condet)
  - **Festival Kampung Betawi** (Kemayoran)
- Dialog dengan typing effect
- Sistem choices/branching dialog
- Jeda otomatis pada "..." (efek mikir)
- Pesan moral di akhir cerita
- Karakter NPC yang bisa diklik

### 7. 💬 Cerita Kami
Platform berbagi pengalaman komunitas:
- Form untuk berbagi cerita
- Sistem like per cerita
- Timestamp relatif
- Data tersimpan di localStorage

## 🎨 Palet Warna Betawi

- **Merah Bata**: `#C0392B` - Identitas kuat Betawi
- **Kuning Emas**: `#F1C40F` - Kemewahan budaya
- **Hijau Daun**: `#27AE60` - Kesegaran tradisi
- **Biru Langit**: `#2980B9` - Kedamaian pembelajaran
- **Latar Krem**: `#FAF3E0` - Hangat dan ramah

## 🛠️ Teknologi

- **React** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **Leaflet.js** - Interactive maps
- **localStorage** - Data persistence

## 📱 Fitur Responsif

- Navigasi mobile-friendly dengan hamburger menu
- Layout grid adaptif untuk berbagai ukuran layar
- Touch-friendly buttons dan interaksi
- Optimized untuk desktop dan mobile

## 🎯 Konsep Gamifikasi

1. **Poin System** - Kumpulkan poin dari Arena Jawara
2. **Leaderboard** - Kompetisi sehat antar pemain
3. **Progress Tracking** - Pantau pembelajaran di Kompas Belajar
4. **Interactive Stories** - Belajar melalui cerita interaktif
5. **Community Engagement** - Berbagi dan like cerita sesama

## 💾 Data Persistence

Semua progress tersimpan di localStorage:
- `gameloka-leaderboard` - Skor Arena Jawara
- `gameloka-completed-topics` - Progress Kompas Belajar
- `gameloka-liked-articles` - Artikel favorit
- `gameloka-stories` - Cerita komunitas
- `gameloka-story-likes` - Like per cerita

## 🚀 Quick Start

1. Install dependencies
2. Run development server
3. Mulai belajar bahasa Betawi!

## 📖 Struktur Pembelajaran

**Level Dasar** → Sapaan, Angka, Kata Sehari-hari
**Level Menengah** → Pantun, Ungkapan Perasaan, Kata Kerja
**Level Lanjut** → Peribahasa, Percakapan Kompleks, Slang
**Level Budaya** → Tradisi, Kuliner, Sejarah

---

**Gameloka** - Melestarikan Bahasa Betawi untuk Generasi Masa Depan 🎯
