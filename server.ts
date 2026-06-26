import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { passengers, users } from "./src/db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { adminAuth } from "./src/lib/firebase-admin.ts";

// Hash function for custom database-backed logins
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "HAMAF_SALT_123987!").digest("hex");
}

// Generate secure custom token
function generateToken(user: { uid: string; email: string; name: string }) {
  const payload = JSON.stringify({
    uid: user.uid,
    email: user.email,
    name: user.name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  });
  const signature = crypto.createHmac("sha256", "HAMAF_SERVER_SECRET_9876").update(payload).digest("hex");
  return `custom_token_${Buffer.from(payload).toString("base64")}.${signature}`;
}

// Verify custom token
function verifyToken(tokenStr: string) {
  if (!tokenStr || !tokenStr.startsWith("custom_token_")) return null;
  try {
    const parts = tokenStr.substring("custom_token_".length).split(".");
    if (parts.length !== 2) return null;
    const [payloadBase64, signature] = parts;
    const payloadStr = Buffer.from(payloadBase64, "base64").toString("utf8");
    
    const expectedSignature = crypto.createHmac("sha256", "HAMAF_SERVER_SECRET_9876").update(payloadStr).digest("hex");
    if (expectedSignature !== signature) return null;

    const payload = JSON.parse(payloadStr);
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

// Auto-initialize tables in PostgreSQL / Supabase
async function initializeDatabase() {
  console.log("Initializing database tables if not exist...");
  
  // 1. Create users table if not exists
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        phone TEXT,
        password TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Users table verified / created.");
  } catch (e) {
    console.warn("Could not create users table. It might already exist:", e);
  }

  // Ensure the password column exists in users table (just in case)
  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
    `);
    console.log("Ensured password column exists in users table.");
  } catch (e) {
    console.warn("Could not add password column to users table:", e);
  }

  // 2. Create passengers table if not exists
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS passengers (
        id TEXT PRIMARY KEY,
        owner_email TEXT NOT NULL,
        agent_id TEXT,
        name TEXT NOT NULL,
        passport_number TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        destination TEXT NOT NULL,
        flight_number TEXT,
        travel_date TEXT NOT NULL,
        visa_status TEXT NOT NULL,
        ticket_status TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        total_amount INTEGER NOT NULL DEFAULT 0,
        amount_paid INTEGER NOT NULL DEFAULT 0,
        amount_due INTEGER NOT NULL DEFAULT 0,
        remarks TEXT,
        passport_submit_date TEXT,
        passport_expiry_date TEXT,
        passport_submit_remarks TEXT,
        medical_status TEXT,
        medical_date TEXT,
        medical_expiry_date TEXT,
        medical_remarks TEXT,
        mofa_status TEXT,
        mofa_number TEXT,
        mofa_date TEXT,
        mofa_expiry_date TEXT,
        visa_stamping_status TEXT,
        visa_stamping_date TEXT,
        visa_expiry_date TEXT,
        fingerprint_status TEXT,
        fingerprint_date TEXT,
        taqamul_status TEXT,
        taqamul_profession TEXT,
        taqamul_date TEXT,
        taqamul_expiry_date TEXT,
        police_clearance_status TEXT,
        police_clearance_date TEXT,
        police_clearance_expiry_date TEXT,
        ok_to_board_status TEXT,
        ok_to_board_date TEXT,
        bmet_training_status TEXT,
        bmet_training_date TEXT,
        bmet_training_expiry_date TEXT,
        bmet_training_remarks TEXT,
        manpower_status TEXT,
        manpower_date TEXT,
        manpower_remarks TEXT,
        air_ticket_status TEXT,
        air_ticket_date TEXT,
        air_ticket_remarks TEXT,
        payments JSONB,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    console.log("Passengers table verified / created.");
  } catch (e) {
    console.warn("Could not create passengers table:", e);
  }

  // 3. Create agents table if not exists
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        owner_email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        agency_name TEXT,
        commission_rate INTEGER NOT NULL DEFAULT 0,
        remarks TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    console.log("Agents table verified / created.");
  } catch (e) {
    console.warn("Could not create agents table:", e);
  }

  console.log("Database initialization completed!");
}

const PORT = 3000;

const INITIAL_PASSENGERS = [
  {
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

// Authentication Middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "অনুমতি নেই। অনুগ্রহ করে লগইন করুন।" });
  }

  // 1. Check if it's a custom DB token
  if (token.startsWith("custom_token_")) {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ error: "লগইন সেশন শেষ হয়েছে বা ভুল টোকেন। আবার লগইন করুন।" });
    }
    
    req.user = {
      email: decoded.email.trim().toLowerCase(),
      uid: decoded.uid,
      name: decoded.name || ""
    };
    return next();
  }

  // 2. Otherwise fall back to Firebase token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;
    if (!email) {
      return res.status(401).json({ error: "অনুমতি নেই। টোকেনটিতে কোনো ইমেইল পাওয়া যায়নি।" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Sync user in postgres
    const usersList = await db.select().from(users).where(eq(users.uid, decodedToken.uid));
    if (usersList.length === 0) {
      await db.insert(users).values({
        uid: decodedToken.uid,
        email: cleanEmail,
        name: decodedToken.name || null,
        phone: decodedToken.phone_number || null,
      }).onConflictDoNothing();
    }

    req.user = {
      email: cleanEmail,
      uid: decodedToken.uid,
      name: decodedToken.name || ""
    };
    next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(403).json({ error: "লগইন সেশন শেষ হয়েছে বা ভুল টোকেন। আবার লগইন করুন।" });
  }
};

async function startServer() {
  // Initialize database tables & columns
  await initializeDatabase();

  const app = express();

  app.use(express.json());

  // --- AUTH ENDPOINTS ---

  app.post("/api/auth/db-register", async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "অনুগ্রহ করে সব প্রয়োজনীয় ঘরগুলো পূরণ করুন।" });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // Check if user already exists
      const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "এই ইমেইল ঠিকানাটি ইতিমধ্যে নিবন্ধিত রয়েছে। অন্য ইমেইল ব্যবহার করুন।" });
      }

      // Create new user
      const customUid = "user_" + crypto.randomBytes(12).toString("hex");
      const hashedPassword = hashPassword(password);

      const newUser = {
        uid: customUid,
        email: cleanEmail,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        createdAt: new Date()
      };

      await db.insert(users).values(newUser);

      // Generate custom token
      const token = generateToken({
        uid: customUid,
        email: cleanEmail,
        name: newUser.name
      });

      res.status(201).json({
        success: true,
        token,
        email: cleanEmail,
        name: newUser.name
      });
    } catch (e: any) {
      console.error("DB Register error:", e);
      res.status(500).json({ error: "নিবন্ধন করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।" });
    }
  });

  app.post("/api/auth/db-login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দুটিই পূরণ করুন।" });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const existingUsers = await db.select().from(users).where(eq(users.email, cleanEmail));
      if (existingUsers.length === 0) {
        return res.status(400).json({ error: "ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে। অনুগ্রহ করে আবার যাচাই করুন।" });
      }

      const user = existingUsers[0];
      const hashedPassword = hashPassword(password);

      // Check password
      if (!user.password || user.password !== hashedPassword) {
        return res.status(400).json({ error: "ইমেইল অথবা পাসওয়ার্ড ভুল হয়েছে। অনুগ্রহ করে আবার যাচাই করুন।" });
      }

      // Generate custom token
      const token = generateToken({
        uid: user.uid,
        email: cleanEmail,
        name: user.name || ""
      });

      res.json({
        success: true,
        token,
        email: cleanEmail,
        name: user.name || ""
      });
    } catch (e: any) {
      console.error("DB Login error:", e);
      res.status(500).json({ error: "লগইন করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({
      success: true,
      email: req.user.email,
      name: req.user.name
    });
  });

  app.post("/api/auth/logout", (req: any, res) => {
    res.json({ success: true, message: "লগআউট সফল হয়েছে।" });
  });

  // --- SECURE PASSENGER ENDPOINTS ---

  // 1. Get User's Passengers (with auto-seeding if empty)
  app.get("/api/passengers", authenticateToken, async (req: any, res) => {
    try {
      const myPassengers = await db.select().from(passengers).where(eq(passengers.ownerEmail, req.user.email));
      
      if (myPassengers.length === 0) {
        // Auto-seed for the user
        const userDemos = INITIAL_PASSENGERS.map((p, idx) => ({
          ...p,
          id: "pass_demo_" + idx + "_" + crypto.randomBytes(4).toString("hex"),
          ownerEmail: req.user.email,
        }));
        
        await db.insert(passengers).values(userDemos);
        return res.json(userDemos);
      }
      
      res.json(myPassengers);
    } catch (e: any) {
      console.error("Error fetching passengers:", e);
      res.status(500).json({ error: "যাত্রী তালিকা লোড করতে ব্যর্থ হয়েছে।" });
    }
  });

  // 2. Add Passenger
  app.post("/api/passengers", authenticateToken, async (req: any, res) => {
    const passengerData = req.body;
    
    if (!passengerData.name || !passengerData.passportNumber) {
      return res.status(400).json({ error: "যাত্রীর নাম এবং পাসপোর্ট নম্বর আবশ্যক।" });
    }

    try {
      const newPassenger = {
        ...passengerData,
        id: "pass_" + crypto.randomBytes(8).toString("hex"),
        ownerEmail: req.user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payments: passengerData.payments || [],
        totalAmount: Number(passengerData.totalAmount) || 0,
        amountPaid: Number(passengerData.amountPaid) || 0,
        amountDue: Number(passengerData.amountDue) || 0
      };

      await db.insert(passengers).values(newPassenger);
      res.status(201).json(newPassenger);
    } catch (e: any) {
      console.error("Error adding passenger:", e);
      res.status(500).json({ error: "যাত্রী যোগ করতে ব্যর্থ হয়েছে।" });
    }
  });

  // 3. Update Passenger
  app.put("/api/passengers/:id", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
      const existing = await db.select().from(passengers).where(and(eq(passengers.id, id), eq(passengers.ownerEmail, req.user.email)));
      
      if (existing.length === 0) {
        return res.status(404).json({ error: "যাত্রী খুঁজে পাওয়া যায়নি বা আপনার এই যাত্রীর তথ্য পরিবর্তন করার অনুমতি নেই।" });
      }

      const passenger = existing[0];

      const updatedPassenger = {
        ...passenger,
        ...updateData,
        id: passenger.id,
        ownerEmail: passenger.ownerEmail,
        createdAt: passenger.createdAt,
        updatedAt: new Date().toISOString(),
        payments: updateData.payments || passenger.payments || [],
        totalAmount: Number(updateData.totalAmount === undefined ? passenger.totalAmount : updateData.totalAmount),
        amountPaid: Number(updateData.amountPaid === undefined ? passenger.amountPaid : updateData.amountPaid),
        amountDue: Number(updateData.amountDue === undefined ? passenger.amountDue : updateData.amountDue)
      };

      await db.update(passengers).set(updatedPassenger).where(eq(passengers.id, id));
      res.json(updatedPassenger);
    } catch (e: any) {
      console.error("Error updating passenger:", e);
      res.status(500).json({ error: "যাত্রী তথ্য আপডেট করতে ব্যর্থ হয়েছে।" });
    }
  });

  // 4. Delete Passenger
  app.delete("/api/passengers/:id", authenticateToken, async (req: any, res) => {
    const { id } = req.params;

    try {
      const existing = await db.select().from(passengers).where(and(eq(passengers.id, id), eq(passengers.ownerEmail, req.user.email)));
      
      if (existing.length === 0) {
        return res.status(404).json({ error: "যাত্রী খুঁজে পাওয়া যায়নি বা আপনার এই যাত্রীর তথ্য ডিলিট করার অনুমতি নেই।" });
      }

      await db.delete(passengers).where(eq(passengers.id, id));
      res.json({ success: true, message: "যাত্রীর তথ্য সফলভাবে ডিলিট করা হয়েছে।" });
    } catch (e: any) {
      console.error("Error deleting passenger:", e);
      res.status(500).json({ error: "যাত্রী ডিলিট করতে ব্যর্থ হয়েছে।" });
    }
  });

  // 5. Reset/Seeding Route
  app.post("/api/passengers/reset", authenticateToken, async (req: any, res) => {
    try {
      await db.delete(passengers).where(eq(passengers.ownerEmail, req.user.email));

      const userDemos = INITIAL_PASSENGERS.map((p, idx) => ({
        ...p,
        id: "pass_demo_" + idx + "_" + crypto.randomBytes(4).toString("hex"),
        ownerEmail: req.user.email,
      }));

      await db.insert(passengers).values(userDemos);
      res.json({ success: true, passengers: userDemos });
    } catch (e: any) {
      console.error("Error resetting passengers:", e);
      res.status(500).json({ error: "ডাটাবেজ রিসেট করতে ব্যর্থ হয়েছে।" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
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
