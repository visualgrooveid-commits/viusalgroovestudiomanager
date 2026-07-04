/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, EventType, BookingStatus, StudioPackage } from "../types";
import { EVENT_TYPES, BOOKING_STATUSES, DEFAULT_CHECKLIST } from "../data";
import { formatRupiah, formatDate, getStatusStyles, getMonthYearKey } from "../utils";
import {
  Plus,
  Search,
  SlidersHorizontal,
  FolderOpen,
  X,
  Phone,
  Instagram,
  Mail,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface BookingsProps {
  bookings: Booking[];
  onSelectBooking: (bookingId: string) => void;
  onAddBooking: (newBooking: Omit<Booking, "id" | "createdAt" | "invoice" | "payments" | "timeline" | "checklist" | "gallery" | "delivery">) => void;
  packages?: StudioPackage[];
}

export default function Bookings({ bookings, onSelectBooking, onAddBooking, packages = [] }: BookingsProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [groupByMonth, setGroupByMonth] = useState(true);

  // Form states
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState<EventType>("Wedding");
  const [packageName, setPackageName] = useState("");
  const [duration, setDuration] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [additionalServices, setAdditionalServices] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [status, setStatus] = useState<BookingStatus>("Inquiry");
  const [assignedPhotographer, setAssignedPhotographer] = useState("Alwi Muhammad A");

  const [formError, setFormError] = useState("");

  // Filter bookings list
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.packageName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "All" || booking.eventType === selectedType;
    const matchesStatus = selectedStatus === "All" || booking.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !eventDate || !price || !packageName) {
      setFormError("Client Name, Event Date, Package Name, and Base Price are required.");
      return;
    }

    setFormError("");

    onAddBooking({
      clientName,
      phoneNumber: phoneNumber || "+62 ",
      instagram: instagram.startsWith("@") ? instagram : instagram ? `@${instagram}` : "",
      email: email || "",
      eventType,
      packageName,
      duration: duration || "4 Hours",
      eventDate,
      eventTime: eventTime || "10:00",
      venue: venue || "Studio Workspace",
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      additionalServices: additionalServices || "None",
      specialNotes: specialNotes || "",
      status,
      assignedPhotographer,
      notes: ""
    });

    // Reset form fields
    setClientName("");
    setPhoneNumber("");
    setInstagram("");
    setEmail("");
    setEventType("Wedding");
    setPackageName("");
    setDuration("");
    setEventDate("");
    setEventTime("");
    setVenue("");
    setPrice("");
    setDiscount("");
    setAdditionalServices("");
    setSpecialNotes("");
    setStatus("Inquiry");
    setAssignedPhotographer("Alwi Muhammad A");

    setIsNewBookingOpen(false);
  };

  // Grouping & Card rendering helpers
  const groupedBookings: Record<string, Booking[]> = {};
  filteredBookings.forEach((booking) => {
    const key = getMonthYearKey(booking.eventDate);
    if (!groupedBookings[key]) {
      groupedBookings[key] = [];
    }
    groupedBookings[key].push(booking);
  });

  const sortedMonthKeys = Object.keys(groupedBookings).sort((a, b) => {
    const firstA = groupedBookings[a][0]?.eventDate || "";
    const firstB = groupedBookings[b][0]?.eventDate || "";
    return firstB.localeCompare(firstA); // Newest month first
  });

  const renderBookingCard = (booking: Booking) => {
    const badge = getStatusStyles(booking.status);
    const totalContract = booking.price - booking.discount;

    return (
      <div
        key={booking.id}
        onClick={() => onSelectBooking(booking.id)}
        className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:border-slate-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden group"
      >
        {/* Card Header Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                {booking.id}
              </span>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-black transition-colors">
                {booking.clientName}
              </h3>
            </div>
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              <span className={`w-1 h-1 rounded-full ${badge.dot}`} />
              <span>{booking.status}</span>
            </span>
          </div>

          {/* Event meta fields */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{formatDate(booking.eventDate)} at {booking.eventTime}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[200px]">{booking.venue}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
              <span className="font-semibold text-slate-700">{booking.eventType}</span>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded uppercase font-mono">{booking.duration}</span>
            </div>
          </div>
        </div>

        {/* Card Bottom Panel */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Total Contract Value
            </p>
            <p className="text-sm font-semibold text-slate-950 mt-0.5">
              {formatRupiah(totalContract)}
            </p>
          </div>
          <div className="flex items-center text-xs font-semibold text-slate-800 space-x-0.5 group-hover:translate-x-1 transition-transform">
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight font-medium text-slate-900">
            Bookings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create, track, and manage clients' workspace projects
          </p>
        </div>
        <button
          onClick={() => setIsNewBookingOpen(true)}
          className="inline-flex items-center space-x-2 bg-black hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, venue, package, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
          />
        </div>

        {/* Event Type Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none focus:border-slate-950 focus:bg-white transition-all cursor-pointer"
          >
            <option value="All">All Event Types</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-4 text-sm text-slate-850 focus:outline-none focus:border-slate-950 focus:bg-white transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {BOOKING_STATUSES.map((statusVal) => (
              <option key={statusVal} value={statusVal}>
                {statusVal}
              </option>
            ))}
          </select>
        </div>

        {/* Group By Month Toggle Button */}
        <div className="w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setGroupByMonth((prev) => !prev)}
            className={`w-full md:w-auto flex items-center justify-center space-x-2 border rounded-xl py-2.5 px-4 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              groupByMonth
                ? "bg-black border-black text-white shadow-xs"
                : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <span>Grup per Bulan</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${groupByMonth ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {groupByMonth ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
        {["All", ...BOOKING_STATUSES].map((st) => {
          const count = st === "All" 
            ? bookings.length 
            : bookings.filter((b) => b.status === st).length;
          const isActive = selectedStatus === st;
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-black text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {st} <span className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full font-mono ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bookings Grid Layout */}
      {groupByMonth ? (
        <div className="space-y-12">
          {sortedMonthKeys.map((monthKey) => {
            const monthBookings = groupedBookings[monthKey];
            return (
              <div key={monthKey} className="space-y-5">
                {/* Month Section Header */}
                <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
                  <span className="text-sm font-bold text-slate-400 font-mono tracking-wider uppercase">
                    {monthKey}
                  </span>
                  <span className="text-[10px] bg-slate-100 border border-slate-200/60 text-slate-750 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    {monthBookings.length} {monthBookings.length === 1 ? "shoot" : "shoots"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {monthBookings.map((booking) => renderBookingCard(booking))}
                </div>
              </div>
            );
          })}

          {sortedMonthKeys.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center space-y-3 shadow-xs">
              <FolderOpen className="w-10 h-10 text-slate-300 animate-pulse" />
              <div>
                <p className="font-semibold text-slate-800">No bookings found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search terms</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => renderBookingCard(booking))}

          {filteredBookings.length === 0 && (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl py-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center space-y-3 shadow-xs">
              <FolderOpen className="w-10 h-10 text-slate-300 animate-pulse" />
              <div>
                <p className="font-semibold text-slate-800">No bookings found</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search terms</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-out / Pop-up Form Modal (New Booking) */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-950/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsNewBookingOpen(false)}
          />

          {/* Form container */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-semibold text-neutral-900">
                  New Booking Creation
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Establishes a dedicated workspace & auto-invoice
                </p>
              </div>
              <button
                onClick={() => setIsNewBookingOpen(false)}
                className="p-1 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Client Info Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase font-mono">
                  Client Information
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Amanda"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Phone Number</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Instagram</label>
                    <input
                      type="text"
                      placeholder="@amanda"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="amanda@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Event Info Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase font-mono">
                  Event Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Duration</label>
                    <input
                      type="text"
                      placeholder="4 Hours"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                {/* Predefined Custom Package Selector */}
                {packages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-700">Pilih dari Paket Studio (Auto-fill)</label>
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider bg-slate-100 border border-slate-200/50 px-1.5 py-0.2 rounded">Preset</span>
                    </div>
                    <select
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        if (!selectedId) return;
                        const pkg = packages.find((p) => p.id === selectedId);
                        if (pkg) {
                          setPackageName(pkg.title);
                          setEventType(pkg.eventType);
                          setDuration(pkg.duration);
                          setPrice(String(pkg.price));
                        }
                        e.target.value = "";
                      }}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-850 focus:outline-none focus:border-neutral-900 cursor-pointer"
                    >
                      <option value="">-- Pilih Paket Untuk Auto-Fill Form --</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} ({pkg.eventType}) - {formatRupiah(pkg.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Traditional Wedding Luxe"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Event Time</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Venue / Location</label>
                  <input
                    type="text"
                    placeholder="Ritz Carlton Jakarta"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Financial Info Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase font-mono">
                  Financial details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Price (IDR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="12000000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Discount (IDR)</label>
                    <input
                      type="number"
                      placeholder="500000"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Additional Services</label>
                  <input
                    type="text"
                    placeholder="E.g. Same-Day Video Edit, Album"
                    value={additionalServices}
                    onChange={(e) => setAdditionalServices(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              {/* Status & Notes Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-semibold tracking-wider text-neutral-400 uppercase font-mono">
                  Internal Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Initial Booking Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as BookingStatus)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    >
                      {BOOKING_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Lead Photographer</label>
                    <input
                      type="text"
                      placeholder="Alwi Muhammad A"
                      value={assignedPhotographer}
                      onChange={(e) => setAssignedPhotographer(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Special Notes</label>
                  <textarea
                    placeholder="Camera preferences, outfit colors, styling requirements..."
                    rows={3}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 resize-none"
                  />
                </div>
              </div>
            </form>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsNewBookingOpen(false)}
                className="px-5 py-2.5 border border-neutral-200 hover:bg-neutral-100 rounded-xl text-xs font-semibold text-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Create Booking Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
