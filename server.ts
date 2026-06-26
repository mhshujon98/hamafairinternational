import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// Define Database file
const DB_FILE = path.join(process.cwd(), "server-db.json");

// Passenger Types
interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  receiptNo: string;
  paymentMethod: string;
  remarks?: string;
}

interface Passenger {
  id: string;
  name: string;
  passportNumber: string;
  phone: string;
  email?: string;
  destination: string;
  flightNumber?: string;
  travelDate: string;
  visaStatus: 'Pending' | 'Approved' | 'Rejected';
  ticketStatus: 'Not Booked' | 'Booked' | 'Issued';
  paymentStatus: 'Paid' | 'Due' | 'Partial';
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  remarks?: string;
  ownerPhone: string; // The user who owns this record
  createdAt: string;
  updatedAt: string;
  payments?: PaymentRecord[];
  
  // Custom travel process steps
  passportSubmitDate?: string;
  passportExpiryDate?: string;
  passportSubmitRemarks?: string;
  medicalStatus?: 'Pending' | 'Fit' | 'Unfit' | 'In Progress';
  medicalDate?: string;
  medicalExpiryDate?: string;
  medicalRemarks?: string;
  mofaStatus?: 'Pending' | 'Done' | 'N/A';
  mofaNumber?: string;
  mofaDate?: string;
  mofaExpiryDate?: string;
  visaStampingStatus?: 'Pending' | 'Done' | 'N/A';
  visaStampingDate?: string;
  visaExpiryDate?: string;
  fingerprintStatus?: 'Pending' | 'Done' | 'N/A';
  fingerprintDate?: string;
  taqamulStatus?: 'Pending' | 'Done' | 'N/A' | 'Failed';
  taqamulProfession?: string;
  taqamulDate?: string;
  taqamulExpiryDate?: string;
  policeClearanceStatus?: 'Pending' | 'Done' | 'Not Required';
  policeClearanceDate?: string;
  policeClearanceExpiryDate?: string;
  okToBoardStatus?: 'Pending' | 'Done' | 'N/A';
  okToBoardDate?: string;
  bmetTrainingStatus?: 'Pending' | 'Done' | 'N/A';
  bmetTrainingDate?: string;
  bmetTrainingExpiryDate?: string;
  bmetTrainingRemarks?: string;
  manpowerStatus?: 'Pending' | 'Done' | 'N/A';
  manpowerDate?: string;
  manpowerRemarks?: string;
  airTicketStatus?: 'Pending' | 'Done' | 'N/A';
  airTicketDate?: string;
  airTicketRemarks?: string;
}

interface Session {
  token: string;
  phone: string;
  expiresAt: number;
}

interface OTP {
  phone: string;
  code: string;
  expiresAt: number;
}

interface DatabaseSchema {
  passengers: Passenger[];
  sessions: Session[];
  otps: OTP[];
}

