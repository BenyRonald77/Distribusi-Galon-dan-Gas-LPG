# PRD - Sistem Distribusi Galon Air & Gas LPG

## 1. Latar Belakang & Tujuan

Usaha distribusi air galon dan gas LPG rumahan/skala kecil umumnya masih mencatat pesanan, rute antar, dan status pinjaman galon kosong secara manual (buku catatan atau chat WhatsApp). Cara ini rawan human error: kurir bisa lupa alamat, dispatcher kesulitan menentukan urutan pengantaran yang efisien, dan yang paling sering menjadi sumber sengketa adalah data galon kosong yang masih dipinjam pelanggan beserta deposit yang sudah dibayarkan.

Aplikasi ini dibangun untuk menjawab tiga masalah inti:

1. **Order dari pelanggan tetap** - mencatat pesanan pelanggan tetap (bukan pelanggan umum/lewat) secara terstruktur, lengkap dengan item produk dan harga.
2. **Rute pengantaran kurir yang diurutkan otomatis berdasarkan lokasi** - dispatcher tidak perlu menebak urutan kunjungan; sistem menghitung urutan terpendek secara otomatis dari koordinat pelanggan.
3. **Pelacakan galon kosong yang masih dipinjam tiap pelanggan beserta depositnya** - setiap kali galon isi diantar atau galon kosong diambil kembali, saldo pinjaman & deposit pelanggan otomatis ter-update sehingga tidak ada lagi hitungan manual yang berbeda-beda antara pemilik usaha dan pelanggan.

Tujuan produk: memberi dispatcher/pemilik usaha alat kerja harian yang cepat dipakai, memberi kurir daftar rute yang jelas dan mudah dibaca di HP, serta menjaga data galon+deposit selalu akurat dan bisa diaudit.

## 2. Target Pengguna

| Peran | Kebutuhan Utama |
|---|---|
| **Admin/Dispatcher** | Mengelola data pelanggan, produk, membuat pesanan, menetapkan kurir & rute, memantau laporan galon outstanding dan pesanan harian. Bekerja dari komputer/laptop di kantor/rumah. |
| **Kurir** | Melihat daftar rute hari ini yang sudah terurut, alamat & item tiap pelanggan, serta menandai status pesanan (diantar/selesai) dan mencatat galon kosong+deposit yang diterima saat di lokasi. Bekerja dari HP di jalan, sering dengan sinyal/koneksi terbatas dan sambil membawa barang. |
| **Pelanggan tetap** | Pihak yang datanya dikelola oleh dispatcher (alamat, HP, riwayat pinjaman galon). Pada versi MVP ini pelanggan tidak memiliki akun/login sendiri - lihat Ruang Lingkup. |

## 3. Ruang Lingkup

### Termasuk (MVP)

- CRUD data pelanggan tetap (nama, alamat, koordinat lokasi, no HP).
- CRUD data produk (galon berbagai ukuran, gas LPG 3kg/12kg) dengan harga & nominal deposit galon.
- CRUD data kurir.
- Pembuatan pesanan dari pelanggan tetap dengan banyak item produk, kalkulasi total otomatis.
- Assign sekumpulan pesanan (per tanggal, status BARU) ke satu kurir + perhitungan urutan rute otomatis berbasis algoritma nearest-neighbor dari koordinat gudang.
- Tampilan rute terurut dengan estimasi jarak antar titik.
- Update status pesanan (BARU -> DIPROSES -> DIANTAR -> SELESAI).
- Saat pesanan galon diselesaikan: form input jumlah galon kosong yang diambil kembali & deposit yang diterima/dikembalikan, yang meng-update saldo pinjaman galon pelanggan.
- Dashboard rute kurir per hari, dioptimalkan untuk layar HP.
- Laporan pesanan per rentang tanggal.
- Laporan galon kosong outstanding per pelanggan (yang jumlah pinjamannya > 0) beserta total deposit yang dipegang.
- Login admin/dispatcher tunggal (satu akun, password ter-hash) untuk melindungi halaman manajemen.
- Seed data contoh untuk demo/pengembangan.

### Tidak Termasuk (Out of Scope MVP)

