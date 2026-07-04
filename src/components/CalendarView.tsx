/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Booking, BookingStatus } from "../types";
import { formatDate } from "../utils";
import { ChevronLeft, ChevronRight, Calendar, Camera, Info, Sparkles } from "lucide-react";

interface CalendarViewProps {
  bookings: Booking[];
  onSelectBooking: (bookingId: string) => void;
}

export default function CalendarView({ bookings, onSelectBooking }: CalendarViewProps) {
  // We're anchoring around July 2026 based on the local time metadata (2026-07-03)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 = July)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month calculator
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of month offset
  const getFirstDayOffset = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper to retrieve status-specific colors for indicators
  const getIndicatorColor = (status: BookingStatus): string => {
    switch (status) {
      case "Inquiry":
        return "bg-amber-500 border-amber-200";
      case "Booked":
        return "bg-blue-500 border-blue-200";
      case "DP Paid":
        return "bg-emerald-500 border-emerald-200";
      case "Shoot Done":
        return "bg-sky-500 border-sky-200";
      case "Editing":
        return "bg-purple-500 border-purple-200";
      case "Ready to Deliver":
        return "bg-indigo-500 border-indigo-200";
      case "Completed":
        return "bg-neutral-500 border-neutral-300";
      case "Cancelled":
        return "bg-rose-500 border-rose-200";
      default:
        return "bg-neutral-400";
    }
  };

  // Build calendar matrix grid
  const daysArray = [];
  for (let i = 0; i < firstDayOffset; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Filter bookings happening on a specific day
  const getBookingsForDay = (day: number) => {
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return bookings.filter((b) => b.eventDate === dateStr && b.status !== "Cancelled");
  };

  // Legend config
  const legendItems = [
    { label: "Inquiry", bg: "bg-amber-500" },
    { label: "Booked Slot", bg: "bg-blue-500" },
    { label: "DP Cleared", bg: "bg-emerald-500" },
    { label: "Editing", bg: "bg-purple-500" },
    { label: "Completed", bg: "bg-neutral-500" },
    { label: "Cancelled", bg: "bg-rose-500" }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight font-medium text-neutral-900">
            Studio Calendar
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Track shoot days, booking availability, and editing delivery limits
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-neutral-100 shadow-sm/5">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-neutral-50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <span className="text-sm font-semibold text-neutral-900 font-mono min-w-[120px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-neutral-50 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm/5 overflow-hidden">
        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50/50 text-center py-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className="text-xs font-semibold text-neutral-400 font-mono uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-flow-row divide-x divide-y divide-neutral-100">
          {daysArray.map((day, idx) => {
            const dayBookings = day ? getBookingsForDay(day) : [];

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  day ? "bg-white hover:bg-neutral-50/40" : "bg-neutral-50/20"
                }`}
              >
                {/* Day number */}
                {day ? (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-semibold text-neutral-800">{day}</span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.2 rounded-full">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <span />
                )}

                {/* Day Bookings List inside calendar block */}
                <div className="mt-2 space-y-1">
                  {dayBookings.map((b) => {
                    const ind = getIndicatorColor(b.status);
                    return (
                      <div
                        key={b.id}
                        onClick={() => onSelectBooking(b.id)}
                        className="group flex items-center space-x-1.5 px-2 py-1 rounded bg-neutral-50 border border-neutral-200/50 hover:border-neutral-400/80 cursor-pointer transition-all truncate text-[10px] font-medium text-neutral-700"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ind}`} />
                        <span className="truncate group-hover:text-neutral-950 font-sans tracking-wide">
                          {b.clientName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Legend / Help Footer */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm/5">
        <div className="flex items-center space-x-2 text-neutral-500">
          <Info className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Legend Indicator Guides</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
              <span className="text-xs font-medium text-neutral-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
