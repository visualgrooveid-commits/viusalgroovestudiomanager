/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Camera,
  LineChart,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  studioName: string;
  googleUser: any;
  googleToken: string | null;
  language?: "en" | "id";
  authUser: any;
  onLogout: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  studioName,
  googleUser,
  googleToken,
  language = "id",
  authUser,
  onLogout
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isEn = language === "en";

  const menuItems = [
    { id: "dashboard", label: isEn ? "Dashboard" : "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: isEn ? "Bookings" : "Pemesanan", icon: Briefcase },
    { id: "calendar", label: isEn ? "Calendar" : "Kalender", icon: CalendarDays },
    { id: "packages", label: isEn ? "Packages" : "Paket Harga", icon: Camera },
    { id: "reports", label: isEn ? "Reports" : "Laporan", icon: LineChart },
    { id: "settings", label: isEn ? "Settings" : "Pengaturan", icon: Settings }
  ];

  const handleItemClick = (id: string) => {
    onViewChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white md:hidden sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tighter">VG</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-900">{studioName}</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Studio OS</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-all duration-200"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:h-screen`}
      >
        <div className="flex flex-col flex-1 py-8 px-6 overflow-y-auto no-scrollbar">
          {/* Logo / Brand Header */}
          <div className="flex items-center space-x-3 pb-8 border-b border-slate-100">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[11px] tracking-tighter">VG</span>
            </div>
            <span className="font-semibold tracking-tight text-lg text-slate-900">VisualGroove</span>
          </div>

          {/* Navigation Items */}
          <nav className="mt-8 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-900 opacity-80" : "text-slate-400 opacity-50"}`} />
                  <span className="tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>


        </div>

        {/* Studio Profile Bar */}
        <div className="border-t border-slate-100 p-6 bg-[#F9F9F9]/50 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border border-slate-100 text-xs font-semibold text-slate-700 overflow-hidden shrink-0">
              {googleToken && googleUser?.photoURL ? (
                <img src={googleUser.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span>{authUser?.displayName?.substring(0, 2).toUpperCase() || "SO"}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-xs font-semibold text-slate-900 truncate flex items-center space-x-1.5">
                <span>{authUser?.displayName || "Studio Owner"}</span>
                {googleToken && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Connected to Google Workspace" />
                )}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {authUser?.email || "owner@studio.com"}
              </p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isEn ? "Log Out" : "Keluar Akun"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
