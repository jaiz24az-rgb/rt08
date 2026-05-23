export interface Balance {
  rtTunai: number;
  rtPettyCash: number;
  rtBank: number;
  rombongTunai: number;
  rombongBank: number;
}

export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface LedgerEntry {
  id: string;
  tanggal: string;
  deskripsi: string;
  jumlah: number;
  tipe: TransactionType;
  sumberKas: keyof Balance;
  kategori: string;
  petugas: string;
}

export interface WargaBill {
  id: string;
  nama: string;
  blok: string;
  noRumah: string;
  noWa?: string; // WhatsApp number for billing
  iuranRT: { bulan: string; lunas: boolean; nominal: number; tahun?: number; tanggalBayar?: string; jamBayar?: string }[];
}

export interface RombongBill {
  id: string;
  namaPemilik: string;
  lokasi: string;
  noLapak: string;
  noWa?: string; // WhatsApp number for billing
  iuranRombong: { bulan: string; lunas: boolean; nominal: number; tahun?: number; tanggalBayar?: string; jamBayar?: string }[];
}

export interface AppUser {
  id: string;
  username: string;
  pin: string; // PIN or Password
  role: 'admin' | 'bendahara';
  nama: string;
}