- **Integrasi peta pihak ketiga (Google Maps API, dsb).** Koordinat lokasi (latitude/longitude) pelanggan diinput **manual** oleh dispatcher (misalnya menyalin dari Google Maps lalu tempel ke form, atau memakai tombol "gunakan lokasi saat ini" berbasis Geolocation API browser saat menambah pelanggan langsung dari lokasi tersebut). Tidak ada pemanggilan API peta eksternal, tidak ada tampilan peta visual/marker di MVP ini - jarak dihitung murni dari rumus matematis (haversine) antar koordinat.
- Akun/login terpisah untuk kurir dan pelanggan. Kurir menggunakan tautan/halaman dashboard yang dibagikan dispatcher (read + update status, tanpa kredensial sendiri) - lihat penjelasan di Rencana Teknis.
- Pembayaran online / payment gateway.
- Notifikasi WhatsApp/SMS/Push otomatis.
- Optimasi rute lanjutan (TSP exact solver, mempertimbangkan lalu lintas real-time, kapasitas kendaraan/muatan).
- Multi-gudang/multi-cabang.
- Aplikasi mobile native (dibangun sebagai web app responsif, bukan native app).
- Manajemen stok gudang/inventori kedatangan barang dari pemasok.

## 4. Daftar Fitur & User Story

### 4.1 Autentikasi Admin
- Sebagai admin, saya bisa login dengan username & password agar hanya saya yang bisa mengelola data.
- Sebagai admin, saya bisa logout kapan saja.

### 4.2 Manajemen Pelanggan Tetap
- Sebagai dispatcher, saya bisa menambah pelanggan tetap baru dengan nama, alamat, no HP, dan koordinat lokasi.
- Sebagai dispatcher, saya bisa mengedit dan menghapus data pelanggan.
- Sebagai dispatcher, saya bisa melihat daftar semua pelanggan beserta status pinjaman galonnya secara ringkas.

### 4.3 Manajemen Produk
- Sebagai dispatcher, saya bisa menambah produk galon (dengan ukuran & deposit galon) dan gas LPG (3kg/12kg) beserta harganya.
- Sebagai dispatcher, saya bisa mengedit harga dan menghapus produk yang tidak dijual lagi.

### 4.4 Pembuatan Pesanan
- Sebagai dispatcher, saya bisa membuat pesanan baru untuk pelanggan tetap, memilih satu atau lebih produk beserta jumlahnya.
- Sebagai dispatcher, saya melihat total harga terhitung otomatis sebelum menyimpan pesanan.
- Sebagai dispatcher, saya bisa melihat daftar pesanan yang belum diproses (status BARU).

### 4.5 Rute Pengantaran Otomatis
- Sebagai dispatcher, saya bisa memilih beberapa pesanan berstatus BARU pada tanggal tertentu dan menugaskannya ke satu kurir.
- Sebagai dispatcher, setelah menugaskan, sistem otomatis menghitung urutan kunjungan pelanggan yang paling efisien berdasarkan lokasi (dimulai dari gudang), dan menyimpannya sebagai urutan rute.
- Sebagai dispatcher, saya bisa melihat hasil rute berupa daftar terurut lengkap dengan jarak (km) antar titik dan total jarak tempuh perkiraan.

### 4.6 Update Status & Pelacakan Galon+Deposit
- Sebagai kurir/dispatcher, saya bisa menandai pesanan sebagai DIANTAR saat barang sudah diserahkan.
- Sebagai kurir/dispatcher, saat menyelesaikan pesanan yang mengandung galon, saya diminta mengisi jumlah galon kosong yang diambil kembali dari pelanggan dan jumlah deposit yang diterima atau dikembalikan.
- Sebagai sistem, saya otomatis menambah `jumlahDipinjam` pelanggan sebesar jumlah galon isi yang diantar pada pesanan tsb, dan menguranginya sebesar jumlah galon kosong yang diambil kembali; `depositTerkumpul` disesuaikan dengan deposit yang diterima/dikembalikan.
- Sebagai dispatcher, saya bisa melihat riwayat status tiap pesanan.

### 4.7 Dashboard Rute Kurir
- Sebagai kurir, saya bisa membuka satu halaman yang menampilkan rute hari ini, terurut sesuai hasil algoritma, lengkap dengan nama pelanggan, alamat, no HP, dan daftar item yang harus diantar per titik.
- Sebagai kurir, tampilan ini nyaman dibaca di layar HP kecil sambil berjalan/berkendara (kontras tinggi, tombol besar, tidak perlu zoom).

### 4.8 Laporan
- Sebagai admin, saya bisa melihat laporan jumlah pesanan & total omzet pada rentang tanggal tertentu.
- Sebagai admin, saya bisa melihat daftar pelanggan yang masih memiliki pinjaman galon kosong (>0) beserta total deposit yang sedang dipegang usaha, untuk keperluan rekonsiliasi.

## 5. Alur Proses Utama

