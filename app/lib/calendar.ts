/**
 * Google Calendar API Integration
 * Functions to manage calendar events using Google Calendar API
 * Uses the OAuth access_token from NextAuth
 */

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        key: string;
      };
    };
  };
}

const GOOGLE_CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";

/**
 * Get user's calendar events from Google Calendar
 * @param accessToken - OAuth access token from NextAuth
 * @param timeMin - Start time (ISO 8601)
 * @param timeMax - End time (ISO 8601)
 * @returns Array of calendar events
 */
export async function getCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
) {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw error;
  }
}

/**
 * Create a new calendar event
 * @param accessToken - OAuth access token from NextAuth
 * @param event - Event details
 * @returns Created event object
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEvent
) {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

/**
 * Update an existing calendar event
 * @param accessToken - OAuth access token from NextAuth
 * @param eventId - ID of the event to update
 * @param event - Updated event details
 * @returns Updated event object
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  event: CalendarEvent
) {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events/${eventId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }
}

/**
 * Delete a calendar event
 * @param accessToken - OAuth access token from NextAuth
 * @param eventId - ID of the event to delete
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
) {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
}

/**
 * Get a specific calendar event
 * @param accessToken - OAuth access token from NextAuth
 * @param eventId - ID of the event
 * @returns Event object
 */
export async function getCalendarEvent(accessToken: string, eventId: string) {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API_URL}/calendars/primary/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    throw error;
  }
}

/**
 * Get available time slots for booking
 * @param accessToken - OAuth access token from NextAuth
 * @param date - Date to check (YYYY-MM-DD)
 * @param duration - Event duration in minutes
 * @returns Array of available time slots
 */
export async function getAvailableSlots(
  accessToken: string,
  date: string,
  duration: number = 30
) {
  try {
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const timeMin = startOfDay.toISOString();
    const timeMax = endOfDay.toISOString();

    const events = await getCalendarEvents(accessToken, timeMin, timeMax);

    // Generate time slots
    const slots: string[] = [];
    const slotDuration = duration;
    const businessHourStart = 9; // 9 AM
    const businessHourEnd = 17; // 5 PM

    for (let hour = businessHourStart; hour < businessHourEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date(`${date}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`);

        // Check if slot conflicts with existing events
        const conflicting = events.some((event: any) => {
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);

          return slotTime < eventEnd && slotEnd > eventStart;
        });

        if (!conflicting) {
          slots.push(slotTime.toISOString());
        }
      }
    }

    return slots;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
}
