/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Booking, BookingStatus, InvoiceStatus, TimelineEvent, ChecklistItem, StudioSettings } from "../types";
import { InvoiceTemplate, downloadInvoiceAsPDF, printInvoiceElement, InvoiceDocType } from "../modules/invoice";

import {
  formatRupiah,
  formatDate,
  getStatusStyles,
  getWhatsAppMessage,
  getInvoiceFilename
} from "../utils";
import {
  ArrowLeft,
  Calendar,
  Camera,
  MapPin,
  CheckCircle2,
  DollarSign,
  FileText,
  Clock,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  Upload,
  User,
  HeartHandshake,
  Milestone,
  Share2,
  Printer,
  FileDown,
  Info,
  CheckSquare,
  Sparkles
} from "lucide-react";

interface BookingWorkspaceProps {
  booking: Booking;
  onBack: () => void;
  onUpdateBooking: (updated: Booking) => void;
  studioSettings: StudioSettings;
  googleUser: any;
  googleToken: string | null;
  onGoogleSignIn: () => Promise<void>;
}

export default function BookingWorkspace({
  booking,
  onBack,
  onUpdateBooking,
  studioSettings,
  googleUser,
  googleToken,
  onGoogleSignIn
}: BookingWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false);

  // Local Form / Interactive States
  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarSyncSuccess, setCalendarSyncSuccess] = useState<string | null>(null);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);

  const handleSyncCalendar = async () => {
    if (!googleToken) return;
    setSyncingCalendar(true);
    setCalendarSyncSuccess(null);
    setCalendarSyncError(null);
    try {
      const { syncBookingToCalendar } = await import("../lib/googleSync");
      const eventId = await syncBookingToCalendar(booking, googleToken);
      if (eventId) {
        const newEvent: TimelineEvent = {
          id: `timeline-${Date.now()}`,
          status: "Google Calendar Synced",
          timestamp: new Date().toISOString(),
          note: "Shoot event synchronized with Google Calendar."
        };
        triggerUpdate({
          googleCalendarEventId: eventId,
          timeline: [...booking.timeline, newEvent]
        });
        setCalendarSyncSuccess("Tersinkronisasi! Jadwal pemotretan berhasil ditambahkan ke Google Calendar Anda.");
        setTimeout(() => setCalendarSyncSuccess(null), 5000);
      }
    } catch (e: any) {
      console.error(e);
      setCalendarSyncError(e.message || String(e));
    } finally {
      setSyncingCalendar(false);
    }
  };

  const [clientForm, setClientForm] = useState({
    clientName: booking.clientName,
    phoneNumber: booking.phoneNumber,
    instagram: booking.instagram,
    email: booking.email,
    venue: booking.venue,
    packageName: booking.packageName,
    duration: booking.duration,
    price: booking.price,
    discount: booking.discount,
    specialNotes: booking.specialNotes,
    additionalServices: booking.additionalServices,
    assignedPhotographer: booking.assignedPhotographer,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newTimelineNote, setNewTimelineNote] = useState("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [notesText, setNotesText] = useState(booking.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Helper: Trigger parent state update
  const triggerUpdate = (changes: Partial<Booking>) => {
    const updated = {
      ...booking,
      ...changes
    };
    onUpdateBooking(updated);
  };

  // Status Milestone Progress Helper
  const getProgressPercentage = (status: BookingStatus): number => {
    switch (status) {
      case "Inquiry":
        return 12;
      case "Booked":
        return 25;
      case "DP Paid":
        return 38;
      case "Shoot Done":
        return 50;
      case "Editing":
        return 65;
      case "Ready to Deliver":
        return 78;
      case "Completed":
        return 100;
      case "Cancelled":
        return 0;
      default:
        return 0;
    }
  };

  // Workflow guidance text
  const getWorkflowGuidance = (status: BookingStatus) => {
    switch (status) {
      case "Inquiry":
        return "Waiting for down payment to lock this event space slot. Share the invoice with the client.";
      case "Booked":
        return "Booking created. Client confirmation of timeline is needed before receiving DP.";
      case "DP Paid":
        return "Slot is officially locked! Prepare gears in Checklist tab. Waiting for Shoot Day.";
      case "Shoot Done":
        return "Shoot successfully done! Head to the Gallery tab to import and curate raw files.";
      case "Editing":
        return "Visuals are being refined. Focus on color grading. Once done, mark as Ready to Deliver.";
      case "Ready to Deliver":
        return "Editing completed! Share Google Drive or Pixieset links in the Delivery tab.";
      case "Completed":
        return "Workspace closed successfully. Thank you for utilizing VisualGroove Studio OS!";
      case "Cancelled":
        return "Project cancelled. No pending milestones.";
    }
  };

  // Countdown calculations
  const getCountdownText = () => {
    const today = new Date("2026-07-03"); // Unified system date
    const eventDateObj = new Date(booking.eventDate);
    const diffTime = eventDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (booking.status === "Completed") return "Shoot completed and delivered";
    if (booking.status === "Cancelled") return "Booking cancelled";

    if (diffDays === 0) {
      return "Shoot Day is TODAY";
    } else if (diffDays > 0) {
      return `${diffDays} days until shoot`;
    } else {
      return `Shoot occurred ${Math.abs(diffDays)} days ago`;
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Client info submit
  const handleClientUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      status: "Client Info Updated",
      timestamp: new Date().toISOString(),
      note: "Modified project details inside client workspace."
    };
    triggerUpdate({
      clientName: clientForm.clientName,
      phoneNumber: clientForm.phoneNumber,
      instagram: clientForm.instagram,
      email: clientForm.email,
      venue: clientForm.venue,
      packageName: clientForm.packageName,
      duration: clientForm.duration,
      price: Number(clientForm.price) || 0,
      discount: Number(clientForm.discount) || 0,
      specialNotes: clientForm.specialNotes,
      additionalServices: clientForm.additionalServices,
      assignedPhotographer: clientForm.assignedPhotographer,
      eventDate: clientForm.eventDate,
      eventTime: clientForm.eventTime,
      timeline: [...booking.timeline, newEvent]
    });
  };

  // Payments logic
  const handleDPChange = (amount: number) => {
    const val = Math.max(0, Math.min(amount, totalDue)); // clamp between 0 and totalDue
    const remaining = totalDue - val;
    triggerUpdate({
      payments: {
        ...booking.payments,
        dpAmount: val,
        remainingAmount: remaining
      }
    });
  };

  const handleDueDateChange = (newDueDate: string) => {
    triggerUpdate({
      invoice: {
        ...booking.invoice,
        dueDate: newDueDate
      }
    });
  };

  const handleMarkDPPaid = () => {
    const dpAmt = booking.payments.dpAmount || Math.round(totalDue * 0.4);
    const remainingAmt = totalDue - dpAmt;
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      status: "DP Received",
      timestamp: new Date().toISOString(),
      note: `Down payment of ${formatRupiah(dpAmt)} confirmed via system.`
    };

    triggerUpdate({
      status: "DP Paid",
      invoice: {
        ...booking.invoice,
        status: "DP Paid"
      },
      payments: {
        ...booking.payments,
        dpPaid: true,
        dpAmount: dpAmt,
        remainingAmount: remainingAmt,
        paymentDate: new Date().toISOString().split("T")[0]
      },
      timeline: [...booking.timeline, newEvent]
    });
  };

  const handleMarkFullyPaid = () => {
    setShowConfirmPaidModal(true);
  };

  const handleConfirmFullPayment = () => {
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      status: "Completed",
      timestamp: new Date().toISOString(),
      note: "Remaining balance fully cleared. Project archived as complete."
    };
    triggerUpdate({
      status: "Completed",
      invoice: {
        ...booking.invoice,
        status: "Paid"
      },
      payments: {
        ...booking.payments,
        dpPaid: true,
        fullPaid: true,
        remainingAmount: 0,
        paymentDate: new Date().toISOString().split("T")[0]
      },
      timeline: [...booking.timeline, newEvent]
    });

    setShowConfirmPaidModal(false);
    setActiveTab("invoice");
  };

  // Add custom checklist item
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: `chk-custom-${Date.now()}`,
      name: newChecklistItem.trim(),
      checked: false
    };

    triggerUpdate({
      checklist: [...booking.checklist, newItem]
    });
    setNewChecklistItem("");
  };

  // Toggle checklist check
  const handleToggleChecklist = (id: string) => {
    const updated = booking.checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    triggerUpdate({ checklist: updated });
  };

  // Delete checklist item
  const handleDeleteChecklist = (id: string) => {
    const updated = booking.checklist.filter((item) => item.id !== id);
    triggerUpdate({ checklist: updated });
  };

  // Add custom Timeline Event
  const addTimelineEvent = (statusName: string, noteText: string) => {
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      status: statusName,
      timestamp: new Date().toISOString(),
      note: noteText
    };
    triggerUpdate({
      timeline: [...booking.timeline, newEvent]
    });
  };

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimelineNote.trim()) return;
    addTimelineEvent("Manual Note", newTimelineNote.trim());
    setNewTimelineNote("");
  };

  // Notes save
  const handleSaveNotes = () => {
    setSavingNotes(true);
    triggerUpdate({ notes: notesText });
    setTimeout(() => {
      setSavingNotes(false);
      addTimelineEvent("Notes Saved", "Project scratchpad notes updated.");
    }, 600);
  };

  // Mock upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateImageUpload();
    }
  };

  const simulateImageUpload = () => {
    const mockImages = [
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1520854221256-17451cc35953?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800"
    ];
    // Select random image
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    const newEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      status: "Gallery Curated",
      timestamp: new Date().toISOString(),
      note: "Added new previews to client selection board."
    };
    triggerUpdate({
      gallery: {
        ...booking.gallery,
        previewImages: [...booking.gallery.previewImages, randomImg],
        deliveryStatus: "Uploading"
      },
      timeline: [...booking.timeline, newEvent]
    });
  };

  // Print trigger using isolated Iframe printer
  const handlePrint = async (elementId: string = "invoice-print-area") => {
    await printInvoiceElement({
      elementId,
      onSuccess: () => {
        addTimelineEvent("Invoice Printed", `Mencetak dokumen: ${elementId === "invoice-paid-print-area" ? "Kuitansi Pelunasan" : "Tagihan Invoice"}`);
      },
      onError: (err) => {
        alert(`Gagal membuka dialog cetak: ${err.message}`);
      }
    });
  };

  // Save invoice PDF using the modular engine
  const handleDownloadInvoice = async (elementId: string = "invoice-print-area", docType: InvoiceDocType = "invoice") => {
    setDownloadingPdf(true);
    try {
      await downloadInvoiceAsPDF({
        elementId,
        booking,
        docType,
        onSuccess: (filename) => {
          addTimelineEvent("Invoice Saved", `Mendownload PDF: ${filename}`);
        },
        onError: (err) => {
          alert(`Gagal mengunduh PDF: ${err.message}`);
        }
      });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const badgeStyles = getStatusStyles(booking.status);
  const totalDue = booking.price - booking.discount;
  const isPaid = booking.payments.fullPaid || booking.status === "Completed";
  const isDPPaid = booking.payments.dpPaid || booking.status === "DP Paid";

  // Dynamic DP computations
  const dpAmount = typeof booking.payments.dpAmount === "number" ? booking.payments.dpAmount : Math.round(totalDue * 0.4);
  const remainingAmount = Math.max(0, totalDue - dpAmount);
  const dpPercent = totalDue > 0 ? Math.round((dpAmount / totalDue) * 100) : 40;
  const remainingPercent = 100 - dpPercent;

  return (
    <div className="space-y-8">
      {/* Confirmation Modal for Marking as Paid */}
      {showConfirmPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in no-print">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-100 p-6 shadow-2xl space-y-5">
            <div className="space-y-2">
              <h3 className="text-base font-serif font-semibold text-neutral-900">Confirm Full Payment</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                This invoice will be marked as Paid.
              </p>
            </div>
            <div className="flex items-center justify-end space-x-4 border-t border-neutral-100 pt-4">
              <button
                onClick={() => setShowConfirmPaidModal(false)}
                className="px-4 py-2 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-500 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFullPayment}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Sub-Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 border-b border-neutral-100 pb-6 no-print">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 bg-white transition-all duration-200"
            aria-label="Back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                {booking.id}
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <span className="text-xs font-serif italic text-neutral-500">{getCountdownText()}</span>
            </div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-neutral-950 mt-1">
              {booking.clientName}
            </h1>
          </div>
        </div>

        {/* Global status modifier dropdown inside workspace */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest hidden sm:block">
            Project Status:
          </span>
          <div className="relative inline-block">
            <select
              value={booking.status}
              onChange={(e) => {
                const nextStatus = e.target.value as BookingStatus;
                const newEvent: TimelineEvent = {
                  id: `timeline-${Date.now()}`,
                  status: "Status Updated",
                  timestamp: new Date().toISOString(),
                  note: `Workflow milestone transitioned manually to "${nextStatus}".`
                };
                triggerUpdate({
                  status: nextStatus,
                  timeline: [...booking.timeline, newEvent]
                });
              }}
              className={`appearance-none pl-4 pr-8 py-1.5 rounded-full text-xs font-semibold border ${badgeStyles.bg} ${badgeStyles.text} ${badgeStyles.border} focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all cursor-pointer shadow-xs`}
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              <option value="Inquiry" className="text-neutral-900 bg-white">Inquiry</option>
              <option value="Booked" className="text-neutral-900 bg-white">Booked</option>
              <option value="DP Paid" className="text-neutral-900 bg-white">DP Paid</option>
              <option value="Shoot Done" className="text-neutral-900 bg-white">Shoot Done</option>
              <option value="Editing" className="text-neutral-900 bg-white">Editing</option>
              <option value="Ready to Deliver" className="text-neutral-900 bg-white">Ready to Deliver</option>
              <option value="Completed" className="text-neutral-900 bg-white">Completed</option>
              <option value="Cancelled" className="text-neutral-900 bg-white">Cancelled</option>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 ${badgeStyles.text}`}>
              <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side Tab Selectors */}
        <div className="w-full lg:w-56 bg-white rounded-2xl border border-neutral-100 p-3 shadow-sm/5 flex flex-row lg:flex-col overflow-x-auto no-scrollbar lg:space-y-0.5 whitespace-nowrap no-print">
          {[
            { id: "overview", label: "Overview", icon: Milestone },
            { id: "client", label: "Client Workspace", icon: User },
            { id: "invoice", label: "Invoice Studio", icon: FileText },
            { id: "payment", label: "Payment Log", icon: DollarSign },
            { id: "contract", label: "Contracts", icon: HeartHandshake },
            { id: "timeline", label: "Project Timeline", icon: Clock },
            { id: "checklist", label: "Gear Checklist", icon: CheckSquare },
            { id: "gallery", label: "Gallery previews", icon: Camera },
            { id: "delivery", label: "Deliveries", icon: ExternalLink },
            { id: "notes", label: "Project Scratchpad", icon: Info }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase font-mono transition-all duration-200 ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Pane */}
        <div className="flex-1 w-full min-h-[500px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-2">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Project Workspace Overview</h2>
                <p className="text-xs text-neutral-400">Current progress and vital pipeline details</p>
              </div>

              {/* Status Progress Bar */}
              <div className="space-y-2.5 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">Studio Workspace Milestone Completion</span>
                  <span className="font-mono font-bold text-neutral-900">{getProgressPercentage(booking.status)}%</span>
                </div>
                <div className="h-2.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(booking.status)}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 italic mt-1 font-serif">
                  <span className="font-sans font-semibold uppercase text-[10px] bg-white text-neutral-800 border px-1.5 py-0.5 rounded mr-1.5">GUIDE:</span>
                  {getWorkflowGuidance(booking.status)}
                </p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-neutral-100 rounded-2xl">
                  <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Package Level</span>
                  <p className="text-base font-semibold text-neutral-900 mt-1">{booking.packageName}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{booking.duration} shoot duration</p>
                </div>
                <div className="p-5 border border-neutral-100 rounded-2xl">
                  <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Event Logistics</span>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{booking.venue}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">{formatDate(booking.eventDate)} at {booking.eventTime}</p>
                </div>
                <div className="p-5 border border-neutral-100 rounded-2xl">
                  <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Lead Creator</span>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{booking.assignedPhotographer}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Primary Director</p>
                </div>
              </div>

              {/* Financial Statement Overview */}
              <div className="border-t border-neutral-100 pt-8 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Financial Log</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-mono text-neutral-500">Contract Total</span>
                    <p className="text-lg font-semibold text-neutral-900 mt-0.5">{formatRupiah(totalDue)}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-mono text-neutral-500">Down Payment Paid</span>
                    <p className="text-lg font-semibold text-neutral-900 mt-0.5">
                      {booking.payments.dpPaid ? formatRupiah(booking.payments.dpAmount) : "Rp 0"}
                    </p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-mono text-neutral-500">Remaining Due</span>
                    <p className={`text-lg font-semibold mt-0.5 ${booking.payments.fullPaid ? "text-emerald-700" : "text-neutral-900"}`}>
                      {booking.payments.fullPaid ? "CLEARED" : formatRupiah(booking.payments.remainingAmount || totalDue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Workspace Connection inside Overview */}
              <div className="border-t border-slate-100 pt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Google Calendar Sync</h3>
                  {googleToken && booking.googleCalendarEventId && (
                    <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold font-mono">
                      ✓ Synced
                    </span>
                  )}
                </div>

                {calendarSyncSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold">
                    {calendarSyncSuccess}
                  </div>
                )}

                {calendarSyncError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold">
                    Gagal sinkronisasi: {calendarSyncError}
                  </div>
                )}
                
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Sync Shoot Schedule to Google Calendar</span>
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      Sync this session to Google Calendar. We will create a color-coded slot matching the studio booking status (e.g. Sage for Deliveries, Cobalt for Locked DP).
                    </p>
                  </div>
                  
                  <div className="shrink-0">
                    {!googleToken ? (
                      <button
                        type="button"
                        onClick={onGoogleSignIn}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 inline-flex items-center justify-center space-x-2"
                      >
                        <span>Hubungkan Google</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSyncCalendar}
                        disabled={syncingCalendar}
                        className={`w-full sm:w-auto px-4 py-2 ${
                          booking.googleCalendarEventId
                            ? "bg-slate-900 hover:bg-slate-800 text-white"
                            : "bg-black hover:bg-slate-900 text-white"
                        } rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 inline-flex items-center justify-center space-x-2 cursor-pointer`}
                      >
                        {syncingCalendar ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sinkronisasi...</span>
                          </>
                        ) : (
                          <>
                            <span>{booking.googleCalendarEventId ? "Update Google Calendar" : "Sync to Google Calendar"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT */}
          {activeTab === "client" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Client Profile Details</h2>
                <p className="text-xs text-neutral-400">Manage client contact variables and project metadata</p>
              </div>

              <form onSubmit={handleClientUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Client Name</label>
                    <input
                      type="text"
                      value={clientForm.clientName}
                      onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Phone Number</label>
                    <input
                      type="text"
                      value={clientForm.phoneNumber}
                      onChange={(e) => setClientForm({ ...clientForm, phoneNumber: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Instagram Handle</label>
                    <input
                      type="text"
                      value={clientForm.instagram}
                      onChange={(e) => setClientForm({ ...clientForm, instagram: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Email Address</label>
                    <input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Event Date</label>
                    <input
                      type="date"
                      value={clientForm.eventDate}
                      onChange={(e) => setClientForm({ ...clientForm, eventDate: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Event Time</label>
                    <input
                      type="time"
                      value={clientForm.eventTime}
                      onChange={(e) => setClientForm({ ...clientForm, eventTime: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Venue</label>
                    <input
                      type="text"
                      value={clientForm.venue}
                      onChange={(e) => setClientForm({ ...clientForm, venue: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Base Price (IDR)</label>
                    <input
                      type="number"
                      value={clientForm.price}
                      onChange={(e) => setClientForm({ ...clientForm, price: Number(e.target.value) || 0 })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Discount (IDR)</label>
                    <input
                      type="number"
                      value={clientForm.discount}
                      onChange={(e) => setClientForm({ ...clientForm, discount: Number(e.target.value) || 0 })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Package Description</label>
                    <input
                      type="text"
                      value={clientForm.packageName}
                      onChange={(e) => setClientForm({ ...clientForm, packageName: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Additional Services Add-ons</label>
                    <input
                      type="text"
                      value={clientForm.additionalServices}
                      onChange={(e) => setClientForm({ ...clientForm, additionalServices: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Special Directives & Notes</label>
                    <textarea
                      value={clientForm.specialNotes}
                      rows={4}
                      onChange={(e) => setClientForm({ ...clientForm, specialNotes: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
                  >
                    Save Client Workspace Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: INVOICE */}
          {activeTab === "invoice" && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm/5 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase text-neutral-400 font-mono">Invoice Status:</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isPaid ? "bg-emerald-50 text-emerald-800" : isDPPaid ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"}`}>
                    {isPaid ? "Paid" : isDPPaid ? "DP Paid" : "Unpaid"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadInvoice("invoice-print-area", "invoice")}
                    disabled={downloadingPdf}
                    className="inline-flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingPdf ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                        <span>Rendering PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download Invoice</span>
                      </>
                    )}
                  </button>
                  {isPaid && (
                    <button
                      onClick={() => handleDownloadInvoice("invoice-paid-print-area", "receipt")}
                      disabled={downloadingPdf}
                      className="inline-flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Download Receipt (Lunas)</span>
                    </button>
                  )}
                  <button
                    onClick={() => handlePrint("invoice-print-area")}
                    className="inline-flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice (A4)</span>
                  </button>
                  {isPaid && (
                    <button
                      onClick={() => handlePrint("invoice-paid-print-area")}
                      className="inline-flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Print Receipt (A4)</span>
                    </button>
                  )}
                  <a
                    href={getWhatsAppMessage(booking, studioSettings.studioName)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 bg-emerald-900 hover:bg-emerald-850 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Informational banner about browser/iframe download restrictions */}
              {typeof window !== "undefined" && window.self !== window.top && (
                <div className="bg-amber-50/70 border border-amber-200/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-900 text-xs no-print">
                  <div className="flex items-start space-x-3">
                    <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-950">💡 Informasi Penting untuk Download PDF:</p>
                      <p className="leading-relaxed text-amber-900/90">
                        Karena preview aplikasi ini berjalan di dalam **iframe** Google AI Studio, browser membatasi proses download langsung demi keamanan.
                        Silakan klik tombol di samping untuk membuka aplikasi di tab baru, lalu coba download kembali agar PDF tersimpan langsung di komputer Anda.
                      </p>
                    </div>
                  </div>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center justify-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm text-center text-xs"
                  >
                    <span>Buka di Tab Baru ↗</span>
                  </a>
                </div>
              )}

              {/* The gorgeous Swiss/Leica A4 Editorial Invoice */}
              <InvoiceTemplate
                id="invoice-print-area"
                booking={booking}
                studioSettings={studioSettings}
                docType="invoice"
              />

              {isPaid && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center space-x-2 no-print">
                    <span className="h-px bg-neutral-200 flex-1" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold px-3">
                      Receipt of Final Payment (Lunas)
                    </span>
                    <span className="h-px bg-neutral-200 flex-1" />
                  </div>
                  
                  <InvoiceTemplate
                    id="invoice-paid-print-area"
                    booking={booking}
                    studioSettings={studioSettings}
                    docType="receipt"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Payment Milestones Log</h2>
                <p className="text-xs text-neutral-400">Update project accounting states and down payment locks</p>
              </div>

              {/* Due Date Editor */}
              <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Tenggat Waktu (Due Date)
                  </label>
                  <p className="text-[10px] text-neutral-400">Tanggal ini muncul di invoice sebagai batas waktu pelunasan</p>
                </div>
                <input
                  type="date"
                  value={booking.invoice.dueDate}
                  disabled={isPaid}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="bg-white disabled:bg-neutral-100 disabled:text-neutral-500 border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                />
              </div>

              {/* Status Indicator Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                {/* Milestone 1: Down Payment */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-neutral-150 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">
                      Milestone 1: Down Payment ({dpPercent}%)
                    </span>
                    
                    <div className="mt-3 space-y-1.5">
                      <label className="text-[11px] font-semibold text-neutral-600 block">DP Amount (IDR)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={dpAmount}
                          disabled={isPaid}
                          onChange={(e) => handleDPChange(Number(e.target.value) || 0)}
                          className="w-full bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-500 border border-neutral-200 rounded-xl pl-4 pr-12 py-2 text-sm text-neutral-800 focus:outline-none focus:border-neutral-900 font-mono"
                          placeholder="Enter custom DP"
                        />
                        <span className="absolute right-3 top-2 text-xs font-semibold text-neutral-400 font-mono">
                          {dpPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-50 mt-4">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isDPPaid || isPaid ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                      {isDPPaid || isPaid ? "CONFIRMED" : "PENDING"}
                    </span>
                    {!isDPPaid && !isPaid && (
                      <button
                        onClick={handleMarkDPPaid}
                        className="text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl transition-all"
                      >
                        Confirm M1 DP Paid
                      </button>
                    )}
                  </div>
                </div>

                {/* Milestone 2: Final Balance */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-neutral-150 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block font-bold">
                      Milestone 2: Final Balance ({remainingPercent}%)
                    </span>
                    <div className="mt-3 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-neutral-900 font-mono">
                        {formatRupiah(remainingAmount)}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isPaid ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                        {isPaid ? "CLEARED" : "PENDING"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-neutral-50 mt-4">
                    <button
                      onClick={handleMarkFullyPaid}
                      disabled={isPaid}
                      className={`w-full text-xs font-semibold px-4 py-2.5 rounded-xl transition-all text-center block ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-700 cursor-not-allowed opacity-80"
                          : "bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer"
                      }`}
                    >
                      {isPaid ? "Full Payment Confirmed" : "Confirm Full Payment"}
                    </button>

                    {/* Jika belum lunas, tampilkan rekening tujuan */}
                    {!isPaid && (
                      <div className="mt-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl space-y-2">
                        <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider font-mono">Transfer Destination Account:</p>
                        <div className="space-y-1.5 text-xs">
                          {studioSettings.bcaAccount && (
                            <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg border border-amber-100">
                              <div>
                                <p className="font-semibold text-slate-800">BCA</p>
                                <p className="font-mono text-slate-600 text-xs">{studioSettings.bcaAccount}</p>
                                <p className="text-[9px] text-slate-400">A/N Alwi Muhammad A</p>
                              </div>
                              <button
                                onClick={() => handleCopy(studioSettings.bcaAccount, "BCA")}
                                className="text-neutral-500 hover:text-neutral-900 transition-all text-[10px] font-mono border border-neutral-200 px-2 py-0.5 rounded bg-white"
                              >
                                {copiedAccount === "BCA" ? "Copied" : "Copy"}
                              </button>
                            </div>
                          )}
                          {studioSettings.briAccount && (
                            <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg border border-amber-100">
                              <div>
                                <p className="font-semibold text-slate-800">BRI</p>
                                <p className="font-mono text-slate-600 text-xs">{studioSettings.briAccount}</p>
                                <p className="text-[9px] text-slate-400">A/N Alwi Muhammad A</p>
                              </div>
                              <button
                                onClick={() => handleCopy(studioSettings.briAccount, "BRI")}
                                className="text-neutral-500 hover:text-neutral-900 transition-all text-[10px] font-mono border border-neutral-200 px-2 py-0.5 rounded bg-white"
                              >
                                {copiedAccount === "BRI" ? "Copied" : "Copy"}
                              </button>
                            </div>
                          )}
                          {studioSettings.shopeepayAccount && (
                            <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg border border-amber-100">
                              <div>
                                <p className="font-semibold text-slate-800">ShopeePay</p>
                                <p className="font-mono text-slate-600 text-xs">{studioSettings.shopeepayAccount}</p>
                                <p className="text-[9px] text-slate-400">A/N Alwi Muhammad A</p>
                              </div>
                              <button
                                onClick={() => handleCopy(studioSettings.shopeepayAccount, "ShopeePay")}
                                className="text-neutral-500 hover:text-neutral-900 transition-all text-[10px] font-mono border border-neutral-200 px-2 py-0.5 rounded bg-white"
                              >
                                {copiedAccount === "ShopeePay" ? "Copied" : "Copy"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Studio Payment Accounts */}
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Studio Destination Accounts</h3>
                <div className="space-y-3">
                  {[
                    { type: "ShopeePay", name: "Alwi Muhammad A", num: studioSettings.shopeepayAccount },
                    { type: "BRI", name: "Alwi Muhammad A", num: studioSettings.briAccount },
                    { type: "BCA", name: "Alwi Muhammad A", num: studioSettings.bcaAccount }
                  ].map((acc) => (
                    <div key={acc.type} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div>
                        <span className="font-mono text-xs font-bold uppercase text-neutral-500">{acc.type}</span>
                        <p className="text-sm font-semibold text-neutral-800 mt-1">{acc.num}</p>
                        <p className="text-[11px] text-neutral-400">A/N {acc.name}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(acc.num, acc.type)}
                        className="p-2 bg-white rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-900 transition-all"
                      >
                        {copiedAccount === acc.type ? <span className="text-[11px] font-mono text-emerald-700">Copied</span> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTRACT */}
          {activeTab === "contract" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Photography Service Agreement</h2>
                <p className="text-xs text-neutral-400">Review model release legal terms, copyright policies and signing states</p>
              </div>

              {/* Legal Placeholder Content */}
              <div className="h-64 overflow-y-auto bg-neutral-50 p-6 rounded-2xl border border-neutral-100 text-xs text-neutral-600 leading-relaxed space-y-4 font-sans">
                <p className="font-semibold text-neutral-800">VisualGroove Creative Services Contract</p>
                <p>
                  This agreement represents the entire contractual arrangement between VisualGroove Studio (hereinafter "Photographer") and {booking.clientName} (hereinafter "Client") on this date.
                </p>
                <p className="font-semibold text-neutral-800">1. Creative Licensing & Usage</p>
                <p>
                  All raw digital assets, curation layouts, and negative frames remain the sole property of Photographer. Client receives perpetual personal reproduction licenses to print, host, and post visual works. Commercial monetization is strictly forbidden without express written permits.
                </p>
                <p className="font-semibold text-neutral-800">2. Cancellation Policy</p>
                <p>
                  Down Payments (40%) represent lock-in retention fees and are fully non-refundable on client cancellation within 30 days of the scheduled shoot. In the event of catastrophic climate conditions or force majeure, sessions will be rescheduled free of charge.
                </p>
                <p className="font-semibold text-neutral-800">3. Liability Limits</p>
                <p>
                  In the extremely rare event of memory card corruption, equipment malfunction, or physical injury preventing Photographer from delivering visual curator results, Photographer’s liability is strictly capped at a 100% refund of fees paid. No secondary punitive damages may be claimed.
                </p>
              </div>

              {/* Signature Agreement Lock */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-800">
                    {booking.contractAgreed ? "Kontrak Telah Disetujui (Agreed)" : "Agreement Confirmation"}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {booking.contractAgreed
                      ? `Disetujui secara digital pada ${booking.timeline.find(t => t.status === "Contract Signed" || t.status === "Contract Signed (Agreed)")?.timestamp ? new Date(booking.timeline.find(t => t.status === "Contract Signed" || t.status === "Contract Signed (Agreed)")!.timestamp).toLocaleDateString("id-ID") : new Date().toLocaleDateString("id-ID")}`
                      : "Agreement locked and approved on client payment."}
                  </p>
                </div>
                {booking.contractAgreed ? (
                  <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Contract Locked</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const newEvent: TimelineEvent = {
                        id: `timeline-${Date.now()}`,
                        status: "Contract Signed",
                        timestamp: new Date().toISOString(),
                        note: "Digital Service Contract locked and accepted."
                      };
                      triggerUpdate({
                        contractAgreed: true,
                        timeline: [...booking.timeline, newEvent]
                      });
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Mark Contract Agreed
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TIMELINE */}
          {activeTab === "timeline" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Project Workspace Timeline Logs</h2>
                <p className="text-xs text-neutral-400">Automated event tracking and manual creative logs</p>
              </div>

              {/* Add Manual Event Form */}
              <form onSubmit={handleAddTimeline} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="E.g. Outfit moodboard received from client..."
                  value={newTimelineNote}
                  onChange={(e) => setNewTimelineNote(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 rounded-xl flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Event</span>
                </button>
              </form>

              {/* Event Timeline Logs */}
              <div className="relative pl-6 space-y-6 border-l border-neutral-100 ml-3">
                {booking.timeline.map((evt) => (
                  <div key={evt.id} className="relative space-y-1">
                    <span className="absolute -left-[30.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-neutral-900 border-2 border-white shadow-xs" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-900 uppercase font-sans tracking-wide">
                        {evt.status}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(evt.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-sans leading-relaxed">{evt.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-xl font-serif font-medium text-neutral-900">Studio Gear Checklist</h2>
                  <p className="text-xs text-neutral-400">Keep track of primary cameras, secondary lenses, battery levels, and details</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-3 py-1 rounded">
                    {booking.checklist.filter((c) => c.checked).length} / {booking.checklist.length} Packaged
                  </span>
                </div>
              </div>

              {/* Add Custom Item */}
              <form onSubmit={handleAddChecklist} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Add custom gear or preparation item..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 rounded-xl flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </form>

              {/* Checklist Grid */}
              <div className="space-y-2">
                {booking.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${item.checked ? "line-through text-neutral-400" : "text-neutral-800"}`}>
                        {item.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteChecklist(item.id)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: GALLERY */}
          {activeTab === "gallery" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Curated Previews Board</h2>
                <p className="text-xs text-neutral-400">Upload sneak peeks or selection assets directly to the workspace</p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={simulateImageUpload}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center space-y-3 ${
                  dragActive ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50"
                }`}
              >
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <Upload className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Drag previews here or click to choose</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Supports High Resolution JPGs, RAW previews or curation thumbnails</p>
                </div>
              </div>

              {/* Thumbnail Previews Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">Curated Previews Grid</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {booking.gallery.previewImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 group shadow-xs">
                      <img
                        src={img}
                        alt={`Curated preview ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = booking.gallery.previewImages.filter((_, i) => i !== idx);
                          triggerUpdate({
                            gallery: {
                              ...booking.gallery,
                              previewImages: updated
                            }
                          });
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  ))}

                  {booking.gallery.previewImages.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-neutral-400 font-serif italic">
                      No preview curations uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: DELIVERY */}
          {activeTab === "delivery" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-8 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Delivery Channels</h2>
                <p className="text-xs text-neutral-400">Share high-resolution Google Drive or Pixieset gallery access directories</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Google Drive High-Res Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={booking.delivery.googleDriveLink}
                      onChange={(e) =>
                        triggerUpdate({
                          delivery: { ...booking.delivery, googleDriveLink: e.target.value }
                        })
                      }
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                    {booking.delivery.googleDriveLink && (
                      <a
                        href={booking.delivery.googleDriveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl flex items-center justify-center transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Pixieset Studio Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://visualgroove.pixieset.com/..."
                      value={booking.delivery.pixiesetLink}
                      onChange={(e) =>
                        triggerUpdate({
                          delivery: { ...booking.delivery, pixiesetLink: e.target.value }
                        })
                      }
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                    {booking.delivery.pixiesetLink && (
                      <a
                        href={booking.delivery.pixiesetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl flex items-center justify-center transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Target Delivery Date</label>
                    <input
                      type="date"
                      value={booking.delivery.deliveryDate}
                      onChange={(e) =>
                        triggerUpdate({
                          delivery: { ...booking.delivery, deliveryDate: e.target.value }
                        })
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div className="flex items-center space-x-3 self-end h-11 bg-neutral-50 border border-neutral-100 px-4 rounded-xl">
                    <input
                      type="checkbox"
                      id="deliveryConfirm"
                      checked={booking.delivery.clientConfirmation}
                      onChange={(e) => {
                        triggerUpdate({
                          delivery: { ...booking.delivery, clientConfirmation: e.target.checked }
                        });
                        addTimelineEvent("Delivery Confirmed", "Client formally acknowledged delivery receipt.");
                      }}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <label htmlFor="deliveryConfirm" className="text-xs font-semibold text-neutral-700 cursor-pointer select-none">
                      Client Confirmed Receipt
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: NOTES */}
          {activeTab === "notes" && (
            <div className="bg-white rounded-3xl border border-neutral-100 p-8 space-y-6 shadow-sm/5">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-medium text-neutral-900">Project Scratchpad</h2>
                <p className="text-xs text-neutral-400">Keep private annotations, visual outlines, styling cues, or layout briefs</p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Styling ideas: Soft cinematic greens, vintage film glow highlights...\nClient preferences: Javanese traditions, warm golden tones...\nAssigned director guidelines..."
                  rows={12}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 font-sans leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-mono uppercase">Scratchpad autosaves manually</span>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center space-x-1.5"
                  >
                    <span>{savingNotes ? "Saving Notes..." : "Save Project Notes"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
