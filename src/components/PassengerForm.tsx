import React, { useState, useEffect } from 'react';
import { Passenger, VisaStatus, TicketStatus, PaymentStatus } from '../types';
import { Save, X, User, FileText, Phone, MapPin, Calendar, CreditCard, PenTool } from 'lucide-react';

interface PassengerFormProps {
  passenger?: Passenger | null;
  onSubmit: (data: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function PassengerForm({ passenger, onSubmit, onCancel }: PassengerFormProps) {
  const [name, setName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [destination, setDestination] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [visaStatus, setVisaStatus] = useState<VisaStatus>('Pending');
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>('Not Booked');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Due');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [remarks, setRemarks] = useState('');

  // If editing, fill in the existing passenger details
  useEffect(() => {
    if (passenger) {
      setName(passenger.name);
      setPassportNumber(passenger.passportNumber);
      setPhone(passenger.phone);
      setEmail(passenger.email || '');
      setDestination(passenger.destination);
      setFlightNumber(passenger.flightNumber || '');
      setTravelDate(passenger.travelDate);
      setVisaStatus(passenger.visaStatus);
      setTicketStatus(passenger.ticketStatus);
      setPaymentStatus(passenger.paymentStatus);
      setTotalAmount(passenger.totalAmount);
      setAmountPaid(passenger.amountPaid);
      setRemarks(passenger.remarks || '');
    }
  }, [passenger]);

  // Handle automatic payment status selection based on amount paid vs total amount
  useEffect(() => {
    if (totalAmount > 0) {
      if (amountPaid === 0) {
        setPaymentStatus('Due');
      } else if (amountPaid >= totalAmount) {
        setPaymentStatus('Paid');
      } else {
        setPaymentStatus('Partial');
      }
    }
  }, [totalAmount, amountPaid]);

  const amountDue = Math.max(0, totalAmount - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !passportNumber || !phone || !destination || !travelDate) {
      alert('অনুগ্রহ করে সব আবশ্যকীয় ফিল্ড পূরণ করুন! (Please fill out all required fields!)');
      return;
    }

    onSubmit({
      name,
      passportNumber: passportNumber.toUpperCase(),
      phone,
      email: email || undefined,
      destination,
      flightNumber: flightNumber || undefined,
      travelDate,
      visaStatus,
      ticketStatus,
      paymentStatus,
      totalAmount,
      amountPaid,
      amountDue,
      remarks: remarks || undefined,
    });
  };

  return (
    <div id="passenger-form-overlay" className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 flex items-center justify-between text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          <span>{passenger ? 'যাত্রীর তথ্য আপডেট করুন (Update Passenger Details)' : 'নতুন যাত্রী নিবন্ধন ফরম (New Passenger Registration)'}</span>
        </h3>
        <button id="close-form-btn" onClick={onCancel} className="text-white/80 hover:text-white transition-colors cursor-pointer">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Section 1: Passenger Personal Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">ব্যক্তিগত তথ্য (Personal Details)</h4>
            
            {/* Passenger Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                যাত্রীর নাম <span className="text-rose-500">*</span> <span className="text-gray-400 font-normal">(Passenger Name)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="input-passenger-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মোহাম্মদ আব্দুর রহমান"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Passport Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                পাসপোর্ট নম্বর <span className="text-rose-500">*</span> <span className="text-gray-400 font-normal">(Passport Number)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <FileText className="h-4 w-4" />
                </span>
                <input
                  id="input-passport-number"
                  type="text"
                  required
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="যেমন: EF1049283"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                মোবাইল নম্বর <span className="text-rose-500">*</span> <span className="text-gray-400 font-normal">(Phone Number)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="input-passenger-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                ইমেইল এড্রেস <span className="text-gray-400 font-normal">(Email Address - Optional)</span>
              </label>
              <input
                id="input-passenger-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="যেমন: travel@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Travel Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">ভ্রমণের তথ্য (Travel Details)</h4>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                গন্তব্য দেশ <span className="text-rose-500">*</span> <span className="text-gray-400 font-normal">(Destination Country)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  id="input-passenger-destination"
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="যেমন: Saudi Arabia / Dubai"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Flight Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                ফ্লাইট নম্বর <span className="text-gray-400 font-normal">(Flight Number - Optional)</span>
              </label>
              <input
                id="input-flight-number"
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="যেমন: SV-804 / EK-583"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                ভ্রমণের তারিখ <span className="text-rose-500">*</span> <span className="text-gray-400 font-normal">(Travel Date)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-mono">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  id="input-travel-date"
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  ভিসা অবস্থা <span className="text-gray-400 font-normal">(Visa Status)</span>
                </label>
                <select
                  id="select-visa-status"
                  value={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.value as VisaStatus)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending (চলমান)</option>
                  <option value="Approved">Approved (অনুমোদিত)</option>
                  <option value="Rejected">Rejected (প্রত্যাখ্যাত)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  টিকিট অবস্থা <span className="text-gray-400 font-normal">(Ticket Status)</span>
                </label>
                <select
                  id="select-ticket-status"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Not Booked">Not Booked (বুক করা হয়নি)</option>
                  <option value="Booked">Booked (বুক করা হয়েছে)</option>
                  <option value="Issued">Issued (ইস্যু করা হয়েছে)</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Financials & Remarks */}
        <div className="border-t border-gray-100 pt-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">হিসাব ও আর্থিক বিবরণী (Financials & Status)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Total Service/Ticket Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                মোট মূল্য (Total Cost)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-mono text-sm">
                  ৳
                </span>
                <input
                  id="input-total-amount"
                  type="number"
                  min="0"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  placeholder="মোট চুক্তিকৃত টাকা"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                পরিশোধিত পরিমাণ (Amount Paid)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-mono text-sm">
                  ৳
                </span>
                <input
                  id="input-amount-paid"
                  type="number"
                  min="0"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  placeholder="জমা বা পরিশোধিত টাকা"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Amount Due (Read Only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                বকেয়া টাকা (Outstanding Due - Auto)
              </label>
              <div className="relative bg-gray-50 rounded-xl border border-gray-200 px-4 py-2.5 flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono">৳</span>
                <span className={`font-mono font-bold ${amountDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {amountDue.toLocaleString('bn-BD')} BDT
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Remarks/Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            অন্যান্য মন্তব্য/নোট <span className="text-gray-400 font-normal">(Remarks or Special Instructions - Optional)</span>
          </label>
          <textarea
            id="input-remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="যাত্রীর মেডিকেল রিপোর্ট, স্পেশাল রিকোয়েস্ট বা অন্য যেকোনো বিশেষ তথ্য এখানে লিখুন..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <button
            id="cancel-form-btn"
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            বাতিল করুন (Cancel)
          </button>
          <button
            id="save-passenger-btn"
            type="submit"
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>সংরক্ষণ করুন (Save Details)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
