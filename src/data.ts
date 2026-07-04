/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, StudioSettings, EventType, BookingStatus, StudioPackage } from "./types";

export const EVENT_TYPES: EventType[] = [
  "Wedding",
  "Graduation",
  "Prewedding",
  "Engagement",
  "Family",
  "Birthday",
  "Other"
];

export const BOOKING_STATUSES: BookingStatus[] = [
  "Inquiry",
  "Booked",
  "DP Paid",
  "Shoot Done",
  "Editing",
  "Ready to Deliver",
  "Completed",
  "Cancelled"
];

export const DEFAULT_CHECKLIST = [
  "Camera (Primary & Secondary)",
  "Battery (Charged + Spares)",
  "Memory Cards (Cleared & Speed-tested)",
  "Prime & Zoom Lenses",
  "Speedlight / Flash Trigger",
  "Drone & Propellers",
  "Tripod / Monopod",
  "Client Confirmation (Time & Outfits)",
  "Location Confirmation & Permit"
];

export const DEFAULT_SETTINGS: StudioSettings = {
  studioName: "VisualGroove Studio",
  instagram: "@visualgroove.moment",
  whatsApp: "+62 859-5292-6600",
  shopeepayAccount: "087866786148",
  briAccount: "371501022904537",
  bcaAccount: "0502476945",
  language: "id"
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "VG-BK-20260615-01",
    clientName: "Amanda & Kevin",
    phoneNumber: "081234567890",
    instagram: "@amanda.srg",
    email: "amanda.kevin@gmail.com",
    eventType: "Wedding",
    packageName: "Traditional Javanese Royal Package",
    duration: "10 Hours",
    eventDate: "2026-06-15",
    eventTime: "08:00",
    venue: "The Ritz-Carlton, Mega Kuningan, Jakarta",
    price: 25000000,
    discount: 1500000,
    additionalServices: "Drone Coverage, 1 Premium Photo Book (100 pages), Same-Day Edit Video",
    specialNotes: "Client requested elegant warm tones and high-contrast black & white portraits in their premium layout. Ensure backup camera body is ready.",
    status: "Completed",
    createdAt: "2026-05-10T10:00:00Z",
    assignedPhotographer: "Alwi Muhammad A",
    invoice: {
      invoiceNumber: "VG-20260615-001",
      status: "Paid",
      issuedDate: "2026-05-10",
      dueDate: "2026-06-10"
    },
    payments: {
      bookingFeePaid: true,
      dpPaid: true,
      fullPaid: true,
      dpAmount: 10000000,
      remainingAmount: 13500000,
      paymentDate: "2026-06-12"
    },
    timeline: [
      { id: "1", status: "Booking Created", timestamp: "2026-05-10T10:00:00Z", note: "Initial inquiry converted to booked project." },
      { id: "2", status: "Invoice Generated", timestamp: "2026-05-10T10:15:00Z", note: "Invoice VG-20260615-001 issued for 23,500,000 IDR." },
      { id: "3", status: "DP Received", timestamp: "2026-05-11T14:30:00Z", note: "Down Payment of 10,000,000 IDR received via BCA." },
      { id: "4", status: "Shoot Completed", timestamp: "2026-06-15T22:00:00Z", note: "A4 portrait wedding session complete at Ritz Kuningan." },
      { id: "5", status: "Editing Started", timestamp: "2026-06-17T09:00:00Z", note: "Culling completed, starting lightroom color correction." },
      { id: "6", status: "Gallery Delivered", timestamp: "2026-06-25T17:00:00Z", note: "Delivered online preview gallery link." },
      { id: "7", status: "Completed", timestamp: "2026-06-27T11:00:00Z", note: "Full payment received and physical album delivered to address." }
    ],
    checklist: [
      { id: "chk-1", name: "Camera (Primary & Secondary)", checked: true },
      { id: "chk-2", name: "Battery (Charged + Spares)", checked: true },
      { id: "chk-3", name: "Memory Cards (Cleared & Speed-tested)", checked: true },
      { id: "chk-4", name: "Prime & Zoom Lenses", checked: true },
      { id: "chk-5", name: "Speedlight / Flash Trigger", checked: true },
      { id: "chk-6", name: "Drone & Propellers", checked: true },
      { id: "chk-7", name: "Tripod / Monopod", checked: true },
      { id: "chk-8", name: "Client Confirmation (Time & Outfits)", checked: true },
      { id: "chk-9", name: "Location Confirmation & Permit", checked: true }
    ],
    gallery: {
      previewImages: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800"
      ],
      storageUrl: "https://supabase.co/storage/v1/visualgroove/amanda-kevin",
      galleryLink: "https://gallery.visualgroove.com/amanda-kevin",
      deliveryStatus: "Delivered"
    },
    delivery: {
      googleDriveLink: "https://drive.google.com/drive/folders/vg-amanda-kevin-highres",
      pixiesetLink: "https://visualgroove.pixieset.com/amandakevin",
      deliveryDate: "2026-06-25",
      clientConfirmation: true
    },
    notes: "Outstanding shoot. Perfect lighting during golden hour outdoors."
  },
  {
    id: "VG-BK-20260628-02",
    clientName: "Narendra & Saraswati",
    phoneNumber: "081987654321",
    instagram: "@narendra_s",
    email: "narasaras@outlook.com",
    eventType: "Prewedding",
    packageName: "Cinematic Nature Editorial",
    duration: "6 Hours",
    eventDate: "2026-06-28",
    eventTime: "06:00",
    venue: "Pine Forest Lembang, Bandung",
    price: 8500000,
    discount: 500000,
    additionalServices: "Analog Film Portrait Roll (36 exp), Stylist Assistance",
    specialNotes: "Editorial mood, morning fog look is critical. Keep focus sharp on movement.",
    status: "Editing",
    createdAt: "2026-05-20T08:00:00Z",
    assignedPhotographer: "Alwi Muhammad A",
    invoice: {
      invoiceNumber: "VG-20260628-002",
      status: "DP Paid",
      issuedDate: "2026-05-20",
      dueDate: "2026-06-20"
    },
    payments: {
      bookingFeePaid: true,
      dpPaid: true,
      fullPaid: false,
      dpAmount: 4000000,
      remainingAmount: 4000000,
      paymentDate: "2026-05-22"
    },
    timeline: [
      { id: "1", status: "Booking Created", timestamp: "2026-05-20T08:00:00Z", note: "Client booking confirmed for Pine Forest." },
      { id: "2", status: "Invoice Generated", timestamp: "2026-05-20T08:10:00Z", note: "Invoice generated with 4,000,000 IDR down payment." },
      { id: "3", status: "DP Received", timestamp: "2026-05-22T11:00:00Z", note: "DP received via ShopeePay." },
      { id: "4", status: "Shoot Completed", timestamp: "2026-06-28T14:00:00Z", note: "Morning shoot successfully completed. Cold climate, batteries drained quickly." },
      { id: "5", status: "Editing Started", timestamp: "2026-06-30T10:00:00Z", note: "Imported 1200 RAW files. Color grading to warm cinematic tones." }
    ],
    checklist: [
      { id: "chk-1", name: "Camera (Primary & Secondary)", checked: true },
      { id: "chk-2", name: "Battery (Charged + Spares)", checked: true },
      { id: "chk-3", name: "Memory Cards (Cleared & Speed-tested)", checked: true },
      { id: "chk-4", name: "Prime & Zoom Lenses", checked: true },
      { id: "chk-5", name: "Speedlight / Flash Trigger", checked: false },
      { id: "chk-6", name: "Drone & Propellers", checked: false },
      { id: "chk-7", name: "Tripod / Monopod", checked: true },
      { id: "chk-8", name: "Client Confirmation (Time & Outfits)", checked: true },
      { id: "chk-9", name: "Location Confirmation & Permit", checked: true }
    ],
    gallery: {
      previewImages: [
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1507504038482-762103743ec5?auto=format&fit=crop&q=80&w=800"
      ],
      storageUrl: "",
      galleryLink: "",
      deliveryStatus: "Uploading"
    },
    delivery: {
      googleDriveLink: "",
      pixiesetLink: "",
      deliveryDate: "2026-07-10",
      clientConfirmation: false
    },
    notes: "Pine forest fog was beautiful. Need to edit with mist-enhancing filters."
  },
  {
    id: "VG-BK-20260702-03",
    clientName: "Nabila Syafitri",
    phoneNumber: "081223344556",
    instagram: "@nabilasyaf",
    email: "nabila.syafitri@ugm.ac.id",
    eventType: "Graduation",
    packageName: "Premium Solo Academic Portrait",
    duration: "2 Hours",
    eventDate: "2026-07-02",
    eventTime: "14:00",
    venue: "Balairung UGM, Yogyakarta",
    price: 3000000,
    discount: 0,
    additionalServices: "Family Portrait Session Add-on (30 mins)",
    specialNotes: "Family members joining at 15:00. Deliver print quality images fast.",
    status: "Ready to Deliver",
    createdAt: "2026-06-10T12:00:00Z",
    assignedPhotographer: "Alwi Muhammad A",
    invoice: {
      invoiceNumber: "VG-20260702-003",
      status: "DP Paid",
      issuedDate: "2026-06-10",
      dueDate: "2026-07-01"
    },
    payments: {
      bookingFeePaid: true,
      dpPaid: true,
      fullPaid: false,
      dpAmount: 1500000,
      remainingAmount: 1500000,
      paymentDate: "2026-06-11"
    },
    timeline: [
      { id: "1", status: "Booking Created", timestamp: "2026-06-10T12:00:00Z", note: "Booking made for solo graduation portrait." },
      { id: "2", status: "Invoice Generated", timestamp: "2026-06-10T12:05:00Z", note: "Invoice generated." },
      { id: "3", status: "DP Received", timestamp: "2026-06-11T09:30:00Z", note: "DP of 1,500,000 IDR received via BRI." },
      { id: "4", status: "Shoot Completed", timestamp: "2026-07-02T16:00:00Z", note: "Shoot finished under clear skies. Family pictures taken perfectly." },
      { id: "5", status: "Editing Started", timestamp: "2026-07-02T19:00:00Z", note: "Culling and editing finished in one rapid night." }
    ],
    checklist: [
      { id: "chk-1", name: "Camera (Primary & Secondary)", checked: true },
      { id: "chk-2", name: "Battery (Charged + Spares)", checked: true },
      { id: "chk-3", name: "Memory Cards (Cleared & Speed-tested)", checked: true },
      { id: "chk-4", name: "Prime & Zoom Lenses", checked: true },
      { id: "chk-5", name: "Speedlight / Flash Trigger", checked: true },
      { id: "chk-6", name: "Drone & Propellers", checked: false },
      { id: "chk-7", name: "Tripod / Monopod", checked: false },
      { id: "chk-8", name: "Client Confirmation (Time & Outfits)", checked: true },
      { id: "chk-9", name: "Location Confirmation & Permit", checked: true }
    ],
    gallery: {
      previewImages: [
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"
      ],
      storageUrl: "https://supabase.co/storage/v1/visualgroove/nabila-ugm",
      galleryLink: "https://gallery.visualgroove.com/nabila-ugm",
      deliveryStatus: "Not Started"
    },
    delivery: {
      googleDriveLink: "https://drive.google.com/drive/folders/nabila-syafitri-graduation",
      pixiesetLink: "",
      deliveryDate: "2026-07-04",
      clientConfirmation: false
    },
    notes: "Nabila's academic gown matches beautifully with Balairung columns."
  },
  {
    id: "VG-BK-20260710-04",
    clientName: "Reza & Tasya",
    phoneNumber: "081345678912",
    instagram: "@reza_tasya",
    email: "reza.tasya@gmail.com",
    eventType: "Engagement",
    packageName: "Intimate Classic Engagement",
    duration: "4 Hours",
    eventDate: "2026-07-10",
    eventTime: "15:00",
    venue: "Amanjiwo Resort, Magelang",
    price: 9000000,
    discount: 1000000,
    additionalServices: "Fine Art Print 16R with Frame",
    specialNotes: "Sunset shoot at Amanjiwo. Check for clear sight of Borobudur temple.",
    status: "DP Paid",
    createdAt: "2026-06-15T09:00:00Z",
    assignedPhotographer: "Alwi Muhammad A",
    invoice: {
      invoiceNumber: "VG-20260710-004",
      status: "DP Paid",
      issuedDate: "2026-06-15",
      dueDate: "2026-07-01"
    },
    payments: {
      bookingFeePaid: true,
      dpPaid: true,
      fullPaid: false,
      dpAmount: 4000000,
      remainingAmount: 4000000,
      paymentDate: "2026-06-16"
    },
    timeline: [
      { id: "1", status: "Booking Created", timestamp: "2026-06-15T09:00:00Z", note: "Booking recorded for Amanjiwo session." },
      { id: "2", status: "Invoice Generated", timestamp: "2026-06-15T09:15:00Z", note: "Invoice VG-20260710-004 generated with 1M discount." },
      { id: "3", status: "DP Received", timestamp: "2026-06-16T15:30:00Z", note: "DP of 4,000,000 IDR received via BCA." }
    ],
    checklist: [
      { id: "chk-1", name: "Camera (Primary & Secondary)", checked: false },
      { id: "chk-2", name: "Battery (Charged + Spares)", checked: false },
      { id: "chk-3", name: "Memory Cards (Cleared & Speed-tested)", checked: false },
      { id: "chk-4", name: "Prime & Zoom Lenses", checked: false },
      { id: "chk-5", name: "Speedlight / Flash Trigger", checked: false },
      { id: "chk-6", name: "Drone & Propellers", checked: false },
      { id: "chk-7", name: "Tripod / Monopod", checked: false },
      { id: "chk-8", name: "Client Confirmation (Time & Outfits)", checked: true },
      { id: "chk-9", name: "Location Confirmation & Permit", checked: true }
    ],
    gallery: {
      previewImages: [],
      storageUrl: "",
      galleryLink: "",
      deliveryStatus: "Not Started"
    },
    delivery: {
      googleDriveLink: "",
      pixiesetLink: "",
      deliveryDate: "2026-07-20",
      clientConfirmation: false
    },
    notes: "Plan sunset timing precisely. Golden light behind Borobudur starts around 16:45."
  },
  {
    id: "VG-BK-20260720-05",
    clientName: "The Hartono Family",
    phoneNumber: "081122446688",
    instagram: "@hartonofamily",
    email: "hartono.heritage@yahoo.com",
    eventType: "Family",
    packageName: "Luxe Home Portraiture",
    duration: "3 Hours",
    eventDate: "2026-07-20",
    eventTime: "10:00",
    venue: "Menteng Residence, Central Jakarta",
    price: 5000000,
    discount: 0,
    additionalServices: "None",
    specialNotes: "Grandfather is elderly. Shoot must be slow, indoor, using natural window light where possible.",
    status: "Inquiry",
    createdAt: "2026-07-01T14:00:00Z",
    assignedPhotographer: "Alwi Muhammad A",
    invoice: {
      invoiceNumber: "VG-20260720-005",
      status: "Draft",
      issuedDate: "2026-07-01",
      dueDate: "2026-07-15"
    },
    payments: {
      bookingFeePaid: false,
      dpPaid: false,
      fullPaid: false,
      dpAmount: 2500000,
      remainingAmount: 2500000,
      paymentDate: null
    },
    timeline: [
      { id: "1", status: "Booking Created", timestamp: "2026-07-01T14:00:00Z", note: "Inquiry registered for home portrait." }
    ],
    checklist: [
      { id: "chk-1", name: "Camera (Primary & Secondary)", checked: false },
      { id: "chk-2", name: "Battery (Charged + Spares)", checked: false },
      { id: "chk-3", name: "Memory Cards (Cleared & Speed-tested)", checked: false },
      { id: "chk-4", name: "Prime & Zoom Lenses", checked: false },
      { id: "chk-5", name: "Speedlight / Flash Trigger", checked: false },
      { id: "chk-6", name: "Drone & Propellers", checked: false },
      { id: "chk-7", name: "Tripod / Monopod", checked: false },
      { id: "chk-8", name: "Client Confirmation (Time & Outfits)", checked: false },
      { id: "chk-9", name: "Location Confirmation & Permit", checked: true }
    ],
    gallery: {
      previewImages: [],
      storageUrl: "",
      galleryLink: "",
      deliveryStatus: "Not Started"
    },
    delivery: {
      googleDriveLink: "",
      pixiesetLink: "",
      deliveryDate: "2026-08-01",
      clientConfirmation: false
    },
    notes: "Home setup. Bring high CRI continuous lights just in case rooms are dim."
  }
];

