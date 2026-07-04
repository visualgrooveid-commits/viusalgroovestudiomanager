/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Booking } from "../types";
import { formatRupiah, formatDate, getWhatsAppMessage } from "../utils";
import {
  LineChart,
  DollarSign,
  TrendingUp,
  Inbox,
  Calendar,
  MessageSquareShare,
  FileCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  CalendarDays,
  X,
  ChevronRight
} from "lucide-react";

interface ReportsProps {
  bookings: Booking[];
  studioName: string;
}

export default function Reports({ bookings, studioName }: ReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Helper to extract year-month from eventDate (YYYY-MM)
  const getYearMonth = (dateStr: string) => {
    if (!dateStr || dateStr.length < 7) return "";
    return dateStr.substring(0, 7); // returns "YYYY-MM"
  };

  // Format month key "YYYY-MM" to Indonesian "Bulan Tahun"
  const formatYearMonth = (ymStr: string) => {
    if (!ymStr) return "";
    const [year, month] = ymStr.split("-");
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];
    const mIndex = parseInt(month, 10) - 1;
    return `${monthNames[mIndex]} ${year}`;
  };

  // Format month key "YYYY-MM" to short "MMM 'YY"
  const formatShortYearMonth = (ymStr: string) => {
    if (!ymStr) return "";
    const [year, month] = ymStr.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des"
    ];
    const mIndex = parseInt(month, 10) - 1;
    return `${monthNames[mIndex]} '${year.substring(2)}`;
  };

  // Format currency value to short rupiah text (e.g. 15.5M or 450rb)
  const formatShortRupiah = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
    }
    if (val >= 1_000) {
      return `Rp ${(val / 1_000).toFixed(0)}rb`;
    }
    return `Rp ${val}`;
  };

  // Get current system year-month for comparison (past/current/future)
  const currentYM = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  // Compute all unique active months from active bookings chronologically
  const activeMonths = useMemo(() => {
    const unique = Array.from(
      new Set(
        bookings
          .filter((b) => b.status !== "Cancelled" && b.eventDate && b.eventDate.match(/^\d{4}-\d{2}-\d{2}$/))
          .map((b) => getYearMonth(b.eventDate))
      )
    ).filter(Boolean);

    // Always ensure current month is in the list
    if (!unique.includes(currentYM)) {
      unique.push(currentYM);
    }

    return unique.sort();
  }, [bookings, currentYM]);

  // Compile monthly performance statistics dynamically for list & chart
  const monthlySummaries = useMemo(() => {
    return activeMonths.map((ym) => {
      const monthlyBookings = bookings.filter(
        (b) => b.status !== "Cancelled" && getYearMonth(b.eventDate) === ym
      );

      const contractValue = monthlyBookings.reduce(
        (sum, b) => sum + (b.price - b.discount),
        0
      );

      const collected = monthlyBookings.reduce((sum, b) => {
        let col = 0;
        if (b.payments.dpPaid) {
          col += b.payments.dpAmount || Math.round((b.price - b.discount) * 0.4);
        }
        if (b.payments.fullPaid) {
          col = b.price - b.discount; // fully cleared
        }
        return sum + col;
      }, 0);

      const pending = contractValue - collected;
      const percentCollected = contractValue > 0 ? Math.round((collected / contractValue) * 100) : 0;
      
      const isCurrent = ym === currentYM;
      const isPast = ym < currentYM;
      const isFuture = ym > currentYM;

      return {
        ym,
        label: formatYearMonth(ym),
        shortLabel: formatShortYearMonth(ym),
        contractValue,
        collected,
        pending,
        percentCollected,
        bookingsCount: monthlyBookings.length,
        isCurrent,
        isPast,
        isFuture
      };
    });
  }, [bookings, activeMonths, currentYM]);

  // Filter bookings to calculate details (top cards, table, package performance)
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedMonth === "all") return true;
      return getYearMonth(b.eventDate) === selectedMonth;
    });
  }, [bookings, selectedMonth]);

  // Aggregate stats based on active filtered bookings
  const activeBookings = useMemo(() => {
    return filteredBookings.filter((b) => b.status !== "Cancelled");
  }, [filteredBookings]);

  const totalBookedValue = useMemo(() => {
    return activeBookings.reduce((sum, b) => sum + (b.price - b.discount), 0);
  }, [activeBookings]);

  const totalCollected = useMemo(() => {
    return activeBookings.reduce((sum, b) => {
      let collected = 0;
      if (b.payments.dpPaid) {
        collected += b.payments.dpAmount || Math.round((b.price - b.discount) * 0.4);
      }
      if (b.payments.fullPaid) {
        collected = b.price - b.discount;
      }
      return sum + collected;
    }, 0);
  }, [activeBookings]);

  const totalOutstanding = totalBookedValue - totalCollected;

  // Receivables list (not fully paid yet, excluding cancelled)
  const outstandingBookings = useMemo(() => {
    return filteredBookings.filter(
      (b) => !b.payments.fullPaid && b.status !== "Cancelled"
    );
  }, [filteredBookings]);

  // Package performance metrics for selected period
  const packageMetrics = useMemo(() => {
    return activeBookings.reduce((acc, b) => {
      acc[b.eventType] = (acc[b.eventType] || 0) + (b.price - b.discount);
      return acc;
    }, {} as Record<string, number>);
  }, [activeBookings]);

  // Calculate coordinates for the dynamic trend line chart
  const maxChartVal = Math.max(
    ...monthlySummaries.map((m) => Math.max(m.contractValue, m.collected)),
    1000000
  );

  const chartPoints = useMemo(() => {
    const N = monthlySummaries.length;
    return monthlySummaries.map((m, i) => {
      const x = 50 + (i * (400 / Math.max(N - 1, 1)));
      const yContract = 170 - (m.contractValue / maxChartVal) * 130;
      const yCollected = 170 - (m.collected / maxChartVal) * 130;
      return { x, yContract, yCollected };
    });
  }, [monthlySummaries, maxChartVal]);

  const contractPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return `M ${chartPoints.map((p) => `${p.x},${p.yContract}`).join(" L ")}`;
  }, [chartPoints]);

  const collectedPath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return `M ${chartPoints.map((p) => `${p.x},${p.yCollected}`).join(" L ")}`;
  }, [chartPoints]);

  return (
    <div className="space-y-10 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight font-medium text-neutral-900">
            Financial Reports
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Pantau arus pendapatan, sisa piutang, dan kinerja paket foto secara dinamis per bulan.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-neutral-100 shadow-xs">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-500">Filter Periode:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-neutral-900 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Waktu (All Time)</option>
            {activeMonths.map((ym) => (
              <option key={ym} value={ym}>
                {formatYearMonth(ym)} {ym === currentYM ? " (Bulan Ini)" : ""}
              </option>
            ))}
          </select>
          {selectedMonth !== "all" && (
            <button
              onClick={() => setSelectedMonth("all")}
              className="p-0.5 hover:bg-neutral-100 rounded-md transition-colors"
              title="Clear filter"
            >
              <X className="w-3 h-3 text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Status Alert */}
      {selectedMonth !== "all" && (
        <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-neutral-600">
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white font-mono text-[10px]">
              i
            </span>
            <span>
              Menampilkan data eksklusif untuk bulan <strong>{formatYearMonth(selectedMonth)}</strong>. Klik bulan lain di bawah atau tombol silang untuk memulihkan tampilan menyeluruh.
            </span>
          </div>
          <button
            onClick={() => setSelectedMonth("all")}
            className="text-[11px] font-semibold text-neutral-900 hover:underline cursor-pointer"
          >
            Tampilkan Semua Waktu
          </button>
        </div>
      )}

      {/* Key Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <DollarSign className="w-16 h-16 text-black" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-medium">
            {selectedMonth === "all" ? "Total Contract Booked" : `Contract Value (${formatShortYearMonth(selectedMonth)})`}
          </span>
          <h3 className="text-2xl font-semibold mt-1.5 text-neutral-900">{formatRupiah(totalBookedValue)}</h3>
          <p className="text-[11px] text-neutral-400 mt-2">
            Nilai kontrak kotor dari semua photoshoot aktif
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-emerald-800" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-medium">
            {selectedMonth === "all" ? "Collected Revenue" : `Collected (${formatShortYearMonth(selectedMonth)})`}
          </span>
          <h3 className="text-2xl font-semibold mt-1.5 text-emerald-800">{formatRupiah(totalCollected)}</h3>
          <p className="text-[11px] text-emerald-600/80 mt-2 font-medium">
            {totalBookedValue > 0 ? `${Math.round((totalCollected / totalBookedValue) * 100)}%` : "0%"} dana aman terkumpul (DP/Lunas)
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-16 h-16 text-amber-700" />
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 font-medium">
            {selectedMonth === "all" ? "Pending Receivables" : `Sisa Piutang (${formatShortYearMonth(selectedMonth)})`}
          </span>
          <h3 className="text-2xl font-semibold mt-1.5 text-amber-700">{formatRupiah(totalOutstanding)}</h3>
          <p className="text-[11px] text-amber-600 mt-2">
            Sisa pelunasan invoice yang wajib ditagih
          </p>
        </div>
      </div>

      {/* Monthly Interactive Grid (Timeline Pemantauan Pendapatan) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-serif font-medium text-neutral-900">Interactive Monthly Timeline</h2>
          <p className="text-xs text-neutral-400">
            Klik kartu bulan di bawah untuk melacak detail transaksi, performa paket, dan daftar piutang di bulan tersebut.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthlySummaries.map((sum) => {
            const isSelected = selectedMonth === sum.ym;
            return (
              <button
                key={sum.ym}
                onClick={() => setSelectedMonth(isSelected ? "all" : sum.ym)}
                className={`text-left p-5 rounded-2xl border transition-all relative ${
                  isSelected
                    ? "bg-neutral-900 border-neutral-900 text-white shadow-md ring-2 ring-neutral-900/10"
                    : "bg-white hover:bg-neutral-50 border-neutral-100 shadow-xs text-neutral-800 cursor-pointer"
                }`}
              >
                {/* Period Badge */}
                <span
                  className={`absolute top-4 right-4 text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : sum.isCurrent
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : sum.isFuture
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {sum.isCurrent ? "Bulan Ini" : sum.isFuture ? "Masa Depan" : "Masa Lalu"}
                </span>

                <div className="space-y-4">
                  <div>
                    <h4 className={`text-sm font-semibold ${isSelected ? "text-white" : "text-neutral-900"}`}>
                      {sum.label}
                    </h4>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                      {sum.bookingsCount} Project Photoshoot
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={isSelected ? "text-neutral-300" : "text-neutral-500"}>Kontrak:</span>
                      <span className="font-semibold">{formatShortRupiah(sum.contractValue)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={isSelected ? "text-neutral-300" : "text-neutral-500"}>Terbayar:</span>
                      <span className={`font-semibold ${isSelected ? "text-emerald-300" : "text-emerald-700"}`}>
                        {formatShortRupiah(sum.collected)}
                      </span>
                    </div>

                    {sum.pending > 0 && (
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className={isSelected ? "text-neutral-400" : "text-neutral-500"}>Piutang:</span>
                        <span className={`font-semibold ${isSelected ? "text-amber-300" : "text-amber-600"}`}>
                          {formatShortRupiah(sum.pending)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSelected ? "text-neutral-400" : "text-neutral-400"}>Koleksi Arus Kas</span>
                      <span>{sum.percentCollected}%</span>
                    </div>
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${isSelected ? "bg-white/10" : "bg-neutral-100"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? "bg-emerald-400" : "bg-emerald-600"
                        }`}
                        style={{ width: `${sum.percentCollected}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Trend Chart */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 lg:col-span-2 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-serif font-medium text-neutral-900">Arus Pendapatan per Bulan</h2>
            <p className="text-xs text-neutral-400">
              Visualisasi pertumbuhan kontrak photoshoot dibanding pembayaran yang masuk (real-time).
            </p>
          </div>

          {monthlySummaries.length > 1 ? (
            <div className="h-64 flex items-end relative pb-4 pt-8 px-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                {/* Horizontal Gridlines */}
                <line x1="40" y1="40" x2="470" y2="40" stroke="#f4f4f5" strokeWidth="1" />
                <line x1="40" y1="105" x2="470" y2="105" stroke="#f4f4f5" strokeWidth="1" />
                <line x1="40" y1="170" x2="470" y2="170" stroke="#e4e4e7" strokeWidth="1" />

                {/* Contract value line path */}
                {contractPath && (
                  <path
                    d={contractPath}
                    fill="none"
                    stroke="#171717"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Collected revenue line path */}
                {collectedPath && (
                  <path
                    d={collectedPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive circles and value indicators */}
                {chartPoints.map((point, index) => {
                  const m = monthlySummaries[index];
                  const isCurrent = m.ym === selectedMonth;
                  return (
                    <g key={m.ym} className="group cursor-pointer" onClick={() => setSelectedMonth(m.ym)}>
                      {/* Contract point */}
                      <circle
                        cx={point.x}
                        cy={point.yContract}
                        r={isCurrent ? "6" : "4.5"}
                        fill="#171717"
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      {/* Collected point */}
                      <circle
                        cx={point.x}
                        cy={point.yCollected}
                        r={isCurrent ? "5" : "3.5"}
                        fill="#10b981"
                        stroke="white"
                        strokeWidth="1"
                      />

                      {/* Display value texts above points */}
                      <text
                        x={point.x}
                        y={point.yContract - 10}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fill="#171717"
                        className="font-bold opacity-80"
                      >
                        {formatShortRupiah(m.contractValue)}
                      </text>

                      {/* Month names at bottom */}
                      <text
                        x={point.x}
                        y="190"
                        fontSize="9"
                        fontWeight={isCurrent ? "bold" : "normal"}
                        fontFamily="sans-serif"
                        textAnchor="middle"
                        fill={isCurrent ? "#171717" : "#a3a3a3"}
                      >
                        {m.shortLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Chart Legend */}
              <div className="absolute top-0 right-2 flex items-center space-x-4 text-[10px] font-semibold text-neutral-500">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 bg-neutral-900 block" />
                  <span>Total Kontrak</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-500 block" />
                  <span className="text-emerald-700">Dana Terkumpul</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-neutral-100 rounded-2xl text-xs text-neutral-400">
              <BarChart3 className="w-8 h-8 text-neutral-300 mb-2" />
              <span>Butuh setidaknya 2 bulan data project untuk memetakan pertumbuhan tren grafik.</span>
            </div>
          )}
        </div>

        {/* Package Revenue Share */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-serif font-medium text-neutral-900">Revenue by Event Type</h2>
            <p className="text-xs text-neutral-400">
              {selectedMonth === "all" ? "Kontribusi pemasukan global per tipe acara." : `Tipe acara terlaris di ${formatShortYearMonth(selectedMonth)}`}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {(Object.entries(packageMetrics) as [string, number][]).map(([eventType, revenue]) => (
              <div key={eventType} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">{eventType}</span>
                  <span className="font-mono text-neutral-950 font-semibold">{formatRupiah(revenue)}</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{
                      width: `${totalBookedValue > 0 ? (revenue / totalBookedValue) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}

            {Object.keys(packageMetrics).length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400 flex flex-col items-center justify-center space-y-2">
                <Inbox className="w-5 h-5" />
                <span>Tidak ada pemasukan tercatat untuk kategori paket di periode ini</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Receivables List */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 space-y-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h2 className="text-lg font-serif font-medium text-neutral-900">
              {selectedMonth === "all" ? "Outstanding Receivables" : `Sisa Piutang Aktif (${formatYearMonth(selectedMonth)})`}
            </h2>
            <p className="text-xs text-neutral-400">
              Daftar klien yang belum melunasi pembayaran sisa. Klik tombol WhatsApp untuk mengirim tagihan otomatis.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-400 font-mono uppercase">
                <th className="pb-3">Klien</th>
                <th className="pb-3">Tanggal Acara</th>
                <th className="pb-3">Nilai Kontrak</th>
                <th className="pb-3 text-right">Sisa Piutang</th>
                <th className="pb-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {outstandingBookings.map((b) => {
                const totalDue = b.price - b.discount;
                const outstanding = b.payments.fullPaid ? 0 : b.payments.remainingAmount || totalDue;

                return (
                  <tr key={b.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5">
                      <div className="font-semibold text-neutral-900">{b.clientName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {b.id} ({b.eventType})
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-neutral-600">{formatDate(b.eventDate)}</td>
                    <td className="py-3.5 font-semibold text-neutral-800">{formatRupiah(totalDue)}</td>
                    <td className="py-3.5 text-right font-bold text-amber-700">{formatRupiah(outstanding)}</td>
                    <td className="py-3.5 text-right">
                      <a
                        href={getWhatsAppMessage(b, studioName)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        <MessageSquareShare className="w-3 h-3" />
                        <span>Remind WA</span>
                      </a>
                    </td>
                  </tr>
                );
              })}

              {outstandingBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-neutral-400">
                    <FileCheck className="w-5 h-5 mx-auto mb-2 text-neutral-300" />
                    <span>Lunas semua! Tidak ada piutang terhutang untuk periode ini.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
