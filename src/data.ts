import { Balance, LedgerEntry, WargaBill, RombongBill, AppUser } from './types';

export const INITIAL_BALANCES: Balance = {
  rtTunai: 5000000,
  rtPettyCash: 500000,
  rtBank: 10000000,
  rombongTunai: 1000000,
  rombongBank: 4000000
};

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'tx-1',
    tanggal: '2026-05-18',
    deskripsi: 'Iuran Bulanan Mei Bp. Slamet (Blok A4-12)',
    jumlah: 150000,
    tipe: 'pemasukan',
    sumberKas: 'rtTunai',
    kategori: 'Iuran Bulanan',
    petugas: 'Sutriadi'
  },
  {
    id: 'tx-2',
    tanggal: '2026-05-19',
    deskripsi: 'Pembelian Sapu dan Alat Kebersihan Pos RT',
    jumlah: 120000,
    tipe: 'pengeluaran',
    sumberKas: 'rtPettyCash',
    kategori: 'Operasional RT',
    petugas: 'Heri'
  },
  {
    id: 'tx-3',
    tanggal: '2026-05-20',
    deskripsi: 'Pemasukan Hasil Sewa Lahan Rombong Kuliner',
    jumlah: 500000,
    tipe: 'pemasukan',
    sumberKas: 'rombongBank',
    kategori: 'Pendapatan Rombong',
    petugas: 'Sutriadi'
  },
  {
    id: 'tx-4',
    tanggal: '2026-05-21',
    deskripsi: 'Transfer Bunga Bank & Administrasi Bulanan',
    jumlah: 15000,
    tipe: 'pengeluaran',
    sumberKas: 'rtBank',
    kategori: 'Administrasi Bank',
    petugas: 'Sutriadi'
  },
  {
    id: 'tx-5',
    tanggal: '2026-05-21',
    deskripsi: 'Honor Satpam Perumahan Periode April',
    jumlah: 1500000,
    tipe: 'pengeluaran',
    sumberKas: 'rtBank',
    kategori: 'Gaji Keamanan',
    petugas: 'Heri'
  }
];

export const INITIAL_WARGA: WargaBill[] = [
  {
    id: 'warga-1',
    nama: 'Ahmad Slamet',
    blok: 'A4',
    noRumah: '12',
    iuranRT: [
      { bulan: 'Maret', lunas: true, nominal: 110000 },
      { bulan: 'April', lunas: true, nominal: 110000 },
      { bulan: 'Mei', lunas: true, nominal: 110000 },
    ]
  },
  {
    id: 'warga-2',
    nama: 'Budi Santoso',
    blok: 'A3',
    noRumah: '15',
    iuranRT: [
      { bulan: 'Maret', lunas: true, nominal: 110000 },
      { bulan: 'April', lunas: true, nominal: 110000 },
      { bulan: 'Mei', lunas: false, nominal: 110000 },
    ]
  },
  {
    id: 'warga-3',
    nama: 'Candra Wijaya',
    blok: 'C5',
    noRumah: '03',
    iuranRT: [
      { bulan: 'Maret', lunas: true, nominal: 110000 },
      { bulan: 'April', lunas: false, nominal: 110000 },
      { bulan: 'Mei', lunas: false, nominal: 110000 },
    ]
  },
  {
    id: 'warga-4',
    nama: 'Deddy Setiawan',
    blok: 'C3',
    noRumah: '07',
    iuranRT: [
      { bulan: 'Maret', lunas: false, nominal: 110000 },
      { bulan: 'April', lunas: false, nominal: 110000 },
      { bulan: 'Mei', lunas: false, nominal: 110000 },
    ]
  },
  {
    id: 'warga-5',
    nama: 'Eko Prasetyo',
    blok: 'A4',
    noRumah: '01',
    iuranRT: [
      { bulan: 'Maret', lunas: true, nominal: 110000 },
      { bulan: 'April', lunas: true, nominal: 110000 },
      { bulan: 'Mei', lunas: true, nominal: 110000 },
    ]
  }
];

export const INITIAL_ROMBONG: RombongBill[] = [
  {
    id: 'rombong-1',
    namaPemilik: 'Suryono (Martabak Bangka)',
    lokasi: 'Pintu Gerbang Utama',
    noLapak: 'Lapak-01',
    iuranRombong: [
      { bulan: 'Maret', lunas: true, nominal: 130000 },
      { bulan: 'April', lunas: true, nominal: 130000 },
      { bulan: 'Mei', lunas: true, nominal: 130000 },
    ]
  },
  {
    id: 'rombong-2',
    namaPemilik: 'Mbak Muji (Sate Madura)',
    lokasi: 'Samping Indomaret',
    noLapak: 'Lapak-02',
    iuranRombong: [
      { bulan: 'Maret', lunas: true, nominal: 130000 },
      { bulan: 'April', lunas: true, nominal: 130000 },
      { bulan: 'Mei', lunas: false, nominal: 130000 },
    ]
  },
  {
    id: 'rombong-3',
    namaPemilik: 'Pak Joko (Bakso Solo)',
    lokasi: 'Taman Bermain Anak',
    noLapak: 'Lapak-03',
    iuranRombong: [
      { bulan: 'Maret', lunas: true, nominal: 130000 },
      { bulan: 'April', lunas: false, nominal: 130000 },
      { bulan: 'Mei', lunas: false, nominal: 130000 },
    ]
  }
];

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    username: 'admin',
    pin: '123456',
    role: 'admin',
    nama: 'Bp. Sutriadi (Ketua RT)'
  },
  {
    id: 'usr-2',
    username: 'bendahara',
    pin: '654321',
    role: 'bendahara',
    nama: 'Heri Gunawan (Bendahara)'
  }
];

