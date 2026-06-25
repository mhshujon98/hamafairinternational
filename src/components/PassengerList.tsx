import { useState } from 'react';
import { Passenger, VisaStatus, TicketStatus, PaymentStatus } from '../types';
import { Search, Eye, Edit2, Trash2, SlidersHorizontal, ArrowUpDown, Download, Plus } from 'lucide-react';

interface PassengerListProps {
  passengers: Passenger[];
  onView: (passenger: Passenger) => void;
  onEdit: (passenger: Passenger) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function PassengerList({ passengers, onView, onEdit, onDelete, onAddNew }: PassengerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [visaFilter, setVisaFilter] = useState<string>('All');
  const [ticketFilter, setTicketFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'travelDate' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter passengers
  const filteredPassengers = passengers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const matchesVisa = visaFilter === 'All' || p.visaStatus === visaFilter;
    const matchesTicket = ticketFilter === 'All' || p.ticketStatus === ticketFilter;
    const matchesPayment = paymentFilter === 'All' || p.paymentStatus === paymentFilter;

    return matchesSearch && matchesVisa && matchesTicket && matchesPayment;
  });

  // Sort passengers
  const sortedPassengers = [...filteredPassengers].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'travelDate') {
      comparison = a.travelDate.localeCompare(b.travelDate);
    } else if (sortField === 'createdAt') {
      comparison = a.createdAt.localeCompare(b.createdAt);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: 'name' | 'travelDate' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export to CSV function
  const exportToCSV = () => {
    if (passengers.length === 0) return;

    // CSV headers
    const headers = [
      'Name',
      'Passport Number',
      'Phone',
      'Email',
      'Destination',
      'Flight Number',
      'Travel Date',
      'Visa Status',
      'Ticket Status',
      'Payment Status',
      'Total Amount',
      'Amount Paid',
      'Amount Due',
      'Remarks',
    ];

    // Map passengers to rows
    const rows = passengers.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.passportNumber}"`,
      `"${p.phone}"`,
      `"${p.email || ''}"`,
      `"${p.destination.replace(/"/g, '""')}"`,
      `"${p.flightNumber || ''}"`,
      `"${p.travelDate}"`,
      `"${p.visaStatus}"`,
      `"${p.ticketStatus}"`,
      `"${p.paymentStatus}"`,
      p.totalAmount,
      p.amountPaid,
      p.amountDue,
      `"${(p.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hamaf_air_passengers_backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status badging styles
  const getVisaBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const getTicketBadge = (status: string) => {
    switch (status) {
      case 'Issued':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Booked':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'Partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-rose-100 text-rose-850';
    }
  };

  return (
    <div id="passenger-directory-card" className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      
      {/* Search and control bar */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="passenger-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="যাত্রীর নাম, পাসপোর্ট বা মোবাইল লিখে খুঁজুন... (Search...)"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            id="toggle-filter-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>ফিল্টার (Filters)</span>
          </button>

          <button
            id="export-csv-btn"
            onClick={exportToCSV}
            className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>ডাউনলোড ব্যাকআপ (CSV)</span>
          </button>

          <button
            id="add-new-passenger-list-btn"
            onClick={onAddNew}
            className="p-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>নতুন যাত্রী যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div id="advanced-filters-panel" className="bg-gray-50 px-5 py-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Visa Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">ভিসা অবস্থা (Visa Status)</label>
            <select
              id="filter-visa-status"
              value={visaFilter}
              onChange={(e) => setVisaFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All (সব)</option>
              <option value="Pending">Pending (চলমান)</option>
              <option value="Approved">Approved (অনুমোদিত)</option>
              <option value="Rejected">Rejected (প্রত্যাখ্যাত)</option>
            </select>
          </div>

          {/* Ticket Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">টিকিট অবস্থা (Ticket Status)</label>
            <select
              id="filter-ticket-status"
              value={ticketFilter}
              onChange={(e) => setTicketFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All (সব)</option>
              <option value="Not Booked">Not Booked (বুক করা হয়নি)</option>
              <option value="Booked">Booked (বুক করা হয়েছে)</option>
              <option value="Issued">Issued (ইস্যু করা হয়েছে)</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">পেমেন্ট অবস্থা (Payment Status)</label>
            <select
              id="filter-payment-status"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All (সব)</option>
              <option value="Paid">Paid (পরিশোধিত)</option>
              <option value="Partial">Partial (আংশিক পরিশোধিত)</option>
              <option value="Due">Due (বকেয়া)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Database Table Grid */}
      <div className="overflow-x-auto">
        <table id="passenger-table-element" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider font-mono">
              <th className="py-3 px-4 text-center w-12">#</th>
              <th className="py-3 px-4 cursor-pointer hover:bg-slate-800" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>যাত্রীর বিবরণ (Passenger)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">পাসপোর্ট নম্বর (Passport)</th>
              <th className="py-3 px-4">গন্তব্য ও তারিখ (Travel Details)</th>
              <th className="py-3 px-4 text-center">ভিসা অবস্থা (Visa)</th>
              <th className="py-3 px-4 text-center">টিকিট অবস্থা (Ticket)</th>
              <th className="py-3 px-4 text-right">আর্থিক তথ্য (Payment)</th>
              <th className="py-3 px-4 text-center w-36">অ্যাকশন (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {sortedPassengers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  কোনো যাত্রীর তথ্য খুঁজে পাওয়া যায়নি! (No passenger data found)
                </td>
              </tr>
            ) : (
              sortedPassengers.map((passenger, index) => (
                <tr
                  key={passenger.id}
                  className="hover:bg-blue-50/20 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-400">{index + 1}</td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-semibold text-gray-950 block">{passenger.name}</span>
                      <span className="text-xs text-gray-500 font-mono mt-0.5 block">{passenger.phone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md text-xs border border-gray-100">
                      {passenger.passportNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-800 block">{passenger.destination}</span>
                      <span className="text-[11px] text-gray-500 block mt-0.5 font-mono">ভ্রমণ: {passenger.travelDate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getVisaBadge(passenger.visaStatus)}`}>
                      {passenger.visaStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getTicketBadge(passenger.ticketStatus)}`}>
                      {passenger.ticketStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${getPaymentBadge(passenger.paymentStatus)}`}>
                        {passenger.paymentStatus}
                      </span>
                      {passenger.amountDue > 0 ? (
                        <span className="text-xs text-rose-600 font-mono block mt-1 font-bold">বকেয়া: ৳{passenger.amountDue.toLocaleString('bn-BD')}</span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-mono block mt-1 font-semibold">সম্পূর্ণ পরিশোধিত</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        id={`view-btn-${passenger.id}`}
                        onClick={() => onView(passenger)}
                        title="বিস্তারিত দেখুন"
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        id={`edit-btn-${passenger.id}`}
                        onClick={() => onEdit(passenger)}
                        title="সম্পাদনা করুন"
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        id={`delete-btn-${passenger.id}`}
                        onClick={() => {
                          if (confirm(`আপনি কি নিশ্চিতভাবে ${passenger.name}-এর তথ্য ডিলিট করতে চান?`)) {
                            onDelete(passenger.id);
                          }
                        }}
                        title="মুছে ফেলুন"
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Row counter */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
        <span>সর্বমোট {filteredPassengers.length} জন যাত্রীর তথ্য ফিল্টার করা হয়েছে</span>
        <span>Hamaf Air International</span>
      </div>

    </div>
  );
}