// Initial Passengers seeded with owner phones matching their phone field for demo purposes
const INITIAL_PASSENGERS: Omit<Passenger, 'ownerPhone'>[] = [
  {
    id: 'pass_1',
    name: 'হাফেজ মোঃ মাহমুদুল হাসান (Hafez Md. Mahmudul Hasan)',
    passportNumber: 'EF1049283',
    phone: '01712345678',
    email: 'mhasan@gmail.com',
    destination: 'Saudi Arabia (সৌদি আরব)',
    flightNumber: 'SV-804',
    travelDate: '2026-07-15',
    visaStatus: 'Approved',
    ticketStatus: 'Issued',
    paymentStatus: 'Paid',
    totalAmount: 85000,
    amountPaid: 85000,
    amountDue: 0,
    remarks: 'উমরাহ্ যাত্রী (Umrah Pilgrim) - সকল কাগজপত্র সম্পন্ন।',
    passportSubmitDate: '2026-06-20',
    passportExpiryDate: '2036-05-15',
    passportSubmitRemarks: 'মূল পাসপোর্ট জমা নেওয়া হয়েছে',
    medicalStatus: 'Fit',
    medicalDate: '2026-06-22',
    medicalExpiryDate: '2026-09-22',
    medicalRemarks: 'মেডিকেল পরীক্ষার রিপোর্ট ফিট এসেছে',
    mofaStatus: 'Done',
    mofaNumber: 'MF74839210',
    mofaDate: '2026-06-24',
    mofaExpiryDate: '2026-09-24',
    visaStampingStatus: 'Done',
    visaStampingDate: '2026-06-25',
    visaExpiryDate: '2026-09-25',
    fingerprintStatus: 'Done',
    fingerprintDate: '2026-06-23',
    taqamulStatus: 'Done',
    taqamulProfession: 'Electrician (ইলেকট্রিশিয়ান)',
    taqamulDate: '2026-06-24',
    taqamulExpiryDate: '2027-06-24',
    policeClearanceStatus: 'Done',
    policeClearanceDate: '2026-06-21',
    policeClearanceExpiryDate: '2026-12-21',
    okToBoardStatus: 'Done',
    okToBoardDate: '2026-06-25',
    bmetTrainingStatus: 'Done',
    bmetTrainingDate: '2026-06-22',
    bmetTrainingExpiryDate: '2031-06-22',
    bmetTrainingRemarks: 'BMET ৩ দিনের ট্রেনিং সফলভাবে সম্পন্ন',
    manpowerStatus: 'Done',
    manpowerDate: '2026-06-25',
    manpowerRemarks: 'স্মার্ট কার্ড ও ম্যানপাওয়ার সম্পন্ন',
    airTicketStatus: 'Done',
    airTicketDate: '2026-06-25',
    airTicketRemarks: 'টিকিট কনফার্ম ও ইস্যু করা হয়েছে',
    payments: [
      {
        id: 'pay_1_1',
        amount: 50000,
        date: '2026-06-20',
        receiptNo: 'HA-4920',
        paymentMethod: 'Cash (নগদ)',
        remarks: 'পাসপোর্ট জমাকালীন এডভান্স জমা'
      },
      {
        id: 'pay_1_2',
        amount: 35000,
        date: '2026-06-25',
        receiptNo: 'HA-4982',
        paymentMethod: 'Bank Transfer (ব্যাংক)',
        remarks: 'ভিসা ও টিকিট ইস্যু ফাইনাল পেমেন্ট'
      }
    ],
    createdAt: '2026-06-20T10:30:00.000Z',
    updatedAt: '2026-06-22T14:15:00.000Z'
  },
  {
    id: 'pass_2',
    name: 'রিনা আক্তার (Rina Akhter)',
    passportNumber: 'EG0987123',
    phone: '01898765432',
    email: 'sharmin.it@yahoo.com',
    destination: 'Saudi Arabia (সৌদি আরব)',
    flightNumber: 'QR-639',
    travelDate: '2026-09-10',
    visaStatus: 'Pending',
    ticketStatus: 'Not Booked',
    paymentStatus: 'Partial',
    totalAmount: 120000,
    amountPaid: 50000,
    amountDue: 70000,
    remarks: 'মেডিকেল ফিট কার্ড পাওয়া গেছে। মুফা অপেক্ষমাণ।',
    passportSubmitDate: '2026-06-21',
    passportSubmitRemarks: 'পাসপোর্ট ও ফটো জমা নেওয়া হয়েছে',
    medicalStatus: 'Fit',
    medicalDate: '2026-06-24',
    medicalRemarks: 'গামকা মেডিকেল ফিট',
    mofaStatus: 'Pending',
    visaStampingStatus: 'Pending',
    fingerprintStatus: 'Pending',
    policeClearanceStatus: 'Pending',
    okToBoardStatus: 'Pending',
    payments: [
      {
        id: 'pay_2_1',
        amount: 50000,
        date: '2026-06-21',
        receiptNo: 'HA-4931',
        paymentMethod: 'bKash (বিকাশ)',
        remarks: 'মেডিকেল বুকিং ও প্রসেসিং খরচ বাবদ'
      }
    ],
    createdAt: '2026-06-21T08:24:00.000Z',
    updatedAt: '2026-06-21T08:24:00.000Z'
  },
  {
    id: 'pass_3',
    name: 'মোঃ ফয়সাল আহমেদ (Md. Faisal Ahmed)',
    passportNumber: 'EH8372910',
    phone: '01555443322',
    email: 'faisal.dxb@gmail.com',
    destination: 'Saudi Arabia (সৌদি আরব)',
    flightNumber: 'EK-583',
    travelDate: '2026-08-05',
    visaStatus: 'Approved',
    ticketStatus: 'Booked',
    paymentStatus: 'Paid',
    totalAmount: 65000,
    amountPaid: 65000,
    amountDue: 0,
    remarks: 'ভিসা ওকে। টিকিট কনফার্ম করা হয়েছে, ইস্যু করা বাকি।',
    passportSubmitDate: '2026-06-18',
    passportSubmitRemarks: 'পাসপোর্ট ও ৫ কপি ছবি জমা',
    medicalStatus: 'Fit',
    medicalDate: '2026-06-20',
    mofaStatus: 'Done',
    mofaNumber: 'MF1928372',
    mofaDate: '2026-06-22',
    visaStampingStatus: 'Done',
    visaStampingDate: '2026-06-23',
    fingerprintStatus: 'Done',
    fingerprintDate: '2026-06-21',
    policeClearanceStatus: 'Not Required',
    okToBoardStatus: 'Pending',
    payments: [
      {
        id: 'pay_3_1',
        amount: 30000,
        date: '2026-06-18',
        receiptNo: 'HA-4902',
        paymentMethod: 'Cash (নগদ)',
        remarks: 'প্রাথমিক প্রসেসিং ফাইল ফি'
      },
      {
        id: 'pay_3_2',
        amount: 35000,
        date: '2026-06-23',
        receiptNo: 'HA-4965',
        paymentMethod: 'Nagad (নগদ অ্যাপ)',
        remarks: 'ভিসা স্ট্যাম্পিং ও টিকিট বুকিং বাবদ জমা'
      }
    ],
    createdAt: '2026-06-18T11:40:00.000Z',
    updatedAt: '2026-06-23T16:50:00.000Z'
  },
  {
    id: 'pass_4',
    name: 'আব্দুর রহমান (Abdur Rahman)',
    passportNumber: 'EE7239104',
    phone: '01911223344',
    destination: 'Saudi Arabia (সৌদি আরব)',
    flightNumber: 'MH-197',
    travelDate: '2026-07-28',
    visaStatus: 'Approved',
    ticketStatus: 'Issued',
    paymentStatus: 'Due',
    totalAmount: 48000,
    amountPaid: 15000,
    amountDue: 33000,
    remarks: 'টিকিট ইস্যু করা হয়েছে। টাকা ভ্রমণের ৩ দিন আগে পরিশোধ করবে।',
    passportSubmitDate: '2026-06-19',
    medicalStatus: 'Fit',
    mofaStatus: 'Done',
    visaStampingStatus: 'Done',
    fingerprintStatus: 'Done',
    policeClearanceStatus: 'Done',
    okToBoardStatus: 'Done',
    payments: [
      {
        id: 'pay_4_1',
        amount: 15000,
        date: '2026-06-19',
        receiptNo: 'HA-4911',
        paymentMethod: 'Cash (নগদ)',
        remarks: 'প্রথম কিস্তি জমা'
      }
    ],
    createdAt: '2026-06-19T09:15:00.000Z',
    updatedAt: '2026-06-24T12:00:00.000Z'
  },
  {
    id: 'pass_5',
    name: 'মোঃ কামরুল ইসলাম (Md. Kamrul Islam)',
    passportNumber: 'EF4422991',
    phone: '01677889900',
    destination: 'Saudi Arabia (সৌদি আরব)',
    travelDate: '2026-07-20',
    visaStatus: 'Rejected',
    ticketStatus: 'Not Booked',
    paymentStatus: 'Paid',
    totalAmount: 35000,
    amountPaid: 35000,
    amountDue: 0,
    remarks: 'ভিসা রিজেক্ট হয়েছে। টাকা রিফান্ডের প্রক্রিয়া চলছে।',
    passportSubmitDate: '2026-06-15',
    medicalStatus: 'Unfit',
    medicalDate: '2026-06-17',
    medicalRemarks: 'মেডিকেল রিপোর্টে আনফিট এসেছে',
    payments: [
      {
        id: 'pay_5_1',
        amount: 35000,
        date: '2026-06-15',
        receiptNo: 'HA-4890',
        paymentMethod: 'Cash (নগদ)',
        remarks: 'সম্পূর্ণ চুক্তি পেমেন্ট'
      }
    ],
    createdAt: '2026-06-15T14:22:00.000Z',
    updatedAt: '2026-06-24T10:10:00.000Z'
  }
];

