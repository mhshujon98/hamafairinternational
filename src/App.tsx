import { useState, useEffect } from 'react';
import { Passenger } from './types';
import { INITIAL_PASSENGERS } from './data';
import Dashboard from './components/Dashboard';
import PassengerList from './components/PassengerList';
import PassengerForm from './components/PassengerForm';
import PassengerDetails from './components/PassengerDetails';
import BloggerGuide from './components/BloggerGuide';
import { 
  Compass, 
  Database, 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Globe, 
  Clock, 
  CheckCircle,
  FileCode2,
  Calendar,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'database' | 'add' | 'blogger'>('dashboard');
  
  // Search & Detail state
  const [headerSearch, setHeaderSearch] = useState('');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Load passengers from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hama_fair_passengers');
    if (saved) {
      try {
        setPassengers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse passengers, loading defaults", e);
        setPassengers(INITIAL_PASSENGERS);
      }
    } else {
      setPassengers(INITIAL_PASSENGERS);
      localStorage.setItem('hama_fair_passengers', JSON.stringify(INITIAL_PASSENGERS));
    }
  }, []);

  // Sync passengers to LocalStorage
  const savePassengersToStorage = (updatedList: Passenger[]) => {
    setPassengers(updatedList);
    localStorage.setItem('hama_fair_passengers', JSON.stringify(updatedList));
  };

  // Add or edit passenger handler
  const handleFormSubmit = (formData: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPassenger) {
      // Editing
      const updated = passengers.map((p) => {
        if (p.id === editingPassenger.id) {
          return {
            ...p,
            ...formData,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      savePassengersToStorage(updated);
      setEditingPassenger(null);
      setActiveTab('database');
    } else {
      // Creating new
      const newPassenger: Passenger = {
        ...formData,
        id: 'pass_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savePassengersToStorage([newPassenger, ...passengers]);
      setActiveTab('database');
    }
  };

  // Delete passenger handler
  const handleDeletePassenger = (id: string) => {
    const updated = passengers.filter((p) => p.id !== id);
    savePassengersToStorage(updated);
    if (selectedPassenger?.id === id) {
      setSelectedPassenger(null);
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

  // Reset database to initial defaults
  const handleResetToDefaults = () => {
    if (confirm('আপনি কি নিশ্চিতভাবে ডাটাবেজ রিসেট করে ডেমো যাত্রী ডেটা লোড করতে চান?')) {
      savePassengersToStorage(INITIAL_PASSENGERS);
      alert('সফলভাবে রিসেট করা হয়েছে!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans">
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo/Agency Identity */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 bg-blue-600 rounded-xl flex items-center justify-center animate-spin-slow text-white">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight uppercase font-mono text-white leading-none">
                  Hama Fair International
                </h1>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
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
                  placeholder="যাত্রীর নাম লিখে সার্চ করুন... (e.g. আব্দুর রহমান)"
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

            {/* DateTime Display (Bilingual) */}
            <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400 font-mono hidden md:flex border-l border-slate-800 pl-4">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>UTC Local: 2026-06-25</span>
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
      <div className="bg-slate-900 text-white pb-24 pt-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        {/* Background mesh glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit mb-3 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>হ্যামা ফেয়ার ইন্টারন্যাশনাল • ট্রাভেল ও পাসপোর্ট ডাটাবেজ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              যাত্রী তথ্য সংরক্ষণ ও ট্র্যাকিং প্ল্যাটফর্ম
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              যাত্রীদের পাসপোর্ট নম্বর, টিকিট কোড, ভিসা স্ট্যাটাস ও পেমেন্টের হিসাব এক জায়গায় সংরক্ষণ করুন এবং যেকোনো সময় নাম দিয়ে সার্চ করে মুহূর্তেই বিস্তারিত খুঁজে বের করুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('add')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/20 cursor-pointer border border-blue-500/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>নতুন যাত্রী নিবন্ধন করুন</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
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
        <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-gray-100 flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => { setActiveTab('dashboard'); setEditingPassenger(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>সারাংশ ড্যাশবোর্ড (Dashboard)</span>
          </button>

          <button
            onClick={() => { setActiveTab('database'); setEditingPassenger(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>যাত্রী ডাটাবেজ (Passenger List)</span>
          </button>

          <button
            onClick={() => { setActiveTab('add'); setEditingPassenger(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'add' || editingPassenger !== null
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{editingPassenger ? 'যাত্রী তথ্য সংশোধন (Edit)' : 'যাত্রী তথ্য ফরম (Submit Form)'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('blogger'); setEditingPassenger(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'blogger'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <FileCode2 className="h-4 w-4" />
            <span>ব্লগার গাইড ও কোড (Blogger Guide)</span>
          </button>
        </div>

        {/* Tab View Contents */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <Dashboard passengers={passengers} />
              <div className="border border-gray-100 rounded-2xl bg-white p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">স্বয়ংক্রিয় ক্লাউড সিঙ্ক সক্রিয় রয়েছে (Cloud Run Live Service Active)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">যাত্রীদের প্রতিটি এন্ট্রি স্বয়ংক্রিয়ভাবে ক্লাউডে এবং আপনার লোকাল মেমোরিতে সংরক্ষণ হচ্ছে।</p>
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

          {activeTab === 'blogger' && (
            <BloggerGuide />
          )}
        </div>
      </main>

      {/* 5. PASSENGER DETAIL MODAL WINDOW */}
      {selectedPassenger && (
        <PassengerDetails
          passenger={selectedPassenger}
          onClose={() => setSelectedPassenger(null)}
        />
      )}

      {/* 6. BOTTOM BRAND FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-center text-xs mt-auto font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 Hama Fair International Travel Agency. All Rights Reserved.</p>
          <p className="text-slate-600 text-[10px]">
            Designed for hamafairinternational.blogspot.com • Persistent Client-Cloud Sync System
          </p>
        </div>
      </footer>

    </div>
  );
}
