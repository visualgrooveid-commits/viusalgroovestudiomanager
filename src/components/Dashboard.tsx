/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, BookingStatus } from "../types";
import { formatRupiah, formatDate, getStatusStyles } from "../utils";
import {
  Calendar,
  DollarSign,
  Camera,
  Layers,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Inbox
} from "lucide-react";

interface DashboardProps {
  bookings: Booking[];
  onSelectBooking: (bookingId: string) => void;
  onNavigateToView: (view: string) => void;
  language?: "en" | "id";
}

export default function Dashboard({ bookings, onSelectBooking, onNavigateToView, language = "id" }: DashboardProps) {
  // Get current date context dynamically based on local browser/system time
  const now = new Date();
  const yearStr = String(now.getFullYear());
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const dayStr = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yearStr}-${monthStr}-${dayStr}`;
  const currentMonth = monthStr;
  const currentYear = yearStr;

  const isEn = language === "en";

  const t = {
    overview: isEn ? "Overview" : "Overview",
    todayIs: isEn ? "Studio performance, upcoming events, and pipeline health. Today is" : "Kinerja studio, jadwal mendatang, dan kesehatan alur data. Hari ini adalah",
    manageBookings: isEn ? "Manage Bookings" : "Kelola Pesanan",
    todaysShoots: isEn ? "Today's Shoots" : "Photoshoot Hari Ini",
    todaysShootsSub: isEn ? "Photoshoots scheduled today" : "Photoshoot terjadwal hari ini",
    monthsBookings: isEn ? "Month's Bookings" : "Pesanan Bulan Ini",
    monthsBookingsSub: isEn ? "Active bookings in current month" : "Pesanan aktif di bulan berjalan",
    pendingIncome: isEn ? "Pending Income" : "Sisa Piutang",
    pendingIncomeSub: isEn ? "Outstanding balance payments" : "Sisa pelunasan belum tertagih",
    revenueSecured: isEn ? "Revenue Secured" : "Pemasukan Terpesan",
    revenueSecuredSub: isEn ? "Total contract value booked" : "Total nilai kontrak terpesan",
    nextPhotoshoot: isEn ? "Next Photoshoot Scheduled" : "Photoshoot Terjadwal Berikutnya",
    assignedTo: isEn ? "Assigned to" : "Ditugaskan ke",
    noShootsToday: isEn ? "No shoots scheduled today." : "Tidak ada jadwal foto hari ini.",
    recentBookings: isEn ? "Recent Bookings" : "Pesanan Terbaru",
    recentBookingsSub: isEn ? "Track & manage the pipeline of photography clients." : "Lacak & kelola alur klien fotografi studio.",
    packageName: isEn ? "Package / Event" : "Paket / Acara",
    client: isEn ? "Client" : "Klien",
    dateVenue: isEn ? "Date & Venue" : "Tanggal & Lokasi",
    contract: isEn ? "Contract" : "Kontrak",
    status: isEn ? "Status" : "Status",
    viewAll: isEn ? "View All" : "Lihat Semua",
    popularPackages: isEn ? "Package Type Breakdown" : "Rincian Jenis Paket Terlaris",
    popularPackagesSub: isEn ? "Photoshoot distribution by event type" : "Distribusi pemesanan berdasarkan jenis acara",
    noBookingsYet: isEn ? "No bookings recorded yet." : "Belum ada pesanan tercatat."
  };

  // Format the display date nicely in selected locale
  const locale = isEn ? "en-US" : "id-ID";
  const localDateStr = now.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // Calculations
  const todaysShoots = bookings.filter((b) => b.eventDate === todayStr && b.status !== "Cancelled");
  
  const upcomingEvents = bookings.filter(
    (b) => b.eventDate > todayStr && b.status !== "Completed" && b.status !== "Cancelled"
  );

  const pendingFullPayment = bookings.filter(
    (b) => b.payments.dpPaid && !b.payments.fullPaid && b.status !== "Cancelled"
  );

  const pendingReceivableAmount = pendingFullPayment.reduce((sum, b) => {
    const totalDue = Math.max(0, b.price - (b.discount || 0));
    const remaining = Math.max(0, totalDue - b.payments.dpAmount);
    return sum + remaining;
  }, 0);

  const projectsInEditing = bookings.filter((b) => b.status === "Editing");
  const completedProjects = bookings.filter((b) => b.status === "Completed");

  // Calculate Revenue this month (e.g. event date in July 2026)
  const monthlyRevenue = bookings
    .filter((b) => {
      if (b.status === "Cancelled") return false;
      const [year, month] = b.eventDate.split("-");
      return year === currentYear && month === currentMonth;
    })
    .reduce((sum, b) => sum + (b.price - b.discount), 0);

  // Total contract value overall (excluding cancelled)
  const totalRevenueBooked = bookings
    .filter((b) => b.status !== "Cancelled")
    .reduce((sum, b) => sum + (b.price - b.discount), 0);

  // Recent activity aggregated from all booking timelines
  const allTimelineEvents = bookings
    .flatMap((b) =>
      b.timeline.map((evt) => ({
        ...evt,
        clientName: b.clientName,
        bookingId: b.id,
        eventType: b.eventType
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Upcoming deadlines (delivery dates or shoots) sorted by date
  const upcomingDeadlines = bookings
    .filter((b) => b.status !== "Completed" && b.status !== "Cancelled")
    .map((b) => {
      const isShoot = b.eventDate >= todayStr;
      return {
        id: b.id,
        clientName: b.clientName,
        date: isShoot ? b.eventDate : b.delivery.deliveryDate || b.eventDate,
        label: isShoot ? `Shoot: ${b.eventType}` : "Gallery Delivery Due",
        type: isShoot ? "shoot" : "delivery"
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  // SVG Chart Calculations - Packages Popularity
  const packageStats = bookings.reduce((acc, b) => {
    if (b.status !== "Cancelled") {
      acc[b.eventType] = (acc[b.eventType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const maxPackageCount = Math.max(...Object.values(packageStats), 1);

  return (
    <div className="space-y-10">
      {/* Welcome / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight font-medium text-slate-900">
            {t.overview}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.todayIs}{" "}
            <span className="font-mono text-slate-950 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
              {localDateStr}
            </span>
          </p>
        </div>
        <button
          onClick={() => onNavigateToView("bookings")}
          className="inline-flex items-center space-x-2 bg-black hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-xs"
        >
          <span>{t.manageBookings}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
              {t.todaysShoots}
            </span>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-900 border border-slate-100">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight font-sans text-slate-900">
              {todaysShoots.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {todaysShoots.length > 0
              ? `${todaysShoots.map((s) => s.clientName).join(", ")}`
              : t.noShootsToday}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
              {t.monthsBookings}
            </span>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-900 border border-slate-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-semibold tracking-tight font-sans text-slate-900">
              {formatRupiah(monthlyRevenue)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t.monthsBookingsSub}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
              {t.pendingIncome}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-semibold tracking-tight font-sans text-slate-900">
              {formatRupiah(pendingReceivableAmount)}
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-100">
              {pendingFullPayment.length} {isEn ? "Clients" : "Klien"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t.pendingIncomeSub}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
              {isEn ? "In Editing Queue" : "Antrean Editing"}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-semibold tracking-tight font-sans text-slate-900">
              {projectsInEditing.length}
            </span>
            <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium border border-purple-100">
              RAW
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isEn ? "Shoots done, currently color grading" : "Sesi selesai, proses edit & grading"}
          </p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              {t.revenueSecured}
            </span>
            <h3 className="text-2xl font-serif tracking-tight mt-1 text-white">
              {formatRupiah(totalRevenueBooked)}
            </h3>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
            <span>{isEn ? "Completed Projects:" : "Project Selesai:"}</span>
            <span className="font-mono text-slate-100 font-bold">{completedProjects.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              {isEn ? "Upcoming Scheduled Events" : "Jadwal Acara Mendatang"}
            </span>
            <h3 className="text-2xl font-semibold mt-1 text-slate-900">
              {upcomingEvents.length}
            </h3>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
            <span>{isEn ? "Pending Remaining Bal:" : "Sisa Piutang Pelunasan:"}</span>
            <span className="font-mono text-slate-900 font-bold">{pendingFullPayment.length}</span>
          </div>
        </div>

        {/* Mini Shortcut Card */}
        <div
          onClick={() => onNavigateToView("calendar")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-slate-400 hover:shadow-xs transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">
              {isEn ? "Interactive Calendar" : "Kalender Interaktif"}
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {isEn ? "View booking timeline layout, slot availability and schedules." : "Lihat timeline pesanan, ketersediaan slot, dan jadwal acara."}
          </p>
          <span className="text-xs font-semibold text-slate-900 mt-4 flex items-center">
            {isEn ? "Open Calendar" : "Buka Kalender"} <ArrowUpRight className="w-3 h-3 ml-1" />
          </span>
        </div>

        {/* Mini Checklist Summary Card */}
        <div
          onClick={() => onNavigateToView("packages")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-slate-400 hover:shadow-xs transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">
              {isEn ? "Premium Packages" : "Paket Premium"}
            </span>
            <Camera className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {isEn ? "Review custom photographic tiers, add-ons and pricing metrics." : "Tinjau tingkat harga foto kustom, layanan tambahan, dan metrik harga."}
          </p>
          <span className="text-xs font-semibold text-slate-900 mt-4 flex items-center">
            {isEn ? "Review Packages" : "Tinjau Paket"} <ArrowUpRight className="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>

      {/* Main Charts & Table Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-serif font-medium text-slate-900">
                {isEn ? "Recent Bookings" : "Pesanan Terbaru"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEn ? "Quick click to open workspace environment" : "Klik cepat untuk membuka lembar kerja klien"}
              </p>
            </div>
            <button
              onClick={() => onNavigateToView("bookings")}
              className="text-xs font-bold text-slate-600 hover:text-black transition-colors"
            >
              {isEn ? "View All" : "Lihat Semua"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400 font-mono uppercase">
                  <th className="pb-3 font-semibold">{isEn ? "Client" : "Klien"}</th>
                  <th className="pb-3 font-semibold">{isEn ? "Type" : "Tipe"}</th>
                  <th className="pb-3 font-semibold">{isEn ? "Event Date" : "Tanggal Acara"}</th>
                  <th className="pb-3 font-semibold">{isEn ? "Status" : "Status"}</th>
                  <th className="pb-3 font-semibold text-right">{isEn ? "Contract" : "Nilai Kontrak"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map((booking) => {
                  const badge = getStatusStyles(booking.status);
                  const total = booking.price - booking.discount;
                  return (
                    <tr
                      key={booking.id}
                      onClick={() => onSelectBooking(booking.id)}
                      className="group cursor-pointer hover:bg-[#F9F9F9] transition-colors"
                    >
                      <td className="py-3.5 pr-3">
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-black">
                          {booking.clientName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {booking.id}
                        </div>
                      </td>
                      <td className="py-3.5 text-sm text-slate-500">{booking.eventType}</td>
                      <td className="py-3.5 text-sm text-slate-600 font-mono">
                        {formatDate(booking.eventDate)}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{booking.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-medium text-sm text-slate-900 font-mono">
                        {formatRupiah(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Package Popularity and Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-serif font-medium text-slate-900">
              {isEn ? "Popular Packages" : "Paket Populer"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{isEn ? "By booking share count" : "Berdasarkan jumlah pemesanan"}</p>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(packageStats).map(([eventType, count]) => {
              const percentage = Math.round((count / bookings.length) * 100);
              const barWidth = `${(count / maxPackageCount) * 100}%`;
              return (
                <div key={eventType} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{eventType}</span>
                    <span className="text-slate-400 font-mono">
                      {count} {isEn ? (count === 1 ? "shoot" : "shoots") : "sesi"} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-black rounded-full" style={{ width: barWidth }} />
                  </div>
                </div>
              );
            })}

            {Object.keys(packageStats).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                <Inbox className="w-5 h-5" />
                <span>{isEn ? "No active booking shares recorded" : "Belum ada pesanan aktif tercatat"}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deadlines & Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Deadlines Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-serif font-medium text-slate-900">
              {isEn ? "Upcoming Deadlines" : "Tenggat Waktu Mendatang"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn ? "Critical timelines and scheduled deliveries" : "Timeline penting dan jadwal pengiriman galeri"}
            </p>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                onClick={() => onSelectBooking(deadline.id)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-[#F9F9F9] cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-800">{deadline.clientName}</p>
                  <p className="text-[11px] text-slate-400">{deadline.label}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-mono font-semibold bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-100">
                    {formatDate(deadline.date)}
                  </span>
                </div>
              </div>
            ))}

            {upcomingDeadlines.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="w-5 h-5 text-slate-350" />
                <span>{isEn ? "All caught up! No upcoming deadlines." : "Semua selesai! Tidak ada tenggat waktu mendatang."}</span>
              </div>
            )}
          </div>
        </div>

        {/* Aggregated Recent Log Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-serif font-medium text-slate-900">
              {isEn ? "Recent Studio Activity" : "Aktivitas Studio Terbaru"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn ? "Real-time audits recorded across client pipelines" : "Audit real-time tercatat di seluruh alur klien"}
            </p>
          </div>

          <div className="relative pl-4 space-y-5 border-l border-slate-200">
            {allTimelineEvents.map((event, index) => (
              <div key={`${event.bookingId}-${index}`} className="relative space-y-1">
                {/* Timeline indicator dot */}
                <span className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-slate-950 border border-white" />

                <div className="flex items-center justify-between">
                  <span
                    onClick={() => onSelectBooking(event.bookingId)}
                    className="text-xs font-semibold text-slate-900 cursor-pointer hover:underline"
                  >
                    {event.clientName} ({event.eventType})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-650">
                  <span className="font-semibold text-slate-800">{event.status}:</span>{" "}
                  {event.note}
                </p>
              </div>
            ))}

            {allTimelineEvents.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                <Clock className="w-5 h-5 text-slate-350" />
                <span>{isEn ? "No recorded activities. Create a booking to start." : "Belum ada aktivitas tercatat. Buat pesanan untuk memulai."}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
