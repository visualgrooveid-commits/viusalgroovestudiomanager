/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Booking } from "../../../types";
import { Calendar, MapPin, Camera, User, Phone, Mail, Instagram } from "lucide-react";

interface InvoiceEventProps {
  booking: Booking;
}

export default function InvoiceEvent({ booking }: InvoiceEventProps) {
  // Parse date safely
  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      {/* Client Information */}
      <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-4 shadow-[0_1px_6px_rgba(0,0,0,0.01)]">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-2.5">
          <User className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Ditagihkan Kepada (Bill To)
          </h3>
        </div>
        <div className="space-y-2.5 text-xs text-slate-600">
          <p className="text-sm font-bold text-slate-900">{booking.clientName}</p>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-500">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{booking.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{booking.email}</span>
            </div>
            {booking.instagram && booking.instagram !== "-" && (
              <div className="flex items-center space-x-2 text-slate-500">
                <Instagram className="w-3.5 h-3.5 shrink-0" />
                <span>@{booking.instagram.replace("@", "")}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-4 shadow-[0_1px_6px_rgba(0,0,0,0.01)]">
        <div className="flex items-center space-x-2 border-b border-slate-50 pb-2.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Rincian Acara (Event Details)
          </h3>
        </div>
        <div className="space-y-2.5 text-xs text-slate-600">
          <p className="text-sm font-bold text-slate-900">{booking.eventType} Session</p>
          <div className="space-y-1.5">
            <div className="flex items-start space-x-2 text-slate-500">
              <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{formatEventDate(booking.eventDate)} at {booking.eventTime}</span>
            </div>
            <div className="flex items-start space-x-2 text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{booking.venue}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>Fotografer: <strong className="text-slate-800">{booking.assignedPhotographer || "Staff Studio"}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
