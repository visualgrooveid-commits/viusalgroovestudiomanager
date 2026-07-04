/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleSignIn } from "../lib/firebase";
import { Camera, Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (user: any, name: string) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // If we are in Forgot Password mode, only email is required
    if (isForgotPassword) {
      if (!email) {
        setError("Email wajib diisi");
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("Link reset password telah dikirim ke email Anda! Silakan periksa inbox atau kotak spam email Anda.");
      } catch (err: any) {
        console.error("Password reset error:", err);
        let errMsg = "Terjadi kesalahan saat mengirim link reset password";
        if (err.code === "auth/user-not-found") {
          errMsg = "Alamat email tidak terdaftar";
        } else if (err.code === "auth/invalid-email") {
          errMsg = "Format email tidak valid";
        } else {
          errMsg = err.message || errMsg;
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Basic Validations
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError("Nama studio/nama lengkap wajib diisi");
        return;
      }
      if (password !== confirmPassword) {
        setError("Konfirmasi password tidak cocok");
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const displayName = userCredential.user.displayName || "";
        onAuthSuccess(userCredential.user, displayName);
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name,
        });
        onAuthSuccess(userCredential.user, name);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      let errMsg = "Terjadi kesalahan autentikasi";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "Email sudah digunakan oleh akun lain";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Format email tidak valid";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password terlalu lemah";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errMsg = "Email atau password salah";
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthSuccess(result.user, result.user.displayName || "");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      // Don't show error if user cancels popup
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Gagal masuk menggunakan Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Camera className="text-white w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-semibold tracking-tight text-slate-900">
          {isForgotPassword ? "Atur Ulang Password" : (isLogin ? "Masuk ke Studio OS" : "Daftar Akun Baru")}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          {isForgotPassword 
            ? "Masukkan email Anda untuk menerima tautan atur ulang kata sandi" 
            : (isLogin ? "Kelola seluruh ekosistem fotografi studio Anda" : "Mulai optimalkan operasional studio Anda sekarang")}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start space-x-2.5 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{successMessage}</span>
                </div>
                
                {isForgotPassword && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-amber-900 text-xs leading-relaxed">
                    <p className="font-bold flex items-center space-x-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Tautan Error saat diklik? (Troubleshooting)</span>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Jika Anda mengeklik tautan di email dan muncul pesan error <span className="font-semibold text-slate-800">"Your request to reset your password has expired or the link has already been used"</span>, hal ini biasanya disebabkan oleh:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                      <li>
                        <strong className="text-slate-700">Sistem Keamanan Email (Auto-Scan):</strong> Filter keamanan email (seperti Microsoft Outlook Safe Links, Gmail Protection, atau corporate spam filters) secara otomatis mengeklik dan memverifikasi tautan di latar belakang untuk keamanan Anda sebelum email dikirim ke inbox. Karena tautan reset password Firebase adalah <span className="underline">sekali pakai (single-use)</span>, proses auto-scan ini langsung menghanguskannya sebelum Anda mengekliknya sendiri.
                      </li>
                      <li>
                        <strong className="text-slate-700">Tautan Kadaluarsa:</strong> Menggunakan tautan dari email lama. Jika Anda menekan tombol kirim berkali-kali, pastikan Anda hanya membuka email yang paling baru masuk.
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-amber-200/50 text-[11px]">
                      <p className="font-bold text-slate-800">💡 Solusi Mudah & Cepat:</p>
                      <ol className="list-decimal pl-4 mt-1 space-y-1 text-slate-600">
                        <li>Jangan klik langsung tombol reset di email Anda.</li>
                        <li><span className="font-semibold text-slate-800">Klik kanan</span> (atau tahan jika di HP) pada tombol reset, lalu pilih <span className="font-semibold text-slate-800">"Salin Alamat Tautan" (Copy Link Address)</span>.</li>
                        <li>Buka browser, lalu buka jendela <span className="font-semibold text-slate-800">Tab Penyamaran Baru (Incognito / Private Window)</span>.</li>
                        <li>Tempel (<span className="font-semibold">Paste</span>) tautan yang disalin ke address bar, lalu tekan Enter untuk menyetel password baru Anda.</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nama Studio / Nama Lengkap
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: VisualGroove Studio"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-black focus:bg-white transition-all duration-150"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Alamat Email
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-black focus:bg-white transition-all duration-150"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-black focus:bg-white transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 h-4" /> : <Eye className="h-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Konfirmasi Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-black focus:bg-white transition-all duration-150"
                  />
                </div>
              </div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-black cursor-pointer underline underline-offset-2"
                >
                  Lupa password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-black hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer shadow-md transition-all duration-150 flex justify-center items-center space-x-2 disabled:bg-slate-300"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                )}
                <span>
                  {loading
                    ? (isForgotPassword ? "Mengirim link..." : (isLogin ? "Sedang Masuk..." : "Mendaftarkan..."))
                    : (isForgotPassword ? "Kirim Link Atur Ulang" : (isLogin ? "Masuk ke Studio OS" : "Mulai Akun Baru"))}
                </span>
              </button>
            </div>
          </form>

          {!isForgotPassword && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                  <span className="bg-white px-3 text-slate-400 font-bold">Atau Masuk Dengan</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={loading}
                className="w-full py-3 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none cursor-pointer shadow-xs transition-all duration-150 flex justify-center items-center space-x-2.5 disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </>
          )}

          {isForgotPassword ? (
            <div className="mt-6 flex justify-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-semibold text-slate-500 hover:text-black cursor-pointer inline-flex items-center space-x-1 underline underline-offset-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Masuk</span>
              </button>
            </div>
          ) : (
            <div className="mt-6 flex justify-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-semibold text-slate-500 hover:text-black cursor-pointer underline underline-offset-4"
              >
                {isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
