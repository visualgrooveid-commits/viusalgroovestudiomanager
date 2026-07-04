/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Bookings from "./components/Bookings";
import BookingWorkspace from "./components/BookingWorkspace";
import CalendarView from "./components/CalendarView";
import PackagesView from "./components/PackagesView";
import Reports from "./components/Reports";
import SettingsView from "./components/SettingsView";
import AuthPage from "./components/AuthPage";

import { Booking, StudioSettings, StudioPackage } from "./types";
import { INITIAL_BOOKINGS, DEFAULT_SETTINGS, DEFAULT_CHECKLIST, DEFAULT_PACKAGES } from "./data";
import { initAuth, googleSignIn, auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { Camera } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Main Email/Password auth state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isMainAuthChecking, setIsMainAuthChecking] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Google OAuth states (for Google Workspace integration in Settings)
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Track primary login auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsMainAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync / Load user-specific data from Firestore when authUser changes
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [packages, setPackages] = useState<StudioPackage[]>(DEFAULT_PACKAGES);

  useEffect(() => {
    if (!authUser) {
      setBookings([]);
      setSettings(DEFAULT_SETTINGS);
      setPackages(DEFAULT_PACKAGES);
      return;
    }

    const loadUserData = async () => {
      setIsDataLoading(true);
      try {
        const uid = authUser.uid;
        const settingsRef = doc(db, "users", uid, "settings", "studioSettings");
        const settingsSnap = await getDoc(settingsRef);

        if (!settingsSnap.exists()) {
          // Brand new user - seed default data to Firestore for a beautiful starter experience
          await setDoc(settingsRef, {
            ...DEFAULT_SETTINGS,
            studioName: authUser.displayName || DEFAULT_SETTINGS.studioName
          });
          
          for (const pkg of DEFAULT_PACKAGES) {
            await setDoc(doc(db, "users", uid, "packages", pkg.id), pkg);
          }
          
          for (const bk of INITIAL_BOOKINGS) {
            await setDoc(doc(db, "users", uid, "bookings", bk.id), bk);
          }

          setSettings({
            ...DEFAULT_SETTINGS,
            studioName: authUser.displayName || DEFAULT_SETTINGS.studioName
          });
          setPackages(DEFAULT_PACKAGES);
          setBookings(INITIAL_BOOKINGS);
        } else {
          // Existing user - load their Firestore documents
          setSettings(settingsSnap.data() as StudioSettings);

          const pkgsSnap = await getDocs(collection(db, "users", uid, "packages"));
          const pkgsList: StudioPackage[] = [];
          pkgsSnap.forEach((d) => {
            pkgsList.push(d.data() as StudioPackage);
          });
          if (pkgsList.length > 0) {
            setPackages(pkgsList);
          } else {
            setPackages(DEFAULT_PACKAGES);
          }

          const bksSnap = await getDocs(collection(db, "users", uid, "bookings"));
          const bksList: Booking[] = [];
          bksSnap.forEach((d) => {
            bksList.push(d.data() as Booking);
          });
          bksList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBookings(bksList);
        }
      } catch (err) {
        console.error("Failed to load user data from Firestore:", err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadUserData();
  }, [authUser]);

  // Handle Google Sync auth setup
  useEffect(() => {
    if (!authUser) return;
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, [authUser]);

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err) {
      console.error("Google sign in failed:", err);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      // Standard Workspace logout only clears the sync state, preserving main session
      localStorage.removeItem("visualgroove_cached_google_token");
      setGoogleUser(null);
      setGoogleToken(null);
    } catch (err) {
      console.error("Google disconnect failed:", err);
    }
  };

  const handleMainLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("visualgroove_cached_google_token");
      setGoogleUser(null);
      setGoogleToken(null);
      setAuthUser(null);
      setCurrentView("dashboard");
      setSelectedBookingId(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // Handle packages updates
  const handleAddPackage = async (newPkg: Omit<StudioPackage, "id">) => {
    if (!authUser) return;
    const id = `pkg-${Date.now()}`;
    const fullPkg = { ...newPkg, id };
    setPackages((prev) => [...prev, fullPkg]);

    try {
      await setDoc(doc(db, "users", authUser.uid, "packages", id), fullPkg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}/packages/${id}`);
    }
  };

  const handleUpdatePackage = async (updatedPkg: StudioPackage) => {
    if (!authUser) return;
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)));

    try {
      await setDoc(doc(db, "users", authUser.uid, "packages", updatedPkg.id), updatedPkg);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}/packages/${updatedPkg.id}`);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!authUser) return;
    setPackages((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, "users", authUser.uid, "packages", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${authUser.uid}/packages/${id}`);
    }
  };

  // Handle setting updates
  const handleUpdateSettings = async (updated: StudioSettings) => {
    if (!authUser) return;
    setSettings(updated);

    try {
      await setDoc(doc(db, "users", authUser.uid, "settings", "studioSettings"), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}/settings/studioSettings`);
    }
  };

  // Handle single booking update (deep clone update)
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    if (!authUser) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );

    try {
      await setDoc(doc(db, "users", authUser.uid, "bookings", updatedBooking.id), updatedBooking);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}/bookings/${updatedBooking.id}`);
    }
  };

  // Clear and restore data specifically in Firestore
  const handleUpdateBookings = async (newBookings: Booking[]) => {
    if (!authUser) return;
    setBookings(newBookings);

    try {
      const uid = authUser.uid;
      const bksSnap = await getDocs(collection(db, "users", uid, "bookings"));
      for (const d of bksSnap.docs) {
        await deleteDoc(doc(db, "users", uid, "bookings", d.id));
      }

      for (const bk of newBookings) {
        await setDoc(doc(db, "users", uid, "bookings", bk.id), bk);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}/bookings`);
    }
  };

  // Add new booking (automatically bootstraps workspace, invoice, payments & timeline)
  const handleAddBooking = async (newFields: Omit<Booking, "id" | "createdAt" | "invoice" | "payments" | "timeline" | "checklist" | "gallery" | "delivery">) => {
    if (!authUser) return;
    const todayStr = "2026-07-03";
    const dateCompact = newFields.eventDate.replace(/-/g, "");
    
    // Create unique ID & invoice numbering
    const serialCount = bookings.filter((b) => b.eventDate === newFields.eventDate).length + 1;
    const padCount = serialCount < 10 ? `0${serialCount}` : `${serialCount}`;
    
    const newId = `VG-BK-${dateCompact}-${padCount}`;
    const invoiceNum = `VG-${dateCompact}-${padCount}`;

    // Compute standard 40% DP
    const finalContract = newFields.price - newFields.discount;
    const dpAmount = Math.round(finalContract * 0.4);
    const remainingAmount = finalContract - dpAmount;

    // Standard checklists mapping
    const checklistItems = DEFAULT_CHECKLIST.map((name, idx) => ({
      id: `chk-${idx}-${Date.now()}`,
      name,
      checked: false
    }));

    const newBooking: Booking = {
      ...newFields,
      id: newId,
      createdAt: new Date().toISOString(),
      invoice: {
        invoiceNumber: invoiceNum,
        status: newFields.status === "DP Paid" ? "DP Paid" : newFields.status === "Inquiry" ? "Draft" : "Unpaid",
        issuedDate: todayStr,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      },
      payments: {
        bookingFeePaid: newFields.status !== "Inquiry",
        dpPaid: newFields.status === "DP Paid" || newFields.status === "Completed" || newFields.status === "Shoot Done" || newFields.status === "Editing" || newFields.status === "Ready to Deliver",
        fullPaid: newFields.status === "Completed",
        dpAmount,
        remainingAmount: newFields.status === "Completed" ? 0 : remainingAmount,
        paymentDate: null
      },
      timeline: [
        {
          id: `t1-${Date.now()}`,
          status: "Booking Created",
          timestamp: new Date().toISOString(),
          note: `Booking ${newId} logged under ${newFields.eventType} tier.`
        }
      ],
      checklist: checklistItems,
      gallery: {
        previewImages: [],
        storageUrl: "",
        galleryLink: "",
        deliveryStatus: "Not Started"
      },
      delivery: {
        googleDriveLink: "",
        pixiesetLink: "",
        deliveryDate: "",
        clientConfirmation: false
      },
      notes: ""
    };

    setBookings((prev) => [newBooking, ...prev]);
    setSelectedBookingId(newId);

    try {
      await setDoc(doc(db, "users", authUser.uid, "bookings", newId), newBooking);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}/bookings/${newId}`);
    }
  };

  // Auth checking loading view
  if (isMainAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center animate-pulse shadow-md">
            <Camera className="text-white w-6 h-6 animate-spin" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">Menginisialisasi Studio OS...</p>
        </div>
      </div>
    );
  }

  // Not logged in - force auth page
  if (!authUser) {
    return <AuthPage onAuthSuccess={(user, name) => setAuthUser(user)} />;
  }

  // Fetching data loading view
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center shadow-md animate-bounce">
            <Camera className="text-white w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Memuat data studio Anda...</p>
          <div className="w-32 bg-slate-200 h-1 rounded-full overflow-hidden">
            <div className="bg-black h-full w-1/2 rounded-full animate-[pulse_1s_infinite_alternate]" />
          </div>
        </div>
      </div>
    );
  }

  // Selected Booking details
  const activeBooking = bookings.find((b) => b.id === selectedBookingId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F9F9]">
      {/* Sidebar (with dynamic settings studioName pass-through) */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedBookingId(null); // Clear selected workspace on sidebar navigation click
        }}
        studioName={settings.studioName}
        googleUser={googleUser}
        googleToken={googleToken}
        language={settings.language || "id"}
        authUser={authUser}
        onLogout={handleMainLogout}
      />

      {/* Main Content Arena */}
      <main className="flex-1 px-6 py-8 md:px-12 md:py-12 overflow-y-auto">
        {/* If a specific workspace is selected, show it as an overlay/details view */}
        {selectedBookingId && activeBooking ? (
          <BookingWorkspace
            booking={activeBooking}
            onBack={() => setSelectedBookingId(null)}
            onUpdateBooking={handleUpdateBooking}
            studioSettings={settings}
            googleUser={googleUser}
            googleToken={googleToken}
            onGoogleSignIn={handleGoogleSignIn}
          />
        ) : (
          /* Render Main Navigation Views */
          <>
            {currentView === "dashboard" && (
              <Dashboard
                bookings={bookings}
                onSelectBooking={(id) => setSelectedBookingId(id)}
                onNavigateToView={(view) => setCurrentView(view)}
                language={settings.language || "id"}
              />
            )}

            {currentView === "bookings" && (
              <Bookings
                bookings={bookings}
                onSelectBooking={(id) => setSelectedBookingId(id)}
                onAddBooking={handleAddBooking}
                packages={packages}
              />
            )}

            {currentView === "calendar" && (
              <CalendarView
                bookings={bookings}
                onSelectBooking={(id) => setSelectedBookingId(id)}
              />
            )}

            {currentView === "packages" && (
              <PackagesView
                packages={packages}
                onAddPackage={handleAddPackage}
                onUpdatePackage={handleUpdatePackage}
                onDeletePackage={handleDeletePackage}
              />
            )}

            {currentView === "reports" && (
              <Reports bookings={bookings} studioName={settings.studioName} />
            )}

            {currentView === "settings" && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                googleUser={googleUser}
                googleToken={googleToken}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleLogout={handleGoogleLogout}
                bookings={bookings}
                onUpdateBookings={handleUpdateBookings}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