### 5.1 Alur Rute Otomatis
1. Dispatcher membuka halaman "Rute Pengantaran", memilih tanggal pengantaran dan kurir yang akan bertugas.
2. Sistem menampilkan semua pesanan berstatus BARU pada tanggal tsb yang belum ditugaskan ke kurir manapun.
3. Dispatcher mencentang pesanan-pesanan yang ingin ditugaskan ke kurir tsb, lalu menekan "Buat Rute Otomatis".
4. Sistem menjalankan algoritma nearest-neighbor:
   - Titik awal = koordinat gudang (dikonfigurasi tetap di sistem).
   - Dari titik saat ini, hitung jarak haversine ke semua pelanggan pesanan terpilih yang belum dikunjungi.
   - Pilih pelanggan dengan jarak terdekat, tandai sebagai langkah berikutnya, titik saat ini berpindah ke pelanggan tsb.
   - Ulangi sampai semua pelanggan terpilih masuk urutan.
5. Sistem menyimpan nomor urut ke field `urutanRute` tiap pesanan, mengisi `kurirId`, dan mengubah status pesanan menjadi DIPROSES.
6. Dispatcher melihat hasil: daftar pelanggan terurut + jarak antar titik (km) + total jarak.
7. Kurir membuka dashboard rute miliknya dan melihat urutan yang sama.

### 5.2 Alur Pelacakan Galon & Deposit
1. Kurir tiba di lokasi pelanggan sesuai urutan rute, menyerahkan pesanan.
2. Di dashboard, kurir menekan "Tandai Diantar" lalu (bila sudah selesai transaksi di lokasi) "Selesaikan Pesanan".
3. Jika pesanan mengandung item galon, sistem menampilkan form tambahan: "Berapa galon kosong yang diambil kembali?" dan "Berapa deposit diterima/dikembalikan (Rp)?".
4. Setelah submit, sistem membuat/mengupdate record `GalonPinjaman` milik pelanggan tsb:
   - `jumlahDipinjam += jumlah galon isi yang diantar (dari item pesanan)`
   - `jumlahDipinjam -= jumlah galon kosong yang diambil kembali`
   - `depositTerkumpul += deposit diterima` (nilai negatif berarti pengembalian deposit)
5. Status pesanan berubah menjadi SELESAI. Data ini langsung terlihat di laporan galon outstanding.

## 6. Skema Data

### Pelanggan
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | primary key |
| nama | String | |
| alamat | String | |
| latitude | Float | koordinat, input manual |
| longitude | Float | koordinat, input manual |
| noHp | String | |
| pelangganTetap | Boolean | default true (MVP fokus pelanggan tetap) |
| createdAt / updatedAt | DateTime | |

### Produk
| Field | Tipe | Keterangan |
|---|---|---|
| id | String | primary key |
| nama | String | mis. "Galon 19L", "LPG 3kg" |
| jenis | Enum GALON \| LPG | |
| varian | String? | mis. ukuran/merk |
| harga | Int | harga jual per unit (Rupiah) |
| depositGalon | Int? | nominal deposit galon kosong, hanya untuk jenis GALON |

### Kurir
| Field | Tipe | Keterangan |
|---|---|---|
| id | String | primary key |
| nama | String | |
| noHp | String | |

### Pesanan
| Field | Tipe | Keterangan |
|---|---|---|
| id | String | primary key |
| pelangganId | String | FK -> Pelanggan |
| kurirId | String? | FK -> Kurir, null sebelum ditugaskan |
| tanggal | DateTime | tanggal pesanan/pengantaran |
| status | Enum BARU\|DIPROSES\|DIANTAR\|SELESAI | |
| urutanRute | Int? | urutan kunjungan hasil algoritma |
| galonKosongDiambil | Int? | diisi saat SELESAI |
| depositDiterima | Int? | diisi saat SELESAI (boleh negatif = pengembalian) |
| createdAt / updatedAt | DateTime | |

### PesananItem
| Field | Tipe | Keterangan |
|---|---|---|
| id | String | primary key |
| pesananId | String | FK -> Pesanan |
| produkId | String | FK -> Produk |
| jumlah | Int | |
| hargaSatuan | Int | disalin dari harga produk saat pesanan dibuat (histori harga) |

### GalonPinjaman
| Field | Tipe | Keterangan |
|---|---|---|
| id | String | primary key |
| pelangganId | String | FK -> Pelanggan, unik (1 record per pelanggan) |
| jumlahDipinjam | Int | akumulasi galon isi yang belum dikembalikan kosongnya |
| depositTerkumpul | Int | akumulasi deposit yang dipegang usaha (Rupiah) |
| updatedAt | DateTime | |

### Admin
| Field | Tipe | Keterangan |
|---|---|---|
| id | String | primary key |
| username | String | unik |
| passwordHash | String | bcrypt |

## 7. Kriteria Penerimaan per Fitur

**Autentikasi**: Login salah menampilkan pesan error; sesi tersimpan via cookie httpOnly; halaman manajemen redirect ke /login bila belum login; logout menghapus sesi.

