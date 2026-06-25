import { Passenger, DashboardStats } from '../types';
import { Users, FileCheck, Ticket, Hourglass, Landmark, Wallet, AlertTriangle, BadgeAlert } from 'lucide-react';

interface DashboardProps {
  passengers: Passenger[];
}

export default function Dashboard({ passengers }: DashboardProps) {
  // Compute stats
  const stats: DashboardStats = passengers.reduce((acc, curr) => {
    acc.totalPassengers += 1;
    
    // Visa
    if (curr.visaStatus === 'Approved') acc.visaApproved += 1;
    else if (curr.visaStatus === 'Pending') acc.visaPending += 1;
    else if (curr.visaStatus === 'Rejected') acc.visaRejected += 1;

    // Ticket
    if (curr.ticketStatus === 'Issued') acc.ticketIssued += 1;
    else if (curr.ticketStatus === 'Booked') acc.ticketBooked += 1;
    else if (curr.ticketStatus === 'Not Booked') acc.ticketNotBooked += 1;

    // Financials
    acc.totalEarnings += curr.amountPaid;
    acc.totalDue += curr.amountDue;

    return acc;
  }, {
    totalPassengers: 0,
    visaPending: 0,
    visaApproved: 0,
    visaRejected: 0,
    ticketIssued: 0,
    ticketBooked: 0,
    ticketNotBooked: 0,
    totalEarnings: 0,
    totalDue: 0
  });

  return (
    <div id="dashboard-statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Passengers Card */}
      <div id="stat-card-total-passengers" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">মোট যাত্রী (Total Passengers)</span>
          <span className="text-3xl font-extrabold text-gray-900 mt-1 block">{stats.totalPassengers} জন</span>
          <span className="text-xs text-gray-400 mt-1 block">নিবন্ধিত যাত্রী তালিকা</span>
        </div>
        <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
          <Users className="h-6 w-6" />
        </div>
      </div>

      {/* Visa Approved Card */}
      <div id="stat-card-visa-approved" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">অনুমোদিত ভিসা (Visa Approved)</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{stats.visaApproved} জন</span>
          <span className="text-xs text-emerald-600/75 mt-1 block flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            প্রক্রিয়া সম্পন্ন হয়েছে
          </span>
        </div>
        <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
          <FileCheck className="h-6 w-6" />
        </div>
      </div>

      {/* Visa Pending Card */}
      <div id="stat-card-visa-pending" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">চলমান ভিসা (Visa Pending)</span>
          <span className="text-3xl font-extrabold text-amber-500 mt-1 block">{stats.visaPending} জন</span>
          <span className="text-xs text-amber-600 mt-1 block flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            প্রক্রিয়াধীন রয়েছে
          </span>
        </div>
        <div className="p-3.5 bg-amber-50 text-amber-500 rounded-2xl">
          <Hourglass className="h-6 w-6" />
        </div>
      </div>

      {/* Tickets Issued Card */}
      <div id="stat-card-ticket-issued" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px]">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">টিকিট ইস্যু (Ticket Issued)</span>
          <span className="text-3xl font-extrabold text-indigo-600 mt-1 block">{stats.ticketIssued} জন</span>
          <span className="text-xs text-indigo-500 mt-1 block flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            টিকিট কনফার্ম ও ইস্যু করা
          </span>
        </div>
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Ticket className="h-6 w-6" />
        </div>
      </div>

      {/* Total Amount Collected Card */}
      <div id="stat-card-total-earnings" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px] lg:col-span-2">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-2xl">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">পরিশোধিত টাকা (Total Received)</span>
            <span className="text-2xl font-bold text-gray-900 mt-0.5 block">৳ {stats.totalEarnings.toLocaleString('bn-BD')} BDT</span>
            <span className="text-xs text-gray-400 block mt-0.5">যাত্রীদের নিকট থেকে সর্বমোট আদায়কৃত অর্থ</span>
          </div>
        </div>
      </div>

      {/* Total Due Card */}
      <div id="stat-card-total-due" className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:translate-y-[-2px] lg:col-span-2">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">বকেয়া টাকা (Total Outstanding Due)</span>
            <span className="text-2xl font-bold text-rose-600 mt-0.5 block">৳ {stats.totalDue.toLocaleString('bn-BD')} BDT</span>
            <span className="text-xs text-rose-500 block mt-0.5">যাত্রীদের নিকট বাকি বা বকেয়া পাওনা অর্থ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
