import React, { useState } from 'react';
import { LedgerEntry, Balance, AppUser } from '../types';
import { 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  Tag, 
  Calendar, 
  Filter, 
  Search,
  BookOpen,
  Trash2,
  Printer,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface LedgerProps {
  ledger: LedgerEntry[];
  setLedger: (newLedger: LedgerEntry[]) => void;
  kas: Balance;
  updateKas: (newKas: Balance) => void;
  isLoggedIn: boolean;
  currentUser?: AppUser | null;
  usersList?: AppUser[];
  yearsList?: number[];
  rtTitle?: string;
  rtAddress?: string;
  rtEmail?: string;
}

export default function Ledger({ 
  ledger, 
  setLedger, 
  kas, 
  updateKas, 
  isLoggedIn, 
  currentUser = null, 
  usersList = [], 
  yearsList = [2024, 2025, 2026, 2027, 2028],
  rtTitle = 'PENGURUS RUKUN TETANGGA 008 RUKUN WARGA 004',
  rtAddress = 'PERUMTAS 3 RT.008 RW.004 DESA POPOH KEC WONOAYU KABUPATEN SIDOARJO 61261',
  rtEmail = 'tas3.rt.08@gmail.com'
}: LedgerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'semua' | 'pemasukan' | 'pengeluaran'>('semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedYear, setSelectedYear] = useState<string>('semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('semua');
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const INDO_MONTHS = [
    { value: '01', name: 'Januari' },
    { value: '02', name: 'Februari' },
    { value: '03', name: 'Maret' },
    { value: '04', name: 'April' },
    { value: '05', name: 'Mei' },
    { value: '06', name: 'Juni' },
    { value: '07', name: 'Juli' },
    { value: '08', name: 'Agustus' },
    { value: '09', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' }
  ];

  const cleanSignatureName = (nama: string) => {
    return nama.replace(/\s*\(.*\)\s*/g, '').trim();
  };

  const adminUser = usersList.find(u => u.role === 'admin');
  const bendaharaUser = usersList.find(u => u.role === 'bendahara');

  const adminName = adminUser ? cleanSignatureName(adminUser.nama) : 'Bp. Sutriadi';
  const bendaharaName = bendaharaUser ? cleanSignatureName(bendaharaUser.nama) : 'Heri Gunawan';

  // Find unique categories for dropdown filter
  const categories = ['Semua', ...Array.from(new Set(ledger.map(entry => entry.kategori)))];

  const handleDeleteLedgerEntry = (id: string, jumlah: number, tipe: 'pemasukan' | 'pengeluaran', sumberKas: keyof Balance) => {
    if (!isLoggedIn) return;
    if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini? Hal ini juga akan membatalkan efek saldo keuangan terkait.')) {
      // Revert cash balance effect
      const nextKas = { ...kas };
      if (tipe === 'pemasukan') {
        nextKas[sumberKas] -= jumlah;
      } else {
        nextKas[sumberKas] += jumlah;
      }
      updateKas(nextKas);

      // Remove entry from ledger
      const updatedLedger = ledger.filter(e => e.id !== id);
      setLedger(updatedLedger);
    }
  };

  const filteredLedger = ledger.filter(entry => {
    const matchesSearch = entry.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.petugas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'semua' || entry.tipe === selectedType;
    const matchesCategory = selectedCategory === 'Semua' || entry.kategori === selectedCategory;

    let matchesDate = true;
    if (entry.tanggal) {
      const parts = entry.tanggal.split('-'); // ["YYYY", "MM", "DD"]
      if (parts.length >= 2) {
        const entryYear = parts[0];
        const entryMonth = parts[1]; // e.g. "05"

        const yearMatch = selectedYear === 'semua' || entryYear === selectedYear;
        const monthMatch = selectedMonth === 'semua' || entryMonth === selectedMonth;
        matchesDate = yearMatch && monthMatch;
      }
    }

    return matchesSearch && matchesType && matchesCategory && matchesDate;
  });

  const totalPemasukan = filteredLedger
    .filter(e => e.tipe === 'pemasukan')
    .reduce((sum, e) => sum + e.jumlah, 0);

  const totalPengeluaran = filteredLedger
    .filter(e => e.tipe === 'pengeluaran')
    .reduce((sum, e) => sum + e.jumlah, 0);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  const handleExportExcel = () => {
    // Column Headers
    const headers = ['No', 'Tanggal', 'Deskripsi/Keterangan', 'Kategori', 'Petugas', 'Akun Kas', 'Tipe', 'Nominal (Rp)'];
    
    // Rows
    const rows = filteredLedger.map((entry, idx) => [
      idx + 1,
      entry.tanggal,
      `"${entry.deskripsi.replace(/"/g, '""')}"`,
      `"${entry.kategori.replace(/"/g, '""')}"`,
      `"${entry.petugas.replace(/"/g, '""')}"`,
      entry.sumberKas,
      entry.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      entry.jumlah
    ]);

    // Summary totals rows inside spreadsheet
    const emptyRow = ['', '', '', '', '', '', '', ''];
    const rowTotalPemasukan = ['', '', 'Total Debit (Pemasukan)', '', '', '', '', totalPemasukan];
    const rowTotalPengeluaran = ['', '', 'Total Kredit (Pengeluaran)', '', '', '', '', totalPengeluaran];
    const rowSaldoBersih = ['', '', 'Saldo Bersih Periode', '', '', '', '', saldoBersih];

    // Join lines with commas
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(',')),
      emptyRow.join(','),
      rowTotalPemasukan.join(','),
      rowTotalPengeluaran.join(','),
      rowSaldoBersih.join(',')
    ].join('\n');

    // Unicode BOM to force Excel to read characters/formulas correctly in UTF-8
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    let periodStr = 'Semua_Periode';
    if (selectedYear !== 'semua') {
      periodStr = `${selectedYear}`;
      if (selectedMonth !== 'semua') {
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const monthIndex = parseInt(selectedMonth, 10) - 1;
        periodStr = `${monthNames[monthIndex]}_${selectedYear}`;
      }
    }

    link.setAttribute('download', `Laporan_Buku_Kas_RT08_${periodStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm font-mono flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-600" />
          Filter Buku Kas Umum RT.008 RW.004
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 font-bold" />
            <input
              type="text"
              placeholder="Cari deskripsi, kategori, petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-450"
            />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            >
              <option value="semua">Semua Tipe</option>
              <option value="pemasukan">Dana Masuk (Debit)</option>
              <option value="pengeluaran">Dana Keluar (Kredit)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.filter(cat => cat !== 'Semua').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            >
              <option value="semua">Semua Bulan</option>
              {INDO_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            >
              <option value="semua">Semua Tahun</option>
              {yearsList.map(yr => (
                <option key={yr} value={String(yr)}>Tahun {yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Excel / PDF Report Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-150 rounded-2xl mt-2 animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-700">Periode Ekspor Terpilih:</p>
            <p className="text-xs text-sky-700 font-black font-mono">
              {selectedMonth === 'semua' && selectedYear === 'semua'
                ? 'Semua Transaksi Buku Kas'
                : `${selectedMonth !== 'semua' ? INDO_MONTHS.find(m => m.value === selectedMonth)?.name : 'Semua Bulan'} ${selectedYear !== 'semua' ? selectedYear : 'Semua Tahun'}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (currentUser?.role === 'admin' || currentUser?.role === 'bendahara') ? (
              <>
                {/* Download Excel */}
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-97 font-sans"
                  title="Unduh Buku Kas dalam format Excel (.csv)"
                  id="ledger-excel-button"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor Excel (.csv)</span>
                </button>
 
                {/* Print directly or preview */}
                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="bg-sky-600 hover:bg-sky-705 text-white font-black px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-600/10 transition cursor-pointer active:scale-97 font-sans"
                  title="Pratinjau Laporan & Cetak PDF / Printer"
                  id="ledger-pdf-button"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Pratinjau Laporan PDF</span>
                </button>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-250 px-4 py-2.5 rounded-xl text-[11px] text-amber-800 font-bold flex items-center gap-1.5 font-sans">
                <span>🔒 Masuk sebagai Admin / Bendahara untuk ekspor Excel atau cetak PDF</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Records List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <span className="text-xs font-mono text-slate-500 font-semibold">Menampilkan {filteredLedger.length} riwayat transaksi</span>
          {isLoggedIn && (
            <span className="text-[10px] text-rose-600 font-mono font-bold">
              *Hapus transaksi akan memulihkan saldo akun kas semula.
            </span>
          )}
        </div>

        {filteredLedger.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center shadow-xs">
            <FileText className="w-10 h-10 text-slate-350 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">Buku kas belum memiliki catatan transaksi</p>
            <p className="text-slate-400 text-xs mt-1">Sesuaikan filter pencarian atau mulailah mencatat.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredLedger.map((entry) => {
              const isPemasukan = entry.tipe === 'pemasukan';
              return (
                <div 
                  key={entry.id} 
                  className={`p-5 rounded-2xl border transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs ${
                    isPemasukan 
                      ? 'bg-white border-emerald-100 hover:border-emerald-300' 
                      : 'bg-white border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Circle icon */}
                    <div className={`p-3 rounded-xl shrink-0 border ${
                      isPemasukan 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {isPemasukan ? <ArrowUpRight className="w-5 h-5 pointer-events-none" /> : <ArrowDownLeft className="w-5 h-5 pointer-events-none" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">{entry.deskripsi}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {entry.tanggal}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {entry.kategori}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Petugas: {entry.petugas}
                        </span>
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Akun: {entry.sumberKas}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className={`text-base md:text-lg font-extrabold font-mono tracking-tight ${
                        isPemasukan ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPemasukan ? '+' : '-'} Rp {entry.jumlah.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {isLoggedIn && (
                      <button
                        onClick={() => handleDeleteLedgerEntry(entry.id, entry.jumlah, entry.tipe, entry.sumberKas)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Hapus Transaksi (Memulihkan Kas)"
                        id={`del-tx-${entry.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Printable & Pratinjau Modal */}
      {showPrintPreview && isLoggedIn && (currentUser?.role === 'admin' || currentUser?.role === 'bendahara') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 md:p-8 z-[100] overflow-y-auto animate-in fade-in duration-200">
          <style>{`
            @media print {
              body {
                background-color: white !important;
                color: black !important;
                font-family: 'Inter', system-ui, sans-serif !important;
              }
              header, footer, nav, .no-print, button, select, input, #tab-dashboard, #tab-tagihan, #tab-buku_kas, .bg-slate-900\\/60 {
                display: none !important;
                visibility: hidden !important;
              }
              body * {
                visibility: hidden;
              }
              #printable-report-area, #printable-report-area * {
                visibility: visible;
              }
              #printable-report-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
            }
          `}</style>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative max-w-4xl w-full animate-in zoom-in-95 duration-200 text-slate-800 my-8">
            {/* Top Toolbar (Invisible in General Print) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6 no-print">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5 font-sans">
                  <Printer className="w-5 h-5 text-sky-600" />
                  Pratinjau Lembar Bukti Buku Kas RT.008 RW.004
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Laporan cetak ini terstruktur secara rapi dan proporsional untuk ukuran kertas portrait A4 / PDF.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  Tutup Laporan
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-600/10 transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Mulai Cetak / Save to PDF 🖨️</span>
                </button>
              </div>
            </div>

            {/* Printable Area Wrapper */}
            <div id="printable-report-area" className="bg-white p-2 md:p-4 text-slate-950 font-sans">
              {/* Kop Surat Header */}
              <div className="border-b-4 border-double border-slate-950 pb-4 mb-6 text-center">
                <h2 className="text-sm md:text-base font-black font-sans tracking-wide text-slate-900 uppercase leading-tight">{rtTitle}</h2>
                <h3 className="text-xs md:text-sm font-extrabold font-sans text-slate-800 tracking-wide uppercase leading-tight mt-1">{rtAddress}</h3>
                {rtEmail && (
                  <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1 font-sans">
                    Email: {rtEmail}
                  </p>
                )}
              </div>

              {/* Document Metadata Block */}
              <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-6 font-sans">
                <div>
                  <h1 className="text-lg md:text-xl font-black font-sans text-slate-910 uppercase tracking-tight">LAPORAN BUKU KAS UMUM RT</h1>
                  <p className="text-xs text-slate-600 mt-1">
                    Periode Laporan:{' '}
                    <strong className="text-slate-900 font-extrabold text-sm">
                      {selectedMonth === 'semua' && selectedYear === 'semua'
                        ? 'Semua Transaksi Buku Kas'
                        : `${selectedMonth !== 'semua' ? INDO_MONTHS.find(m => m.value === selectedMonth)?.name : 'Semua Bulan'} ${selectedYear !== 'semua' ? selectedYear : 'Semua Tahun'}`}
                    </strong>
                  </p>
                </div>
                <div className="text-xs text-slate-630 sm:text-right font-sans">
                  <p>Tanggal Cetak: <strong className="text-slate-900">Jumat, 22 Mei 2026</strong></p>
                  <p>Petugas Operator: <strong className="text-slate-900">{isLoggedIn && currentUser ? cleanSignatureName(currentUser.nama) + (currentUser.role === 'admin' ? ' (Admin)' : ' (Bendahara)') : 'Sistem Keuangan RT'}</strong></p>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto border border-slate-300 rounded-xl mb-6">
                <table className="w-full text-xs text-left text-slate-900 font-sans border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                      <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center font-mono">No</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-24">Tanggal</th>
                      <th className="py-2.5 px-3 border-r border-slate-300">Keterangan / Deskripsi Transaksi</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-28">Kategori</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-24">Pintu Kas</th>
                      <th className="py-2.5 px-3 border-r border-slate-300 w-28 text-right">Debit / Pemasukan (Rp)</th>
                      <th className="py-2.5 px-3 text-right w-28">Kredit / Pengeluaran (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-bold bg-slate-50">
                          Tidak terdapat rincian transaksi buku kas pada saringan periodik terpilih.
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((entry, idx) => {
                        const isPemasukan = entry.tipe === 'pemasukan';
                        return (
                          <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50/20">
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">{entry.tanggal}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900 leading-normal">{entry.deskripsi}</td>
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{entry.kategori}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-mono text-[10px] text-slate-500">{entry.sumberKas}</td>
                            <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-semibold text-emerald-700">
                              {isPemasukan ? `Rp ${entry.jumlah.toLocaleString('id-ID')}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-rose-700">
                              {!isPemasukan ? `Rp ${entry.jumlah.toLocaleString('id-ID')}` : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals Box Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 font-sans">
                <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">TOTAL SELURUH DEBIT (MASUK)</span>
                  <span className="text-base font-black font-mono text-emerald-900 mt-1">
                    Rp {totalPemasukan.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-800">TOTAL SELURUH KREDIT (KELUAR)</span>
                  <span className="text-base font-black font-mono text-rose-900 mt-1">
                    Rp {totalPengeluaran.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${saldoBersih >= 0 ? 'bg-sky-50/50 border-sky-200 text-sky-950' : 'bg-amber-50/50 border-amber-200 text-amber-950'}`}>
                  <span className="text-[10px] uppercase font-black tracking-wider">SALDO BERSIH PERIODE FILTER</span>
                  <span className="text-base font-black font-mono mt-1">
                    {saldoBersih < 0 ? '-' : ''} Rp {Math.abs(saldoBersih).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 gap-12 text-center pt-8 border-t border-dashed border-slate-250 text-xs font-sans text-slate-800">
                <div className="space-y-16">
                  <p className="font-semibold text-slate-600">Disiapkan Oleh (Bendahara RT):</p>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900 underline text-sm">{bendaharaName}</p>
                    <p className="text-[10px] text-slate-500">Staf Keuangan & Pembukuan RT</p>
                  </div>
                </div>
                <div className="space-y-16">
                  <p className="font-semibold text-slate-600">Mengetahui & Menyetujui (Ketua RT.008):</p>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-905 underline text-sm">{adminName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Ketua RT.008 RW.004 PERUMTAS 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
