# Changelog

Semua perubahan penting pada ezpr dicatat di sini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [0.3.0] - 6 Juli 2026

### Added
- Backend API terintegrasi langsung ke dalam SvelteKit via route handler (`+server.ts`) — tidak perlu server terpisah.
- Tipe TypeScript untuk seluruh endpoint API dan modul database.
- Database SQLite diinisialisasi otomatis saat server pertama kali dijalankan.

### Changed
- Adapter diubah dari `@sveltejs/adapter-static` ke `@sveltejs/adapter-node` — aplikasi berjalan sebagai Node.js server utuh.
- Base path API berubah dari `/api` menjadi `/ezpr/api` mengikuti konfigurasi base aplikasi.
- Script build dirapikan, hapus dependensi ke LiteSpeed.
- Seluruh kode backend dikonversi dari JavaScript ke TypeScript.

### Removed
- Server HTTP terpisah (`server/index.cjs` dan `server/db.cjs`) — fungsionalitas dipindahkan ke `src/routes/api/` dan `src/lib/server/db.ts`.

## [0.2.0] - 3 Juli 2026

### Added
- Pencatatan pesanan tempe harian per sales dengan tiga varian: oranye, hijau, dan merah.
- Searchbar filter untuk mencari nama sales di halaman utama.
- Konfirmasi dialog sebelum menandai sales sebagai libur.
- Tombol simpan data langsung dari halaman utama ketika semua sales sudah terkonfirmasi.
- Reset data harian dengan input teks konfirmasi untuk mencegah klik tidak sengaja.
- Jam input (HH:MM) ditampilkan di kolom tanggal pada file CSV.

### Changed
- Route utama dipindahkan dari `/ezpr` ke `/ezpr/tempe/pesanan`.
- Kolom "total" dihapus dari CSV; total otomatis dihitung dari ketiga varian tempe.
- Sales yang sudah tersimpan otomatis berpindah ke tab Tersimpan.
- Data disimpan per tanggal dan dapat dinavigasi antar hari.
- Build otomatis langsung deploy ke server LiteSpeed setiap kali `npm run build`.

### Fixed
- Auto-switch ke tab Tersimpan saat semua sales selesai kini hanya terjadi satu kali; pengguna tetap bisa kembali ke tab Belum.
- CSV parser tetap dapat membaca format lama (8 kolom dengan `total`) maupun format baru (7 kolom).

### Removed
- Kolom `total` dari output CSV.