export const DEFAULT_PACKAGES: StudioPackage[] = [
  {
    id: "pkg-1",
    title: "Royal Javanese Wedding Heritage",
    eventType: "Wedding",
    duration: "10 Hours Session",
    price: 25000000,
    features: [
      "2 Senior Lead Photographers",
      "1 Videographer (Cinema Coverage)",
      "Premium 100-page Hardcover Photo Album",
      "All RAW assets delivered on physical hard drive",
      "Same-Day Edit Video (1 Minute)",
      "Google Drive High-Res storage backup for 1 Year"
    ],
    popular: true
  },
  {
    id: "pkg-2",
    title: "Nature Cinematic Prewedding",
    eventType: "Prewedding",
    duration: "6 Hours Session",
    price: 8500000,
    features: [
      "1 Lead Photographer + 1 Assistant",
      "Fine Art color grading (30 curated previews)",
      "1 Roll of 35mm Analog Film portraiture",
      "Styling and moodboard consultation",
      "A2 Premium Frame (with wooden borders)",
      "Drone landscape coverage (included)"
    ],
    popular: false
  },
  {
    id: "pkg-3",
    title: "Solo Academic Portraiture",
    eventType: "Graduation",
    duration: "2 Hours Session",
    price: 3000000,
    features: [
      "1 Lead Portraitist",
      "Balairung / University landscape composition",
      "15 Curated edited frames",
      "Family session add-on (30 minutes)",
      "Pixieset online gallery directory (3 months)"
    ],
    popular: false
  },
  {
    id: "pkg-4",
    title: "Intimate Classic Engagement",
    eventType: "Engagement",
    duration: "4 Hours Session",
    price: 9000000,
    features: [
      "1 Senior Photographer",
      "Fine art editing focus",
      "20 High-resolution printed proofs",
      "16R Premium canvas print with minimal framing",
      "Google Drive digital download"
    ],
    popular: false
  },
  {
    id: "pkg-5",
    title: "Heritage Home Portrait",
    eventType: "Family",
    duration: "3 Hours Session",
    price: 5000000,
    features: [
      "1 Portrait specialist",
      "Natural window light focus",
      "Mobile lighting setups provided",
      "20 fully corrected high-res files",
      "Complete group framing templates"
    ],
    popular: false
  }
];
