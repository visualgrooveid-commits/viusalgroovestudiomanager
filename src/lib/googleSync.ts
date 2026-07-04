/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking, BookingStatus } from "../types";

// Helper to determine event end time based on start time and duration
export function getEndTime(startTime: string, durationStr: string): string {
  try {
    const [shour, smin] = startTime.split(":").map(Number);
    let hoursToAdd = 3; // Default fallback 3 hours
    
    const matches = durationStr.match(/(\d+)\s*(hour|Hour|jam|Jam|h|H)/i);
    if (matches && matches[1]) {
      hoursToAdd = parseInt(matches[1], 10);
    }
    
    let ehour = shour + hoursToAdd;
    let emin = smin || 0;
    if (ehour >= 24) {
      ehour = 23;
      emin = 59;
    }
    
    const ehourStr = ehour < 10 ? `0${ehour}` : `${ehour}`;
    const eminStr = emin < 10 ? `0${emin}` : `${emin}`;
    return `${ehourStr}:${eminStr}`;
  } catch (e) {
    return "23:59";
  }
}

// Google Calendar status to colorId map
// 1: Lavender, 2: Sage, 3: Grape, 4: Flamingo, 5: Banana, 6: Tangerine, 7: Peacock, 8: Graphite, 9: Cobalt, 10: Basil, 11: Tomato
function getCalendarColorForStatus(status: BookingStatus): string {
  switch (status) {
    case "Inquiry":
      return "8"; // Graphite (Gray)
    case "Booked":
      return "5"; // Banana (Yellow)
    case "DP Paid":
      return "9"; // Cobalt (Blue)
    case "Shoot Done":
      return "7"; // Peacock (Turquoise)
    case "Editing":
      return "6"; // Tangerine (Orange)
    case "Ready to Deliver":
      return "1"; // Lavender (Light Blue)
    case "Completed":
      return "10"; // Basil (Green)
    case "Cancelled":
      return "11"; // Tomato (Red)
    default:
      return "8";
  }
}

/**
 * Syncs all bookings to a single Google Spreadsheet
 * Overwrites Sheet1 with the latest bookings lists to keep them in perfect sync
 */
export async function syncToGoogleSheets(
  bookings: Booking[],
  token: string,
  studioName: string
): Promise<{ spreadsheetId: string; url: string }> {
  let spreadsheetId = localStorage.getItem("vg_spreadsheet_id");

  // Verify the saved spreadsheet exists/is accessible, or create a new one
  if (spreadsheetId) {
    try {
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!checkRes.ok) {
        // Spreadsheet has been deleted or is inaccessible, reset to trigger creation
        spreadsheetId = null;
      }
    } catch (e) {
      spreadsheetId = null;
    }
  }

  // Create a new spreadsheet if not exists
  if (!spreadsheetId) {
    const title = studioName ? `${studioName} - Studio OS Bookings` : "VisualGroove Studio OS Bookings";
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          title: title
        }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || "Failed to create Google Sheet");
    }

    const sheetData = await createRes.json();
    spreadsheetId = sheetData.spreadsheetId;
    if (spreadsheetId) {
      localStorage.setItem("vg_spreadsheet_id", spreadsheetId);
    } else {
      throw new Error("No spreadsheetId returned from Sheets API");
    }
  }

  // Define headers
  const headers = [
    "Booking ID",
    "Client Name",
    "Email",
    "Phone",
    "Instagram",
    "Event Type",
    "Package Name",
    "Duration",
    "Event Date",
    "Event Time",
    "Venue",
    "Package Price",
    "Discount",
    "Total Contract Value",
    "DP Paid?",
    "Full Paid?",
    "Status",
    "Assigned Photographer",
    "Notes"
  ];

  // Map bookings to rows sorted by Date
  const sortedBookings = [...bookings].sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  const rows = sortedBookings.map((b) => [
    b.id,
    b.clientName,
    b.email || "-",
    b.phoneNumber || "-",
    b.instagram || "-",
    b.eventType,
    b.packageName,
    b.duration,
    b.eventDate,
    b.eventTime,
    b.venue || "-",
    b.price,
    b.discount,
    b.price - b.discount,
    b.payments.dpPaid ? "Yes" : "No",
    b.payments.fullPaid ? "Yes" : "No",
    b.status,
    b.assignedPhotographer || "-",
    b.notes || b.specialNotes || "-"
  ]);

  const values = [headers, ...rows];

  // Overwrite Sheet1 contents
  const range = `Sheet1!A1:S${values.length}`;
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        range,
        majorDimension: "ROWS",
        values
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || "Failed to sync spreadsheet rows");
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}

/**
 * Syncs a single booking to Google Calendar
 * Creates the event if it doesn't exist, or updates it if it does
 */
export async function syncBookingToCalendar(
  booking: Booking,
  token: string
): Promise<string> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta";
  
  const eventBody = {
    summary: `📸 [${booking.status}] ${booking.clientName} - ${booking.eventType}`,
    location: booking.venue || "Studio / TBA",
    description: `Booking ID: ${booking.id}\nPackage: ${booking.packageName} (${booking.duration})\nStatus: ${booking.status}\nTotal Contract Value: Rp ${booking.price - booking.discount}\nAssigned Photographer: ${booking.assignedPhotographer || "TBA"}\n\nSpecial Notes: ${booking.specialNotes || "-"}\nWorkspace Notes: ${booking.notes || "-"}\n\nSynchronized from VisualGroove Studio OS.`,
    start: {
      dateTime: `${booking.eventDate}T${booking.eventTime}:00`,
      timeZone
    },
    end: {
      dateTime: `${booking.eventDate}T${getEndTime(booking.eventTime, booking.duration)}:00`,
      timeZone
    },
    colorId: getCalendarColorForStatus(booking.status)
  };

  let eventId = booking.googleCalendarEventId;

  if (eventId) {
    // Try updating existing event
    try {
      const updateRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(eventBody)
        }
      );

      if (updateRes.ok) {
        const data = await updateRes.json();
        return data.id;
      } else if (updateRes.status === 404) {
        // Event might have been deleted manually from Google Calendar, reset ID and create new one below
        eventId = undefined;
      } else {
        const err = await updateRes.json();
        throw new Error(err.error?.message || "Failed to update Google Calendar event");
      }
    } catch (e) {
      eventId = undefined;
    }
  }

  // Create new event
  const createRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(eventBody)
    }
  );

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || "Failed to create Google Calendar event");
  }

  const data = await createRes.json();
  return data.id;
}
