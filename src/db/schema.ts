import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table (aligned with Firebase Auth UID as primary identifier)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Passengers Table
export const passengers = pgTable("passengers", {
  id: text("id").primaryKey(), // Using text id (e.g. 'pass_xxxx')
  ownerEmail: text("owner_email").notNull(), // Linked to logged-in user email
  name: text("name").notNull(),
  passportNumber: text("passport_number").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  destination: text("destination").notNull(),
  flightNumber: text("flight_number"),
  travelDate: text("travel_date").notNull(),
  visaStatus: text("visa_status").notNull(), // 'Pending' | 'Approved' | 'Rejected'
  ticketStatus: text("ticket_status").notNull(), // 'Not Booked' | 'Booked' | 'Issued'
  paymentStatus: text("payment_status").notNull(), // 'Paid' | 'Due' | 'Partial'
  totalAmount: integer("total_amount").notNull().default(0),
  amountPaid: integer("amount_paid").notNull().default(0),
  amountDue: integer("amount_due").notNull().default(0),
  remarks: text("remarks"),
  
  // Custom travel process steps
  passportSubmitDate: text("passport_submit_date"),
  passportExpiryDate: text("passport_expiry_date"),
  passportSubmitRemarks: text("passport_submit_remarks"),
  
  medicalStatus: text("medical_status"), // 'Pending' | 'Fit' | 'Unfit' | 'In Progress'
  medicalDate: text("medical_date"),
  medicalExpiryDate: text("medical_expiry_date"),
  medicalRemarks: text("medical_remarks"),
  
  mofaStatus: text("mofa_status"), // 'Pending' | 'Done' | 'N/A'
  mofaNumber: text("mofa_number"),
  mofaDate: text("mofa_date"),
  mofaExpiryDate: text("mofa_expiry_date"),
  
  visaStampingStatus: text("visa_stamping_status"), // 'Pending' | 'Done' | 'N/A'
  visaStampingDate: text("visa_stamping_date"),
  visaExpiryDate: text("visa_expiry_date"),
  
  fingerprintStatus: text("fingerprint_status"), // 'Pending' | 'Done' | 'N/A'
  fingerprintDate: text("fingerprint_date"),
  
  taqamulStatus: text("taqamul_status"), // 'Pending' | 'Done' | 'N/A' | 'Failed'
  taqamulProfession: text("taqamul_profession"),
  taqamulDate: text("taqamul_date"),
  taqamulExpiryDate: text("taqamul_expiry_date"),
  
  policeClearanceStatus: text("police_clearance_status"), // 'Pending' | 'Done' | 'Not Required'
  policeClearanceDate: text("police_clearance_date"),
  policeClearanceExpiryDate: text("police_clearance_expiry_date"),
  
  okToBoardStatus: text("ok_to_board_status"), // 'Pending' | 'Done' | 'N/A'
  okToBoardDate: text("ok_to_board_date"),
  
  bmetTrainingStatus: text("bmet_training_status"), // 'Pending' | 'Done' | 'N/A'
  bmetTrainingDate: text("bmet_training_date"),
  bmetTrainingExpiryDate: text("bmet_training_expiry_date"),
  bmetTrainingRemarks: text("bmet_training_remarks"),
  
  manpowerStatus: text("manpower_status"), // 'Pending' | 'Done' | 'N/A'
  manpowerDate: text("manpower_date"),
  manpowerRemarks: text("manpower_remarks"),
  
  airTicketStatus: text("air_ticket_status"), // 'Pending' | 'Done' | 'N/A'
  airTicketDate: text("air_ticket_date"),
  airTicketRemarks: text("air_ticket_remarks"),
  
  payments: jsonb("payments").$type<any[]>(), // Stores the array of PaymentRecord objects
  
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  passengers: many(passengers),
}));
