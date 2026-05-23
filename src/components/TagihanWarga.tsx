import React, { useState } from 'react';
import { WargaBill, Balance, LedgerEntry, RombongBill, AppUser } from '../types';
import { 
  Search, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Home, 
  Filter, 
  Coins, 
  Trash2,
  X,
  MessageSquare,
  Send,
  ExternalLink,
  Edit2,
  Store,
  Users,
  BookOpen,
  Calendar,
  Settings,
  Printer,
  Copy
} from 'lucide-react';

interface TagihanWargaProps {
  wargaList: WargaBill[];
  updateWargaList: (newList: WargaBill[]) => void;
  rombongList: RombongBill[];
  updateRombongList: (newList: RombongBill[]) => void;
  kas: Balance;
  updateKas: (newKas: Balance) => void;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id'>) => void;
  isLoggedIn: boolean;
  ledger?: LedgerEntry[];
  currentUser?: AppUser | null;
  usersList?: AppUser[];
  blocksList?: string[];
  updateBlocksList?: (newBlocks: string[]) => void;
  yearsList?: number[];
  updateYearsList?: (newYears: number[]) => void;
}

export default function TagihanWarga({ 
  wargaList, 
  updateWargaList, 
  rombongList,
  updateRombongList,
  kas, 
  updateKas, 
  addLedgerEntry, 
  isLoggedIn,
  ledger = [],
  currentUser = null,
  usersList = [],
  blocksList = ['A4', 'A3', 'C5', 'C3'],
  updateBlocksList,
  yearsList = [2024, 2025, 2026, 2027],
  updateYearsList
}: TagihanWargaProps) {
  // Helpers for dynamic greetings/signatures
  const cleanSignatureName = (nama: string) => {
    return nama.replace(/\s*\(.*\)\s*/g, '').trim();
  };

  const formatGreetingName = (name: string, defaultSalutation = 'Bapak') => {
    if (/^(bapak|bp\.|ibu|mas|mbak|pak|bu)\s/i.test(name)) {
      return name;
    }
    return `${defaultSalutation} ${name}`;
  };

  const adminUser = usersList.find(u => u.role === 'admin');
  const bendaharaUser = usersList.find(u => u.role === 'bendahara');

  const adminNameFormatted = adminUser ? formatGreetingName(cleanSignatureName(adminUser.nama), 'Bapak') : 'Bapak Sutriadi';
  const bendaharaNameFormatted = bendaharaUser ? formatGreetingName(cleanSignatureName(bendaharaUser.nama), 'Bapak') : 'Bapak Heri';

  // Sub-tab selection: 'warga' (resident) or 'rombong' (food stalls)
  const [activeSubTab, setActiveSubTab] = useState<'warga' | 'rombong'>('warga');

  // Filters & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua'); // Semua, Lunas, Belum Lunas
  const [selectedBillingYear, setSelectedBillingYear] = useState<number>(2026);

  // Block management state
  const [showBlockManageModal, setShowBlockManageModal] = useState(false);
  const [showPrintBillingModal, setShowPrintBillingModal] = useState(false);
  const [printFormatType, setPrintFormatType] = useState<'table' | 'whatsapp'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newBlockInput, setNewBlockInput] = useState('');
  const [newYearInput, setNewYearInput] = useState('');

  // Warga Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWarga, setNewWarga] = useState({
    nama: '',
    blok: 'A4',
    noRumah: '',
    noWa: '',
  });

  // Rombong Form states
  const [showAddRombongModal, setShowAddRombongModal] = useState(false);
  const [newRombong, setNewRombong] = useState({
    namaPemilik: '',
    lokasi: '',
    noLapak: '',
    noWa: '',
  });

  // Edit states for admins
  const [editingWarga, setEditingWarga] = useState<WargaBill | null>(null);
  const [editingRombong, setEditingRombong] = useState<RombongBill | null>(null);

  // Warga Payment confirmation state (with year)
  const [payingInfo, setPayingInfo] = useState<{
    warga: WargaBill;
    category: 'Iuran RT';
    bulan: string;
    nominal: number;
    billingType: 'iuranRT';
    tahun: number;
  } | null>(null);

  // Rombong Payment confirmation state (with year)
  const [payingRombongInfo, setPayingRombongInfo] = useState<{
    rombong: RombongBill;
    category: 'Iuran Rombong';
    bulan: string;
    nominal: number;
    billingType: 'iuranRombong';
    tahun: number;
  } | null>(null);

  const [paymentTargetKas, setPaymentTargetKas] = useState<keyof Balance>('rtTunai');
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paymentTime, setPaymentTime] = useState<string>(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  const [corrPaymentDate, setCorrPaymentDate] = useState<string>('');
  const [corrPaymentTime, setCorrPaymentTime] = useState<string>('');

  // Warga Correction Modal states
  const [correctionWargaInfo, setCorrectionWargaInfo] = useState<{
    warga: WargaBill;
    billingType: 'iuranRT';
    bulan: string;
    nominal: number;
    tahun: number;
  } | null>(null);

  const [corrStatusLunas, setCorrStatusLunas] = useState<boolean>(true);
  const [corrNominal, setCorrNominal] = useState<number>(110000);
  const [corrTahun, setCorrTahun] = useState<number>(2026);
  const [corrTransferTargetWargaId, setCorrTransferTargetWargaId] = useState<string>('');
  const [corrTargetKas, setCorrTargetKas] = useState<keyof Balance>('rtBank');

  // Rombong Correction Modal states
  const [correctionRombongInfo, setCorrectionRombongInfo] = useState<{
    rombong: RombongBill;
    billingType: 'iuranRombong';
    bulan: string;
    nominal: number;
    tahun: number;
  } | null>(null);

  const [corrRombongStatusLunas, setCorrRombongStatusLunas] = useState<boolean>(true);
  const [corrRombongNominal, setCorrRombongNominal] = useState<number>(130000);
  const [corrRombongTahun, setCorrRombongTahun] = useState<number>(2026);
  const [corrTransferTargetRombongId, setCorrTransferTargetRombongId] = useState<string>('');
  const [corrRombongTargetKas, setCorrRombongTargetKas] = useState<keyof Balance>('rombongBank');

  // WhatsApp Billing popup state
  const [selectedWargaForWhatsApp, setSelectedWargaForWhatsApp] = useState<WargaBill | null>(null);
  const [selectedRombongForWhatsApp, setSelectedRombongForWhatsApp] = useState<RombongBill | null>(null);
  const [targetPhone, setTargetPhone] = useState('');

  // Annual Registry check states
  const [selectedWargaHistory, setSelectedWargaHistory] = useState<WargaBill | null>(null);
  const [selectedRombongHistory, setSelectedRombongHistory] = useState<RombongBill | null>(null);
  const [historyYear, setHistoryYear] = useState<number>(2026);

  const fullMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const isCitizenTx = (entry: LedgerEntry, citizenName: string, block: string, noRumah: string) => {
    const desc = entry.deskripsi.toLowerCase();
    const name = citizenName.toLowerCase();
    const sub = `blok ${block}-${noRumah}`.toLowerCase();
    const subWithSpace = `blok ${block} - ${noRumah}`.toLowerCase();
    const subSimple = `${block}-${noRumah}`.toLowerCase();
    
    return (
      desc.includes(name) || 
      desc.includes(sub) || 
      desc.includes(subWithSpace) || 
      desc.includes(subSimple)
    );
  };

  const filterLedgerForWarga = (citizen: WargaBill, targetYear: number) => {
    return ledger.filter(entry => {
      const matchesResident = isCitizenTx(entry, citizen.nama, citizen.blok, citizen.noRumah);
      const txYear = new Date(entry.tanggal).getFullYear();
      return matchesResident && txYear === targetYear;
    });
  };

  const filterLedgerForRombong = (rtLapak: RombongBill, targetYear: number) => {
    return ledger.filter(entry => {
      const desc = entry.deskripsi.toLowerCase();
      const owner = rtLapak.namaPemilik.toLowerCase();
      const cleanOwner = owner.split('(')[0].trim();
      const lapakNo = rtLapak.noLapak.toLowerCase();
      
      const matchesOwner = desc.includes(owner) || desc.includes(cleanOwner) || desc.includes(lapakNo);
      const txYear = new Date(entry.tanggal).getFullYear();
      return matchesOwner && txYear === targetYear;
    });
  };

  // Warga operations
  const handleAddWarga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarga.nama || !newWarga.noRumah) return;

    const months = ['Maret', 'April', 'Mei'];
    const created: WargaBill = {
      id: `warga-${Date.now()}`,
      nama: newWarga.nama,
      blok: newWarga.blok,
      noRumah: newWarga.noRumah,
      noWa: newWarga.noWa.trim(),
      iuranRT: months.map(m => ({ bulan: m, lunas: false, nominal: 110000 })),
    };

    updateWargaList([...wargaList, created]);
    setShowAddModal(false);
    setNewWarga({ nama: '', blok: 'A4', noRumah: '', noWa: '' });

    // Log addition to ledger
    addLedgerEntry({
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: `Pendaftaran Warga Baru: ${created.nama} (Blok ${created.blok}-${created.noRumah})`,
      jumlah: 0,
      tipe: 'pemasukan',
      sumberKas: 'rtTunai',
      kategori: 'Administrasi Warga',
      petugas: currentUser?.nama.split(' ')[0] || 'Admin'
    });
  };

  const handleEditWargaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarga) return;

    const updated = wargaList.map(w => {
      if (w.id === editingWarga.id) {
        return {
          ...w,
          nama: editingWarga.nama,
          blok: editingWarga.blok,
          noRumah: editingWarga.noRumah,
          noWa: editingWarga.noWa?.trim()
        };
      }
      return w;
    });

    updateWargaList(updated);
    setEditingWarga(null);

    // Log edit to ledger
    addLedgerEntry({
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: `Modifikasi Data Warga: ${editingWarga.nama} (Blok ${editingWarga.blok}-${editingWarga.noRumah})`,
      jumlah: 0,
      tipe: 'pemasukan',
      sumberKas: 'rtTunai',
      kategori: 'Administrasi Warga',
      petugas: currentUser?.nama.split(' ')[0] || 'Admin'
    });
  };

  const handleDeleteWarga = (id: string, nama: string) => {
    if (!isLoggedIn || currentUser?.role !== 'admin') return;
    if (confirm(`Apakah Anda yakin ingin menghapus warga "${nama}" dari database?`)) {
      updateWargaList(wargaList.filter(w => w.id !== id));
    }
  };

  // Rombong operations
  const handleAddRombong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRombong.namaPemilik || !newRombong.noLapak) return;

    const months = ['Maret', 'April', 'Mei'];
    const created: RombongBill = {
      id: `rombong-${Date.now()}`,
      namaPemilik: newRombong.namaPemilik,
      lokasi: newRombong.lokasi || 'Samping Lapangan',
      noLapak: newRombong.noLapak,
      noWa: newRombong.noWa.trim(),
      iuranRombong: months.map(m => ({ bulan: m, lunas: false, nominal: 130000 })),
    };

    updateRombongList([...rombongList, created]);
    setShowAddRombongModal(false);
    setNewRombong({ namaPemilik: '', lokasi: '', noLapak: '', noWa: '' });

    // Log addition to ledger
    addLedgerEntry({
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: `Pendaftaran Rombong Baru: ${created.namaPemilik} (${created.noLapak})`,
      jumlah: 0,
      tipe: 'pemasukan',
      sumberKas: 'rombongTunai',
      kategori: 'Administrasi Rombong',
      petugas: currentUser?.nama.split(' ')[0] || 'Admin'
    });
  };

  const handleEditRombongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRombong) return;

    const updated = rombongList.map(r => {
      if (r.id === editingRombong.id) {
        return {
          ...r,
          namaPemilik: editingRombong.namaPemilik,
          lokasi: editingRombong.lokasi,
          noLapak: editingRombong.noLapak,
          noWa: editingRombong.noWa?.trim()
        };
      }
      return r;
    });

    updateRombongList(updated);
    setEditingRombong(null);

    // Log edit to ledger
    addLedgerEntry({
      tanggal: new Date().toISOString().split('T')[0],
      deskripsi: `Modifikasi Data Rombong: ${editingRombong.namaPemilik} (${editingRombong.noLapak})`,
      jumlah: 0,
      tipe: 'pemasukan',
      sumberKas: 'rombongTunai',
      kategori: 'Administrasi Rombong',
      petugas: currentUser?.nama.split(' ')[0] || 'Admin'
    });
  };

  const handleDeleteRombong = (id: string, nama: string) => {
    if (!isLoggedIn || currentUser?.role !== 'admin') return;
    if (confirm(`Apakah Anda yakin ingin menghapus rombong kuliner "${nama}" dari database?`)) {
      updateRombongList(rombongList.filter(r => r.id !== id));
    }
  };

  // Payment triggers with year compatibility
  const openPaymentModal = (
    warga: WargaBill, 
    category: 'Iuran RT', 
    bulan: string, 
    nominal: number,
    billingType: 'iuranRT',
    tahun: number = 2026
  ) => {
    if (!isLoggedIn) {
      alert('Anda harus masuk/login sebagai Admin terlebih dahulu untuk mencatat pembayaran.');
      return;
    }
    setPaymentTargetKas('rtBank');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setPaymentTime(`${hh}:${mm}`);
    setPayingInfo({ warga, category, bulan, nominal, billingType, tahun });
  };

  const openRombongPaymentModal = (
    rombong: RombongBill, 
    category: 'Iuran Rombong', 
    bulan: string, 
    nominal: number, 
    billingType: 'iuranRombong',
    tahun: number = 2026
  ) => {
    if (!isLoggedIn) {
      alert('Anda harus masuk/login sebagai Admin terlebih dahulu untuk mencatat pembayaran Rombong.');
      return;
    }
    setPaymentTargetKas('rombongBank');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setPaymentTime(`${hh}:${mm}`);
    setPayingRombongInfo({ rombong, category, bulan, nominal, billingType, tahun });
  };

  const processPayment = () => {
    if (!payingInfo) return;

    const { warga, category, bulan, nominal, billingType, tahun } = payingInfo;

    const updatedWargaList = wargaList.map(w => {
      if (w.id === warga.id) {
        const index = w[billingType].findIndex(b => b.bulan.toLowerCase() === bulan.toLowerCase() && (b.tahun === tahun || (!b.tahun && tahun === 2026)));
        let updatedBillings = [...w[billingType]];
        if (index > -1) {
          updatedBillings = updatedBillings.map(b => {
             if (b.bulan.toLowerCase() === bulan.toLowerCase() && (b.tahun === tahun || (!b.tahun && tahun === 2026))) {
              return { ...b, lunas: true, tanggalBayar: paymentDate, jamBayar: paymentTime };
            }
            return b;
          });
        } else {
          updatedBillings.push({
            bulan: bulan,
            lunas: true,
            nominal: nominal,
            tahun: tahun,
            tanggalBayar: paymentDate,
            jamBayar: paymentTime
          });
        }
        const updatedWarga = { ...w, [billingType]: updatedBillings };
        // Sync our open calendar bookkeeping modal instantly
        if (selectedWargaHistory && selectedWargaHistory.id === warga.id) {
          setSelectedWargaHistory(updatedWarga);
        }
        return updatedWarga;
      }
      return w;
    });

    updateWargaList(updatedWargaList);

    const nextKas = { ...kas };
    nextKas[paymentTargetKas] += nominal;
    updateKas(nextKas);

    addLedgerEntry({
      tanggal: paymentDate,
      deskripsi: `${category} Bulan ${bulan} ${tahun} - ${warga.nama} (Blok ${warga.blok}-${warga.noRumah})`,
      jumlah: nominal,
      tipe: 'pemasukan',
      sumberKas: paymentTargetKas,
      kategori: category,
      petugas: 'Petugas RT'
    });

    setPayingInfo(null);
  };

  const processRombongPayment = () => {
    if (!payingRombongInfo) return;

    const { rombong, category, bulan, nominal, billingType, tahun } = payingRombongInfo;

    const updatedRombongList = rombongList.map(r => {
      if (r.id === rombong.id) {
        const index = r[billingType].findIndex(b => b.bulan.toLowerCase() === bulan.toLowerCase() && (b.tahun === tahun || (!b.tahun && tahun === 2026)));
        let updatedBillings = [...r[billingType]];
        if (index > -1) {
          updatedBillings = updatedBillings.map(b => {
            if (b.bulan.toLowerCase() === bulan.toLowerCase() && (b.tahun === tahun || (!b.tahun && tahun === 2026))) {
              return { ...b, lunas: true, tanggalBayar: paymentDate, jamBayar: paymentTime };
            }
            return b;
          });
        } else {
          updatedBillings.push({
            bulan: bulan,
            lunas: true,
            nominal: nominal,
            tahun: tahun,
            tanggalBayar: paymentDate,
            jamBayar: paymentTime
          });
        }
        const updatedRombong = { ...r, [billingType]: updatedBillings };
        // Sync our open calendar bookkeeping modal instantly
        if (selectedRombongHistory && selectedRombongHistory.id === rombong.id) {
          setSelectedRombongHistory(updatedRombong);
        }
        return updatedRombong;
      }
      return r;
    });

    updateRombongList(updatedRombongList);

    const nextKas = { ...kas };
    nextKas[paymentTargetKas] += nominal;
    updateKas(nextKas);

    addLedgerEntry({
      tanggal: paymentDate,
      deskripsi: `${category} Bulan ${bulan} ${tahun} - ${rombong.namaPemilik} (${rombong.noLapak})`,
      jumlah: nominal,
      tipe: 'pemasukan',
      sumberKas: paymentTargetKas,
      kategori: 'Pendapatan Rombong',
      petugas: 'Petugas RT'
    });

    setPayingRombongInfo(null);
  };

  // Correction Triggers & Actions
  const openCorrectionModal = (
    warga: WargaBill,
    category: 'Iuran RT',
    bulan: string,
    nominal: number,
    billingType: 'iuranRT',
    tahun: number
  ) => {
    const slot = warga.iuranRT.find(b => 
      b.bulan.toLowerCase() === bulan.toLowerCase() && 
      (b.tahun === tahun || (!b.tahun && tahun === 2026))
    );
    const existingDate = slot?.tanggalBayar || new Date().toISOString().split('T')[0];
    const existingTime = slot?.jamBayar || (() => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    })();
    setCorrPaymentDate(existingDate);
    setCorrPaymentTime(existingTime);

    setCorrectionWargaInfo({ warga, billingType, bulan, nominal, tahun });
    setCorrStatusLunas(slot ? slot.lunas : true);
    setCorrNominal(nominal);
    setCorrTahun(tahun);
    setCorrTransferTargetWargaId('');
    setCorrTargetKas('rtBank');
  };

  const openRombongCorrectionModal = (
    rombong: RombongBill,
    category: 'Iuran Rombong',
    bulan: string,
    nominal: number,
    billingType: 'iuranRombong',
    tahun: number
  ) => {
    const slot = rombong.iuranRombong.find(b => 
      b.bulan.toLowerCase() === bulan.toLowerCase() && 
      (b.tahun === tahun || (!b.tahun && tahun === 2026))
    );
    const existingDate = slot?.tanggalBayar || new Date().toISOString().split('T')[0];
    const existingTime = slot?.jamBayar || (() => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    })();
    setCorrPaymentDate(existingDate);
    setCorrPaymentTime(existingTime);

    setCorrectionRombongInfo({ rombong, billingType, bulan, nominal, tahun });
    setCorrRombongStatusLunas(slot ? slot.lunas : true);
    setCorrRombongNominal(nominal);
    setCorrRombongTahun(tahun);
    setCorrTransferTargetRombongId('');
    setCorrRombongTargetKas('rombongBank');
  };

  const saveCorrection = () => {
    if (!correctionWargaInfo) return;

    const { warga, billingType, bulan, nominal: initialNominal, tahun: initialTahun } = correctionWargaInfo;

    // 1. Correct "Wrong Ticked Warga" by moving payment to another person
    if (corrTransferTargetWargaId) {
      const targetWarga = wargaList.find(w => w.id === corrTransferTargetWargaId);
      if (!targetWarga) return;

      const updatedWargaList = wargaList.map(w => {
        // Revert source citizen billing slot
        if (w.id === warga.id) {
          const updatedBillings = w[billingType].map(b => {
            const isMatch = b.bulan.toLowerCase() === bulan.toLowerCase() && 
                            (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026));
            if (isMatch) {
              return { ...b, lunas: false, tanggalBayar: undefined, jamBayar: undefined };
            }
            return b;
          });
          const updated = { ...w, [billingType]: updatedBillings };
          if (selectedWargaHistory && selectedWargaHistory.id === warga.id) {
            setSelectedWargaHistory(updated);
          }
          return updated;
        }

        // Apply to target citizen billing slot
        if (w.id === corrTransferTargetWargaId) {
          const index = w[billingType].findIndex(b => 
            b.bulan.toLowerCase() === bulan.toLowerCase() && 
            (b.tahun === corrTahun || (!b.tahun && corrTahun === 2026))
          );
          let updatedBillings = [...w[billingType]];
          if (index > -1) {
            updatedBillings = updatedBillings.map(b => {
              if (b.bulan.toLowerCase() === bulan.toLowerCase() && (b.tahun === corrTahun || (!b.tahun && corrTahun === 2026))) {
                return { ...b, lunas: true, nominal: corrNominal, tanggalBayar: corrPaymentDate, jamBayar: corrPaymentTime };
              }
              return b;
            });
          } else {
            updatedBillings.push({
              bulan: bulan,
              lunas: true,
              nominal: corrNominal,
              tahun: corrTahun,
              tanggalBayar: corrPaymentDate,
              jamBayar: corrPaymentTime
            });
          }
          return { ...w, [billingType]: updatedBillings };
        }

        return w;
      });

      updateWargaList(updatedWargaList);

      addLedgerEntry({
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: `Koreksi Transfer Iuran RT Bulan ${bulan} ${corrTahun}: Dari ${warga.nama} ke ${targetWarga.nama} (Blok ${targetWarga.blok}-${targetWarga.noRumah})`,
        jumlah: corrNominal - initialNominal,
        tipe: 'pemasukan',
        sumberKas: corrTargetKas,
        kategori: 'Koreksi Data',
        petugas: currentUser?.nama ? cleanSignatureName(currentUser.nama) : 'Sutriadi (Admin)'
      });

      if (corrNominal !== initialNominal) {
        const nextKas = { ...kas };
        nextKas[corrTargetKas] += (corrNominal - initialNominal);
        updateKas(nextKas);
      }

      alert(`Sukses: Pencatatan iuran berhasil dipindahkan ke ${targetWarga.nama} (Blok ${targetWarga.blok}-${targetWarga.noRumah}).`);
      setCorrectionWargaInfo(null);
      return;
    }

    // 2. Adjusting status, year/period, or nominal for the same citizen
    const updatedWargaList = wargaList.map(w => {
      if (w.id === warga.id) {
        const index = w[billingType].findIndex(b => 
          b.bulan.toLowerCase() === bulan.toLowerCase() && 
          (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026))
        );
        let updatedBillings = [...w[billingType]];
        
        if (corrStatusLunas) {
          if (index > -1) {
            updatedBillings = updatedBillings.map(b => {
              const isMatch = b.bulan.toLowerCase() === bulan.toLowerCase() && 
                              (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026));
              if (isMatch) {
                return { ...b, lunas: true, nominal: corrNominal, tahun: corrTahun, tanggalBayar: corrPaymentDate, jamBayar: corrPaymentTime };
              }
              return b;
            });
          } else {
            updatedBillings.push({
              bulan: bulan,
              lunas: true,
              nominal: corrNominal,
              tahun: corrTahun,
              tanggalBayar: corrPaymentDate,
              jamBayar: corrPaymentTime
            });
          }
        } else {
          // Unmark / change to unpaid
          if (index > -1) {
            updatedBillings = updatedBillings.map(b => {
              const isMatch = b.bulan.toLowerCase() === bulan.toLowerCase() && 
                              (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026));
              if (isMatch) {
                return { ...b, lunas: false, tanggalBayar: undefined, jamBayar: undefined };
              }
              return b;
            });
          }
        }

        const updated = { ...w, [billingType]: updatedBillings };
        if (selectedWargaHistory && selectedWargaHistory.id === warga.id) {
          setSelectedWargaHistory(updated);
        }
        return updated;
      }
      return w;
    });

    updateWargaList(updatedWargaList);

    if (!corrStatusLunas) {
      // Revert initial nominal
      const nextKas = { ...kas };
      nextKas[corrTargetKas] -= initialNominal;
      updateKas(nextKas);

      addLedgerEntry({
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: `Koreksi Batalkan Iuran RT Bulan ${bulan} ${initialTahun} - Warga ${warga.nama}`,
        jumlah: -initialNominal,
        tipe: 'pengeluaran',
        sumberKas: corrTargetKas,
        kategori: 'Koreksi Data',
        petugas: currentUser?.nama ? cleanSignatureName(currentUser.nama) : 'Sutriadi (Admin)'
      });
    } else {
      // Adjustment Difference
      const diff = corrNominal - initialNominal;
      if (diff !== 0 || corrTahun !== initialTahun) {
        const nextKas = { ...kas };
        nextKas[corrTargetKas] += diff;
        updateKas(nextKas);

        addLedgerEntry({
          tanggal: new Date().toISOString().split('T')[0],
          deskripsi: `Koreksi Edit Iuran RT Bulan ${bulan} ${corrTahun} - Warga ${warga.nama} (Penyesuaian Data)`,
          jumlah: diff,
          tipe: 'pemasukan',
          sumberKas: corrTargetKas,
          kategori: 'Koreksi Data',
          petugas: currentUser?.nama ? cleanSignatureName(currentUser.nama) : 'Sutriadi (Admin)'
        });
      }
    }

    alert('Koreksi data iuran berhasil disimpan.');
    setCorrectionWargaInfo(null);
  };

  const saveRombongCorrection = () => {
    if (!correctionRombongInfo) return;

    const { rombong, billingType, bulan, nominal: initialNominal, tahun: initialTahun } = correctionRombongInfo;

    // 1. Move to another merchant / stall (correction)
    if (corrTransferTargetRombongId) {
      const targetRombong = rombongList.find(r => r.id === corrTransferTargetRombongId);
      if (!targetRombong) return;

      const updatedRombongList = rombongList.map(r => {
        // Revert source stall
        if (r.id === rombong.id) {
          const updatedBillings = r[billingType].map(b => {
            const isMatch = b.bulan.toLowerCase() === bulan.toLowerCase() && 
                            (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026));
            if (isMatch) {
              return { ...b, lunas: false, tanggalBayar: undefined, jamBayar: undefined };
            }
            return b;
          });
          const updated = { ...r, [billingType]: updatedBillings };
          if (selectedRombongHistory && selectedRombongHistory.id === rombong.id) {
            setSelectedRombongHistory(updated);
          }
          return updated;
        }

        // Apply to target stall
        if (r.id === corrTransferTargetRombongId) {
          const index = r[billingType].findIndex(b => 
            b.bulan.toLowerCase() === bulan.toLowerCase() && 
            (b.tahun === corrRombongTahun || (!b.tahun && corrRombongTahun === 2026))
          );
          let updatedBillings = [...r[billingType]];
          if (index > -1) {
            updatedBillings = updatedBillings.map(b => {
              if (b.bulan.toLowerCase() === bulan.toLowerCase() && (b.tahun === corrRombongTahun || (!b.tahun && corrRombongTahun === 2026))) {
                return { ...b, lunas: true, nominal: corrRombongNominal, tanggalBayar: corrPaymentDate, jamBayar: corrPaymentTime };
              }
              return b;
            });
          } else {
            updatedBillings.push({
              bulan: bulan,
              lunas: true,
              nominal: corrRombongNominal,
              tahun: corrRombongTahun,
              tanggalBayar: corrPaymentDate,
              jamBayar: corrPaymentTime
            });
          }
          return { ...r, [billingType]: updatedBillings };
        }

        return r;
      });

      updateRombongList(updatedRombongList);

      addLedgerEntry({
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: `Koreksi Transfer Lapak Rombong Bulan ${bulan} ${corrRombongTahun}: Dari ${rombong.namaPemilik} ke ${targetRombong.namaPemilik}`,
        jumlah: corrRombongNominal - initialNominal,
        tipe: 'pemasukan',
        sumberKas: corrRombongTargetKas,
        kategori: 'Koreksi Data',
        petugas: currentUser?.nama ? cleanSignatureName(currentUser.nama) : 'Sutriadi (Admin)'
      });

      if (corrRombongNominal !== initialNominal) {
        const nextKas = { ...kas };
        nextKas[corrRombongTargetKas] += (corrRombongNominal - initialNominal);
        updateKas(nextKas);
      }

      alert(`Sukses: Pencatatan sewa/lapak berhasil dipindahkan ke lapak ${targetRombong.namaPemilik} (${targetRombong.noLapak}).`);
      setCorrectionRombongInfo(null);
      return;
    }

    // 2. Adjusting status, periods, or nominals for the same merchant
    const updatedRombongList = rombongList.map(r => {
      if (r.id === rombong.id) {
        const index = r[billingType].findIndex(b => 
          b.bulan.toLowerCase() === bulan.toLowerCase() && 
          (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026))
        );
        let updatedBillings = [...r[billingType]];

        if (corrRombongStatusLunas) {
          if (index > -1) {
            updatedBillings = updatedBillings.map(b => {
              const isMatch = b.bulan.toLowerCase() === bulan.toLowerCase() && 
                              (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026));
              if (isMatch) {
                return { ...b, lunas: true, nominal: corrRombongNominal, tahun: corrRombongTahun, tanggalBayar: corrPaymentDate, jamBayar: corrPaymentTime };
              }
              return b;
            });
          } else {
            updatedBillings.push({
              bulan: bulan,
              lunas: true,
              nominal: corrRombongNominal,
              tahun: corrRombongTahun,
              tanggalBayar: corrPaymentDate,
              jamBayar: corrPaymentTime
            });
          }
        } else {
          if (index > -1) {
            updatedBillings = updatedBillings.map(b => {
              const isMatch = b.bulan.toLowerCase() === bulan.toLowerCase() && 
                              (b.tahun === initialTahun || (!b.tahun && initialTahun === 2026));
              if (isMatch) {
                return { ...b, lunas: false, tanggalBayar: undefined, jamBayar: undefined };
              }
              return b;
            });
          }
        }

        const updated = { ...r, [billingType]: updatedBillings };
        if (selectedRombongHistory && selectedRombongHistory.id === rombong.id) {
          setSelectedRombongHistory(updated);
        }
        return updated;
      }
      return r;
    });

    updateRombongList(updatedRombongList);

    if (!corrRombongStatusLunas) {
      const nextKas = { ...kas };
      nextKas[corrRombongTargetKas] -= initialNominal;
      updateKas(nextKas);

      addLedgerEntry({
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: `Koreksi Batalkan Sewa Rombong Bulan ${bulan} ${initialTahun} - ${rombong.namaPemilik}`,
        jumlah: -initialNominal,
        tipe: 'pengeluaran',
        sumberKas: corrRombongTargetKas,
        kategori: 'Koreksi Data',
        petugas: currentUser?.nama ? cleanSignatureName(currentUser.nama) : 'Sutriadi (Admin)'
      });
    } else {
      const diff = corrRombongNominal - initialNominal;
      if (diff !== 0 || corrRombongTahun !== initialTahun) {
        const nextKas = { ...kas };
        nextKas[corrRombongTargetKas] += diff;
        updateKas(nextKas);

        addLedgerEntry({
          tanggal: new Date().toISOString().split('T')[0],
          deskripsi: `Koreksi Edit Sewa Rombong Bulan ${bulan} ${corrRombongTahun} - ${rombong.namaPemilik} (Penyesuaian Data)`,
          jumlah: diff,
          tipe: 'pemasukan',
          sumberKas: corrRombongTargetKas,
          kategori: 'Koreksi Data',
          petugas: currentUser?.nama ? cleanSignatureName(currentUser.nama) : 'Sutriadi (Admin)'
        });
      }
    }

    alert('Koreksi data sewa berhasil disimpan.');
    setCorrectionRombongInfo(null);
  };

  // Filter systems
  const filteredWarga = wargaList.filter(w => {
    const matchesSearch = w.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          `${w.blok}-${w.noRumah}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = selectedBlock === 'Semua' || w.blok === selectedBlock;
    
    if (selectedStatus === 'Semua') {
      return matchesSearch && matchesBlock;
    }

    const defaultMonths = ['Maret', 'April', 'Mei'];
    const hasOutstanding = defaultMonths.some(m => {
      const slot = w.iuranRT.find(b => 
        b.bulan.toLowerCase() === m.toLowerCase() && 
        (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026))
      );
      return !slot || !slot.lunas;
    });

    if (selectedStatus === 'Lunas') {
      return matchesSearch && matchesBlock && !hasOutstanding;
    } else {
      return matchesSearch && matchesBlock && hasOutstanding;
    }
  });

  const filteredRombong = rombongList.filter(r => {
    const matchesSearch = r.namaPemilik.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.noLapak.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedStatus === 'Semua') {
      return matchesSearch;
    }

    const defaultMonths = ['Maret', 'April', 'Mei'];
    const hasOutstanding = defaultMonths.some(m => {
      const slot = r.iuranRombong.find(b => 
        b.bulan.toLowerCase() === m.toLowerCase() && 
        (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026))
      );
      return !slot || !slot.lunas;
    });

    if (selectedStatus === 'Lunas') {
      return matchesSearch && !hasOutstanding;
    } else {
      return matchesSearch && hasOutstanding;
    }
  });

  // Analytics calculation
  const totalWargaCount = wargaList.length;
  const totalRombongCount = rombongList.length;

  const outstandingWargaBillsCount = wargaList.reduce((acc, w) => {
    const unRT = w.iuranRT.filter(b => !b.lunas).length;
    return acc + unRT;
  }, 0);

  const outstandingRombongBillsCount = rombongList.reduce((acc, r) => {
    const unRombong = r.iuranRombong.filter(b => !b.lunas).length;
    return acc + unRombong;
  }, 0);

  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          fallbackCopyText(text, id);
        });
    } else {
      fallbackCopyText(text, id);
    }
  };

  const fallbackCopyText = (text: string, id: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  // WhatsApp annual payment history book formatter for citizen
  const getWhatsAppHistoryMessageText = (warga: WargaBill, targetYear: number) => {
    let message = `*BUKU CATATAN TAGIHAN TAHUNAN RT 08 PERUMTAS 3*\n`;
    message += `Tahun Buku: *${targetYear}*\n`;
    message += `Nama Warga: *${warga.nama}*\n`;
    message += `Alamat: *Blok ${warga.blok} No. ${warga.noRumah}*\n\n`;
    message += `*Rincian Status Pembayaran Iuran RT (Jan - Des):*\n`;
    
    fullMonths.forEach((m, idx) => {
      const shortM = m.slice(0, 3);
      const slot = warga.iuranRT.find(b => 
        (b.tahun === targetYear || (!b.tahun && targetYear === 2026)) &&
        (b.bulan.toLowerCase() === m.toLowerCase() || b.bulan.toLowerCase() === shortM.toLowerCase())
      );
      
      if (slot && slot.lunas) {
        const timeStr = slot.tanggalBayar ? ` (Tgl: ${slot.tanggalBayar}${slot.jamBayar ? ` ${slot.jamBayar}` : ''})` : '';
        message += `${idx + 1}. *${m}*: Lunas - Rp ${slot.nominal.toLocaleString('id-ID')}${timeStr} ✓\n`;
      } else {
        message += `${idx + 1}. *${m}*: Belum Bayar (Rp 110.000) ✗\n`;
      }
    });
    
    const totalPaid = warga.iuranRT
      .filter(b => b.lunas && (b.tahun === targetYear || (!b.tahun && targetYear === 2026)))
      .reduce((sum, b) => sum + b.nominal, 0);
    message += `\n*Total Terbayar: Rp ${totalPaid.toLocaleString('id-ID')}*\n\n`;
    message += `Dicetak otomatis real-time dari Sistem Pembukuan Digital RT 08 Perumtas 3. ✨\n`;
    message += `Keamanan, Kemudahan, dan Keterbukaan RT 08 Perumtas 3. 🙏`;
    return message;
  };

  // WhatsApp annual payment history book formatter for rombong
  const getWhatsAppRombongHistoryMessageText = (rombong: RombongBill, targetYear: number) => {
    let message = `*BUKU CATATAN SEWA LAHAN & ROMBONG RT 08 PERUMTAS 3*\n`;
    message += `Tahun Buku: *${targetYear}*\n`;
    message += `Pemilik Lapak: *${rombong.namaPemilik}*\n`;
    message += `No. Lapak: *${rombong.noLapak} (${rombong.lokasi})*\n\n`;
    message += `*Rincian Status Pembayaran Sewa (Jan - Des):*\n`;
    
    fullMonths.forEach((m, idx) => {
      const shortM = m.slice(0, 3);
      const slot = rombong.iuranRombong.find(b => 
        (b.tahun === targetYear || (!b.tahun && targetYear === 2026)) &&
        (b.bulan.toLowerCase() === m.toLowerCase() || b.bulan.toLowerCase() === shortM.toLowerCase())
      );
      
      if (slot && slot.lunas) {
        const timeStr = slot.tanggalBayar ? ` (Tgl: ${slot.tanggalBayar}${slot.jamBayar ? ` ${slot.jamBayar}` : ''})` : '';
        message += `${idx + 1}. *${m}*: Lunas - Rp ${slot.nominal.toLocaleString('id-ID')}${timeStr} ✓\n`;
      } else {
        message += `${idx + 1}. *${m}*: Belum Bayar (Rp 130.000) ✗\n`;
      }
    });
    
    const totalPaid = rombong.iuranRombong
      .filter(b => b.lunas && (b.tahun === targetYear || (!b.tahun && targetYear === 2026)))
      .reduce((sum, b) => sum + b.nominal, 0);
    message += `\n*Total Terbayar: Rp ${totalPaid.toLocaleString('id-ID')}*\n\n`;
    message += `Dicetak otomatis real-time dari Sistem Pembukuan Digital RT 08 Perumtas 3. ✨\n`;
    message += `Terima kasih banyak atas kerjasamanya demi kemajuan lingkungan RT 08. 🙏`;
    return message;
  };

  // WhatsApp helper for warga
  const getWhatsAppMessageText = (warga: WargaBill) => {
    const defaultMonths = ['Maret', 'April', 'Mei'];
    const unpaidRT: string[] = [];
    defaultMonths.forEach(m => {
      const slot = warga.iuranRT.find(b => 
        b.bulan.toLowerCase() === m.toLowerCase() && 
        (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026))
      );
      if (!slot || !slot.lunas) {
        unpaidRT.push(m);
      }
    });
    
    const unpaidCount = unpaidRT.length;

    let message = `*TAGIHAN IURAN BULANAN RT 08 PERUMTAS 3*\n`;
    message += `Kepada Yth. Bapak/Ibu: *${warga.nama}*\n`;
    message += `Alamat: *Blok ${warga.blok} No. ${warga.noRumah}*\n\n`;

    if (unpaidCount === 0) {
      message += `Selamat! Saat ini Anda *Bebas Tunggakan* untuk tahun *${selectedBillingYear}* (Lunas seluruh iuran). Terima kasih banyak atas partisipasi aktif Bapak/Ibu! 🎉`;
    } else {
      message += `Berikut rincian tunggakan iuran bulanan Anda untuk tahun *${selectedBillingYear}*:\n`;
      let totalTunggakan = 0;

      if (unpaidRT.length > 0) {
        const sub = unpaidRT.length * 110000;
        totalTunggakan += sub;
        message += `• *Iuran RT (${selectedBillingYear})* (Rp 110.000 / bln): ${unpaidRT.join(', ')} (Subtotal: Rp ${sub.toLocaleString('id-ID')})\n`;
      }

      message += `\n*Total Tunggakan: Rp ${totalTunggakan.toLocaleString('id-ID')}*\n\n`;
      message += `Mohon untuk dapat melakukan pembayaran melalui Pengurus RT ${adminNameFormatted} / ${bendaharaNameFormatted}.\n`;
      message += `Terima kasih banyak atas perhatian dan partisipasi Bapak/Ibu demi kenyamanan lingkungan Perumtas 3 RT 08. 🙏`;
    }
    return message;
  };

  const handleOpenWhatsAppLink = (warga: WargaBill) => {
    const rawMsg = getWhatsAppMessageText(warga);
    const cleanedPhone = targetPhone.replace(/\D/g, '');
    let formattedPhone = cleanedPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    const finalUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rawMsg)}`;
    window.open(finalUrl, '_blank');
    setSelectedWargaForWhatsApp(null);
    setTargetPhone('');
  };

  // WhatsApp helper for rombong
  const getWhatsAppRombongMessageText = (rombong: RombongBill) => {
    const defaultMonths = ['Maret', 'April', 'Mei'];
    const unpaidRombong: string[] = [];
    defaultMonths.forEach(m => {
      const slot = rombong.iuranRombong.find(b => 
        b.bulan.toLowerCase() === m.toLowerCase() && 
        (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026))
      );
      if (!slot || !slot.lunas) {
        unpaidRombong.push(m);
      }
    });

    const unpaidCount = unpaidRombong.length;

    let message = `*TAGIHAN KETERTIBAN & SEWA LAHAN ROMBONG RT 08 PERUMTAS 3*\n`;
    message += `Kepada Yth. Bapak/Ibu Pemilik: *${rombong.namaPemilik}*\n`;
    message += `Lapak: *${rombong.noLapak} (${rombong.lokasi})*\n\n`;

    if (unpaidCount === 0) {
      message += `Selamat! Saat ini usaha Anda *Bebas Tunggakan* untuk tahun *${selectedBillingYear}* (Lunas sewa dan iuran). Terima kasih atas kerja samanya! 🎉`;
    } else {
      message += `Berikut rincian tunggakan sewa & iuran untuk rombong kuliner Anda pada tahun *${selectedBillingYear}*:\n`;
      let totalTunggakan = 0;

      if (unpaidRombong.length > 0) {
        const sub = unpaidRombong.length * 130000;
        totalTunggakan += sub;
        message += `• *Iuran Rombong (${selectedBillingYear})* (Rp 130.000 / bln): ${unpaidRombong.join(', ')} (Subtotal: Rp ${sub.toLocaleString('id-ID')})\n`;
      }

      message += `\n*Total Tunggakan: Rp ${totalTunggakan.toLocaleString('id-ID')}*\n\n`;
      message += `Mohon pembayaran dapat dikoordinasikan dengan Pengurus RT ${adminNameFormatted} / ${bendaharaNameFormatted}.\n`;
      message += `Sukses selalu untuk usahanya! Terima kasih banyak atas kerjasamanya. 🙏`;
    }
    return message;
  };

  const handleOpenWhatsAppRombongLink = (rombong: RombongBill) => {
    const rawMsg = getWhatsAppRombongMessageText(rombong);
    const cleanedPhone = targetPhone.replace(/\D/g, '');
    let formattedPhone = cleanedPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    const finalUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rawMsg)}`;
    window.open(finalUrl, '_blank');
    setSelectedRombongForWhatsApp(null);
    setTargetPhone('');
  };

  return (
    <div className="space-y-6">

      {/* Top Selector Panel: Sub-Tabs for Warga vs Rombong */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 animate-in fade-in duration-300">
        <button
          onClick={() => {
            setActiveSubTab('warga');
            setSearchTerm('');
            setSelectedBlock('Semua');
            setSelectedStatus('Semua');
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'warga'
              ? 'bg-white text-sky-600 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          Iuran Bulanan Warga
        </button>
        <button
          onClick={() => {
            setActiveSubTab('rombong');
            setSearchTerm('');
            setSelectedBlock('Semua');
            setSelectedStatus('Semua');
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeSubTab === 'rombong'
              ? 'bg-white text-emerald-600 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
          }`}
        >
          <Store className="w-4.5 h-4.5" />
          Iuran Lapak Rombong
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-350">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-semibold font-mono">
              {activeSubTab === 'warga' ? 'Daftar Warga Terdaftar' : 'Daftar Lapak Terdaftar'}
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {activeSubTab === 'warga' ? `${totalWargaCount} Kepala Keluarga` : `${totalRombongCount} Lapak Rombong`}
            </p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            {activeSubTab === 'warga' ? <Home className="w-5 h-5" /> : <Store className="w-5 h-5" />}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-semibold font-mono">Tagihan Belum Lunas</p>
            <p className="text-xl font-extrabold text-amber-600 mt-1">
              {activeSubTab === 'warga' 
                ? `${outstandingWargaBillsCount} Pos Dues` 
                : `${outstandingRombongBillsCount} Bulan Dues`
              }
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-slate-500 font-semibold font-mono">Sistem Pendataan Dues</p>
            <p className="text-sm font-semibold text-emerald-600 mt-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Sesuai SK RT 08
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Adding */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs animate-in fade-in duration-400">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="flex flex-col md:flex-row gap-3 w-full lg:flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'warga' 
                    ? "Cari warga berdasarkan nama atau blok nomor..." 
                    : "Cari pemilik rombong, nomor lapak, lokasi..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-450"
              />
            </div>

            {/* Block Filter - Only shown for warga */}
            {activeSubTab === 'warga' && (
              <div className="flex gap-2 w-full md:w-56 shrink-0">
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                >
                  <option value="Semua">Blok: Semua</option>
                  {blocksList.map(b => (
                    <option key={b} value={b}>Blok {b}</option>
                  ))}
                </select>
                {isLoggedIn && (
                  <button
                    onClick={() => setShowBlockManageModal(true)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl hover:text-slate-800 transition flex items-center justify-center cursor-pointer active:scale-95 duration-200"
                    title="Kelola & Tambah Blok"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Status Filter */}
            <div className="relative w-full md:w-36">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
              >
                <option value="Semua">Status: Semua</option>
                <option value="Lunas">Bebas Tunggakan</option>
                <option value="Belum Lunas">Ada Tunggakan</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="relative w-full md:w-36">
              <select
                value={selectedBillingYear}
                onChange={(e) => setSelectedBillingYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-extrabold font-mono"
                title="Pilih Tahun Anggaran/Tagihan"
              >
                {yearsList.map(yr => (
                  <option key={yr} value={yr}>Tahun {yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Add triggers for logged in admins & general actions (Print Buku Tagihan) */}
          <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-2.5">
            <button
              onClick={() => setShowPrintBillingModal(true)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold px-4 py-3 rounded-xl transition duration-200 text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 border border-slate-205 w-full md:w-auto active:scale-95"
              title="Cetak format Buku Rekapitulasi Tagihan dan Status Bulanan"
            >
              <Printer className="w-4 h-4 text-sky-600 shrink-0" />
              Cetak Buku Tagihan
            </button>

            {isLoggedIn && currentUser?.role === 'admin' && (
              activeSubTab === 'warga' ? (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-xl transition duration-200 text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/10 w-full md:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Tambah Warga Baru
                </button>
              ) : (
                <button
                  onClick={() => setShowAddRombongModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition duration-200 text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 w-full md:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Tambah Rombong Baru
                </button>
              )
            )}
          </div>

        </div>
      </div>

      {/* Add Resident Form Inline Modal */}
      {showAddModal && (
        <div className="bg-white border-2 border-sky-100 rounded-2xl p-6 shadow-lg relative animate-in fade-in duration-300">
          <button 
            onClick={() => setShowAddModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <h4 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-600" />
            Pendaftaran Keluarga Warga Baru RT 08
          </h4>
          <form onSubmit={handleAddWarga} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Nama Lengkap Kepala Keluarga</label>
              <input 
                required
                type="text"
                placeholder="cth: Bambang Utomo"
                value={newWarga.nama}
                onChange={e => setNewWarga({...newWarga, nama: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Blok Rumah</label>
              <select
                value={newWarga.blok}
                onChange={e => setNewWarga({...newWarga, blok: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold"
              >
                {blocksList.map(b => (
                  <option key={b} value={b}>Blok {b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Nomor Rumah</label>
              <input 
                required
                type="text"
                placeholder="cth: 24, 02A"
                value={newWarga.noRumah}
                onChange={e => setNewWarga({...newWarga, noRumah: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Nomor WhatsApp (Penagihan)</label>
              <input 
                type="text"
                placeholder="cth: 08123456789"
                value={newWarga.noWa}
                onChange={e => setNewWarga({...newWarga, noWa: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-850 text-sm transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-sky-600/10 cursor-pointer"
              >
                Simpan Warga
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Rombong Form Inline Modal */}
      {showAddRombongModal && (
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-lg relative animate-in fade-in duration-300">
          <button 
            onClick={() => setShowAddRombongModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <h4 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            Pendaftaran Lapak Rombong Baru RT 08
          </h4>
          <form onSubmit={handleAddRombong} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Nama Pemilik / Usaha</label>
              <input 
                required
                type="text"
                placeholder="cth: Suryono (Martabak Bangka)"
                value={newRombong.namaPemilik}
                onChange={e => setNewRombong({...newRombong, namaPemilik: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Nomor Lapak</label>
              <input 
                required
                type="text"
                placeholder="cth: Lapak-05, Stand-02"
                value={newRombong.noLapak}
                onChange={e => setNewRombong({...newRombong, noLapak: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Lokasi Rombong</label>
              <input 
                type="text"
                placeholder="cth: Samping Gapura Perumahan"
                value={newRombong.lokasi}
                onChange={e => setNewRombong({...newRombong, lokasi: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">Nomor WhatsApp (Penagihan)</label>
              <input 
                type="text"
                placeholder="cth: 08123456789"
                value={newRombong.noWa}
                onChange={e => setNewRombong({...newRombong, noWa: e.target.value})}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddRombongModal(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-850 text-sm transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-600/10 cursor-pointer"
              >
                Simpan Rombong
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Resident (Warga) Overlay Dialog */}
      {editingWarga && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800">
            <button 
              onClick={() => setEditingWarga(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-sky-600" />
              Edit Informasi Kepala Keluarga (Warga)
            </h4>
            <form onSubmit={handleEditWargaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Nama Lengkap</label>
                <input 
                  required
                  type="text"
                  value={editingWarga.nama}
                  onChange={e => setEditingWarga({...editingWarga, nama: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Blok Rumah</label>
                  <select
                    value={editingWarga.blok}
                    onChange={e => setEditingWarga({...editingWarga, blok: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none font-semibold"
                  >
                    {blocksList.map(b => (
                      <option key={b} value={b}>Blok {b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Nomor Rumah</label>
                  <input 
                    required
                    type="text"
                    value={editingWarga.noRumah}
                    onChange={e => setEditingWarga({...editingWarga, noRumah: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Nomor WhatsApp (Penagihan)</label>
                <input 
                  type="text"
                  value={editingWarga.noWa || ''}
                  placeholder="Format: 08123456789"
                  onChange={e => setEditingWarga({...editingWarga, noWa: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setEditingWarga(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rombong Overlay Dialog */}
      {editingRombong && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800">
            <button 
              onClick={() => setEditingRombong(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-emerald-600" />
              Edit Informasi Rombong Lapak Kuliner
            </h4>
            <form onSubmit={handleEditRombongSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Nama Pemilik / Usaha</label>
                <input 
                  required
                  type="text"
                  value={editingRombong.namaPemilik}
                  onChange={e => setEditingRombong({...editingRombong, namaPemilik: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Nomor Lapak</label>
                  <input 
                    required
                    type="text"
                    value={editingRombong.noLapak}
                    onChange={e => setEditingRombong({...editingRombong, noLapak: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Lokasi Rombong</label>
                  <input 
                    required
                    type="text"
                    value={editingRombong.lokasi}
                    onChange={e => setEditingRombong({...editingRombong, lokasi: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">Nomor WhatsApp (Penagihan)</label>
                <input 
                  type="text"
                  value={editingRombong.noWa || ''}
                  placeholder="Format: 08123456789"
                  onChange={e => setEditingRombong({...editingRombong, noWa: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-sm text-slate-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setEditingRombong(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-sm transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warga Payment Processing Confirmation Box (Floating Modal Overlay) */}
      {payingInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-w-lg w-full">
            <button 
              onClick={() => setPayingInfo(null)}
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-105 transition"
              title="Batal"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-extrabold text-emerald-600 text-base mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Konfirmasi Pencatatan Pembayaran Iuran
            </h4>
            <p className="text-slate-650 text-sm mb-3 leading-relaxed">
              Mencatat pembayaran iuran <strong className="text-slate-900">{payingInfo.category}</strong> bulan <strong className="text-slate-900">{payingInfo.bulan}</strong> oleh warga <strong className="text-slate-900">{payingInfo.warga.nama}</strong> (Blok {payingInfo.warga.blok}-{payingInfo.warga.noRumah}) sebesar <strong className="text-emerald-605 font-mono font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-lg">Rp {payingInfo.nominal.toLocaleString('id-ID')}</strong>.
            </p>
            <div className="bg-sky-50 border border-sky-150 rounded-xl p-3 mb-4 text-xs text-sky-800 leading-relaxed">
              💡 <strong>Ketentuan Kas:</strong> Uang tagihan ini dihitung sebagai <strong>Pendapatan Akrual / Kas Masuk</strong> dan langsung disetorkan ke Bank untuk keamanan dan pembukuan resmi, serta tetap terhitung dalam total saldo keseluruhan kas warga.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-605 mb-1.5 font-mono">Target Penerimaan Kas Pelunasan (Rekomendasi: Bank)</label>
                <select
                  value={paymentTargetKas}
                  onChange={(e) => setPaymentTargetKas(e.target.value as keyof Balance)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="rtBank">[RT] RT Bank / Setor Bank (Sisa: Rp {kas.rtBank.toLocaleString('id-ID')})</option>
                  <option value="rtTunai">[RT] RT Tunai (Sisa: Rp {kas.rtTunai.toLocaleString('id-ID')})</option>
                  <option value="rtPettyCash">[RT] RT Petty Cash (Sisa: Rp {kas.rtPettyCash.toLocaleString('id-ID')})</option>
                  <option value="rombongBank">[Rombong] Rombong Bank / Setor Bank (Sisa: Rp {kas.rombongBank.toLocaleString('id-ID')})</option>
                  <option value="rombongTunai">[Rombong] Rombong Tunai (Sisa: Rp {kas.rombongTunai.toLocaleString('id-ID')})</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-mono">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-mono">Jam Pembayaran</label>
                  <input
                    type="time"
                    required
                    value={paymentTime}
                    onChange={(e) => setPaymentTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setPayingInfo(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Batalkan
                </button>
                <button 
                  onClick={processPayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer active:scale-97 transition"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Selesaikan Pembayaran & Catat Kas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rombong Payment Processing Confirmation Box (Floating Modal Overlay) */}
      {payingRombongInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-w-lg w-full">
            <button 
              onClick={() => setPayingRombongInfo(null)}
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-105 transition"
              title="Batal"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-extrabold text-emerald-600 text-base mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Konfirmasi Penerimaan Sewa / Lapak Rombong
            </h4>
            <p className="text-slate-655 text-sm mb-3 leading-relaxed">
              Mencatat pembayaran <strong className="text-slate-900">{payingRombongInfo.category}</strong> bulan <strong className="text-slate-900">{payingRombongInfo.bulan}</strong> oleh pemilik <strong className="text-slate-900">{payingRombongInfo.rombong.namaPemilik}</strong> ({payingRombongInfo.rombong.noLapak}) sebesar <strong className="text-emerald-605 font-mono font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-lg">Rp {payingRombongInfo.nominal.toLocaleString('id-ID')}</strong>.
            </p>
            <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 mb-4 text-xs text-emerald-800 leading-relaxed font-sans">
              💡 <strong>Ketentuan Kas:</strong> Pendapatan sewa rombong wajib disetorkan ke rekening Bank, serta tetap menjadi bagian dari representasi saldo keseluruhan kas Rombong RT 08.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-605 mb-1.5 font-mono">Target Penerimaan Akun Kas (Rekomendasi: Bank)</label>
                <select
                  value={paymentTargetKas}
                  onChange={(e) => setPaymentTargetKas(e.target.value as keyof Balance)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                >
                  <option value="rombongBank">[Rombong] Rombong Bank / Setor Bank (Sisa: Rp {kas.rombongBank.toLocaleString('id-ID')})</option>
                  <option value="rombongTunai">[Rombong] Rombong Tunai (Sisa: Rp {kas.rombongTunai.toLocaleString('id-ID')})</option>
                  <option value="rtBank">[RT] RT Bank / Setor Bank (Sisa: Rp {kas.rtBank.toLocaleString('id-ID')})</option>
                  <option value="rtTunai">[RT] RT Tunai (Sisa: Rp {kas.rtTunai.toLocaleString('id-ID')})</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-mono">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-mono">Jam Pembayaran</label>
                  <input
                    type="time"
                    required
                    value={paymentTime}
                    onChange={(e) => setPaymentTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setPayingRombongInfo(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Batalkan
                </button>
                <button 
                  onClick={processRombongPayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 cursor-pointer active:scale-97 transition"
                >
                  <Coins className="w-3.5 h-3.5" />
                  Selesaikan Pembayaran & Catat Kas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warga Correction Modal */}
      {correctionWargaInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setCorrectionWargaInfo(null)}
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-105 transition"
              title="Batal"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-extrabold text-sky-600 text-base mb-2 flex items-center gap-2 font-sans">
              <Settings className="w-5 h-5 text-sky-600" />
              Koreksi &amp; Edit Iuran RT
            </h4>
            <p className="text-slate-655 text-sm mb-4 leading-relaxed font-sans">
              Mengedit catatan iuran <strong className="text-slate-950">Iuran RT</strong> bulan <strong className="text-slate-950">{correctionWargaInfo.bulan}</strong> untuk warga <strong className="text-slate-950">{correctionWargaInfo.warga.nama}</strong> (Blok {correctionWargaInfo.warga.blok}-{correctionWargaInfo.warga.noRumah}).
            </p>

            <div className="border-b border-dashed border-slate-200 my-4"></div>

            <div className="space-y-4">
              {/* Option 1: Basic Status Adjustment */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">1. Ubah Informasi Tagihan Warga Ini</div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status Pembayaran</label>
                  <select
                    value={corrStatusLunas ? 'true' : 'false'}
                    onChange={(e) => setCorrStatusLunas(e.target.value === 'true')}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  >
                    <option value="true">Lunas (Selesai Dibayar)</option>
                    <option value="false">Belum Lunas (Batalkan Pembayaran)</option>
                  </select>
                </div>

                {corrStatusLunas && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal Iuran (Rp)</label>
                        <input
                          type="number"
                          value={corrNominal}
                          onChange={(e) => setCorrNominal(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Periode Tahun</label>
                        <select
                          value={corrTahun}
                          onChange={(e) => setCorrTahun(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                        >
                          <option value="2025">Tahun 2025</option>
                          <option value="2026">Tahun 2026</option>
                          <option value="2027">Tahun 2027</option>
                          <option value="2028">Tahun 2028</option>
                          <option value="2029">Tahun 2029</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Akun Kas Pembukuan terkait</label>
                      <select
                        value={corrTargetKas}
                        onChange={(e) => setCorrTargetKas(e.target.value as keyof Balance)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      >
                        <option value="rtBank">[RT] Bank RT</option>
                        <option value="rtTunai">[RT] Tunai RT</option>
                        <option value="rtPettyCash">[RT] Petty Cash RT</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Tanggal Pembayaran</label>
                        <input
                          type="date"
                          value={corrPaymentDate}
                          onChange={(e) => setCorrPaymentDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Jam Pembayaran</label>
                        <input
                          type="time"
                          value={corrPaymentTime}
                          onChange={(e) => setCorrPaymentTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Option 2: Salah Centang */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-150 space-y-3">
                <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-widest font-mono flex items-center gap-1">
                  💡 2. Pindahkan Pembayaran (Salah Centang Orang)
                </div>
                <p className="text-xs text-slate-600 leading-normal font-sans">
                  Jika Anda salah klik/salah centang nama orang lain, pilih warga yang seharusnya membayar di bawah ini. Catatan iuran lunas akan dipindahkan ke nama warga yang dipilih.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1 font-sans">Warga Penerima Sebenarnya</label>
                  <select
                    value={corrTransferTargetWargaId}
                    onChange={(e) => setCorrTransferTargetWargaId(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  >
                    <option value="">-- Tetap pada warga ini (Jangan dipindahkan) --</option>
                    {wargaList.filter(w => w.id !== correctionWargaInfo.warga.id).map(w => (
                      <option key={w.id} value={w.id}>
                        {w.nama} (Blok {w.blok}-{w.noRumah})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setCorrectionWargaInfo(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={saveCorrection}
                  className="bg-sky-650 hover:bg-sky-750 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-600/10 cursor-pointer active:scale-97 transition refinement-button"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Simpan Koreksi Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rombong Correction Modal */}
      {correctionRombongInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setCorrectionRombongInfo(null)}
              className="absolute top-4 right-4 text-slate-455 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-105 transition"
              title="Batal"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-extrabold text-sky-600 text-base mb-2 flex items-center gap-2 font-sans">
              <Settings className="w-5 h-5 text-sky-600" />
              Koreksi &amp; Edit Sewa Rombong
            </h4>
            <p className="text-slate-655 text-sm mb-4 leading-relaxed font-sans">
              Mengedit catatan sewa <strong className="text-slate-950">Iuran Rombong</strong> bulan <strong className="text-slate-950">{correctionRombongInfo.bulan}</strong> untuk pemilik <strong className="text-slate-950">{correctionRombongInfo.rombong.namaPemilik}</strong> ({correctionRombongInfo.rombong.noLapak}).
            </p>

            <div className="border-b border-dashed border-slate-200 my-4"></div>

            <div className="space-y-4">
              {/* Option 1: Basic Status Adjustment */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">1. Ubah Informasi Lapak Rombong Ini</div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status Sewa</label>
                  <select
                    value={corrRombongStatusLunas ? 'true' : 'false'}
                    onChange={(e) => setCorrRombongStatusLunas(e.target.value === 'true')}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  >
                    <option value="true">Lunas (Selesai Dibayar)</option>
                    <option value="false">Belum Lunas (Batalkan Sewa)</option>
                  </select>
                </div>

                {corrRombongStatusLunas && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal Sewa (Rp)</label>
                        <input
                          type="number"
                          value={corrRombongNominal}
                          onChange={(e) => setCorrRombongNominal(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Periode Tahun</label>
                        <select
                          value={corrRombongTahun}
                          onChange={(e) => setCorrRombongTahun(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                        >
                          <option value="2025">Tahun 2025</option>
                          <option value="2026">Tahun 2026</option>
                          <option value="2027">Tahun 2027</option>
                          <option value="2028">Tahun 2028</option>
                          <option value="2029">Tahun 2029</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Akun Kas Pembukuan terkait</label>
                      <select
                        value={corrRombongTargetKas}
                        onChange={(e) => setCorrRombongTargetKas(e.target.value as keyof Balance)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      >
                        <option value="rombongBank">[Rombong] Bank Rombong</option>
                        <option value="rombongTunai">[Rombong] Tunai Rombong</option>
                        <option value="rtBank">[RT] Bank RT</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Tanggal Pembayaran</label>
                        <input
                          type="date"
                          value={corrPaymentDate}
                          onChange={(e) => setCorrPaymentDate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Jam Pembayaran</label>
                        <input
                          type="time"
                          value={corrPaymentTime}
                          onChange={(e) => setCorrPaymentTime(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Option 2: Salah Centang Rombong */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-150 space-y-3">
                <div className="text-[11px] font-extrabold text-amber-700 uppercase tracking-widest font-mono flex items-center gap-1">
                  💡 2. Pindahkan Pembayaran (Salah Centang Lapak Rombong)
                </div>
                <p className="text-xs text-slate-600 leading-normal font-sans">
                  Jika Anda salah klik/salah centang nama lapak rombong, pilih lapak/pemilik yang seharusnya di bawah ini. Catatan sewa lunas akan dipindahkan ke lapak yang baru.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-655 mb-1 font-sans">Lapak Penerima Sebenarnya</label>
                  <select
                    value={corrTransferTargetRombongId}
                    onChange={(e) => setCorrTransferTargetRombongId(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs text-slate-955 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  >
                    <option value="">-- Tetap pada lapak ini (Jangan dipindahkan) --</option>
                    {rombongList.filter(r => r.id !== correctionRombongInfo.rombong.id).map(r => (
                      <option key={r.id} value={r.id}>
                        {r.namaPemilik} ({r.noLapak} - {r.lokasi})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setCorrectionRombongInfo(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={saveRombongCorrection}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-sky-600/10 cursor-pointer active:scale-97 transition refinement-button"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Simpan Koreksi Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Bill Sharing Drawer / Modal (Warga) */}
      {selectedWargaForWhatsApp && (
        <div className="bg-white border-2 border-emerald-250 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95 duration-250 text-slate-800">
          <button 
            onClick={() => setSelectedWargaForWhatsApp(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Generate Tagihan WhatsApp (Warga)</h4>
              <p className="text-xs text-slate-500">Draft tagihan bulanan untuk {selectedWargaForWhatsApp.nama}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">
              Nomor WhatsApp Warga (Opsional, gunakan awalan 08 / 62)
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="cth: 08123456789 atau kosongkan"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              * Jika dikosongkan, WhatsApp akan meminta Anda memilih kontak setelah aplikasi WhatsApp terbuka.
            </p>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-mono">Preview Pesan Tagihan:</label>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-line text-slate-700 leading-relaxed scrollbar">
              {getWhatsAppMessageText(selectedWargaForWhatsApp)}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={() => {
                setSelectedWargaForWhatsApp(null);
                setTargetPhone('');
              }}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            <button 
              onClick={() => handleOpenWhatsAppLink(selectedWargaForWhatsApp)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim via WhatsApp
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Bill Sharing Drawer / Modal (Rombong) */}
      {selectedRombongForWhatsApp && (
        <div className="bg-white border-2 border-emerald-250 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95 duration-250 text-slate-800">
          <button 
            onClick={() => setSelectedRombongForWhatsApp(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Generate Tagihan WhatsApp (Rombong)</h4>
              <p className="text-xs text-slate-500">Draft rincian sewa & iuran untuk {selectedRombongForWhatsApp.namaPemilik}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 font-mono">
              Nomor WhatsApp Penyewa (Opsional, gunakan 08 / 62)
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="cth: 08987654321 atau kosongkan"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              * Jika dikosongkan, WhatsApp akan meminta Anda memilih kontak setelah aplikasi WhatsApp terbuka.
            </p>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-650 mb-1.5 font-mono">Preview Pesan Tagihan:</label>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-line text-slate-700 leading-relaxed scrollbar">
              {getWhatsAppRombongMessageText(selectedRombongForWhatsApp)}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              onClick={() => {
                setSelectedRombongForWhatsApp(null);
                setTargetPhone('');
              }}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
            <button 
              onClick={() => handleOpenWhatsAppRombongLink(selectedRombongForWhatsApp)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim via WhatsApp
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* --- ANNUAL BOOKKEEPING & PAYMENT HISTORY (CITIZEN - WARGA) --- */}
      {selectedWargaHistory && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => {
                setSelectedWargaHistory(null);
                setHistoryYear(2026);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header profile info */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 shrink-0">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Buku Registry & Tagihan Tahunan</h4>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{selectedWargaHistory.nama}</div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
                  <Home className="w-3.5 h-3.5 text-sky-550 shrink-0" />
                  Blok {selectedWargaHistory.blok} No. {selectedWargaHistory.noRumah} — RT 08 Perumtas 3
                </div>
                {selectedWargaHistory.noWa && (
                  <div className="text-xs text-emerald-600 font-semibold font-mono flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-emerald-50 rounded-lg w-fit border border-emerald-100/50">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 block bg-emerald-500 animate-ping"></span>
                    <span>No. WA Penagihan: {selectedWargaHistory.noWa}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable contents */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 scrollbar select-none">
              
              {/* Year options selector bar */}
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-150">
                <span className="text-xs font-bold text-slate-600 pl-1.5">Tahun Buku / Anggaran:</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {yearsList.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setHistoryYear(yr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                        historyYear === yr
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual statistics summary block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Terbayar ({historyYear})</div>
                  <div className="text-[10px] text-slate-400 font-medium">Iuran RT Selesai</div>
                  <div className="text-lg font-black font-mono text-emerald-800 mt-1">
                    Rp {selectedWargaHistory.iuranRT
                      .filter(b => b.lunas && (b.tahun === historyYear || (!b.tahun && historyYear === 2026)))
                      .reduce((sum, b) => sum + b.nominal, 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/45 border border-amber-100">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">Tunggakan ({historyYear})</div>
                  <div className="text-[10px] text-slate-400 font-medium font-mono">Tahun {historyYear}</div>
                  <div className="text-lg font-black font-mono text-amber-850 mt-1">
                    Rp {(() => {
                      let totalTunggakan = 0;
                      fullMonths.forEach(m => {
                        const shortM = m.slice(0, 3);
                        const slot = selectedWargaHistory.iuranRT.find(b => 
                          b.lunas &&
                          (b.tahun === historyYear || (!b.tahun && historyYear === 2026)) &&
                          (b.bulan.toLowerCase() === m.toLowerCase() || b.bulan.toLowerCase() === shortM.toLowerCase())
                        );
                        if (!slot) {
                          totalTunggakan += 110000;
                        }
                      });
                      return totalTunggakan;
                    })().toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* 12 Months layout grid */}
              <div>
                <h5 className="text-xs font-extrabold text-slate-700 font-sans uppercase mb-3 flex items-center gap-1.5 font-mono tracking-wider">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Lembar Buku Tagihan Setahun (Jan s.d. Des)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {fullMonths.map((IndoMonth, idx) => {
                    const shortMonth = IndoMonth.slice(0, 3);
                    const matchedSlot = selectedWargaHistory.iuranRT.find(
                      slot => (slot.tahun === historyYear || (!slot.tahun && historyYear === 2026)) &&
                              (slot.bulan.toLowerCase() === IndoMonth.toLowerCase() || 
                               slot.bulan.toLowerCase() === shortMonth.toLowerCase())
                    );

                    const isLunas = matchedSlot ? matchedSlot.lunas : false;
                    const nominalValue = matchedSlot ? matchedSlot.nominal : 110000;
                    const displayBulan = matchedSlot ? matchedSlot.bulan : IndoMonth;

                    return (
                      <div 
                        key={IndoMonth}
                        className={`p-3 rounded-xl border flex flex-col justify-between min-h-[5.5rem] h-auto pb-1.5 transition duration-150 ${
                          isLunas
                            ? 'bg-emerald-50/40 border-emerald-150 shadow-xs'
                            : 'bg-amber-50/30 border-amber-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-extrabold text-slate-700">{IndoMonth}</span>
                          <span className="text-[9px] text-slate-400 font-mono">#{String(idx + 1).padStart(2, '0')}</span>
                        </div>

                        <div className="mt-1 flex justify-between items-end">
                          <div className="text-[10px] font-mono text-slate-500 self-end">
                            Rp {nominalValue.toLocaleString('id-ID')}
                          </div>
                          
                          {/* Payment status badge */}
                          {isLunas ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-[10px] text-emerald-700 font-black flex items-center gap-0.5 whitespace-nowrap">
                                Lunas ✓
                              </span>
                              {matchedSlot?.tanggalBayar && (
                                <span className="text-[7.5px] text-slate-500 font-mono text-right leading-none scale-[0.9] origin-right">
                                  {(() => {
                                    const p = matchedSlot.tanggalBayar.split('-');
                                    const datePart = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : matchedSlot.tanggalBayar;
                                    return matchedSlot.jamBayar ? `${datePart} ${matchedSlot.jamBayar}` : datePart;
                                  })()}
                                </span>
                              )}
                              {isLoggedIn && (
                                <button
                                  onClick={() => {
                                    openCorrectionModal(selectedWargaHistory, 'Iuran RT', displayBulan, nominalValue, 'iuranRT', historyYear);
                                  }}
                                  className="text-[9px] text-sky-600 hover:text-sky-850 font-bold hover:underline cursor-pointer active:scale-95 leading-none mt-1"
                                >
                                  Koreksi ⚙
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (isLoggedIn) {
                                  openPaymentModal(selectedWargaHistory, 'Iuran RT', displayBulan, nominalValue, 'iuranRT', historyYear);
                                } else {
                                  alert('Silahkan masuk/login sebagai Admin terlebih dahulu untuk mencatat pembayaran.');
                                }
                              }}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${
                                isLoggedIn 
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 cursor-pointer active:scale-95' 
                                  : 'text-amber-600'
                              }`}
                            >
                              {isLoggedIn ? 'Bayar ❯' : 'Belum Lunas'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment History timeline search match of ledger */}
              <div>
                <h5 className="text-xs font-extrabold text-slate-750 font-mono uppercase mb-3 flex items-center gap-1.5 tracking-wider">
                  <Clock className="w-4 h-4 text-sky-600" />
                  Riwayat Transaksi Kas Warga ({historyYear})
                </h5>
                
                {(() => {
                  const matchingTxs = filterLedgerForWarga(selectedWargaHistory, historyYear);
                  if (matchingTxs.length === 0) {
                    return (
                      <div className="p-6 text-center bg-slate-55 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-xs text-slate-500 font-bold">Belum ada rincian riwayat transaksi kas tercatat di Buku Kas RT untuk tahun {historyYear}.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="bg-slate-50/50 border border-slate-150 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                      {matchingTxs.map((tx) => (
                        <div key={tx.id} className="p-3.5 flex justify-between items-center hover:bg-slate-100/50 transition">
                          <div>
                            <div className="text-xs font-extrabold text-slate-800 leading-snug">{tx.deskripsi}</div>
                            <div className="text-[10px] text-slate-450 font-mono mt-0.5">
                              Tanggal: {tx.tanggal} • Kas: <span className="text-slate-555 font-bold">{tx.sumberKas}</span> • Oleh: {tx.petugas}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/70 px-2 py-1 rounded-lg">
                              + Rp {tx.jumlah.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Footer buttons */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
              <span className="text-[10px] text-slate-400 italic">
                * Sinkronisasi data real-time dengan Buku Kas & Keamanan RT
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const rawMsg = getWhatsAppHistoryMessageText(selectedWargaHistory, historyYear);
                    const cleanedPhone = (selectedWargaHistory.noWa || '').replace(/\D/g, '');
                    let formattedPhone = cleanedPhone;
                    if (formattedPhone.startsWith('0')) {
                      formattedPhone = '62' + formattedPhone.slice(1);
                    }
                    const finalUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rawMsg)}`;
                    window.open(finalUrl, '_blank');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/10 transition cursor-pointer active:scale-97"
                  title="Kirim Catatan Buku Tagihan per Warga ini ke WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Buku Ke WA</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedWargaHistory(null);
                    setHistoryYear(2026);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Tutup Buku
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ANNUAL BOOKKEEPING & PAYMENT HISTORY (ROMBONG - LAPAK SEWA) --- */}
      {selectedRombongHistory && (
        <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => {
                setSelectedRombongHistory(null);
                setHistoryYear(2026);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header profile info */}
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4 shrink-0">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-105">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Buku Registry & Riwayat Rombong</h4>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">{selectedRombongHistory.namaPemilik}</div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-1">
                  <Store className="w-3.5 h-3.5 text-emerald-650 shrink-0" />
                  {selectedRombongHistory.noLapak} • {selectedRombongHistory.lokasi} • Kuliner RT 08
                </div>
                {selectedRombongHistory.noWa && (
                  <div className="text-xs text-emerald-600 font-semibold font-mono flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-emerald-50 rounded-lg w-fit border border-emerald-100/50">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 block bg-emerald-500 animate-ping"></span>
                    <span>No. WA Penagihan: {selectedRombongHistory.noWa}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable contents */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 scrollbar select-none">
              
              {/* Year options selector bar */}
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-150">
                <span className="text-xs font-bold text-slate-655 pl-1.5">Tahun Buku / Anggaran:</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {yearsList.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setHistoryYear(yr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                        historyYear === yr
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual statistics summary block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">Terbayar ({historyYear})</div>
                  <div className="text-[10px] text-slate-405 font-medium">Sewa & Iuran Lapak Selesai</div>
                  <div className="text-lg font-black font-mono text-emerald-800 mt-1">
                    Rp {selectedRombongHistory.iuranRombong
                      .filter(b => b.lunas && (b.tahun === historyYear || (!b.tahun && historyYear === 2026)))
                      .reduce((sum, b) => sum + b.nominal, 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/45 border border-amber-104">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">Tunggakan ({historyYear})</div>
                  <div className="text-[10px] text-slate-405 font-medium font-mono">Tahun {historyYear}</div>
                  <div className="text-lg font-black font-mono text-amber-850 mt-1">
                    Rp {(() => {
                      let totalTunggakan = 0;
                      fullMonths.forEach(m => {
                        const shortM = m.slice(0, 3);
                        const slot = selectedRombongHistory.iuranRombong.find(b => 
                          b.lunas &&
                          (b.tahun === historyYear || (!b.tahun && historyYear === 2026)) &&
                          (b.bulan.toLowerCase() === m.toLowerCase() || b.bulan.toLowerCase() === shortM.toLowerCase())
                        );
                        if (!slot) {
                          totalTunggakan += 130000;
                        }
                      });
                      return totalTunggakan;
                    })().toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* 12 Months layout grid */}
              <div>
                <h5 className="text-xs font-extrabold text-slate-700 font-sans uppercase mb-3 flex items-center gap-1.5 font-mono tracking-wider">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Lembar Buku Tagihan Setahun (Jan s.d. Des)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {fullMonths.map((IndoMonth, idx) => {
                    const shortMonth = IndoMonth.slice(0, 3);
                    const matchedSlot = selectedRombongHistory.iuranRombong.find(
                      slot => (slot.tahun === historyYear || (!slot.tahun && historyYear === 2026)) &&
                              (slot.bulan.toLowerCase() === IndoMonth.toLowerCase() || 
                               slot.bulan.toLowerCase() === shortMonth.toLowerCase())
                    );

                    const isLunas = matchedSlot ? matchedSlot.lunas : false;
                    const nominalValue = matchedSlot ? matchedSlot.nominal : 130000;
                    const displayBulan = matchedSlot ? matchedSlot.bulan : IndoMonth;

                    return (
                      <div 
                        key={IndoMonth}
                        className={`p-3 rounded-xl border flex flex-col justify-between min-h-[5.5rem] h-auto pb-1.5 transition duration-150 ${
                          isLunas
                            ? 'bg-emerald-50/40 border-emerald-150 shadow-xs'
                            : 'bg-amber-50/30 border-amber-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-extrabold text-slate-700">{IndoMonth}</span>
                          <span className="text-[9px] text-slate-400 font-mono">#{String(idx + 1).padStart(2, '0')}</span>
                        </div>

                        <div className="mt-1 flex justify-between items-end">
                          <div className="text-[10px] font-mono text-slate-500 self-end">
                            Rp {nominalValue.toLocaleString('id-ID')}
                          </div>
                          
                          {/* Payment status badge */}
                          {isLunas ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-[10px] text-emerald-700 font-black flex items-center gap-0.5 whitespace-nowrap">
                                Lunas ✓
                              </span>
                              {matchedSlot?.tanggalBayar && (
                                <span className="text-[7.5px] text-slate-500 font-mono text-right leading-none scale-[0.9] origin-right">
                                  {(() => {
                                    const p = matchedSlot.tanggalBayar.split('-');
                                    const datePart = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : matchedSlot.tanggalBayar;
                                    return matchedSlot.jamBayar ? `${datePart} ${matchedSlot.jamBayar}` : datePart;
                                  })()}
                                </span>
                              )}
                              {isLoggedIn && (
                                <button
                                  onClick={() => {
                                    openRombongCorrectionModal(selectedRombongHistory, 'Iuran Rombong', displayBulan, nominalValue, 'iuranRombong', historyYear);
                                  }}
                                  className="text-[9px] text-sky-600 hover:text-sky-850 font-bold hover:underline cursor-pointer active:scale-95 leading-none mt-1"
                                >
                                  Koreksi ⚙
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (isLoggedIn) {
                                  openRombongPaymentModal(selectedRombongHistory, 'Iuran Rombong', displayBulan, nominalValue, 'iuranRombong', historyYear);
                                } else {
                                  alert('Silahkan masuk/login sebagai Admin terlebih dahulu untuk mencatat pembayaran.');
                                }
                              }}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${
                                isLoggedIn 
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 cursor-pointer active:scale-95' 
                                  : 'text-amber-600'
                              }`}
                            >
                              {isLoggedIn ? 'Bayar ❯' : 'Belum Lunas'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment History timeline search match of ledger for Rombong */}
              <div>
                <h5 className="text-xs font-extrabold text-slate-750 font-mono uppercase mb-3 flex items-center gap-1.5 tracking-wider">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Riwayat Transaksi Kas Rombong ({historyYear})
                </h5>
                
                {(() => {
                  const matchingTxs = filterLedgerForRombong(selectedRombongHistory, historyYear);
                  if (matchingTxs.length === 0) {
                    return (
                      <div className="p-6 text-center bg-slate-55 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-xs text-slate-500 font-bold">Belum ada rincian riwayat transaksi sewa/lapak tercatat di Buku Kas RT untuk tahun {historyYear}.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="bg-slate-50/50 border border-slate-150 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                      {matchingTxs.map((tx) => (
                        <div key={tx.id} className="p-3.5 flex justify-between items-center hover:bg-slate-100/50 transition">
                          <div>
                            <div className="text-xs font-extrabold text-slate-800 leading-snug">{tx.deskripsi}</div>
                            <div className="text-[10px] text-slate-450 font-mono mt-0.5">
                              Tanggal: {tx.tanggal} • Kas: <span className="text-slate-555 font-bold">{tx.sumberKas}</span> • Oleh: {tx.petugas}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/70 px-2 py-1 rounded-lg">
                              + Rp {tx.jumlah.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Footer buttons */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0">
              <span className="text-[10px] text-slate-400 italic">
                * Sinkronisasi data real-time dengan Buku Kas & Keamanan RT
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const rawMsg = getWhatsAppRombongHistoryMessageText(selectedRombongHistory, historyYear);
                    const cleanedPhone = (selectedRombongHistory.noWa || '').replace(/\D/g, '');
                    let formattedPhone = cleanedPhone;
                    if (formattedPhone.startsWith('0')) {
                      formattedPhone = '62' + formattedPhone.slice(1);
                    }
                    const finalUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rawMsg)}`;
                    window.open(finalUrl, '_blank');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/10 transition cursor-pointer active:scale-97"
                  title="Kirim Catatan Buku Tagihan per Rombong ini ke WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kirim Buku Ke WA</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedRombongHistory(null);
                    setHistoryYear(2026);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Tutup Buku
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Registry Table Grid based on Sub-Tab selection */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-in duration-300">
        
        {/* Table header with search count info */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-sm font-mono flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            {activeSubTab === 'warga' 
              ? `Buku Registry Warga (${filteredWarga.length} Temuan)`
              : `Buku Registry Lapak Rombong (${filteredRombong.length} Temuan)`
            }
          </h3>
          {!isLoggedIn && (
            <span className="text-[10px] text-amber-700 font-semibold font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              Hanya Baca (Login untuk kelola iuran)
            </span>
          )}
        </div>

        {/* --- CITIZEN REGISTER VIEW --- */}
        {activeSubTab === 'warga' && (
          filteredWarga.length === 0 ? (
            <div className="p-12 text-center bg-white">
              <Search className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Buku registry warga kosong atau hasil cari tidak ditemukan</p>
              <p className="text-slate-400 text-xs mt-1">Gunakan kata pencarian lain atau klik "Tambah Warga" saat login.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-600 text-xs font-extrabold font-mono border-b border-slate-150 uppercase tracking-wider">
                    <th className="p-4">Warga & Rumah</th>
                    <th className="p-4 text-center">Iuran RT<br/><span className="text-[10px] lowercase text-slate-400 font-normal">(Rp 110k / bln)</span></th>
                    {isLoggedIn && <th className="p-4 text-center">Tagihan WA</th>}
                    {isLoggedIn && currentUser?.role === 'admin' && <th className="p-4 text-center">Aksi Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarga.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedWargaHistory(w);
                            setHistoryYear(2026);
                          }}
                          className="font-extrabold text-slate-900 hover:text-sky-600 transition text-sm cursor-pointer border-b border-dashed border-slate-300 hover:border-sky-500 text-left focus:outline-none focus:ring-0 select-all"
                          title="Klik untuk cek buku tagihan setahun & riwayat"
                        >
                          {w.nama}
                        </button>
                        <div className="text-slate-500 text-xs font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                          <Home className="w-3.5 h-3.5 text-sky-550 shrink-0" />
                          <span>Blok {w.blok} No. {w.noRumah}</span>
                          {w.noWa && (
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50 flex items-center gap-0.5 whitespace-nowrap">
                              ● WA: {w.noWa}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* RT Month Grid */}
                      <td className="p-4 text-center align-middle">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {(() => {
                            const defaultMonths = ['Maret', 'April', 'Mei'];
                            return defaultMonths.map((m) => {
                              const slot = w.iuranRT.find(b => 
                                b.bulan.toLowerCase() === m.toLowerCase() && 
                                (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026))
                              ) || { bulan: m, lunas: false, nominal: 110000, tahun: selectedBillingYear };

                              return (
                                <button
                                  key={m}
                                  onClick={() => !slot.lunas && openPaymentModal(w, 'Iuran RT', slot.bulan, slot.nominal, 'iuranRT', selectedBillingYear)}
                                  disabled={slot.lunas}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono text-center transition flex flex-col items-center justify-center min-w-[72px] ${
                                    slot.lunas
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85 cursor-default'
                                      : isLoggedIn
                                      ? 'bg-amber-55 text-amber-700 border border-amber-200 hover:bg-amber-100/70 cursor-pointer'
                                      : 'bg-slate-50 text-slate-450 border border-slate-150 cursor-default'
                                  }`}
                                >
                                  <span className="text-[10px] font-semibold">{slot.bulan} <span className="text-[8px] font-normal opacity-75">'{String(selectedBillingYear).slice(-2)}</span></span>
                                  {slot.lunas ? (
                                    <>
                                      <span className="text-[8px] mt-0.5 block opacity-95 text-emerald-600 font-bold">Lunas ✓</span>
                                      {slot.tanggalBayar && (
                                        <span className="text-[7.5px] text-emerald-650 font-mono mt-0.5 leading-none whitespace-nowrap scale-[0.88]">
                                          {(() => {
                                            const p = slot.tanggalBayar.split('-');
                                            const datePart = p.length === 3 ? `${p[2]}/${p[1]}` : slot.tanggalBayar;
                                            return slot.jamBayar ? `${datePart} ${slot.jamBayar}` : datePart;
                                          })()}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[8px] mt-0.5 block opacity-95">
                                      Bayar ❯
                                    </span>
                                  )}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </td>

                      {/* Action whatsapp billing helper */}
                      {isLoggedIn && (
                        <td className="p-4 text-center align-middle">
                          <button
                            onClick={() => {
                              setSelectedWargaForWhatsApp(w);
                              setTargetPhone(w.noWa || '');
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs shadow-emerald-600/10 whitespace-nowrap"
                            title="Kirim slip rincian tagihan via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </button>
                        </td>
                      )}

                      {/* Admin Management Actions: Edit and Delete */}
                      {isLoggedIn && currentUser?.role === 'admin' && (
                        <td className="p-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingWarga(w)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                              title="Edit data warga"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteWarga(w.id, w.nama)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus warga dari daftar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* --- ROMBONG LAPAK KULINER VIEW --- */}
        {activeSubTab === 'rombong' && (
          filteredRombong.length === 0 ? (
            <div className="p-12 text-center bg-white">
              <Search className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <p className="text-slate-500 font-bold">Buku lapak rombong kosong atau hasil cari tidak ditemukan</p>
              <p className="text-slate-400 text-xs mt-1">Gunakan kata pencarian lain atau klik "Tambah Rombong Baru" saat login.</p>
            </div>
          ) : (
            <div className="overflow-x-auto animate-in fade-in duration-200">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-600 text-xs font-extrabold font-mono border-b border-slate-150 uppercase tracking-wider">
                    <th className="p-4">Pemilik & Lapak Rombong</th>
                    <th className="p-4 text-center">Iuran Rombong<br/><span className="text-[10px] lowercase text-slate-400 font-normal">(Rp 130k / bln)</span></th>
                    {isLoggedIn && <th className="p-4 text-center">Rincian WA</th>}
                    {isLoggedIn && currentUser?.role === 'admin' && <th className="p-4 text-center">Aksi Admin</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRombong.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedRombongHistory(r);
                            setHistoryYear(2026);
                          }}
                          className="font-extrabold text-slate-900 hover:text-emerald-700 transition text-sm cursor-pointer border-b border-dashed border-slate-300 hover:border-emerald-600 text-left focus:outline-none focus:ring-0 select-all"
                          title="Klik untuk cek buku tagihan setahun & riwayat"
                        >
                          {r.namaPemilik}
                        </button>
                        <div className="text-slate-500 text-xs font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r.noLapak} — <span className="opacity-90">{r.lokasi}</span></span>
                          {r.noWa && (
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50 flex items-center gap-0.5 whitespace-nowrap">
                              ● WA: {r.noWa}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rombong Month Grid */}
                      <td className="p-4 text-center align-middle">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {(() => {
                            const defaultMonths = ['Maret', 'April', 'Mei'];
                            return defaultMonths.map((m) => {
                              const slot = r.iuranRombong.find(b => 
                                b.bulan.toLowerCase() === m.toLowerCase() && 
                                (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026))
                              ) || { bulan: m, lunas: false, nominal: 130000, tahun: selectedBillingYear };

                              return (
                                <button
                                  key={m}
                                  onClick={() => !slot.lunas && openRombongPaymentModal(r, 'Iuran Rombong', slot.bulan, slot.nominal, 'iuranRombong', selectedBillingYear)}
                                  disabled={slot.lunas}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-bold font-mono text-center transition flex flex-col items-center justify-center min-w-[72px] ${
                                    slot.lunas
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/85 cursor-default'
                                      : isLoggedIn
                                      ? 'bg-amber-55 text-amber-700 border border-amber-200 hover:bg-amber-100/70 cursor-pointer'
                                      : 'bg-slate-50 text-slate-450 border border-slate-150 cursor-default'
                                  }`}
                                >
                                  <span className="text-[10px] font-semibold">{slot.bulan} <span className="text-[8px] font-normal opacity-75">'{String(selectedBillingYear).slice(-2)}</span></span>
                                  {slot.lunas ? (
                                    <>
                                      <span className="text-[8px] mt-0.5 block opacity-95 text-emerald-600 font-bold">Lunas ✓</span>
                                      {slot.tanggalBayar && (
                                        <span className="text-[7.5px] text-emerald-650 font-mono mt-0.5 leading-none whitespace-nowrap scale-[0.88]">
                                          {(() => {
                                            const p = slot.tanggalBayar.split('-');
                                            const datePart = p.length === 3 ? `${p[2]}/${p[1]}` : slot.tanggalBayar;
                                            return slot.jamBayar ? `${datePart} ${slot.jamBayar}` : datePart;
                                          })()}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[8px] mt-0.5 block opacity-95">
                                      Bayar ❯
                                    </span>
                                  )}
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </td>

                      {/* WA slip generator */}
                      {isLoggedIn && (
                        <td className="p-4 text-center align-middle">
                          <button
                            onClick={() => {
                              setSelectedRombongForWhatsApp(r);
                              setTargetPhone(r.noWa || '');
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs shadow-emerald-600/10 whitespace-nowrap"
                            title="Kirim rincian iuran rombong via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
                          </button>
                        </td>
                      )}

                      {/* Admin Options */}
                      {isLoggedIn && currentUser?.role === 'admin' && (
                        <td className="p-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingRombong(r)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              title="Edit data rombong"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRombong(r.id, r.namaPemilik)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Hapus rombong dari daftar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

      {/* Dynamic Billing Book Print Preview (Buku Tagihan) */}
      {showPrintBillingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[98] overflow-y-auto no-print">
          <style>{`
            @media print {
              body {
                background-color: white !important;
                color: black !important;
                font-family: 'Inter', system-ui, sans-serif !important;
              }
              header, footer, nav, .no-print, button, select, input, #tab-dashboard, #tab-tagihan, #tab-buku_kas, .pb-32, .pb-8 {
                display: none !important;
                visibility: hidden !important;
              }
              body * {
                visibility: hidden;
              }
              #printable-billing-area, #printable-billing-area * {
                visibility: visible;
              }
              #printable-billing-area {
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

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl relative max-w-6xl w-full my-8 flex flex-col max-h-[90vh]">
            {/* Top Toolbar (Invisible in General Print) */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6 no-print">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5 font-sans">
                  <Printer className="w-5 h-5 text-sky-600" />
                  Pratinjau Buku Tagihan RT.008 RW.004
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Sesuai dengan sub-tab dan filter aktif ({activeSubTab === 'warga' ? 'Kategori Warga' : 'Kategori Rombong Kuliner'}, Tahun: {selectedBillingYear}).</p>
              </div>

              {/* Format Selector and Toolbar Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs no-print">
                  <button
                    onClick={() => setPrintFormatType('table')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      printFormatType === 'table'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Format Kertas (Tabel)
                  </button>
                  <button
                    onClick={() => setPrintFormatType('whatsapp')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      printFormatType === 'whatsapp'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-500 hover:text-emerald-700'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    Format WhatsApp (WA)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrintBillingModal(false)}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
                  >
                    Tutup
                  </button>
                  {printFormatType === 'table' && (
                    <button
                      onClick={() => window.print()}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/15 cursor-pointer active:scale-95 transition"
                    >
                      <Printer className="w-4 h-4" />
                      Cetak Buku Sekarang
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Document Area */}
            <div className="flex-1 overflow-y-auto pr-1">
              {printFormatType === 'table' ? (
                <div id="printable-billing-area" className="bg-white p-4 md:p-8 border border-slate-150 rounded-2xl shadow-xs text-slate-900 font-sans">
                  
                  {/* Letterhead Header */}
                  <div className="text-center border-b-4 border-double border-slate-900 pb-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">RUKUN TETANGGA (RT) 008 RUKUN WARGA (RW) 004</h2>
                    <h3 className="text-sm md:text-base font-extrabold text-slate-805 mt-0.5">PERUMAHAN TAS III (PERUMTAS 3) BLOK G &amp; H</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Jabaran, Krian, Sidoarjo, Jawa Timur, Indonesia — Kode Pos 61262</p>
                  </div>

                  <div className="text-center mb-6">
                    <h4 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                      {activeSubTab === 'warga' 
                        ? 'DAFTAR REKAPITULASI BUKU TAGIHAN IURAN WARGA'
                        : 'DAFTAR REKAPITULASI BUKU TAGIHAN SEWA LAPAK ROMBONG'
                      }
                    </h4>
                    <div className="text-sm font-semibold text-slate-700 mt-0.5 uppercase">
                      Tahun Anggaran: <span className="font-mono font-black">{selectedBillingYear}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Dicetak Pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Main Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-400 table-auto text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                          <th className="border border-slate-400 p-2 text-center w-8">No</th>
                          {activeSubTab === 'warga' ? (
                            <>
                              <th className="border border-slate-400 p-2">Nama Warga</th>
                              <th className="border border-slate-400 p-2 text-center w-24">Blok &amp; Rumah</th>
                            </>
                          ) : (
                            <>
                              <th className="border border-slate-400 p-2">Pemilik Lapak</th>
                              <th className="border border-slate-400 p-2 text-center w-24 font-mono">No Lapak</th>
                            </>
                          )}
                          {fullMonths.map((m) => (
                            <th key={m} className="border border-slate-400 p-1 text-center font-mono text-[9px]">
                              {m.slice(0, 3)}
                            </th>
                          ))}
                          <th className="border border-slate-400 p-2 text-right w-24">Terbayar (Rp)</th>
                          <th className="border border-slate-400 p-2 text-right w-24">Tunggak (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSubTab === 'warga' ? (
                          filteredWarga.map((w, idx) => {
                            let paidSum = 0;
                            let unpaidSum = 0;
                            
                            const monthlyStatus = fullMonths.map((m) => {
                              const shortM = m.slice(0, 3);
                              const matchedSlot = w.iuranRT.find(
                                slot => (slot.tahun === selectedBillingYear || (!slot.tahun && selectedBillingYear === 2026)) &&
                                        (slot.bulan.toLowerCase() === m.toLowerCase() || 
                                         slot.bulan.toLowerCase() === shortM.toLowerCase())
                              );
                              const isLunas = matchedSlot ? matchedSlot.lunas : false;
                              const nominal = matchedSlot ? matchedSlot.nominal : 110000;
                              if (isLunas) {
                                paidSum += nominal;
                              } else {
                                unpaidSum += 110000;
                              }
                              return isLunas;
                            });

                            return (
                              <tr key={w.id} className="hover:bg-slate-50 transition border-b border-slate-350">
                                <td className="border border-slate-350 p-2 text-center">{idx + 1}</td>
                                <td className="border border-slate-350 p-2 font-bold text-slate-900">{w.nama}</td>
                                <td className="border border-slate-350 p-2 text-center font-mono text-slate-800">{w.blok}-{w.noRumah}</td>
                                {monthlyStatus.map((isLunas, mIdx) => (
                                  <td 
                                    key={mIdx} 
                                    className={`border border-slate-350 p-1 text-center font-mono font-extrabold text-[10px] ${
                                      isLunas ? 'text-emerald-700 bg-emerald-50/20' : 'text-rose-600 bg-rose-50/10'
                                    }`}
                                  >
                                    {isLunas ? '✓' : '×'}
                                  </td>
                                ))}
                                <td className="border border-slate-350 p-2 text-right font-mono text-emerald-800 font-bold">{paidSum.toLocaleString('id-ID')}</td>
                                <td className={`border border-slate-350 p-2 text-right font-mono font-bold ${unpaidSum > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                                  {unpaidSum > 0 ? unpaidSum.toLocaleString('id-ID') : '0'}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          filteredRombong.map((r, idx) => {
                            let paidSum = 0;
                            let unpaidSum = 0;
                            
                            const monthlyStatus = fullMonths.map((m) => {
                              const shortM = m.slice(0, 3);
                              const matchedSlot = r.iuranRombong.find(
                                slot => (slot.tahun === selectedBillingYear || (!slot.tahun && selectedBillingYear === 2026)) &&
                                        (slot.bulan.toLowerCase() === m.toLowerCase() || 
                                         slot.bulan.toLowerCase() === shortM.toLowerCase())
                              );
                              const isLunas = matchedSlot ? matchedSlot.lunas : false;
                              const nominal = matchedSlot ? matchedSlot.nominal : 110000;
                              if (isLunas) {
                                paidSum += nominal;
                              } else {
                                unpaidSum += 110000;
                              }
                              return isLunas;
                            });

                            return (
                              <tr key={r.id} className="hover:bg-slate-50 transition border-b border-slate-350">
                                <td className="border border-slate-350 p-2 text-center">{idx + 1}</td>
                                <td className="border border-slate-350 p-2 font-bold text-slate-900">{r.namaPemilik}</td>
                                <td className="border border-slate-350 p-2 text-center font-mono text-slate-800">{r.noLapak}</td>
                                {monthlyStatus.map((isLunas, mIdx) => (
                                  <td 
                                    key={mIdx} 
                                    className={`border border-slate-350 p-1 text-center font-mono font-extrabold text-[10px] ${
                                      isLunas ? 'text-emerald-700 bg-emerald-50/20' : 'text-rose-600 bg-rose-50/10'
                                    }`}
                                  >
                                    {isLunas ? '✓' : '×'}
                                  </td>
                                ))}
                                <td className="border border-slate-350 p-2 text-right font-mono text-emerald-800 font-bold">{paidSum.toLocaleString('id-ID')}</td>
                                <td className={`border border-slate-350 p-2 text-right font-mono font-bold ${unpaidSum > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                                  {unpaidSum > 0 ? unpaidSum.toLocaleString('id-ID') : '0'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Report Statistics Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-xl border border-slate-300 bg-slate-50">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-505 block">Total Entitas</span>
                      <strong className="text-sm font-extrabold text-slate-900">
                        {activeSubTab === 'warga' ? `${filteredWarga.length} Kepala Keluarga` : `${filteredRombong.length} Lapak Rombong`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-505 block">Estimasi Kas Terbayar</span>
                      <strong className="text-sm font-extrabold text-emerald-800 font-mono">
                        Rp {((activeSubTab === 'warga' ? filteredWarga : filteredRombong) as any[]).reduce((total, item) => {
                          const billList = activeSubTab === 'warga' ? item.iuranRT : item.iuranRombong;
                          const paidTotal = billList
                            .filter((b: any) => b.lunas && (b.tahun === selectedBillingYear || (!b.tahun && selectedBillingYear === 2026)))
                            .reduce((s: number, b: any) => s + b.nominal, 0);
                          return total + paidTotal;
                        }, 0).toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div className="col-span-2 text-right hidden md:block">
                      <span className="text-[10px] italic text-slate-500 block">* Seluruh pembayaran terhitung dalam sistem akuntansi ganda RT 08</span>
                    </div>
                  </div>

                  {/* Signing Footer Block */}
                  <div className="grid grid-cols-2 gap-8 mt-12 text-center text-xs">
                    <div>
                      <p className="font-semibold text-slate-600 mb-16">Mengetahui,<br/>Ketua RT 008 RW 004</p>
                      <p className="font-black underline uppercase text-slate-900">{adminNameFormatted}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">NIP. 24.08.004.008.01</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-605 mb-16">Penanggung Jawab Keuangan,<br/>Bendahara RT 008</p>
                      <p className="font-black underline uppercase text-slate-900">{bendaharaNameFormatted}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">NIP. 24.08.004.008.02</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-4 no-print select-none">
                  <div className="bg-emerald-50 border border-emerald-150 text-emerald-850 p-4 rounded-2xl text-xs flex items-start gap-2.5">
                    <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-[13px] text-emerald-950">Daftar Tagihan Format Teks WhatsApp (WA)</p>
                      <p className="text-emerald-800 font-medium mt-0.5 leading-relaxed">
                        Berikut adalah daftar draf tagihan untuk draf pesan WhatsApp per {activeSubTab === 'warga' ? 'warga' : 'rombong'} sesuai filter aktif.
                        Anda dapat menyalin (Copy) draf pesan dengan klik tombol <strong>Salin Format WA</strong>, atau buka chat instan dengan klik <strong>Kirim WA</strong> secara cepat.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSubTab === 'warga' ? (
                      filteredWarga.map((w) => {
                        const rawMsg = getWhatsAppMessageText(w);
                        const isCopied = copiedId === w.id;
                        
                        return (
                          <div key={w.id} className="bg-slate-50 border border-slate-205 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h5 className="font-extrabold text-slate-900 text-sm leading-tight">{w.nama}</h5>
                                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-200 rounded text-slate-700 mt-1 inline-block">
                                    Blok {w.blok}-{w.noRumah}
                                  </span>
                                </div>
                                {w.noWa ? (
                                  <span className="text-[10px] font-mono text-slate-600 font-bold border border-slate-200 px-2 py-0.5 rounded bg-white shrink-0">
                                    📱 {w.noWa}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shrink-0">
                                    Belum ada WA
                                  </span>
                                )}
                              </div>

                              <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-[11px] font-mono whitespace-pre-line text-slate-700 leading-relaxed max-h-36 overflow-y-auto mt-2.5 shadow-inner select-text">
                                {rawMsg}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100 shrink-0">
                              <button
                                onClick={() => copyToClipboard(rawMsg, w.id)}
                                className={`flex-1 font-extrabold py-2 px-2.5 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                    : 'bg-slate-150 hover:bg-slate-200 text-slate-700 border border-slate-250'
                                }`}
                              >
                                {isCopied ? (
                                  <>Tersalin! ✓</>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    Salin Format WA
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  let cleanPhone = (w.noWa || '').replace(/\D/g, '');
                                  let formattedPhone = cleanPhone;
                                  if (formattedPhone.startsWith('0')) {
                                    formattedPhone = '62' + formattedPhone.slice(1);
                                  }
                                  const finalUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rawMsg)}`;
                                  window.open(finalUrl, '_blank');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center transition shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Kirim WA
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      filteredRombong.map((r) => {
                        const rawMsg = getWhatsAppRombongMessageText(r);
                        const isCopied = copiedId === r.id;

                        return (
                          <div key={r.id} className="bg-slate-50 border border-slate-205 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs transition">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h5 className="font-extrabold text-slate-900 text-sm leading-tight">{r.namaPemilik}</h5>
                                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-250 rounded text-slate-700 mt-1 inline-block">
                                    Lapak: {r.noLapak} ({r.lokasi})
                                  </span>
                                </div>
                                {r.noWa ? (
                                  <span className="text-[10px] font-mono text-slate-600 font-bold border border-slate-200 px-2 py-0.5 rounded bg-white shrink-0">
                                    📱 {r.noWa}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 shrink-0">
                                    Belum ada WA
                                  </span>
                                )}
                              </div>

                              <div className="bg-white border border-slate-200/80 rounded-xl p-3 text-[11px] font-mono whitespace-pre-line text-slate-700 leading-relaxed max-h-36 overflow-y-auto mt-2.5 shadow-inner select-text">
                                {rawMsg}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100 shrink-0">
                              <button
                                onClick={() => copyToClipboard(rawMsg, r.id)}
                                className={`flex-1 font-extrabold py-2 px-2.5 rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                    : 'bg-slate-150 hover:bg-slate-200 text-slate-700 border border-slate-250'
                                }`}
                              >
                                {isCopied ? (
                                  <>Tersalin! ✓</>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    Salin Format WA
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  let cleanPhone = (r.noWa || '').replace(/\D/g, '');
                                  let formattedPhone = cleanPhone;
                                  if (formattedPhone.startsWith('0')) {
                                    formattedPhone = '62' + formattedPhone.slice(1);
                                  }
                                  const finalUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(rawMsg)}`;
                                  window.open(finalUrl, '_blank');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center transition shadow-xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                Kirim WA
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer and cancel buttons */}
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0 no-print">
              <span className="text-[10px] text-slate-400 italic font-sans">
                {printFormatType === 'table' 
                  ? '* Gunakan kombinasi tombol Ctrl + P pada keyboard jika dialog cetak browser Anda tidak muncul otomatis.'
                  : '* Klik Salin Format WA untuk langsung menyalin rincian tagihan per warga.'
                }
              </span>
              <button
                onClick={() => setShowPrintBillingModal(false)}
                className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic System configuration Management Dialogue (Blok & Tahun) */}
      {showBlockManageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[95] animate-in fade-in duration-250 no-print">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-805 max-w-2xl md:max-w-3xl w-full">
            <button 
              onClick={() => {
                setShowBlockManageModal(false);
                setNewBlockInput('');
                setNewYearInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer p-1.5 rounded-full hover:bg-slate-50 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl">
                <Settings className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Pengaturan Batasan &amp; Parameter RT 08</h3>
                <p className="text-xs text-slate-500">Kelola daftar wilayah Blok rumah dan daftar Tahun Anggaran aktif.</p>
              </div>
            </div>

            {/* Split layout: Blok & Tahun */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Left Column: Blocks management */}
              <div className="space-y-4 pb-4 md:pb-0">
                <h4 className="text-xs font-black text-sky-700 uppercase tracking-wider">1. Wilayah Blok Rumah</h4>
                
                {/* List of current blocks */}
                <div className="space-y-2.5 font-mono">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Daftar Blok Tersimpan</label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {blocksList.map(b => (
                      <div key={b} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-800 shadow-3xs">
                        <span>Blok {b}</span>
                        <button
                          onClick={() => {
                            const inUse = wargaList.some(w => w.blok === b);
                            if (inUse) {
                              alert(`Blok ${b} tidak bisa dihapus karena masih digunakan oleh warga!`);
                              return;
                            }
                            if (confirm(`Apakah Anda yakin ingin menghapus Blok ${b}?`)) {
                              if (updateBlocksList) {
                                updateBlocksList(blocksList.filter(item => item !== b));
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer transition ml-0.5"
                          title={`Hapus Blok ${b}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Form box to add new block */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = newBlockInput.trim().toUpperCase();
                    if (!trimmed) return;
                    
                    if (blocksList.includes(trimmed)) {
                      alert(`Blok "${trimmed}" sudah ada!`);
                      return;
                    }

                    if (updateBlocksList) {
                      updateBlocksList([...blocksList, trimmed]);
                      setNewBlockInput('');
                    }
                  }}
                  className="space-y-2"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 font-sans">Sandi/Huruf Blok Baru</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newBlockInput}
                        onChange={(e) => setNewBlockInput(e.target.value)}
                        placeholder="Contoh: B2, D1, E3"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold uppercase font-sans"
                      />
                      <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs transition cursor-pointer shrink-0"
                      >
                        + Tambah Blok
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Column: Years management */}
              <div className="space-y-4 pt-4 md:pt-0 md:pl-6">
                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider">2. Tahun Buku / Anggaran</h4>
                
                {/* List of current years */}
                <div className="space-y-2.5 font-mono">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Daftar Tahun Aktif</label>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {yearsList.map(yr => {
                      // Check if year is in use (warga bills, rombong bills, ledger entries)
                      const hasWargaMatch = wargaList.some(w => w.iuranRT.some(b => b.tahun === yr));
                      const hasRombongMatch = rombongList.some(r => r.iuranRombong.some(b => b.tahun === yr));
                      const hasLedgerMatch = ledger.some(l => {
                        const dateYear = l.tanggal ? Number(l.tanggal.split('-')[0]) : 0;
                        return dateYear === yr || l.deskripsi?.includes(String(yr));
                      });
                      const inUse = hasWargaMatch || hasRombongMatch || hasLedgerMatch;
                      const isLastYear = yearsList.length <= 1;
                      const deletable = !inUse && !isLastYear;

                      return (
                        <div key={yr} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-800 shadow-3xs">
                          <span>Tahun {yr}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!deletable) {
                                alert(`Tahun ${yr} tidak dapat dihapus karena masih digunakan dalam catatan keuangan / tagihan, atau ini merupakan satu-satunya tahun yang tersisa.`);
                                return;
                              }
                              if (confirm(`Apakah Anda yakin ingin menghapus Tahun Anggaran ${yr}?`)) {
                                if (updateYearsList) {
                                  updateYearsList(yearsList.filter(item => item !== yr));
                                  // fallback selected billing year if deleted is currently selected
                                  if (selectedBillingYear === yr) {
                                    const nextAvail = yearsList.find(item => item !== yr);
                                    if (nextAvail) setSelectedBillingYear(nextAvail);
                                  }
                                }
                              }
                            }}
                            className={`p-0.5 rounded transition ml-0.5 cursor-pointer ${deletable ? 'text-slate-400 hover:text-rose-600' : 'text-slate-200 hover:text-slate-300'}`}
                            title={deletable ? `Hapus Tahun ${yr}` : 'Tahun sedang digunakan & terkunci dari penghapusan'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Input Form box to add new year */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const value = parseInt(newYearInput.trim());
                    if (isNaN(value) || value < 2000 || value > 2100) {
                      alert('Mohon masukkan tahun masehi yang valid (contoh: 2028, 2029)!');
                      return;
                    }
                    
                    if (yearsList.includes(value)) {
                      alert(`Tahun "${value}" sudah tercapai atau didaftarkan!`);
                      return;
                    }

                    if (updateYearsList) {
                      const updated = [...yearsList, value].sort((a, b) => a - b);
                      updateYearsList(updated);
                      setNewYearInput('');
                    }
                  }}
                  className="space-y-2"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 font-sans">Masukan Tahun Masehi Baru</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        required
                        value={newYearInput}
                        onChange={(e) => setNewYearInput(e.target.value)}
                        placeholder="Contoh: 2028"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs transition cursor-pointer shrink-0"
                      >
                        + Tambah Tahun
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowBlockManageModal(false);
                  setNewBlockInput('');
                  setNewYearInput('');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition duration-150"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

    </div>
  );
}
