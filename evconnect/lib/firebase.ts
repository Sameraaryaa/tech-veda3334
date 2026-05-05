import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  onValue,
  update,
  Database,
  Unsubscribe,
} from "firebase/database";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  Auth,
  User,
} from "firebase/auth";
import { Charger, ChargerStatus, Booking } from "./types";
import { MOCK_CHARGERS } from "./data/mockChargers";

/* ═══════════════════════════════════════════════════════════
   Firebase Configuration
   ═══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

/* ═══════════════════════════════════════════════════════════
   Firebase Initialization (singleton)
   ═══════════════════════════════════════════════════════════ */

let app: FirebaseApp;
let db: Database;
let auth: Auth;

function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
}

export function getFirebaseDB(): Database {
  if (!db) {
    db = getDatabase(getFirebaseApp());
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

/* ═══════════════════════════════════════════════════════════
   Auth Functions
   ═══════════════════════════════════════════════════════════ */

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup — writes user profile to DB on first login
 */
export async function signInWithGoogle(role: "owner" | "user" = "user"): Promise<User> {
  const authInstance = getFirebaseAuth();
  const result = await signInWithPopup(authInstance, googleProvider);
  const user = result.user;
  // Write/update user profile in Realtime DB
  await writeUserProfile(user, role);
  return user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const authInstance = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(authInstance, email, password);
  return result.user;
}

/**
 * Sign up with email, password, name, and role
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  role: "owner" | "user"
): Promise<User> {
  const authInstance = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(authInstance, email, password);
  const user = result.user;
  // Set display name
  await updateProfile(user, { displayName: name });
  // Write user profile to DB
  await writeUserProfile(user, role, name);
  return user;
}

/**
 * Write or update user profile in Firebase Realtime DB
 */
export async function writeUserProfile(
  user: User,
  role: "owner" | "user",
  displayName?: string
): Promise<void> {
  const database = getFirebaseDB();
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    // First time — create profile
    await set(userRef, {
      uid: user.uid,
      name: displayName || user.displayName || "User",
      email: user.email,
      role,
      photoURL: user.photoURL || null,
      nfcCardUID: null,
      createdAt: new Date().toISOString(),
    });
  } else {
    // Existing user — just update last login
    await update(userRef, {
      lastLoginAt: new Date().toISOString(),
      photoURL: user.photoURL || snapshot.val().photoURL || null,
    });
  }
}

/**
 * Get user profile from Realtime DB
 */
export async function getUserProfile(uid: string): Promise<{
  uid: string;
  name: string;
  email: string;
  role: "owner" | "user" | "both";
  nfcCardUID: string | null;
  photoURL: string | null;
} | null> {
  const database = getFirebaseDB();
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.val();
}

export async function signOutUser(): Promise<void> {
  const authInstance = getFirebaseAuth();
  await signOut(authInstance);
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
}

/* ═══════════════════════════════════════════════════════════
   Charger CRUD Operations
   ═══════════════════════════════════════════════════════════ */

/**
 * Seed mock chargers into Firebase if the chargers node is empty
 */
export async function seedChargers(): Promise<void> {
  const database = getFirebaseDB();
  const chargersRef = ref(database, "chargers");
  const snapshot = await get(chargersRef);

  if (!snapshot.exists()) {
    const chargersData: Record<string, Charger> = {};
    MOCK_CHARGERS.forEach((charger) => {
      chargersData[charger.id] = charger;
    });
    await set(chargersRef, chargersData);
    console.log("✅ Seeded", MOCK_CHARGERS.length, "chargers to Firebase");
  }
}

/**
 * Get all chargers (one-time read)
 */
export async function getChargers(): Promise<Charger[]> {
  const database = getFirebaseDB();
  const chargersRef = ref(database, "chargers");
  const snapshot = await get(chargersRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as Charger[];
}

/**
 * Listen to all chargers in real-time
 */
export function listenToAllChargers(
  callback: (chargers: Charger[]) => void
): Unsubscribe {
  const database = getFirebaseDB();
  const chargersRef = ref(database, "chargers");

  return onValue(chargersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.val();
    const chargers = Object.values(data) as Charger[];
    callback(chargers);
  });
}

/**
 * Listen to a single charger in real-time (for BookingModal)
 */
export function listenToSingleCharger(
  id: string,
  callback: (charger: Charger) => void
): Unsubscribe {
  const database = getFirebaseDB();
  const chargerRef = ref(database, `chargers/${id}`);

  return onValue(chargerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Charger);
    }
  });
}

/**
 * Update a charger's status
 */
export async function updateChargerStatus(
  id: string,
  status: ChargerStatus
): Promise<void> {
  const database = getFirebaseDB();
  const chargerRef = ref(database, `chargers/${id}`);
  await update(chargerRef, { status });
}

/**
 * Add a new charger listing
 */
export async function addCharger(charger: Omit<Charger, "id">): Promise<string> {
  const database = getFirebaseDB();
  const chargersRef = ref(database, "chargers");
  const newRef = push(chargersRef);
  const id = newRef.key!;
  await set(newRef, { ...charger, id });
  return id;
}

/* ═══════════════════════════════════════════════════════════
   Booking Operations
   ═══════════════════════════════════════════════════════════ */

/**
 * Create a new booking and mark the charger as booked
 */
export async function createBooking(booking: Omit<Booking, "id">): Promise<string> {
  const database = getFirebaseDB();
  const bookingsRef = ref(database, "bookings");
  const newRef = push(bookingsRef);
  const id = newRef.key!;

  await set(newRef, { ...booking, id });

  // Also update charger status to "booked"
  await updateChargerStatus(booking.chargerId, "booked");

  return id;
}

/**
 * Get bookings for a user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const database = getFirebaseDB();
  const bookingsRef = ref(database, "bookings");
  const snapshot = await get(bookingsRef);

  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  const allBookings = Object.values(data) as Booking[];
  return allBookings.filter((b) => b.userId === userId);
}