// Helper to read database
function readDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading database file, using defaults", e);
  }
  
  // Seed with default data
  const seededPassengers = INITIAL_PASSENGERS.map((p) => ({
    ...p,
    ownerPhone: p.phone // Map initial passengers to their own phone number as owners
  }));
  
  const defaultDB: DatabaseSchema = {
    passengers: seededPassengers,
    sessions: [],
    otps: []
  };
  
  writeDB(defaultDB);
  return defaultDB;
}

// Helper to write database
function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing database file", e);
  }
}

// Start Server Wrapper
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Clean expired OTPs and Sessions periodically
  setInterval(() => {
    const db = readDB();
    const now = Date.now();
    let changed = false;

    const activeSessions = db.sessions.filter((s) => s.expiresAt > now);
    if (activeSessions.length !== db.sessions.length) {
      db.sessions = activeSessions;
      changed = true;
    }

    const activeOTPs = db.otps.filter((o) => o.expiresAt > now);
    if (activeOTPs.length !== db.otps.length) {
      db.otps = activeOTPs;
      changed = true;
    }

    if (changed) {
      writeDB(db);
    }
  }, 10 * 60 * 1000);

  // Authenticate Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "অনুমতি নেই। অনুগ্রহ করে লগইন করুন।" });
    }

    const db = readDB();
    const session = db.sessions.find((s) => s.token === token);

    if (!session || session.expiresAt < Date.now()) {
      return res.status(403).json({ error: "লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।" });
    }

    req.user = { phone: session.phone };
    next();
  };

  // --- AUTH ENDPOINTS ---

  // Request OTP
  app.post("/api/auth/send-otp", (req, res) => {
    const { phone } = req.body;
    
    if (!phone || typeof phone !== "string" || phone.trim().length < 8) {
      return res.status(400).json({ error: "সঠিক মোবাইল নম্বর প্রদান করুন।" });
    }

    const cleanPhone = phone.trim();
    
    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    const db = readDB();
    
    // Remove existing OTP for this phone
    db.otps = db.otps.filter((o) => o.phone !== cleanPhone);
    db.otps.push({ phone: cleanPhone, code: otpCode, expiresAt });
    writeDB(db);

    console.log(`[SMS OTP SIMULATION] Code for ${cleanPhone} is: ${otpCode}`);

    // Return the simulationCode so the UI can toast/alert it to the user.
    // This allows real-world testing without needing active premium SMS gateways.
    res.json({
      success: true,
      message: "মোবাইল নম্বরে একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে।",
      simulationCode: otpCode
    });
  });

  // Verify OTP & Sign In
  app.post("/api/auth/verify-otp", (req, res) => {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: "মোবাইল নম্বর এবং ওটিপি কোড উভয়ই আবশ্যক।" });
    }

    const cleanPhone = phone.trim();
    const cleanCode = code.trim();

    const db = readDB();
    const otpIndex = db.otps.findIndex(
      (o) => o.phone === cleanPhone && o.code === cleanCode && o.expiresAt > Date.now()
    );

    if (otpIndex === -1) {
      return res.status(400).json({ error: "ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }

    // Remove OTP after verification
    db.otps.splice(otpIndex, 1);

    // Create session token
    const token = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    db.sessions.push({
      token,
      phone: cleanPhone,
      expiresAt: sessionExpiresAt
    });

    // Make sure we have some demo passengers for this phone if it's one of the initial ones
    // and they don't have any record owned by them yet.
    const userPassengers = db.passengers.filter(p => p.ownerPhone === cleanPhone);
    if (userPassengers.length === 0) {
      // If there are passengers whose contact phone matches this, assign ownership
      let claimedCount = 0;
      db.passengers = db.passengers.map(p => {
        if (p.phone === cleanPhone && !p.ownerPhone) {
          claimedCount++;
          return { ...p, ownerPhone: cleanPhone };
        }
        return p;
      });
      if (claimedCount > 0) {
        writeDB(db);
      }
    }

    writeDB(db);

    res.json({
      success: true,
      token,
      phone: cleanPhone,
      message: "সফলভাবে লগইন হয়েছে।"
    });
  });

  // Get Current Authenticated User
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({
      success: true,
      phone: req.user.phone
    });
  });

  // Logout
  app.post("/api/auth/logout", (req: any, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const db = readDB();
      db.sessions = db.sessions.filter((s) => s.token !== token);
      writeDB(db);
    }

    res.json({ success: true, message: "লগআউট সফল হয়েছে।" });
  });

  // --- SECURE PASSENGER ENDPOINTS ---
  // Ensure that users can ONLY access or modify passengers that they own!

  // 1. Get User's Passengers
  app.get("/api/passengers", authenticateToken, (req: any, res) => {
    const db = readDB();
    const myPassengers = db.passengers.filter((p) => p.ownerPhone === req.user.phone);
    res.json(myPassengers);
  });

  // 2. Add Passenger (Auto-assign ownership)
  app.post("/api/passengers", authenticateToken, (req: any, res) => {
    const passengerData = req.body;
    
    if (!passengerData.name || !passengerData.passportNumber) {
      return res.status(400).json({ error: "যাত্রীর নাম এবং পাসপোর্ট নম্বর আবশ্যক।" });
    }

    const db = readDB();
    
    const newPassenger: Passenger = {
      ...passengerData,
      id: "pass_" + crypto.randomBytes(8).toString("hex"),
      ownerPhone: req.user.phone, // STRICT SECURITY: Auto-bind to logged-in user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.passengers.unshift(newPassenger);
    writeDB(db);

    res.status(201).json(newPassenger);
  });

  // 3. Update Passenger (With ownership check)
  app.put("/api/passengers/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const db = readDB();
    const passengerIndex = db.passengers.findIndex((p) => p.id === id);

    if (passengerIndex === -1) {
      return res.status(404).json({ error: "যাত্রী খুঁজে পাওয়া যায়নি।" });
    }

    const passenger = db.passengers[passengerIndex];

    // STRICT SECURITY: Verify ownership before allowing update
    if (passenger.ownerPhone !== req.user.phone) {
      return res.status(403).json({ error: "আপনার এই যাত্রীর তথ্য পরিবর্তন করার অনুমতি নেই।" });
    }

    // Keep immutable and secure fields
    const updatedPassenger: Passenger = {
      ...passenger,
      ...updateData,
      id: passenger.id,
      ownerPhone: passenger.ownerPhone, // Immutable
      createdAt: passenger.createdAt, // Immutable
      updatedAt: new Date().toISOString()
    };

    db.passengers[passengerIndex] = updatedPassenger;
    writeDB(db);

    res.json(updatedPassenger);
  });

  // 4. Delete Passenger (With ownership check)
  app.delete("/api/passengers/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;

    const db = readDB();
    const passengerIndex = db.passengers.findIndex((p) => p.id === id);

    if (passengerIndex === -1) {
      return res.status(404).json({ error: "যাত্রী খুঁজে পাওয়া যায়নি।" });
    }

    const passenger = db.passengers[passengerIndex];

    // STRICT SECURITY: Verify ownership before allowing delete
    if (passenger.ownerPhone !== req.user.phone) {
      return res.status(403).json({ error: "আপনার এই যাত্রীর তথ্য ডিলিট করার অনুমতি নেই।" });
    }

    db.passengers.splice(passengerIndex, 1);
    writeDB(db);

    res.json({ success: true, message: "যাত্রীর তথ্য সফলভাবে ডিলিট করা হয়েছে।" });
  });

  // Reset/Seeding Route for User (Deletes only their passengers and adds default demo passengers owned by them)
  app.post("/api/passengers/reset", authenticateToken, (req: any, res) => {
    const db = readDB();
    
    // Remove current user's passengers
    db.passengers = db.passengers.filter((p) => p.ownerPhone !== req.user.phone);
    
    // Generate new demo passengers owned by this user
    const userDemos = INITIAL_PASSENGERS.map((p, idx) => ({
      ...p,
      id: "pass_demo_" + idx + "_" + crypto.randomBytes(4).toString("hex"),
      ownerPhone: req.user.phone,
      phone: idx === 0 ? req.user.phone : p.phone // Set first demo passenger's phone to user's phone
    }));

    db.passengers.unshift(...userDemos);
    writeDB(db);

    res.json({ success: true, passengers: userDemos });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
