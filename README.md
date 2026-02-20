# SakuMate 💸

SakuMate adalah aplikasi pencatatan keuangan pribadi (Pemasukan & Pengeluaran) yang dirancang modern, cepat, dan *offline-first*. Aplikasi ini berjalan lansgung di browser pengguna tanpa memerlukan koneksi internet aktif setelah pertama kali dimuat.

Dibangun dengan **React** + **Vite**, dan menggunakan **Dexie.js** (IndexedDB) sebagai penyimpanan database lokal yang cepat dan aman.

## ✨ Fitur Utama

- ⚡️ **Offline-First & Cepat:** Semua data disimpan di peramban lokal (IndexedDB) untuk akses instan tanpa jeda server.
- 💳 **Multi-Dompet (Wallets):** Pisahkan pencatatan keuangan berdasarkan sumber dana (misal: Tunai, Bank BCA, GoPay, OVO). Saldo masing-masing dompet otomatis dihitung.
- 🎯 **Target Finansial (Goals):** Buat target menabung (misal: Beli Laptop Baru, Liburan), alokasikan dana, dan pantau persentase progres harian.
- 📊 **Analitik & Wawasan:** Visualisasi data pengeluaran dengan grafik menarik (Recharts) serta analisis *cash flow* berdasarkan kategori (Makanan, Transportasi, dsb).
- 🎨 **Desain Modern:** Antarmuka bergaya *glassmorphism* elegan dengan palet warna Indigo premium yang nyaman dilihat. Akses fitur cepat dengan satu ibu jari lewat navigasi bawah.
- 🔔 **Sistem Notifikasi:** (Toast Notifications) untuk setiap aksi (tambah/hapus transaksi) dan peringatan saldo limit.
- 🌙 **Dark Mode / Light Mode:** Tampilan yang dapat beradaptasi sesuai kenyamanan mata dengan sekali ketuk.

## 🛠️ Tech Stack

- **Framework:** [React 18](https://reactjs.org/) (Vite)
- **Database Lokal:** [Dexie.js](https://dexie.org/) (Wrapper untuk IndexedDB)
- **Styling:** Vanilla CSS (CSS Variables untuk Design System)
- **Ikonografi:** [React Icons](https://react-icons.github.io/react-icons/) (koleksi Ionicons 5)
- **Peta Data (Charts):** [Recharts](https://recharts.org/)
- **Manipulasi Waktu:** [date-fns](https://date-fns.org/)
- **ID Generator:** UUID

## 🚀 Instalasi & Menjalankan Lokal (Development)

Pastikan kamu sudah menginstal [Node.js](https://nodejs.org/) di komputermu.

1. Clone repositori ini:
   ```bash
   git clone https://github.com/utsrale/SakuMate.git
   ```

2. Masuk ke folder proyek:
   ```bash
   cd SakuMate
   ```

3. Instal semua dependensi:
   ```bash
   npm install
   ```

4. Jalankan server *development*:
   ```bash
   npm run dev
   ```

5. Buka `http://localhost:5173` di browser.

## 📦 Deployment (Vercel)

Aplikasi ini sudah dioptimalkan untuk mudah dideploy ke [Vercel](https://vercel.com/) sebagai aplikasi statis (*Static Site Generation / CSR*). Cukup hubungkan repositori ini ke Vercel via dashboard, atau jalankan perintah `npx vercel --prod` jika kamu sudah terotentikasi di CLI.

## 📑 Lisensi

Didistribusikan di bawah [MIT License](LICENSE). 

---

*Setiap rupiah berharga. Catat dengan mudah, capai target finansialmu bersama SakuMate!* 🚀
