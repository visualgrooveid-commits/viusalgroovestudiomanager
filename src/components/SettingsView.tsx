/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, StudioSettings } from "../types";
import { INITIAL_BOOKINGS } from "../data";
import { Settings, Save, CheckCircle2, Instagram, Phone, Info, CreditCard, Sparkles, Trash2, RefreshCw, AlertTriangle, Database, Key, Lock, Eye, EyeOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { auth } from "../lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, linkWithCredential } from "firebase/auth";

interface SettingsViewProps {
  settings: StudioSettings;
  onUpdateSettings: (updated: StudioSettings) => void;
  googleUser: any;
  googleToken: string | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  bookings: Booking[];
  onUpdateBookings?: (updatedBookings: Booking[]) => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  googleUser,
  googleToken,
  onGoogleSignIn,
  onGoogleLogout,
  bookings,
  onUpdateBookings
}: SettingsViewProps) {
  const [studioName, setStudioName] = useState(settings.studioName);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [whatsApp, setWhatsApp] = useState(settings.whatsApp);
  const [shopeepayAccount, setShopeepayAccount] = useState(settings.shopeepayAccount);
  const [briAccount, setBriAccount] = useState(settings.briAccount);
  const [bcaAccount, setBcaAccount] = useState(settings.bcaAccount);
  const [language, setLanguage] = useState<"en" | "id">(settings.language || "id");

  const [savedAlert, setSavedAlert] = useState(false);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetsSuccessUrl, setSheetsSuccessUrl] = useState<string | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  // States for resetting bookings database
  const [showResetEmptyConfirm, setShowResetEmptyConfirm] = useState(false);
  const [showResetDemoConfirm, setShowResetDemoConfirm] = useState(false);
  const [resetAlert, setResetAlert] = useState<string | null>(null);

  // Password Manager States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordErrorCode, setPasswordErrorCode] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const isEmailUser = currentUser?.providerData.some((p) => p.providerId === "password");
  const [isLinkedPassword, setIsLinkedPassword] = useState(isEmailUser || false);

  React.useEffect(() => {
    const isEmail = currentUser?.providerData.some((p) => p.providerId === "password") || false;
    setIsLinkedPassword(isEmail);
  }, [currentUser]);

  const handleLinkPassword = async () => {
    setPasswordError(null);
    setPasswordErrorCode(null);
    setPasswordSuccess(null);

    const isEn = language === "en";

    if (!newPassword) {
      setPasswordError(
        isEn ? "Please enter a password." : "Harap masukkan kata sandi baru."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        isEn ? "Password must be at least 6 characters long." : "Kata sandi minimal harus 6 karakter."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        isEn ? "Passwords do not match." : "Konfirmasi kata sandi tidak cocok."
      );
      return;
    }

    setPasswordLoading(true);
    try {
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, newPassword);
        await linkWithCredential(currentUser, credential);
        
        // Reload user so that changes reflect in Firebase Auth instance
        await currentUser.reload();
        
        setIsLinkedPassword(true);
        setPasswordSuccess(
          isEn
            ? "Your account has been successfully linked with this password! You can now log in using either Google or your email & password."
            : "Akun Anda berhasil ditautkan dengan kata sandi! Sekarang Anda dapat masuk menggunakan Google maupun email & kata sandi Anda."
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(isEn ? "No authenticated user or email found." : "Pengguna tidak terautentikasi atau email tidak ditemukan.");
      }
    } catch (err: any) {
      console.error("Password link error:", err);
      setPasswordErrorCode(err.code || "unknown");
      let errorMsg = err.message || String(err);
      if (err.code === "auth/provider-already-linked") {
        errorMsg = isEn 
          ? "This account is already linked with a password provider." 
          : "Akun ini sudah ditautkan dengan penyedia kata sandi.";
      } else if (err.code === "auth/credential-already-in-use") {
        errorMsg = isEn
          ? "This email is already in use by another account."
          : "Email ini sudah digunakan oleh akun lain.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = isEn ? "Password is too weak." : "Kata sandi terlalu lemah.";
      } else if (err.code === "auth/requires-recent-login") {
        errorMsg = isEn
          ? "For security, this action requires a recent login. Please sign out and sign in again using Google, then try setting a password."
          : "Untuk keamanan, tindakan ini memerlukan login terbaru. Silakan keluar dan masuk kembali menggunakan Google, lalu coba atur kata sandi.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMsg = isEn
          ? "The Email/Password sign-in provider is disabled in your Firebase project. You must enable it in the Firebase Console."
          : "Metode masuk Email/Kata Sandi dinonaktifkan di proyek Firebase Anda. Anda harus mengaktifkannya terlebih dahulu di Firebase Console.";
      }
      setPasswordError(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError(null);
    setPasswordErrorCode(null);
    setPasswordSuccess(null);

    const isEn = language === "en";

    if (!isEmailUser) {
      setPasswordError(
        isEn
          ? "You are logged in via Google. Password can only be configured in Google Account settings."
          : "Anda masuk menggunakan Google. Pengaturan kata sandi hanya dapat dikonfigurasi melalui akun Google Anda."
      );
      return;
    }

    if (!currentPassword) {
      setPasswordError(
        isEn ? "Please enter your current password." : "Harap masukkan kata sandi Anda saat ini."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        isEn ? "Please enter a new password." : "Harap masukkan kata sandi baru."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        isEn ? "New password must be at least 6 characters long." : "Kata sandi baru minimal harus 6 karakter."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        isEn ? "New passwords do not match." : "Kata sandi baru tidak cocok."
      );
      return;
    }

    setPasswordLoading(true);
    try {
      if (currentUser && currentUser.email) {
        // Reauthenticate
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        // Update password
        await updatePassword(currentUser, newPassword);
        
        setPasswordSuccess(
          isEn
            ? "Your password has been updated successfully!"
            : "Kata sandi Anda berhasil diperbarui!"
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(isEn ? "No authenticated user found." : "Pengguna tidak terautentikasi.");
      }
    } catch (err: any) {
      console.error("Password update error:", err);
      setPasswordErrorCode(err.code || "unknown");
      let errorMsg = err.message || String(err);
      if (err.code === "auth/wrong-password") {
        errorMsg = isEn ? "Incorrect current password." : "Kata sandi saat ini salah.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = isEn ? "Password is too weak." : "Kata sandi terlalu lemah.";
      } else if (err.code === "auth/requires-recent-login") {
        errorMsg = isEn 
          ? "Session expired. Please log out and log in again to update your password." 
          : "Sesi kedaluwarsa. Silakan keluar dan masuk kembali untuk memperbarui kata sandi Anda.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMsg = isEn
          ? "The Email/Password sign-in provider is disabled in your Firebase project. You must enable it in the Firebase Console."
          : "Metode masuk Email/Kata Sandi dinonaktifkan di proyek Firebase Anda. Anda harus mengaktifkannya terlebih dahulu di Firebase Console.";
      }
      setPasswordError(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSyncSheets = async () => {
    if (!googleToken) return;
    setSyncingSheets(true);
    setSheetsSuccessUrl(null);
    setSheetsError(null);
    try {
      const { syncToGoogleSheets } = await import("../lib/googleSync");
      const result = await syncToGoogleSheets(bookings, googleToken, studioName);
      if (result && result.url) {
        setSheetsSuccessUrl(result.url);
      }
    } catch (e: any) {
      console.error(e);
      setSheetsError(e.message || String(e));
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      studioName,
      instagram: instagram.startsWith("@") ? instagram : instagram ? `@${instagram}` : "",
      whatsApp,
      shopeepayAccount,
      briAccount,
      bcaAccount,
      language
    });

    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  const isEn = language === "en";

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif tracking-tight font-medium text-neutral-900">
          {isEn ? "Studio Settings" : "Pengaturan Studio"}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          {isEn
            ? "Configure VisualGroove studio parameters, invoice signatures, and billing accounts"
            : "Konfigurasi parameter studio VisualGroove, tanda tangan invoice, dan akun pembayaran"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {savedAlert && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              {isEn
                ? "Studio settings saved and propagated successfully!"
                : "Pengaturan studio berhasil disimpan dan diterapkan!"}
            </span>
          </div>
        )}

        {/* Studio Identity Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm/5 space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-semibold text-neutral-900 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-neutral-500" />
              <span>{isEn ? "Studio Identity" : "Identitas Studio"}</span>
            </h2>
            <p className="text-xs text-neutral-400">
              {isEn ? "Configure visual brand signatures" : "Konfigurasi identitas visual brand"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "Studio Name" : "Nama Studio"}
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "Instagram Handle" : "Username Instagram"}
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "WhatsApp Hotline Number" : "Nomor WhatsApp Hotline"}
              </label>
              <input
                type="text"
                value={whatsApp}
                onChange={(e) => setWhatsApp(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "System Language" : "Bahasa Sistem"}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "id")}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Destination Invoicing Accounts Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm/5 space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-semibold text-neutral-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-neutral-500" />
              <span>{isEn ? "Destination Accounts" : "Rekening Penerima"}</span>
            </h2>
            <p className="text-xs text-neutral-400">
              {isEn
                ? "Manage payment destinations embedded inside client invoices"
                : "Kelola rekening tujuan pembayaran yang disematkan di dalam invoice klien"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "ShopeePay Number" : "Nomor ShopeePay"}
              </label>
              <input
                type="text"
                value={shopeepayAccount}
                onChange={(e) => setShopeepayAccount(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "BRI Account Number" : "Nomor Rekening BRI"}
              </label>
              <input
                type="text"
                value={briAccount}
                onChange={(e) => setBriAccount(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                {isEn ? "BCA Account Number" : "Nomor Rekening BCA"}
              </label>
              <input
                type="text"
                value={bcaAccount}
                onChange={(e) => setBcaAccount(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google Workspace Integrations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm/5 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-slate-500" />
                <span>Google Workspace Sync</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? "Connect and synchronize studio CRM data with Google Sheets & Google Calendar"
                  : "Hubungkan dan sinkronkan data studio CRM dengan Google Sheets & Google Calendar"}
              </p>
            </div>
            {googleToken && (
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
                ● {isEn ? "Connected" : "Terhubung"}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {/* Account Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 border border-slate-150 p-5 rounded-2xl gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-full bg-slate-150 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 overflow-hidden shrink-0">
                  {googleUser?.photoURL ? (
                    <img src={googleUser.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <span>G</span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {googleToken ? googleUser?.displayName || (isEn ? "Connected User" : "Pengguna Terhubung") : (isEn ? "Google Account" : "Akun Google")}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {googleToken
                      ? googleUser?.email
                      : (isEn
                          ? "Connect to Google Calendar and Google Sheets API."
                          : "Hubungkan ke Google Calendar dan Google Sheets API.")}
                  </p>
                </div>
              </div>

              <div>
                {!googleToken ? (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="w-full sm:w-auto px-4 py-2.5 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 inline-flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>{isEn ? "Connect Google Account" : "Hubungkan Akun Google"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGoogleLogout}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 inline-flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>{isEn ? "Disconnect" : "Putuskan Koneksi"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Google Sheets Sync Action Block */}
            {googleToken && (
              <div className="border border-slate-150 rounded-2xl p-5 space-y-4 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                      <span>📊 {isEn ? "Google Sheets CRM Backup" : "Backup CRM Google Sheets"}</span>
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      {isEn
                        ? "One-click to create a new spreadsheet 'VisualGroove Studio OS Bookings' in Google Drive and sync all bookings."
                        : "Satu klik untuk membuat spreadsheet baru \"VisualGroove Studio OS Bookings\" di Google Drive dan sinkronkan semua daftar booking ke dalamnya."}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={handleSyncSheets}
                      disabled={syncingSheets}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 inline-flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {syncingSheets ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isEn ? "Syncing..." : "Menyinkronkan..."}</span>
                        </>
                      ) : (
                        <span>{isEn ? "Sync Bookings to Sheets" : "Sinkronkan Pesanan ke Sheets"}</span>
                      )}
                    </button>
                  </div>
                </div>

                {sheetsSuccessUrl && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold">
                    <span>
                      {isEn
                        ? "✓ Data successfully synced to Google Sheet!"
                        : "✓ Data berhasil disinkronkan ke Google Sheet!"}
                    </span>
                    <a
                      href={sheetsSuccessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-900 underline inline-flex items-center space-x-1 hover:text-emerald-955"
                    >
                      <span>{isEn ? "Open Google Sheet" : "Buka Google Sheet"}</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

                {sheetsError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold">
                    {isEn ? "Sheets sync failed: " : "Gagal sinkronisasi Sheets: "}{sheetsError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password Management Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm/5 space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-base font-semibold text-neutral-900 flex items-center space-x-2">
              <Key className="w-4 h-4 text-neutral-500" />
              <span>{isEn ? "Security & Password" : "Keamanan & Kata Sandi"}</span>
            </h2>
            <p className="text-xs text-neutral-400">
              {isEn
                ? "Update your login credentials to protect your studio data"
                : "Perbarui kredensial masuk Anda untuk melindungi data studio Anda"}
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{passwordError}</span>
              </div>

              {passwordErrorCode === "auth/operation-not-allowed" && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5 text-slate-700 text-xs leading-relaxed">
                  <p className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{isEn ? "How to enable Email/Password in Firebase Console" : "Cara Mengaktifkan Email/Kata Sandi di Firebase Console"}</span>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {isEn
                      ? "By default, your Firebase project only has Google login enabled. To set a password, you must enable the Email/Password provider in your Firebase project:"
                      : "Secara default, proyek Firebase Anda hanya mengaktifkan login lewat Google. Untuk dapat mengatur kata sandi, Anda harus mengaktifkan penyedia Email/Kata Sandi terlebih dahulu di Firebase:"}
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600">
                    <li>
                      {isEn ? (
                        <>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-neutral-800 underline hover:text-neutral-900">Firebase Console</a> for your project.</>
                      ) : (
                        <>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-neutral-800 underline hover:text-neutral-900">Firebase Console</a> proyek Anda.</>
                      )}
                    </li>
                    <li>
                      {isEn
                        ? "Go to Authentication from the left sidebar navigation, then click the Sign-in method tab."
                        : "Masuk ke menu Authentication di bilah sisi kiri, lalu klik tab Sign-in method."}
                    </li>
                    <li>
                      {isEn
                        ? "Under Sign-in providers, click Add new provider."
                        : "Di bagian Sign-in providers, klik tombol Add new provider."}
                    </li>
                    <li>
                      {isEn
                        ? "Select Email/Password from the list."
                        : "Pilih Email/Password dari daftar penyedia autentikasi."}
                    </li>
                    <li>
                      {isEn
                        ? "Enable the first switch (Email/Password), then click Save."
                        : "Aktifkan sakelar pertama (Email/Password), lalu klik Save."}
                    </li>
                    <li>
                      {isEn
                        ? "Return to this Settings page and try setting your password again!"
                        : "Kembali ke halaman Pengaturan ini dan coba atur kata sandi Anda kembali!"}
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {!isLinkedPassword ? (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-slate-600">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">
                    {isEn ? "LoggedIn via Google OAuth" : "Masuk melalui Google OAuth"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {isEn
                      ? "Your account currently has no password. You can set a password below to allow logging in with either Google or your email address."
                      : "Akun Anda saat ini tidak memiliki kata sandi. Anda dapat mengatur kata sandi di bawah ini untuk memungkinkan login menggunakan Google maupun alamat email Anda."}
                  </p>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    {isEn ? "Create Password" : "Buat Kata Sandi Baru"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    {isEn ? "Confirm Password" : "Konfirmasi Kata Sandi"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleLinkPassword}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 inline-flex items-center space-x-2 cursor-pointer"
                >
                  {passwordLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEn ? "Saving..." : "Menyimpan..."}</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>{isEn ? "Set & Link Password" : "Atur & Tautkan Kata Sandi"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-xl">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  {isEn ? "Current Password" : "Kata Sandi Saat Ini"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    {isEn ? "New Password" : "Kata Sandi Baru"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    {isEn ? "Confirm New Password" : "Konfirmasi Kata Sandi Baru"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 inline-flex items-center space-x-2 cursor-pointer"
                >
                  {passwordLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEn ? "Updating..." : "Memperbarui..."}</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>{isEn ? "Change Password" : "Ubah Kata Sandi"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Database Control & Reset Block */}
        <div className="bg-white p-6 rounded-3xl border border-rose-200/60 shadow-sm/5 space-y-6">
          <div className="border-b border-rose-100 pb-4">
            <h2 className="text-base font-semibold text-rose-950 flex items-center space-x-2">
              <Database className="w-4 h-4 text-rose-600" />
              <span>{isEn ? "Data Management & Database Reset" : "Manajemen Data & Reset Database"}</span>
            </h2>
            <p className="text-xs text-neutral-400">
              {isEn
                ? "Reset the booking database and manage the client data status of your studio"
                : "Atur ulang database pesanan dan kelola status data klien studio Anda"}
            </p>
          </div>

          {resetAlert && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{resetAlert}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Clean Slate Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-5 gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">
                  {isEn ? "Clean Slate (Start Fresh)" : "Clean Slate (Mulai Pencatatan Baru)"}
                </h4>
                <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                  {isEn
                    ? "Delete all current booking & client data from your browser. The best choice to enter real client data with 100% accurate tracking."
                    : "Hapus semua data pesanan & klien saat ini dari browser Anda. Pilihan terbaik agar Anda bisa memasukkan data klien riil dengan akurasi pemantauan 100%."}
                </p>
              </div>

              <div className="shrink-0">
                {showResetEmptyConfirm ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateBookings) {
                          onUpdateBookings([]);
                          setResetAlert(
                            isEn
                              ? "Database cleared! Start your client records from scratch."
                              : "Database berhasil dibersihkan! Mulai pencatatan klien Anda dari awal."
                          );
                          setTimeout(() => setResetAlert(null), 4000);
                        }
                        setShowResetEmptyConfirm(false);
                      }}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isEn ? "Yes, Delete All" : "Ya, Hapus Semua"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetEmptyConfirm(false)}
                      className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isEn ? "Cancel" : "Batal"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetEmptyConfirm(true);
                      setShowResetDemoConfirm(false);
                    }}
                    className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isEn ? "Delete All Clients" : "Hapus Semua Klien"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Restore Demo Data Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900">
                  {isEn ? "Restore Simulation Data (Demo Data)" : "Kembalikan Data Simulasi (Restore Demo Data)"}
                </h4>
                <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                  {isEn
                    ? "Repopulate the database with 5 default sample bookings (Amanda, Narendra, Nabila, Reza, etc.) for simulation or demo purposes."
                    : "Isi ulang database dengan 5 contoh pesanan bawaan dari studio (Amanda, Narendra, Nabila, Reza, dll.) untuk keperluan simulasi atau demo."}
                </p>
              </div>

              <div className="shrink-0">
                {showResetDemoConfirm ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateBookings) {
                          onUpdateBookings(INITIAL_BOOKINGS);
                          setResetAlert(
                            isEn
                              ? "Default simulation data successfully restored!"
                              : "Data simulasi bawaan berhasil dipulihkan!"
                          );
                          setTimeout(() => setResetAlert(null), 4000);
                        }
                        setShowResetDemoConfirm(false);
                      }}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isEn ? "Yes, Restore Demo" : "Ya, Pulihkan Demo"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetDemoConfirm(false)}
                      className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isEn ? "Cancel" : "Batal"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetDemoConfirm(true);
                      setShowResetEmptyConfirm(false);
                    }}
                    className="px-4 py-2 bg-neutral-50 border border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-xl text-xs font-semibold cursor-pointer transition-all inline-flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{isEn ? "Restore Demo Data" : "Pulihkan Data Demo"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guidance and Warning Info Banner */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-start space-x-3 text-neutral-500 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
          <p>
            {isEn
              ? "Modifying settings instantly alters standard invoicing details, down-payment instruction references, and WhatsApp text templates for all active booking pipelines. Save changes to keep settings synced."
              : "Mengubah pengaturan secara instan mengubah detail invoice standar, referensi instruksi uang muka, dan template teks WhatsApp untuk semua alur booking yang aktif. Simpan perubahan agar pengaturan tetap sinkron."}
          </p>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 inline-flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isEn ? "Save Configuration" : "Simpan Konfigurasi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
