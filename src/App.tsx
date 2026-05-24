import React, { useState, useEffect } from 'react';
import { Balance, LedgerEntry, WargaBill, RombongBill, AppUser } from './types';
import { INITIAL_BALANCES, INITIAL_LEDGER, INITIAL_WARGA, INITIAL_ROMBONG, INITIAL_USERS } from './data';
import Dashboard from './components/Dashboard';
import TagihanWarga from './components/TagihanWarga';
import Ledger from './components/Ledger';
import LoginModal from './components/LoginModal';
import UserManagementModal from './components/UserManagementModal';
import { 
  Coins, 
  LayoutDashboard, 
  Receipt, 
  BookOpen, 
  PlusSquare, 
  LogOut, 
  LogIn, 
  RotateCcw,
  Sparkles,
  Calendar,
  ShieldAlert,
  User,
  Menu,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tagihan' | 'buku_kas'>('dashboard');
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('perumtas_rt08_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('perumtas_rt08_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [blocksList, setBlocksList] = useState<string[]>(() => {
    const saved = localStorage.getItem('perumtas_rt08_blocks');
    return saved ? JSON.parse(saved) : ['A4', 'A3', 'C5', 'C3'];
  });
  const [yearsList, setYearsList] = useState<number[]>(() => {
    const saved = localStorage.getItem('perumtas_rt08_years');
    return saved ? JSON.parse(saved) : [2024, 2025, 2026, 2027, 2028];
  });
  const [rateRT, setRateRT] = useState<number>(() => {
    const saved = localStorage.getItem('perumtas_rt08_rate_rt');
    return saved ? parseInt(saved, 10) : 35000;
  });
  const [rateRombong, setRateRombong] = useState<number>(() => {
    const saved = localStorage.getItem('perumtas_rt08_rate_rombong');
    return saved ? parseInt(saved, 10) : 50000;
  });
  const [rtTitle, setRtTitle] = useState<string>(() => {
    const saved = localStorage.getItem('perumtas_rt08_title');
    return saved || 'PENGURUS RUKUN TETANGGA 008 RUKUN WARGA 004';
  });
  const [rtAddress, setRtAddress] = useState<string>(() => {
    const saved = localStorage.getItem('perumtas_rt08_address');
    return saved || 'PERUMTAS 3 RT.008 RW.004 DESA POPOH KEC WONOAYU KABUPATEN SIDOARJO 61261';
  });
  const [rtEmail, setRtEmail] = useState<string>(() => {
    const saved = localStorage.getItem('perumtas_rt08_email');
    return saved || 'tas3.rt.08@gmail.com';
  });
  const [showUserManagement, setShowUserManagement] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [resetConfirmInput, setResetConfirmInput] = useState<string>('');

  useEffect(() => {
    const handleFocusIn = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (
        target && 
        (target.tagName === 'INPUT' || 
         target.tagName === 'TEXTAREA' || 
         target.tagName === 'SELECT' || 
         target.isContentEditable)
      ) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeEl = document.activeElement as HTMLElement | null;
        if (
          !activeEl || 
          (activeEl.tagName !== 'INPUT' && 
           activeEl.tagName !== 'TEXTAREA' && 
           activeEl.tagName !== 'SELECT' && 
           !activeEl.isContentEditable)
        ) {
          setIsInputFocused(false);
        }
      }, 60);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const isLoggedIn = !!currentUser;

  // Sync currentUser with usersList updates automatically
  useEffect(() => {
    if (currentUser) {
      const updatedMe = usersList.find(u => u.id === currentUser.id);
      if (updatedMe && (
        updatedMe.nama !== currentUser.nama || 
        updatedMe.username !== currentUser.username || 
        updatedMe.role !== currentUser.role || 
        updatedMe.pin !== currentUser.pin
      )) {
        setCurrentUser(updatedMe);
      }
    }
  }, [usersList, currentUser]);

  // Core financial states persisted to Local Storage
  const [kas, setKas] = useState<Balance>(() => {
    const saved = localStorage.getItem('perumtas_rt08_kas');
    return saved ? JSON.parse(saved) : INITIAL_BALANCES;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('perumtas_rt08_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [wargaList, setWargaList] = useState<WargaBill[]>(() => {
    const saved = localStorage.getItem('perumtas_rt08_warga');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && ('iuranKebersihan' in parsed[0])) {
          localStorage.removeItem('perumtas_rt08_warga');
          return INITIAL_WARGA;
        }
        return parsed;
      } catch (e) {
        return INITIAL_WARGA;
      }
    }
    return INITIAL_WARGA;
  });

  const [rombongList, setRombongList] = useState<RombongBill[]>(() => {
    const saved = localStorage.getItem('perumtas_rt08_rombong');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && ('iuranSewa' in parsed[0])) {
          localStorage.removeItem('perumtas_rt08_rombong');
          return INITIAL_ROMBONG;
        }
        return parsed;
      } catch (e) {
        return INITIAL_ROMBONG;
      }
    }
    return INITIAL_ROMBONG;
  });

  // Sync to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('perumtas_rt08_kas', JSON.stringify(kas));
  }, [kas]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_warga', JSON.stringify(wargaList));
  }, [wargaList]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_rombong', JSON.stringify(rombongList));
  }, [rombongList]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_blocks', JSON.stringify(blocksList));
  }, [blocksList]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_years', JSON.stringify(yearsList));
  }, [yearsList]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_rate_rt', rateRT.toString());
  }, [rateRT]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_rate_rombong', rateRombong.toString());
  }, [rateRombong]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_title', rtTitle);
  }, [rtTitle]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_address', rtAddress);
  }, [rtAddress]);

  useEffect(() => {
    localStorage.setItem('perumtas_rt08_email', rtEmail);
  }, [rtEmail]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('perumtas_rt08_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('perumtas_rt08_current_user');
    }
  }, [currentUser]);

  // Force automatic first-time load reset to ensure older browser cache is cleared with empty initial values
  useEffect(() => {
    const isCleaned = localStorage.getItem('perumtas_rt08_empty_init_v5');
    if (!isCleaned) {
      localStorage.setItem('perumtas_rt08_empty_init_v5', 'true');
      localStorage.removeItem('perumtas_rt08_kas');
      localStorage.removeItem('perumtas_rt08_ledger');
      localStorage.removeItem('perumtas_rt08_warga');
      localStorage.removeItem('perumtas_rt08_rombong');
      localStorage.removeItem('perumtas_rt08_rate_rt');
      localStorage.removeItem('perumtas_rt08_rate_rombong');
      
      setKas(INITIAL_BALANCES);
      setLedger(INITIAL_LEDGER);
      setWargaList(INITIAL_WARGA);
      setRombongList(INITIAL_ROMBONG);
      setRateRT(35000);
      setRateRombong(50000);
    }
  }, []);

  // Handle adding custom transactions
  const addLedgerEntry = (entry: Omit<LedgerEntry, 'id'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: `tx-${Date.now()}`
    };
    setLedger(prev => [newEntry, ...prev]);
  };

  // Reset Application Data Helper (Admin ONLY)
  const handleResetData = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Akses Ditolak: Hanya pengguna dengan peran Admin (Ketua RT) yang diberikan hak akses untuk mengosongkan pembukuan & data.');
      return;
    }
    setShowResetConfirmModal(true);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${
      isInputFocused ? 'pb-8' : 'pb-32'
    }`}>
      
      {/* Top Header Banner */}
      <header className={`sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs z-40 transition-all duration-300 ${
        isInputFocused ? 'max-md:-translate-y-full max-md:absolute max-md:opacity-0' : 'translate-y-0'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10">
              <Coins className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                Kas Perumtas 3 RT 08
              </h1>
              <span className="text-[10px] md:text-xs font-semibold text-sky-600 font-mono tracking-wide uppercase mt-1 block">
                Sistem Pengelolaan Keuangan & Tagihan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time formatted date */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs text-slate-600 font-mono">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Jumat, 22 Mei 2026</span>
            </div>



            {/* Admin Login Indicator Button */}
            {isLoggedIn ? (
              <button
                onClick={() => setCurrentUser(null)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100/50 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar ({currentUser?.nama.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-sky-600/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Pengurus</span>
              </button>
            )}
          </div>
        </div>
      </header>
 
      {/* Main Container Workspace */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        
        {/* Admin Operational Alert Panel */}
        {isLoggedIn && activeTab === 'dashboard' && (
          <div className="mb-6 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 text-sky-750 rounded-xl">
                <CheckCircle2 className="w-5 h-5 pointer-events-none text-sky-600" />
              </div>
              <div>
                <div className="text-slate-800 font-extrabold text-sm flex flex-wrap items-center gap-1.5">
                  <span>Sesi Aktif:</span>
                  <span className="text-sky-705 font-black">{currentUser?.nama}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-mono font-black ${currentUser?.role === 'admin' ? 'bg-indigo-100 border border-indigo-200 text-indigo-800' : 'bg-emerald-100 border border-emerald-250 text-emerald-800'}`}>
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Bendahara'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {currentUser?.role === 'admin' 
                    ? 'Akses Penuh: Anda diizinkan untuk menambah/mengedit akun pengurus RT, menyunting mutasi, register warga, dan mengurus pencatatan kas.' 
                    : 'Akses Pencatat (Bendahara): Anda diizinkan melakukan pencatatan buku kas masuk/keluar serta memperbarui status iuran warga.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-center">
              {isLoggedIn && (
                <button
                  onClick={() => setShowUserManagement(true)}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-sm active:scale-95"
                  title="Kelola akun & nama pengurus RT"
                >
                  <Users className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  <span>Kelola Pengurus RT</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab content switches */}
        <div className="focus-tab-view animate-in fade-in duration-300">
          {activeTab === 'dashboard' && (
            <Dashboard 
              kas={kas} 
              updateKas={setKas} 
              ledger={ledger} 
              addLedgerEntry={addLedgerEntry} 
              isLoggedIn={isLoggedIn}
            />
          )}

          {activeTab === 'tagihan' && (
            <TagihanWarga 
              wargaList={wargaList} 
              updateWargaList={setWargaList}
              rombongList={rombongList}
              updateRombongList={setRombongList}
              kas={kas}
              updateKas={setKas}
              addLedgerEntry={addLedgerEntry}
              isLoggedIn={isLoggedIn}
              ledger={ledger}
              currentUser={currentUser}
              usersList={usersList}
              blocksList={blocksList}
              updateBlocksList={setBlocksList}
              yearsList={yearsList}
              updateYearsList={setYearsList}
              rateRT={rateRT}
              updateRateRT={setRateRT}
              rateRombong={rateRombong}
              updateRateRombong={setRateRombong}
              onTriggerReset={handleResetData}
              rtTitle={rtTitle}
              updateRtTitle={setRtTitle}
              rtAddress={rtAddress}
              updateRtAddress={setRtAddress}
              rtEmail={rtEmail}
              updateRtEmail={setRtEmail}
            />
          )}

          {activeTab === 'buku_kas' && (
            <Ledger 
              ledger={ledger}
              setLedger={setLedger}
              kas={kas}
              updateKas={setKas}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              usersList={usersList}
              yearsList={yearsList}
              rtTitle={rtTitle}
              rtAddress={rtAddress}
              rtEmail={rtEmail}
            />
          )}
        </div>

      </main>

      {/* Styled Responsive Docked Bottom Navigation Panel */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white/85 backdrop-blur-md border-t border-slate-200/60 z-40 transition-all duration-300 ${
        isInputFocused
          ? 'translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}>
        <div className="max-w-xl mx-auto flex items-center justify-around gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xl">
          
          {/* Dasbor Button */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-3 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
            id="tab-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dasbor</span>
          </button>

          {/* Tagihan Button */}
          <button 
            onClick={() => setActiveTab('tagihan')}
            className={`flex-1 py-3 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'tagihan' 
                ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
            id="tab-tagihan"
          >
            <Receipt className="w-4 h-4" />
            <span>Daftar Tagihan</span>
          </button>

          {/* Buku Kas Ledger Button */}
          <button 
            onClick={() => setActiveTab('buku_kas')}
            className={`flex-1 py-3 px-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'buku_kas' 
                ? 'bg-sky-50 text-sky-600 border border-sky-100' 
                : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
            }`}
            id="tab-buku_kas"
          >
            <BookOpen className="w-4 h-4" />
            <span>Buku Kas</span>
          </button>

        </div>
      </div>

      {/* Persistent Login Modal Dialog */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        users={usersList}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // Set tab to active edit tab for smooth experience
          setActiveTab('dashboard');
        }}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        users={usersList}
        onUpdateUsers={setUsersList}
        currentUser={currentUser}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-800 max-w-md w-full">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3 mb-4">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl animate-pulse">
                <ShieldAlert className="w-6 h-6 animate-pulse text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Konfirmasi Pengosongan Data</h3>
                <p className="text-[11px] text-slate-400 font-semibold font-mono tracking-wide uppercase">Peringatan Kritis Keamanan</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Tindakan ini akan <strong className="text-rose-600">menghapus seluruh data secara permanen</strong> termasuk:
              </p>
              <ul className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-150 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Seluruh mutasi mutasi masuk/keluar buku kas RT</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Seluruh riwayat pembayaran & tagihan warga</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Seluruh riwayat iuran & sewa rombong pedagang</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>Pengaturan Blok Rumah & parameter tarif iuran default</span>
                </li>
              </ul>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Untuk meminimalkan kesalahan, silakan ketik kata <strong className="text-rose-650 font-extrabold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-mono">HAPUS</strong> di bawah ini:
                </label>
                <input
                  type="text"
                  placeholder="Ketik HAPUS untuk konfirmasi"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-extrabold font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex gap-2.5 justify-end mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirmModal(false);
                  setResetConfirmInput('');
                }}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-805 font-bold rounded-xl text-xs cursor-pointer transition active:scale-95 flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetConfirmInput.trim().toUpperCase() !== 'HAPUS'}
                onClick={() => {
                  if (resetConfirmInput.trim().toUpperCase() === 'HAPUS') {
                    // Execute reset
                    setKas(INITIAL_BALANCES);
                    setLedger(INITIAL_LEDGER);
                    setWargaList(INITIAL_WARGA);
                    setRombongList(INITIAL_ROMBONG);
                    setBlocksList(['A4', 'A3', 'C5', 'C3']);
                    setRateRT(35000);
                    setRateRombong(50000);
                    setActiveTab('dashboard');
                    setShowResetConfirmModal(false);
                    setResetConfirmInput('');
                    alert('Seluruh data pembukuan, warga, dan rombong berhasil dikosongkan.');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-750 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-250 text-white font-extrabold rounded-xl text-xs cursor-pointer transition flex-1 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Seluruh Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
