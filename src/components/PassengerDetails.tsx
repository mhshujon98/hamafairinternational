import React, { useState } from 'react';
import { Passenger } from '../types';
import { X, Printer, Copy, Check, MessageSquare, MapPin, Calendar, Compass, User, CreditCard, Tag, FileText, Activity, Globe, ClipboardCheck, Fingerprint, ShieldCheck, BookOpen, Briefcase, Plane, Trash2, Plus, List, CheckCircle } from 'lucide-react';

interface PassengerDetailsProps {
  passenger: Passenger;
  onClose: () => void;
  onUpdatePassenger?: (updated: Passenger) => void;
}

export default function PassengerDetails({ passenger, onClose, onUpdatePassenger }: PassengerDetailsProps) {
  const [copied, setCopied] = useState(false);

  // Installment/Payment form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newReceiptNo, setNewReceiptNo] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMethod, setNewMethod] = useState('Cash (নগদ)');
  const [newRemarks, setNewRemarks] = useState('');
  const [pSuccessMsg, setPSuccessMsg] = useState('');

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) {
      alert('অনুগ্রহ করে সঠিক জমার পরিমাণ লিখুন! (Please enter a valid amount!)');
      return;
    }
    if (!newReceiptNo.trim()) {
      alert('অনুগ্রহ করে জমা রশিদ নম্বর লিখুন! (Please enter a receipt number!)');
      return;
    }

    const currentPayments = passenger.payments || [];
    const newRecord = {
      id: 'pay_' + Math.random().toString(36).substr(2, 9),
      amount: Number(newAmount),
      date: newDate,
      receiptNo: newReceiptNo.trim(),
      paymentMethod: newMethod,
      remarks: newRemarks.trim() || undefined,
    };

    const updatedPayments = [...currentPayments, newRecord];
    const updatedPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const updatedDue = Math.max(0, passenger.totalAmount - updatedPaid);
    
    let updatedStatus: 'Paid' | 'Due' | 'Partial' = 'Due';
    if (updatedPaid === 0) {
      updatedStatus = 'Due';
    } else if (updatedPaid >= passenger.totalAmount) {
      updatedStatus = 'Paid';
    } else {
      updatedStatus = 'Partial';
    }

    const updatedPassenger: Passenger = {
      ...passenger,
      payments: updatedPayments,
      amountPaid: updatedPaid,
      amountDue: updatedDue,
      paymentStatus: updatedStatus,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdatePassenger) {
      onUpdatePassenger(updatedPassenger);
    }

    // Reset Form
    setNewAmount('');
    setNewReceiptNo('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewMethod('Cash (নগদ)');
    setNewRemarks('');
    setShowAddForm(false);

    setPSuccessMsg('জমা রশিদ সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setPSuccessMsg(''), 3000);
  };

  const handleDeletePayment = (payId: string) => {
    if (!confirm('আপনি কি এই জমা রশিদের তথ্য মুছে ফেলতে চান?')) return;

    const currentPayments = passenger.payments || [];
    const updatedPayments = currentPayments.filter(p => p.id !== payId);
    const updatedPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const updatedDue = Math.max(0, passenger.totalAmount - updatedPaid);
    
    let updatedStatus: 'Paid' | 'Due' | 'Partial' = 'Due';
    if (updatedPaid === 0) {
      updatedStatus = 'Due';
    } else if (updatedPaid >= passenger.totalAmount) {
      updatedStatus = 'Paid';
    } else {
      updatedStatus = 'Partial';
    }

    const updatedPassenger: Passenger = {
      ...passenger,
      payments: updatedPayments,
      amountPaid: updatedPaid,
      amountDue: updatedDue,
      paymentStatus: updatedStatus,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdatePassenger) {
      onUpdatePassenger(updatedPassenger);
    }
    
    setPSuccessMsg('জমা রশিদ সফলভাবে মুছে ফেলা হয়েছে!');
    setTimeout(() => setPSuccessMsg(''), 3000);
  };

  // Step tracker definitions
  const steps = [
    {
      label: '১. পাসপোর্ট জমা',
      sublabel: 'Passport Submitted',
      date: passenger.passportSubmitDate,
      expiryDate: passenger.passportExpiryDate,
      status: passenger.passportSubmitDate ? 'Done' : 'Pending',
      remarks: passenger.passportSubmitRemarks,
      icon: FileText,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: '২. মেডিকেল টেস্ট',
      sublabel: 'Medical Check (GAMCA)',
      date: passenger.medicalDate,
      expiryDate: passenger.medicalExpiryDate,
      status: passenger.medicalStatus || 'Pending',
      remarks: passenger.medicalRemarks,
      icon: Activity,
      colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: '৩. তাকামুল পেশা',
      sublabel: 'Taqamul Skill Test',
      date: passenger.taqamulDate,
      expiryDate: passenger.taqamulExpiryDate,
      status: passenger.taqamulStatus || 'Pending',
      remarks: passenger.taqamulProfession ? `পেশা: ${passenger.taqamulProfession}` : undefined,
      icon: Fingerprint,
      colorClass: 'text-orange-600 bg-orange-50 border-orange-100',
    },
    {
      label: '৪. মুফা প্রসেস',
      sublabel: 'MOFA Visa Number',
      date: passenger.mofaDate,
      expiryDate: passenger.mofaExpiryDate,
      status: passenger.mofaStatus || 'Pending',
      remarks: passenger.mofaNumber ? `MF Number: ${passenger.mofaNumber}` : undefined,
      icon: Globe,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: '৫. ফিঙ্গারপ্রিন্ট',
      sublabel: 'Fingerprint & Biometric',
      date: passenger.fingerprintDate,
      status: passenger.fingerprintStatus || 'Pending',
      icon: Fingerprint,
      colorClass: 'text-pink-600 bg-pink-50 border-pink-100',
    },
    {
      label: '৬. পুলিশ ও ওকে টু বোর্ড',
      sublabel: 'Police Clearance & OTB',
      date: passenger.policeClearanceDate ? `পুলিশ ক্লিয়া.: ${passenger.policeClearanceDate}` : undefined,
      expiryDate: passenger.policeClearanceExpiryDate,
      status: (passenger.policeClearanceStatus === 'Done' && passenger.okToBoardStatus === 'Done') ? 'Done' : 
              (passenger.policeClearanceStatus === 'Done' || passenger.okToBoardStatus === 'Done') ? 'In Progress' : 'Pending',
      remarks: `পুলিশ ক্লিয়ারেন্স: ${passenger.policeClearanceStatus || 'Pending'} | ওকে টু বোর্ড: ${passenger.okToBoardStatus || 'Pending'} ${passenger.okToBoardDate ? `(${passenger.okToBoardDate})` : ''}`,
      icon: ShieldCheck,
      colorClass: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      label: '৭. BMET Training',
      sublabel: 'BMET Training Card',
      date: passenger.bmetTrainingDate,
      expiryDate: passenger.bmetTrainingExpiryDate,
      status: passenger.bmetTrainingStatus || 'Pending',
      remarks: passenger.bmetTrainingRemarks,
      icon: BookOpen,
      colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: '৮. ভিসা স্ট্যাম্পিং',
      sublabel: 'Visa Stamping',
      date: passenger.visaStampingDate,
      expiryDate: passenger.visaExpiryDate,
      status: passenger.visaStampingStatus || 'Pending',
      icon: ClipboardCheck,
      colorClass: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      label: '৯. ManPower',
      sublabel: 'ManPower Smart Card',
      date: passenger.manpowerDate,
      status: passenger.manpowerStatus || 'Pending',
      remarks: passenger.manpowerRemarks,
      icon: Briefcase,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: '১০. Air Ticket',
      sublabel: 'Air Ticket Booking & Issue',
      date: passenger.airTicketDate,
      status: passenger.airTicketStatus || 'Pending',
      remarks: passenger.airTicketRemarks,
      icon: Plane,
      colorClass: 'text-sky-600 bg-sky-50 border-sky-100',
    }
  ];

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'Done':
      case 'Fit':
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Unfit':
      case 'Rejected':
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Not Required':
      case 'N/A':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Status Style Helpers
  const getVisaBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getTicketBadge = (status: string) => {
    switch (status) {
      case 'Issued':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Booked':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Convert numbers to Bengali words (কথায় রূপান্তর)
  const numberToBanglaWords = (num: number): string => {
    const bnNumbers = [
      'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 
      'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
      'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
      'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইтриশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
      'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চৌয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
      'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চৌয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
      'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
      'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চৌয়াত্তর', 'পঁচাত্তর', 'ছেয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
      'একাশি', 'বিয়াশি', 'তিরাশি', 'চৌরাশি', 'পঁচাশী', 'ছেয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
      'একানব্বই', 'বিয়ানব্বই', 'তিরানব্বই', 'চৌরানব্বই', 'পঁচানব্বই', 'ছেয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
    ];

    if (num === 0) return 'শূন্য';
    
    let words = '';
    let temp = num;
    
    if (temp >= 10000000) { // Crore (কোটি)
      const crore = Math.floor(temp / 10000000);
      words += numberToBanglaWords(crore).replace(' টাকা মাত্র', '') + ' কোটি ';
      temp %= 10000000;
    }
    
    if (temp >= 100000) { // Lakh (লক্ষ)
      const lakh = Math.floor(temp / 100000);
      words += numberToBanglaWords(lakh).replace(' টাকা মাত্র', '') + ' লক্ষ ';
      temp %= 100000;
    }
    
    if (temp >= 1000) { // Thousand (হাজার)
      const thousand = Math.floor(temp / 1000);
      words += numberToBanglaWords(thousand).replace(' টাকা মাত্র', '') + ' হাজার ';
      temp %= 1000;
    }
    
    if (temp >= 100) { // Hundred (শত)
      const hundred = Math.floor(temp / 100);
      words += bnNumbers[hundred] + ' শত ';
      temp %= 100;
    }
    
    if (temp > 0) {
      if (temp < 100) {
        words += bnNumbers[temp];
      }
    }
    
    return words.trim() + ' টাকা মাত্র';
  };

  // Money Receipt Printer (টাকা জমার রশিদ প্রিন্ট)
  const handlePrintReceipt = (pay: any) => {
    const printWindow = window.open('', '', 'height=750,width=850');
    if (!printWindow) {
      alert('পপআপ উইন্ডো খোলা যায়নি! অনুগ্রহ করে পপআপ ব্লকার বন্ধ করুন।');
      return;
    }

    const bnWords = numberToBanglaWords(pay.amount);

    printWindow.document.write('<html><head><title>Money Receipt - Hamaf Air International</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Serif+Bengali:wght@400;700&display=swap');
      body {
        font-family: 'Inter', 'Noto Serif Bengali', serif;
        padding: 40px;
        color: #1e293b;
        background-color: #ffffff;
        line-height: 1.5;
      }
      .receipt-container {
        border: 4px double #1e3a8a;
        padding: 30px;
        position: relative;
        background-color: #fff;
        max-width: 750px;
        margin: 0 auto;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 60px;
        font-weight: 800;
        color: rgba(30, 58, 138, 0.04);
        pointer-events: none;
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 5px;
      }
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #1e3a8a;
        padding-bottom: 15px;
        margin-bottom: 25px;
      }
      .logo-details {
        text-align: left;
      }
      .agency-title {
        font-size: 24px;
        font-weight: 800;
        color: #1e3a8a;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .agency-subtitle {
        font-size: 12px;
        color: #475569;
        margin: 3px 0 0 0;
        font-weight: 600;
      }
      .agency-contact {
        font-size: 11px;
        color: #64748b;
        margin: 3px 0 0 0;
      }
      .receipt-title-box {
        text-align: right;
      }
      .receipt-badge {
        background-color: #1e3a8a;
        color: #ffffff;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 6px;
        display: inline-block;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 25px;
        background-color: #f8fafc;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .meta-item {
        font-size: 13px;
      }
      .meta-label {
        font-weight: bold;
        color: #475569;
        display: inline-block;
        width: 140px;
      }
      .meta-value {
        color: #0f172a;
        font-weight: 600;
      }
      .table-title {
        font-size: 14px;
        font-weight: bold;
        color: #1e3a8a;
        border-bottom: 1px solid #cbd5e1;
        padding-bottom: 6px;
        margin-bottom: 15px;
        margin-top: 25px;
      }
      .details-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 25px;
      }
      .details-table th, .details-table td {
        border: 1px solid #e2e8f0;
        padding: 12px 14px;
        text-align: left;
        font-size: 13px;
      }
      .details-table th {
        background-color: #f1f5f9;
        font-weight: bold;
        color: #1e3a8a;
      }
      .amount-in-words {
        background-color: #f8fafc;
        border-left: 4px solid #1e3a8a;
        padding: 12px 15px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 30px;
        color: #0f172a;
      }
      .summary-box {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 35px;
      }
      .summary-table {
        width: 280px;
        border-collapse: collapse;
      }
      .summary-table td {
        padding: 8px 12px;
        font-size: 13px;
        border: 1px solid #e2e8f0;
      }
      .summary-table .total-row {
        font-weight: bold;
        background-color: #f8fafc;
        color: #1e3a8a;
      }
      .signatures-container {
        display: flex;
        justify-content: space-between;
        margin-top: 60px;
        padding-top: 20px;
      }
      .signature-block {
        text-align: center;
        width: 200px;
        border-top: 1px dashed #94a3b8;
        padding-top: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
      }
      .print-footer {
        margin-top: 40px;
        text-align: center;
        font-size: 11px;
        color: #94a3b8;
        border-top: 1px solid #f1f5f9;
        padding-top: 15px;
      }
      @media print {
        body { padding: 0; background: none; }
        .receipt-container { border: 4px double #1e3a8a; box-shadow: none; margin: 0; max-width: 100%; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(`
      <div class="receipt-container">
        <div class="watermark">HAMAF AIR</div>
        
        <div class="header-container">
          <div class="logo-details">
            <h1 class="agency-title">Hamaf Air International</h1>
            <p class="agency-subtitle">Hajj, Umrah & Travel Agency (হজ্জ, উমরাহ ও ট্রাভেল এজেন্ট)</p>
            <p class="agency-contact">Dhaka, Bangladesh • Phone: ${passenger.phone ? '+88' + passenger.phone : '+880XXXXXXXXXX'}</p>
          </div>
          <div class="receipt-title-box">
            <div class="receipt-badge">Money Receipt</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-item"><span class="meta-label">রশিদ নম্বর (Receipt No):</span> <span class="meta-value" style="font-family: monospace;">${pay.receiptNo}</span></div>
            <div class="meta-item" style="margin-top: 8px;"><span class="meta-label">তারিখ (Date):</span> <span class="meta-value">${pay.date}</span></div>
            <div class="meta-item" style="margin-top: 8px;"><span class="meta-label">পরিশোধের মাধ্যম:</span> <span class="meta-value">${pay.paymentMethod}</span></div>
          </div>
          <div>
            <div class="meta-item"><span class="meta-label">যাত্রীর নাম (Name):</span> <span class="meta-value">${passenger.name}</span></div>
            <div class="meta-item" style="margin-top: 8px;"><span class="meta-label">পাসপোর্ট নং (Passport):</span> <span class="meta-value" style="font-family: monospace;">${passenger.passportNumber}</span></div>
            <div class="meta-item" style="margin-top: 8px;"><span class="meta-label">গন্তব্য (Destination):</span> <span class="meta-value">${passenger.destination}</span></div>
          </div>
        </div>

        <div class="table-title">পরিশোধিত অর্থের বিবরণ (Payment Particulars)</div>
        <table class="details-table">
          <thead>
            <tr>
              <th style="width: 60%;">বিবরণ (Particulars)</th>
              <th style="width: 40%; text-align: right;">পরিমাণ (Amount)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div><strong>প্যাকেজ কিস্তি / জমা রশিদ</strong></div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${pay.remarks || 'প্রোফাইল পেমেন্ট অ্যাকাউন্ট থেকে সরাসরি জমাকৃত কিস্তি'}</div>
              </td>
              <td style="text-align: right; font-weight: bold; font-family: monospace;">৳ ${pay.amount.toLocaleString('bn-BD')} BDT</td>
            </tr>
          </tbody>
        </table>

        <div class="amount-in-words">
          কথায় (In Words): <span style="color: #1e3a8a;">${bnWords}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="font-size: 12px; color: #64748b; max-width: 320px; line-height: 1.5;">
            <strong style="color: #0f172a; display: block; margin-bottom: 4px;">শর্তাবলী / Notes:</strong>
            ১. এই রশিদটি সাময়িক জমাকৃত টাকার প্রমাণ হিসেবে গণ্য হবে।<br/>
            ২. রশিদে উল্লেখিত টাকা চূড়ান্ত পরিশোধিত মূল্যের অংশবিশেষ।
          </div>
          <div class="summary-box">
            <table class="summary-table">
              <tr>
                <td>মোট চুক্তি মূল্য (Total Contract):</td>
                <td style="text-align: right; font-family: monospace;">৳ ${passenger.totalAmount.toLocaleString('bn-BD')}</td>
              </tr>
              <tr>
                <td>আজকের জমা (This Payment):</td>
                <td style="text-align: right; font-family: monospace; font-weight: bold; color: #16a34a;">৳ ${pay.amount.toLocaleString('bn-BD')}</td>
              </tr>
              <tr>
                <td>সর্বমোট জমা (Total Paid):</td>
                <td style="text-align: right; font-family: monospace;">৳ ${passenger.amountPaid.toLocaleString('bn-BD')}</td>
              </tr>
              <tr class="total-row">
                <td>অবশিষ্ট বকেয়া (Total Due):</td>
                <td style="text-align: right; font-family: monospace; font-weight: bold;">৳ ${passenger.amountDue.toLocaleString('bn-BD')}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="signatures-container">
          <div class="signature-block">যাত্রীর স্বাক্ষর<br/><span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(Passenger Signature)</span></div>
          <div class="signature-block">অনুমোদিত স্বাক্ষরকারী<br/><span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(Authorized Signature)</span></div>
        </div>

        <div class="print-footer">
          Hamaf Air International-এর উপর আস্থা রাখার জন্য ধন্যবাদ। আপনার যাত্রা নিরাপদ ও শুভ হোক।
        </div>
      </div>
    `);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Printable slip style triggers
  const handlePrint = () => {
    const printContent = document.getElementById('printable-passenger-slip')?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Create a temporary print view
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Passenger Itinerary Slip</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
          .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-item { border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .label { font-size: 12px; font-weight: bold; color: #555; text-transform: uppercase; }
          .value { font-size: 15px; font-weight: 500; color: #111; margin-top: 4px; }
          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid #ddd; }
          .Approved { background-color: #ecfdf5; color: #047857; border-color: #a7f3d0; }
          .Pending { background-color: #fffbeb; color: #b45309; border-color: #fde68a; }
          .Rejected { background-color: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
          .Issued { background-color: #e0e7ff; color: #4338ca; border-color: #c7d2fe; }
          .remarks-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-top: 30px; }
          .step-table { width: 100%; border-collapse: collapse; margin-top: 25px; margin-bottom: 25px; }
          .step-table th, .step-table td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; font-size: 12px; }
          .step-table th { background-color: #f9fafb; font-weight: bold; color: #1e3a8a; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
        `);
        printWindow.document.write('</style></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  // Generate WhatsApp formatted text
  const handleCopyText = () => {
    const text = `✈️ *Hamaf Air International Travel Agency* ✈️
━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *যাত্রীর নাম (Name):* ${passenger.name}
🛂 *পাসপোর্ট নম্বর (Passport):* ${passenger.passportNumber}
📞 *মোবাইল নম্বর (Phone):* ${passenger.phone}
🌍 *গন্তব্য দেশ (Destination):* ${passenger.destination}
📅 *ভ্রমণের তারিখ (Travel Date):* ${passenger.travelDate}
📄 *ভিসা অবস্থা (Visa Status):* ${passenger.visaStatus === 'Approved' ? '✅ Approved' : passenger.visaStatus === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
🎫 *টিকিট অবস্থা (Ticket Status):* ${passenger.ticketStatus}
💵 *পেমেন্ট অবস্থা (Payment):* ${passenger.paymentStatus} (বকেয়া: ৳${passenger.amountDue})
📝 *মন্তব্য (Remarks):* ${passenger.remarks || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
_যাত্রীর সুন্দর ও নিরাপদ সফর কামনা করছি!_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="passenger-details-modal" className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-400 animate-spin-slow" />
            <span>যাত্রী প্রোফাইল বিস্তারিত (Passenger Profiles)</span>
          </h3>
          <button id="close-modal-btn" onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Printable Element Hidden in Normal View but referenced during Print */}
          <div id="printable-passenger-slip" className="hidden">
            <div className="header">
              <div className="title">HAMAF AIR INTERNATIONAL TRAVEL AGENCY</div>
              <div className="subtitle">Passenger Travel Summary & Receipt Slip</div>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <div className="label">Passenger Name / যাত্রীর নাম</div>
                <div className="value">{passenger.name}</div>
              </div>
              <div className="info-item">
                <div className="label">Passport Number / পাসপোর্ট নম্বর</div>
                <div className="value" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{passenger.passportNumber}</div>
              </div>
              <div className="info-item">
                <div className="label">Phone Number / মোবাইল নম্বর</div>
                <div className="value">{passenger.phone}</div>
              </div>
              <div className="info-item">
                <div className="label">Email Address / ইমেইল</div>
                <div className="value">{passenger.email || 'N/A'}</div>
              </div>
              <div className="info-item">
                <div className="label">Destination Country / গন্তব্য দেশ</div>
                <div className="value">{passenger.destination}</div>
              </div>
              <div className="info-item">
                <div className="label">Flight Number / ফ্লাইট নম্বর</div>
                <div className="value">{passenger.flightNumber || 'Not assigned'}</div>
              </div>
              <div className="info-item">
                <div className="label">Travel Date / ভ্রমণের তারিখ</div>
                <div className="value">{passenger.travelDate}</div>
              </div>
              <div className="info-item">
                <div className="label">Visa Status / ভিসার অবস্থা</div>
                <div className="value" style={{ marginTop: '5px' }}>
                  <span className={`status-badge ${passenger.visaStatus}`}>{passenger.visaStatus}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="label">Ticket Status / টিকিটের অবস্থা</div>
                <div className="value" style={{ marginTop: '5px' }}>
                  <span className={`status-badge ${passenger.ticketStatus}`}>{passenger.ticketStatus}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="label">Payment Status / পরিশোধের অবস্থা</div>
                <div className="value" style={{ marginTop: '5px' }}>
                  <span className="status-badge" style={{ backgroundColor: '#f3f4f6', color: '#111827' }}>
                    {passenger.paymentStatus} (Due: ৳{passenger.amountDue})
                  </span>
                </div>
              </div>
              <div className="info-item">
                <div className="label">Total Amount / মোট চুক্তি</div>
                <div className="value">৳ {passenger.totalAmount.toLocaleString('bn-BD')} BDT</div>
              </div>
              <div className="info-item">
                <div className="label">Paid Amount / পরিশোধিত</div>
                <div className="value">৳ {passenger.amountPaid.toLocaleString('bn-BD')} BDT</div>
              </div>
            </div>

            <div style={{ marginTop: '25px', marginBottom: '10px', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '1px solid #1e3a8a', paddingBottom: '5px', fontSize: '14px' }}>
              Travel Journey Milestone Tracking / প্রসেস ট্র্যাকিং বিবরণী
            </div>
            <table className="step-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>ধাপ (Step)</th>
                  <th style={{ textAlign: 'left' }}>অবস্থা (Status)</th>
                  <th style={{ textAlign: 'left' }}>শুরুর তারিখ (Start Date)</th>
                  <th style={{ textAlign: 'left' }}>মেয়াদ শেষ (Expiry Date)</th>
                  <th style={{ textAlign: 'left' }}>মন্তব্য / বিবরণ (Details)</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((st, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{st.label}</td>
                    <td>{st.status}</td>
                    <td style={{ fontFamily: 'monospace' }}>{st.date || 'N/A'}</td>
                    <td style={{ fontFamily: 'monospace', color: st.expiryDate ? '#b91c1c' : '#555' }}>{st.expiryDate || 'N/A'}</td>
                    <td>{st.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {passenger.remarks && (
              <div className="remarks-box">
                <div className="label" style={{ marginBottom: '5px' }}>Remarks & Notes / বিশেষ মন্তব্য</div>
                <div className="value" style={{ fontSize: '13px', fontStyle: 'italic' }}>{passenger.remarks}</div>
              </div>
            )}

            <div className="footer">
              Thank you for choosing Hamaf Air International. Have a safe flight! <br />
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Interactive Profile View Card */}
          <div className="bg-slate-50/50 rounded-2xl border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{passenger.name}</h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Passport: <span className="font-bold text-gray-700">{passenger.passportNumber}</span></p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getVisaBadge(passenger.visaStatus)}`}>
                  Visa: {passenger.visaStatus}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getTicketBadge(passenger.ticketStatus)}`}>
                  Ticket: {passenger.ticketStatus}
                </span>
              </div>
            </div>

            {/* Travel Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
              <div className="flex gap-2.5">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-400 block">গন্তব্য দেশ (Destination)</span>
                  <span className="text-sm font-semibold text-gray-800">{passenger.destination}</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-400 block">ভ্রমণের তারিখ (Travel Date)</span>
                  <span className="text-sm font-semibold text-gray-800">{passenger.travelDate}</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Compass className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-400 block">ফ্লাইট নম্বর (Flight Number)</span>
                  <span className="text-sm font-semibold text-gray-800 font-mono">{passenger.flightNumber || 'Not assigned yet'}</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Tag className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-400 block">মোবাইল নম্বর (Contact Phone)</span>
                  <span className="text-sm font-semibold text-gray-800 font-mono">{passenger.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Saudi/Travel Journey Milestones Pipeline */}
          <div className="border border-gray-100 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h5 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-600 animate-spin-slow animate-pulse" />
                ধাপ ভিত্তিক ট্রাভেল প্রসেস ট্র্যাকিং (Travel Journey Progress)
              </h5>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">সৌদি আরব স্পেশাল</span>
            </div>

            {/* Steps Container */}
            <div className="space-y-3 pt-1">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    {/* Icon status container */}
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${step.colorClass}`}>
                      <StepIcon className="h-4 w-4" />
                    </div>

                    {/* Step details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-800">{step.label}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStepBadge(step.status)}`}>
                          {step.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 mt-1 text-[11px]">
                        <div className="flex items-center justify-between text-gray-500">
                          <span className="italic">{step.sublabel}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {step.date ? (
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-100 flex items-center gap-1 text-gray-600">
                              <span className="text-[10px] font-sans font-bold text-slate-400">শুরু:</span>
                              <Calendar className="h-3 w-3 text-gray-400" /> {step.date}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">তারিখ নির্ধারিত নয় (No date set)</span>
                          )}
                          
                          {step.expiryDate && (
                            <span className="font-mono bg-rose-50/50 text-rose-700 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                              <span className="text-[10px] font-sans font-bold text-rose-500">মেয়াদ শেষ:</span>
                              <Calendar className="h-3 w-3 text-rose-400" /> {step.expiryDate}
                            </span>
                          )}
                        </div>
                      </div>

                      {step.remarks && (
                        <div className="mt-1.5 text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 text-gray-600 leading-relaxed">
                          📝 {step.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial details inside Profile view */}
          <div className="border border-gray-100 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h5 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                হিসাব ও আর্থিক বিবরণী (Financials & Status)
              </h5>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                passenger.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                passenger.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {passenger.paymentStatus === 'Paid' ? 'Paid (পরিশোধিত)' :
                 passenger.paymentStatus === 'Partial' ? 'Partial (আংশিক পরিশোধিত)' :
                 'Due (বকেয়া)'}
              </span>
            </div>

            {/* Flexible Receipts Ledger Guide / Features List */}
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-4 rounded-xl border border-indigo-50 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold border-b border-indigo-100/50 pb-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>সম্পূর্ণ নমনীয় জমা রশিদ সিস্টেম (Flexible Receipts Ledger)</span>
              </div>
              <div className="space-y-2.5 pl-1">
                <div className="space-y-0.5">
                  <h6 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    সম্পূর্ণ নমনীয় জমা রশিদ সিস্টেম (Flexible Receipts Ledger):
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                    যাত্রীদের প্রোফাইল ভিউ থেকে যেকোনো সময়ে, যেকোনো তারিখে এবং যেকোনো পরিশোধের মাধ্যমে (যেমন: নগদ (Cash), ব্যাংক ট্রান্সফার, বিকাশ, নগদ অ্যাপ, বা রকেট) টাকা জমার রশিদ তৈরি করার পূর্ণ সুবিধা নিশ্চিত করা হয়েছে। পূর্বে শুধুমাত্র একটি সাধারণ হিসাব ছিল, এখন প্রতিটি পেমেন্টকে আলাদা ট্র্যাকেবল জমা রশিদে (Receipts) রূপান্তর করা হয়েছে।
                  </p>
                </div>

                <div className="space-y-0.5">
                  <h6 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    স্বয়ংক্রিয় প্রারম্ভিক জমা এন্ট্রি (Auto-Init Deposit):
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                    নতুন যাত্রী নিবন্ধন করার সময় যদি কোনো পরিশোধিত পরিমাণ বা জমা টাকা প্রদান করা হয়, তবে সিস্টেম স্বয়ংক্রিয়ভাবে একটি প্রাথমিক জমা রশিদ (Initial Deposit Receipt) তৈরি করে দেয়, যাতে ডাটাবেজে তথ্যের কোনো অমিল না থাকে।
                  </p>
                </div>

                <div className="space-y-0.5">
                  <h6 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    নিখুঁত ডাটা ইন্টিগ্রিটি (Data Integrity Guard):
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                    যদি কোনো যাত্রীর ইতিমধ্যেই ধাপে ধাপে জমার রশিদ যুক্ত থাকে, তবে ভুল এন্ট্রি এড়ানোর জন্য যাত্রী তথ্য ফরমের "Amount Paid" ফিল্ডটি নিষ্ক্রিয় (Disabled) থাকবে এবং প্রোফাইল ভিউ থেকে রশিদ যোগ/বিয়োগ করার পরামর্শ দেবে।
                  </p>
                </div>

                <div className="space-y-0.5">
                  <h6 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    মোট সেকশন (Total Summary Section):
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                    পেমেন্ট হিস্ট্রি তালিকার ঠিক নিচে একটি চমৎকার ও সুবিন্যস্ত "মোট হিসাবের সারাংশ" ব্লক যুক্ত করা হয়েছে। এটি রিয়েল-টাইমে হিসাব করে বাংলা ও ইংরেজিতে প্রদর্শন করে: সর্বমোট জমা টাকা (Total Deposited) ৳ (বাংলা অংকে), অবশিষ্ট বকেয়া টাকা (Total Due) ৳ (বাংলা অংকে), এবং মোট রশিদ সংখ্যা (Receipts Count) (যেমন: ৩ টি রশিদ)।
                  </p>
                </div>
              </div>
            </div>

            {pSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{pSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-[10px] text-gray-400 block font-bold">মোট চুক্তি মূল্য (Total Contract)</span>
                <span className="text-sm font-black text-gray-800 block mt-1">৳ {passenger.totalAmount.toLocaleString('bn-BD')}</span>
              </div>
              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-3 border border-emerald-100">
                <span className="text-[10px] text-emerald-600 block font-bold">পরিশোধিত টাকা (Total Paid)</span>
                <span className="text-sm font-black text-emerald-700 block mt-1">৳ {passenger.amountPaid.toLocaleString('bn-BD')}</span>
              </div>
              <div className={`rounded-xl p-3 border ${passenger.amountDue > 0 ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                <span className={`text-[10px] block font-bold ${passenger.amountDue > 0 ? 'text-rose-600' : 'text-blue-600'}`}>অবশিষ্ট বকেয়া (Amount Due)</span>
                <span className={`text-sm font-black block mt-1 ${passenger.amountDue > 0 ? 'text-rose-700' : 'text-blue-700'}`}>৳ {passenger.amountDue.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Installment Payment History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <List className="h-3.5 w-3.5 text-slate-400" />
                  ধাপে ধাপে জমা রশিদ সমূহ (Payment History)
                </span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-gray-600">{(passenger.payments || []).length} টি এন্ট্রি</span>
              </div>

              {(passenger.payments || []).length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
                  কোনো জমার রশিদ পাওয়া যায়নি। নিচে ফর্ম পূরণ করে নতুন জমা রশিদ সেভ করুন।
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {(passenger.payments || []).map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between p-3 bg-slate-50 border border-gray-100 rounded-xl hover:bg-slate-100/70 transition-colors">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-800">৳ {pay.amount.toLocaleString('bn-BD')}</span>
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            রশিদ #: {pay.receiptNo}
                          </span>
                          <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-semibold">
                            {pay.paymentMethod}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span className="font-mono">{pay.date}</span>
                          {pay.remarks && <span className="truncate">• {pay.remarks}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          onClick={() => handlePrintReceipt(pay)}
                          className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all cursor-pointer"
                          title="রশিদ প্রিন্ট করুন (Print Receipt)"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(pay.id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="রশিদ মুছুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Section (মোট সেকশন) */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="bg-slate-200 h-2 w-2 rounded-full animate-pulse"></span>
                    মোট হিসাবের সারাংশ (Total Summary)
                  </span>
                  <span className="text-slate-500">মোট রশিদ: {(passenger.payments || []).length} টি</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white rounded-lg p-2.5 border border-slate-200/60">
                    <span className="text-[10px] text-gray-400 block font-bold">সর্বমোট জমা টাকা (Total Deposited)</span>
                    <span className="text-sm font-black text-emerald-600 block mt-0.5">
                      ৳ {((passenger.payments || []).reduce((sum, pay) => sum + pay.amount, 0)).toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 border border-slate-200/60">
                    <span className="text-[10px] text-gray-400 block font-bold">অবশিষ্ট বকেয়া টাকা (Total Due)</span>
                    <span className="text-sm font-black text-rose-600 block mt-0.5">
                      ৳ {Math.max(0, passenger.totalAmount - (passenger.payments || []).reduce((sum, pay) => sum + pay.amount, 0)).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Expandable Add Deposit Receipt Form */}
            <div className="pt-2 border-t border-gray-50">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>নতুন জমা রশিদ যোগ করুন (Add New Deposit / Installment)</span>
                </button>
              ) : (
                <form onSubmit={handleSavePayment} className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <Plus className="h-3.5 w-3.5 text-blue-600" />
                      নতুন জমা রশিদের তথ্য (New Deposit Receipt)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 underline font-semibold"
                    >
                      বাতিল (Hide)
                    </button>
                  </div>

                  {/* ডাটা সেভ নোটিশ (Data Save Notice) */}
                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 font-bold flex items-start gap-2 leading-relaxed">
                    <span className="text-base select-none shrink-0 mt-0.5">⚠️</span>
                    <span>ডাটা সেভ করার জন্য প্রতিবারে টাকা জমা দেবার তথ্য এন্ট্রি করতে হবে।</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">জমার পরিমাণ BDT <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 text-xs font-mono">৳</span>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="যেমন: ২০০০০"
                          value={newAmount}
                          onChange={(e) => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">জমা রশিদ/ভাউচার নম্বর <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: HA-5001"
                        value={newReceiptNo}
                        onChange={(e) => setNewReceiptNo(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">জমার তারিখ <span className="text-rose-500">*</span></label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">পরিশোধের মাধ্যম (Method)</label>
                      <select
                        value={newMethod}
                        onChange={(e) => setNewMethod(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      >
                        <option value="Cash (নগদ)">Cash (নগদ)</option>
                        <option value="Bank Transfer (ব্যাংক)">Bank Transfer (ব্যাংক)</option>
                        <option value="bKash (বিকাশ)">bKash (বিকাশ)</option>
                        <option value="Nagad (নগদ অ্যাপ)">Nagad (নগদ অ্যাপ)</option>
                        <option value="Rocket (রকেট)">Rocket (রকেট)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">মন্তব্য (Remarks / Notes)</label>
                    <input
                      type="text"
                      placeholder="যেমন: দ্বিতীয় কিস্তির কিয়দাংশ জমা"
                      value={newRemarks}
                      onChange={(e) => setNewRemarks(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-600 transition-all cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>জমা সেভ করুন</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Remarks display */}
          {passenger.remarks && (
            <div className="border-l-4 border-blue-600 bg-blue-50/40 p-4 rounded-r-xl">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">অফিসিয়াল মন্তব্য (Agency Remarks)</span>
              <p className="text-sm text-gray-700 leading-relaxed italic">{passenger.remarks}</p>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <button
            id="whatsapp-share-btn"
            onClick={handleCopyText}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>কপি হয়েছে! (Copied)</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>মেসেজ কপি করুন (Copy for SMS/WhatsApp)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="print-passenger-slip-btn"
              onClick={handlePrint}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-gray-500" />
              <span>রসিদ প্রিন্ট করুন (Print Slip)</span>
            </button>
            <button
              id="close-details-btn"
              onClick={onClose}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
