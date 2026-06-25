export type VisaStatus = 'Pending' | 'Approved' | 'Rejected';
export type TicketStatus = 'Not Booked' | 'Booked' | 'Issued';
export type PaymentStatus = 'Paid' | 'Due' | 'Partial';

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