**CRUD Pelanggan**: Data tersimpan ke database dan langsung tampil di daftar; validasi field wajib (nama, alamat, no HP, latitude, longitude) menampilkan pesan error yang jelas; hapus pelanggan meminta konfirmasi.

**CRUD Produk**: Deposit galon wajib diisi untuk jenis GALON, tersembunyi/tidak relevan untuk jenis LPG; harga harus angka positif.

**Pembuatan Pesanan**: Minimal 1 item wajib ada; total otomatis update saat qty/produk berubah; pesanan tersimpan berstatus BARU.

**Rute Otomatis**: Urutan yang dihasilkan konsisten dengan algoritma nearest-neighbor (dapat diverifikasi manual pada data seed); total jarak ditampilkan; pesanan yang sudah dirutekan tidak bisa dirutekan ulang tanpa reset eksplisit; status berubah ke DIPROSES setelah rute dibuat.

**Update Status & Galon**: Form galon+deposit hanya muncul jika pesanan mengandung item GALON; setelah submit, `GalonPinjaman` pelanggan ter-update sesuai rumus di bagian 5.2 dan berubah nilainya bisa diverifikasi di laporan outstanding.

**Dashboard Kurir**: Menampilkan hanya pesanan milik kurir pada tanggal terpilih, terurut oleh `urutanRute` ascending; tampilan tidak overflow di lebar layar 360px.

**Laporan**: Filter rentang tanggal berfungsi menyaring pesanan yang ditampilkan; laporan galon outstanding hanya menampilkan pelanggan dengan `jumlahDipinjam > 0`.

## 8. Rencana Teknis

- **Framework**: Next.js 14+ (App Router), TypeScript.
- **Styling**: Tailwind CSS dengan design token warna terbatas (2-3 warna inti + 1 aksen) agar identitas visual konsisten, dioptimalkan untuk kepadatan informasi (dense, scannable) sesuai kebutuhan alat kerja logistik, bukan halaman marketing.
- **Database**: SQLite file lokal (`prisma/dev.db`) via Prisma ORM - tanpa dependensi server database eksternal, cocok untuk skala usaha kecil-menengah dan mudah di-deploy.
- **Validasi**: Zod pada setiap form/endpoint API.
- **Autentikasi**: Sesi cookie httpOnly sederhana (bukan NextAuth) dengan satu akun admin, password di-hash dengan bcrypt. Middleware Next.js melindungi rute `/admin/*` dan API mutasi data.
- **Halaman kurir**: `/kurir/[kurirId]` adalah halaman baca+update status tanpa login terpisah (dibagikan sebagai tautan oleh dispatcher). Ini adalah simplifikasi MVP yang disengaja - lihat asumsi di bagian 9.
- **Algoritma rute**: Nearest-neighbor heuristic dengan formula haversine untuk jarak antar dua koordinat (lat/lon derajat) dalam kilometer. Kompleksitas O(n^2) - cukup untuk jumlah pesanan harian skala usaha kecil (puluhan pesanan). Titik gudang dikonfigurasi sebagai konstanta di kode (`lib/config.ts`), dapat disesuaikan sebelum deploy ke lokasi usaha yang sebenarnya.
- **Struktur data koordinat**: latitude/longitude disimpan sebagai `Float` derajat desimal, diinput manual oleh dispatcher (lihat Ruang Lingkup).

## 9. Batasan & Asumsi

- Koordinat lokasi pelanggan diinput manual dan akurasinya bergantung sepenuhnya pada ketelitian dispatcher/pelanggan saat menyalin dari aplikasi peta di HP masing-masing; sistem tidak melakukan validasi geografis (mis. memastikan titik berada di wilayah layanan).
- Algoritma nearest-neighbor menghasilkan rute yang baik namun tidak selalu rute paling optimal secara matematis (bukan exact TSP solver) - cukup untuk kebutuhan operasional harian.
- Jarak dihitung sebagai garis lurus (haversine), bukan jarak tempuh jalan raya sesungguhnya, karena tidak ada integrasi peta/routing pihak ketiga di MVP ini.
- Kurir tidak memiliki akun login terpisah pada MVP; keamanan halaman kurir mengandalkan URL yang tidak mudah ditebak (id kurir berupa cuid) - cukup untuk kebutuhan internal tim kecil, bukan untuk data sensitif publik.
- Aplikasi ditujukan untuk satu gudang/basis operasi tunggal.
- Tidak ada penanganan konkurensi tingkat lanjut (mis. dua dispatcher merutekan pesanan yang sama bersamaan) - diasumsikan dioperasikan oleh tim kecil dengan koordinasi manual.
