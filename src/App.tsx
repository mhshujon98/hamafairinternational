import { useState, useEffect } from 'react';
import { Passenger } from './types';
import Dashboard from './components/Dashboard';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import PassengerList from './components/PassengerList';
import PassengerForm from './components/PassengerForm';
import PassengerDetails from './components/PassengerDetails';
import Login from './components/Login';
import { 
  Database, 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Clock, 
  CheckCircle,
  RefreshCw,
  Plane,
  PlaneTakeoff,
  LogOut,
  User,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null means checking, true/false means verified
  
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'database' | 'add'>('dashboard');
  const [loadingPassengers, setLoadingPassengers] = useState<boolean>(false);
  
  // Search & Detail state
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Load and verify auth session on mount with custom token persistence and Firebase fallback
  useEffect(() => {
    let active = true;
    let unsubscribeFirebase: (() => void) | null = null;

    const checkAuth = async () => {
      // 1. Check localStorage for custom token first
      const savedToken = localStorage.getItem('hamaf_token');
      const savedEmail = localStorage.getItem('hamaf_email');
      
      if (savedToken && savedEmail) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok && active) {
            setToken(savedToken);
            setUserEmail(savedEmail);
            setIsAuthenticated(true);
            return; // Skip Firebase auth check if custom token is valid
          } else {
            // Invalid token
            localStorage.removeItem('hamaf_token');
            localStorage.removeItem('hamaf_email');
          }
        } catch (e) {
          console.error("Failed to verify custom token:", e);
        }
      }

      if (!active) return;

      // 2. Fallback to Firebase onAuthStateChanged
      unsubscribeFirebase = onAuthStateChanged(auth, async (user) => {
        if (!active) return;
        if (user) {
          try {
            const idToken = await user.getIdToken();
            setToken(idToken);
            setUserEmail(user.email);
            setIsAuthenticated(true);
          } catch (e) {
            console.error("Error getting idToken", e);
            setIsAuthenticated(false);
          }
        } else {
          // If we haven't authenticated via custom token, then set authenticated to false
          const currentToken = localStorage.getItem('hamaf_token');
          if (!currentToken) {
            setToken(null);
            setUserEmail(null);
            setIsAuthenticated(false);
            setPassengers([]);
            setSelectedPassenger(null);
            setEditingPassenger(null);
          }
        }
      });
    };

    checkAuth();

    return () => {
      active = false;
      if (unsubscribeFirebase) {
        unsubscribeFirebase();
      }
    };
  }, []);

  // Fetch passengers whenever authentication state changes to true
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPassengers();
    }
  }, [isAuthenticated, token]);

  const fetchPassengers = async () => {
    if (!token) return;
    setLoadingPassengers(true);
    try {
      const res = await fetch('/api/passengers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPassengers(data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (e) {
      console.error("Failed to fetch passengers", e);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const handleLoginSuccess = (newToken: string, newEmail: string) => {
    localStorage.setItem('hamaf_token', newToken);
    localStorage.setItem('hamaf_email', newEmail);
    setToken(newToken);
    setUserEmail(newEmail);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('hamaf_token');
      localStorage.removeItem('hamaf_email');
      setToken(null);
      setUserEmail(null);
      setIsAuthenticated(false);
      setPassengers([]);
      setSelectedPassenger(null);
      setEditingPassenger(null);
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Add or edit passenger handler (Using safe server API)
  const handleFormSubmit = async (formData: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt' | 'ownerPhone' | 'ownerEmail'>) => {
    if (!token) return;
    
    try {
      if (editingPassenger) {
        // Editing Passenger via API
        const res = await fetch(`/api/passengers/${editingPassenger.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          const updated = await res.json();
          setPassengers(passengers.map((p) => p.id === editingPassenger.id ? updated : p));
          setEditingPassenger(null);
          setActiveTab('database');
        } else {
          const errData = await res.json();
          alert(errData.error || 'যাত্রীর তথ্য পরিবর্তন করতে ব্যর্থ হয়েছে।');
        }
      } else {
        // Creating New Passenger via API
        const res = await fetch('/api/passengers', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          const newPassenger = await res.json();
          setPassengers([newPassenger, ...passengers]);
          setActiveTab('database');
        } else {
          const errData = await res.json();
          alert(errData.error || 'নতুন যাত্রী যোগ করতে ব্যর্থ হয়েছে।');
        }
      }
    } catch (e) {
      console.error("Error submitting passenger form", e);
      alert('সার্ভার কানেকশন ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // Live update passenger details (installments) from modal
  const handleUpdatePassenger = async (updatedPassenger: Passenger) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/passengers/${updatedPassenger.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPassenger)
      });

      if (res.ok) {
        const updated = await res.json();
        setPassengers(passengers.map((p) => p.id === updated.id ? updated : p));
        setSelectedPassenger(updated);
      } else {
        const errData = await res.json();
        alert(errData.error || 'তথ্য আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error("Error updating passenger", e);
    }
  };

  // Delete passenger handler via API
  const handleDeletePassenger = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/passengers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setPassengers(passengers.filter((p) => p.id !== id));
        if (selectedPassenger?.id === id) {
          setSelectedPassenger(null);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'যাত্রীর তথ্য ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error("Error deleting passenger", e);
    }
  };

  // Filter passengers for the top quick search dropdown
  const quickSearchMatches = headerSearch.trim()
    ? passengers.filter(
        (p) =>
          p.name.toLowerCase().includes(headerSearch.toLowerCase()) ||
          p.passportNumber.toLowerCase().includes(headerSearch.toLowerCase()) ||
          p.phone.includes(headerSearch)
      )
    : [];

  // Reset database to initial defaults (securely mapped to user phone)
  const handleResetToDefaults = async () => {
    if (!token) return;
    if (confirm('আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট ডাটাবেজ রিসেট করে ডেমো যাত্রী ডেটা লোড করতে চান? এটি আপনার অন্য কোনো ডেটা পরিবর্তন করবে না।')) {
      try {
        const res = await fetch('/api/passengers/reset', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPassengers(data.passengers);
          alert('আপনার অ্যাকাউন্টের ডেমো ডেটা সফলভাবে রিসেট ও লোড করা হয়েছে!');
        } else {
          alert('রিসেট করতে ব্যর্থ হয়েছে।');
        }
      } catch (e) {
        console.error("Error resetting data", e);
      }
    }
  };

  // 1. SHOW LOADING WHILE AUTH STATE IS BEING DETERMINED
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="space-y-4 text-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">নিরাপত্তা ভেরিফিকেশন চলছে...</p>
        </div>
      </div>
    );
  }

  // 2. SHOW LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. SHOW AUTHENTICATED MAIN APPLICATION
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans">
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo/Agency Identity with Airplane Icon */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
                <PlaneTakeoff className="h-5.5 w-5.5 animate-bounce" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-wider uppercase font-sans text-white leading-none flex items-center gap-1">
                  <span>Hamaf Air International</span>
                </h1>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 block">
                  Travel Agency Database
                </span>
              </div>
            </div>

            {/* 2. DYNAMIC TOP SEARCH BAR (Core Requirement) */}
            <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  id="header-global-search"
                  type="text"
                  placeholder="যাত্রীর নাম লিখে সার্চ করুন..."
                  value={headerSearch}
                  onChange={(e) => {
                    setHeaderSearch(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 hover:bg-slate-700/80 focus:bg-white text-slate-200 focus:text-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-xs focus:outline-hidden transition-all placeholder-slate-400 font-medium"
                />
              </div>

              {/* Instant Search Matches Dropdown */}
              {showSearchDropdown && headerSearch.trim() && (
                <div id="search-dropdown-box" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto z-50 text-gray-800">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">অনুসন্ধান ফলাফল ({quickSearchMatches.length})</span>
                    <button 
                      onClick={() => setShowSearchDropdown(false)} 
                      className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      বন্ধ করুন (Close)
                    </button>
                  </div>
                  {quickSearchMatches.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      উক্ত নামে কোনো যাত্রী খুঁজে পাওয়া যায়নি!
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {quickSearchMatches.map((passenger) => (
                        <button
                          key={passenger.id}
                          onClick={() => {
                            setSelectedPassenger(passenger);
                            setHeaderSearch('');
                            setShowSearchDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div>
                            <span className="text-xs font-bold text-gray-950 block">{passenger.name}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">Passport: {passenger.passportNumber} • {passenger.destination}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            passenger.visaStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {passenger.visaStatus}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Status and Logout Button */}
            <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  নিরাপদ সেশন
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {userEmail}
                </span>
              </div>
              <div className="p-1.5 bg-slate-850 rounded-xl flex items-center gap-1.5 border border-slate-800">
                <button
                  onClick={handleLogout}
                  title="লগআউট করুন"
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">লগআউট</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE ONLY SEARCH BOX */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 sm:hidden block sticky top-16 z-30">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="header-global-search-mobile"
            type="text"
            placeholder="যাত্রীর নাম লিখে সার্চ করুন..."
            value={headerSearch}
            onChange={(e) => {
              setHeaderSearch(e.target.value);
              setShowSearchDropdown(true);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 focus:border-blue-500 rounded-xl text-xs focus:outline-hidden"
          />
          {showSearchDropdown && headerSearch.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto z-50 text-gray-800">
              <div className="divide-y divide-gray-100">
                {quickSearchMatches.map((passenger) => (
                  <button
                    key={passenger.id}
                    onClick={() => {
                      setSelectedPassenger(passenger);
                      setHeaderSearch('');
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-950 block">{passenger.name}</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">{passenger.passportNumber} • {passenger.destination}</span>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-600">{passenger.visaStatus}</span>
                  </button>
                ))}
                {quickSearchMatches.length === 0 && (
                  <div className="px-4 py-4 text-center text-xs text-gray-400">কোনো যাত্রী পাওয়া যায়নি</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. HERO SUB-HEADER DESIGN */}
      <div className="bg-slate-900 text-white pb-24 pt-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Background mesh glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest w-fit border border-blue-500/20 shadow-xs">
              <Plane className="h-4 w-4 animate-pulse text-blue-400" />
              <span>Hamaf Air International Travel Agency</span>
            </div>
            
            {/* Main Styled Heading with Airplane Graphic */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
                  Hamaf Air International
                </span>
                <span className="inline-flex items-center justify-center p-1.5 bg-blue-600/30 text-blue-400 rounded-full border border-blue-500/30 animate-pulse">
                  <PlaneTakeoff className="h-6 w-6 sm:h-8 sm:w-8" />
                </span>
              </h2>
              <h3 className="text-lg sm:text-xl font-bold text-slate-300">
                যাত্রী তথ্য সংরক্ষণ, অনুসন্ধান ও ট্র্যাকিং ডাটাবেজ
              </h3>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              নিরাপদ ক্লাউড ডাটাবেজ সিস্টেমে যাত্রীদের পাসপোর্ট নম্বর, ভিসা এবং টিকিটের তথ্য স্বয়ংক্রিয়ভাবে তালিকাভুক্ত করুন। আপনার অ্যাকাউন্ট নম্বর দিয়ে লগইন করা অবস্থায় শুধুমাত্র আপনারই নিবন্ধিত ডেটা এখানে দেখতে পাবেন।
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => setActiveTab('add')}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 cursor-pointer border border-blue-500/30 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>নতুন যাত্রী নিবন্ধন করুন</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <RefreshCw className="h-4 w-4 text-slate-400" />
              <span>রিসেট ডেমো ডেটা (Reset)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12 relative z-20">
        
        {/* Navigation Tabs Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Dashboard */}
          <button
            onClick={() => { setActiveTab('dashboard'); setEditingPassenger(null); }}
            className={`group text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-white border-blue-500/50 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/30'
                : 'bg-white hover:bg-slate-50/50 border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            {activeTab === 'dashboard' && (
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            )}
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
              }`}>
                <LayoutDashboard className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm sm:text-base font-bold transition-colors duration-200 ${
                    activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-700'
                  }`}>সারাংশ ড্যাশবোর্ড</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold uppercase tracking-wider font-mono">Live</span>
                </div>
                <p className="text-xs text-slate-400 font-sans font-medium">সার্বিক অবস্থা, রিয়েল-টাইম চার্ট ও পরিসংখ্যান</p>
              </div>
            </div>
          </button>

          {/* Card 2: Passenger Database */}
          <button
            onClick={() => { setActiveTab('database'); setEditingPassenger(null); }}
            className={`group text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
              activeTab === 'database'
                ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-500/50 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/30'
                : 'bg-white hover:bg-slate-50/50 border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            {activeTab === 'database' && (
              <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'database'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
              }`}>
                <Database className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm sm:text-base font-bold transition-colors duration-200 ${
                    activeTab === 'database' ? 'text-slate-900' : 'text-slate-700'
                  }`}>যাত্রী ডাটাবেজ</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold font-mono">
                    {passengers.length} জন
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans font-medium">পাসপোর্ট, ভিসা ও টিকিট অনুসন্ধান ও ট্র্যাকিং</p>
              </div>
            </div>
          </button>

          {/* Card 3: Form */}
          <button
            onClick={() => { setActiveTab('add'); setEditingPassenger(null); }}
            className={`group text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${
              activeTab === 'add' || editingPassenger !== null
                ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-white border-purple-500/50 shadow-md shadow-purple-500/5 ring-1 ring-purple-500/30'
                : 'bg-white hover:bg-slate-50/50 border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            {(activeTab === 'add' || editingPassenger !== null) && (
              <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                activeTab === 'add' || editingPassenger !== null
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
              }`}>
                <PlusCircle className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm sm:text-base font-bold transition-colors duration-200 ${
                    (activeTab === 'add' || editingPassenger !== null) ? 'text-slate-900' : 'text-slate-700'
                  }`}>
                    {editingPassenger ? '정보 수정' : 'যাত্রী তথ্য ফরম'}
                  </span>
                  {editingPassenger && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold animate-pulse">Editing</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-sans font-medium">
                  {editingPassenger ? 'যাত্রী বিবরণ সংশোধন বা আপডেট করুন' : 'নতুন ট্রাভেল এন্ট্রি ও পাসপোর্ট ডেটা ফরম'}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Tab View Contents */}
        <div className="space-y-6">
          {/* SECURE LOADING SCREEN FOR DATABASE DATA */}
          {loadingPassengers ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ডাটাবেজ লোড হচ্ছে...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <Dashboard passengers={passengers} />
                  
                  {/* Security Assurance Banner */}
                  <div className="border border-blue-500/10 rounded-2xl bg-blue-500/5 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">জিরো-ট্রাস্ট অ্যাকাউন্ট সিকিউরিটি সক্রিয়</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          আপনার ডাটাবেজ সম্পূর্ণ আলাদা। আপনি ছাড়া অন্য কোনো ব্যবহারকারী আপনার নিবন্ধিত তথ্য অ্যাক্সেস বা সার্চ করতে পারবেন না।
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('database')} 
                      className="text-xs font-bold text-blue-700 hover:underline cursor-pointer bg-blue-50 hover:bg-blue-100/70 px-4 py-2 rounded-xl transition-all"
                    >
                      ডাটাবেজ টেবিল ভিউ দেখুন →
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'database' && (
                <PassengerList
                  passengers={passengers}
                  onView={(p) => setSelectedPassenger(p)}
                  onEdit={(p) => {
                    setEditingPassenger(p);
                    setActiveTab('add');
                  }}
                  onDelete={handleDeletePassenger}
                  onAddNew={() => {
                    setEditingPassenger(null);
                    setActiveTab('add');
                  }}
                />
              )}

              {(activeTab === 'add' || editingPassenger !== null) && (
                <PassengerForm
                  passenger={editingPassenger}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setEditingPassenger(null);
                    setActiveTab('database');
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* 5. PASSENGER DETAIL MODAL WINDOW */}
      {selectedPassenger && (
        <PassengerDetails
          passenger={selectedPassenger}
          onClose={() => setSelectedPassenger(null)}
          onUpdatePassenger={handleUpdatePassenger}
        />
      )}

      {/* 6. BOTTOM BRAND FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-center text-xs mt-auto font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 Hamaf Air International Travel Agency. All Rights Reserved.</p>
          <p className="text-slate-600 text-[10px]">
            Designed for hamafairinternational.vercel.app • Secure Full-Stack OTP Auth System
          </p>
        </div>
      </footer>

    </div>
  );
}
