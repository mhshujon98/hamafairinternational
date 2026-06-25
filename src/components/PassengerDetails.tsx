import { useState } from 'react';
import { Passenger } from '../types';
import { X, Printer, Copy, Check, MessageSquare, MapPin, Calendar, Compass, User, CreditCard, Tag } from 'lucide-react';

interface PassengerDetailsProps {
  passenger: Passenger;
  onClose: () => void;
}

export default function PassengerDetails({ passenger, onClose }: PassengerDetailsProps) {
  const [copied, setCopied] = useState(false);

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

          {/* Financial details inside Profile view */}
          <div className="border border-gray-100 rounded-2xl p-5 bg-white space-y-4">
            <h5 className="font-semibold text-gray-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              পেমেন্ট বিবরণী (Financial Transactions)
            </h5>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <span className="text-xs text-gray-400 block">মোট মূল্য (Total Cost)</span>
                <span className="text-sm font-bold text-gray-800 block mt-1">৳ {passenger.totalAmount.toLocaleString('bn-BD')}</span>
              </div>
              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-3">
                <span className="text-xs text-emerald-600 block">পরিশোধিত (Paid)</span>
                <span className="text-sm font-bold text-emerald-700 block mt-1">৳ {passenger.amountPaid.toLocaleString('bn-BD')}</span>
              </div>
              <div className={`rounded-xl p-3 ${passenger.amountDue > 0 ? 'bg-rose-50 text-rose-800' : 'bg-blue-50 text-blue-800'}`}>
                <span className={`text-xs block ${passenger.amountDue > 0 ? 'text-rose-600' : 'text-blue-600'}`}>বকেয়া (Due)</span>
                <span className={`text-sm font-bold block mt-1 ${passenger.amountDue > 0 ? 'text-rose-700' : 'text-blue-700'}`}>৳ {passenger.amountDue.toLocaleString('bn-BD')}</span>
              </div>
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
