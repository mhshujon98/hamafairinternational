export type VisaStatus = 'Pending' | 'Approved' | 'Rejected';
export type TicketStatus = 'Not Booked' | 'Booked' | 'Issued';
export type PaymentStatus = 'Paid' | 'Due' | 'Partial';

export interface PaymentRecord {
  id: string;
  amount: number;       // জমা পরিমাণ
  date: string;         // জমার তারিখ
  receiptNo: string;    // জমা রশিদ নম্বর
  paymentMethod: string; // পরিশোধের মাধ্যম (যেমন: নগদ, ব্যাংক, বিকাশ)
  remarks?: string;     // মন্তব্য
}

export interface Passenger {
  id: string;
  name: string; // যাত্রীর নাম
  passportNumber: string; // পাসপোর্ট নম্বর
  phone: string; // মোবাইল নম্বর
  email?: string; // ইমেইল
  destination: string; // গন্তব্য দেশ
  flightNumber?: string; // ফ্লাইট নম্বর
  travelDate: string; // ভ্রমণের তারিখ
  visaStatus: VisaStatus; // ভিসার অবস্থা
  ticketStatus: TicketStatus; // টিকিটের অবস্থা
  paymentStatus: PaymentStatus; // পেমেন্ট অবস্থা
  totalAmount: number; // মোট টাকা
  amountPaid: number; // পরিশোধিত টাকা
  amountDue: number; // বকেয়া টাকা
  remarks?: string; // মন্তব্য
  
  // ট্রাভেল প্রসেস ও সৌৗদি দেশের জন্য প্রতিটা ধাপের ট্র্যাকিং তথ্য (Saudi/Travel Journey Steps)
  passportSubmitDate?: string; // পাসপোর্ট জমা দেওয়ার তারিখ
  passportExpiryDate?: string; // পাসপোর্টের মেয়াদ শেষ তারিখ (Expiry Date)
  passportSubmitRemarks?: string; // পাসপোর্ট জমার মন্তব্য
  
  medicalStatus?: 'Pending' | 'Fit' | 'Unfit' | 'In Progress'; // মেডিকেল অবস্থা
  medicalDate?: string; // মেডিকেল পরীক্ষার শুরুর তারিখ
  medicalExpiryDate?: string; // মেডিকেল মেয়াদ শেষের তারিখ (Expiry Date)
  medicalRemarks?: string; // মেডিকেল পরীক্ষার রিপোর্ট বা মন্তব্য
  
  mofaStatus?: 'Pending' | 'Done' | 'N/A'; // মুফা অবস্থা
  mofaNumber?: string; // মুফা নম্বর
  mofaDate?: string; // মুফা শুরুর তারিখ
  mofaExpiryDate?: string; // মুফা মেয়াদ শেষের তারিখ (Expiry Date)
  
  visaStampingStatus?: 'Pending' | 'Done' | 'N/A'; // ভিসা স্ট্যাম্পিং অবস্থা
  visaStampingDate?: string; // ভিসা স্ট্যাম্পিং শুরুর তারিখ
  visaExpiryDate?: string; // ভিসা মেয়াদ শেষের তারিখ (Expiry Date)
  
  fingerprintStatus?: 'Pending' | 'Done' | 'N/A'; // ফিঙ্গারপ্রিন্ট অবস্থা
  fingerprintDate?: string; // ফিঙ্গারপ্রিন্ট তারিখ
  
  taqamulStatus?: 'Pending' | 'Done' | 'N/A' | 'Failed'; // তাকামুল পেশা অবস্থা
  taqamulProfession?: string; // তাকামুল পেশা (Taqamul Profession)
  taqamulDate?: string; // তাকামুল পরীক্ষার তারিখ
  taqamulExpiryDate?: string; // তাকামুল মেয়াদ শেষের তারিখ (Expiry Date)
  
  policeClearanceStatus?: 'Pending' | 'Done' | 'Not Required'; // পুলিশ ক্লিয়ারেন্স অবস্থা
  policeClearanceDate?: string; // পুলিশ ক্লিয়ারেন্স শুরুর তারিখ
  policeClearanceExpiryDate?: string; // পুলিশ ক্লিয়ারেন্স মেয়াদ শেষের তারিখ (Expiry Date)
  
  okToBoardStatus?: 'Pending' | 'Done' | 'N/A'; // ওকে টু বোর্ড অবস্থা
  okToBoardDate?: string; // ওকে টু বোর্ড সম্পন্ন হওয়ার তারিখ

  bmetTrainingStatus?: 'Pending' | 'Done' | 'N/A'; // BMET Training অবস্থা
  bmetTrainingDate?: string; // BMET Training শুরুর তারিখ
  bmetTrainingExpiryDate?: string; // BMET Training মেয়াদ শেষ তারিখ
  bmetTrainingRemarks?: string; // BMET Training মন্তব্য

  manpowerStatus?: 'Pending' | 'Done' | 'N/A'; // ManPower অবস্থা
  manpowerDate?: string; // ManPower শুরুর তারিখ
  manpowerRemarks?: string; // ManPower মন্তব্য

  airTicketStatus?: 'Pending' | 'Done' | 'N/A'; // Air Ticket অবস্থা
  airTicketDate?: string; // Air Ticket শুরুর তারিখ
  airTicketRemarks?: string; // Air Ticket মন্তব্য
  payments?: PaymentRecord[]; // ধাপে ধাপে পেমেন্ট রশিদ সমূহ

  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalPassengers: number;
  visaPending: number;
  visaApproved: number;
  visaRejected: number;
  ticketIssued: number;
  ticketBooked: number;
  ticketNotBooked: number;
  totalEarnings: number;
  totalDue: number;
}
