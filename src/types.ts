/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType =
  | "Wedding"
  | "Graduation"
  | "Prewedding"
  | "Engagement"
  | "Family"
  | "Birthday"
  | "Other";

export type BookingStatus =
  | "Inquiry"
  | "Booked"
  | "DP Paid"
  | "Shoot Done"
  | "Editing"
  | "Ready to Deliver"
  | "Completed"
  | "Cancelled";

export type InvoiceStatus =
  | "Draft"
  | "Unpaid"
  | "DP Paid"
  | "Paid"
  | "Cancelled";

export interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  note: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface GalleryData {
  previewImages: string[];
  storageUrl: string;
  galleryLink: string;
  deliveryStatus: "Not Started" | "Uploading" | "Delivered";
}

export interface DeliveryData {
  googleDriveLink: string;
  pixiesetLink: string;
  deliveryDate: string;
  clientConfirmation: boolean;
}

export interface PaymentData {
  bookingFeePaid: boolean;
  dpPaid: boolean;
  fullPaid: boolean;
  dpAmount: number;
  remainingAmount: number;
  paymentDate: string | null;
}

export interface InvoiceData {
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
}

export interface Booking {
  id: string;
  clientName: string;
  phoneNumber: string;
  instagram: string;
  email: string;
  eventType: EventType;
  packageName: string;
  duration: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  price: number;
  discount: number;
  additionalServices: string;
  specialNotes: string;
  status: BookingStatus;
  createdAt: string;
  assignedPhotographer: string;
  invoice: InvoiceData;
  payments: PaymentData;
  timeline: TimelineEvent[];
  checklist: ChecklistItem[];
  gallery: GalleryData;
  delivery: DeliveryData;
  notes: string;
  googleCalendarEventId?: string;
  contractAgreed?: boolean;
}

export interface StudioSettings {
  studioName: string;
  instagram: string;
  whatsApp: string;
  shopeepayAccount: string;
  briAccount: string;
  bcaAccount: string;
  language?: "en" | "id";
}

export interface StudioPackage {
  id: string;
  title: string;
  eventType: EventType;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}
