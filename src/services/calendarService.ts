export interface CalendarEventInput {
  summary: string;
  description: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
}

/**
 * Creates an event in the user's primary Google Calendar.
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEventInput
): Promise<{ id: string; htmlLink: string }> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  const body: any = {
    summary: event.summary,
    description: event.description,
    reminders: {
      useDefault: true,
    },
  };

  if (event.allDay) {
    const startYMD = event.startDate.split('T')[0];
    let endYMD = event.endDate ? event.endDate.split('T')[0] : startYMD;
    
    // For all-day events, the end date in Google Calendar is exclusive.
    // If it's a single day event, start: YYYY-MM-DD, end: YYYY-MM-DD is accepted,
    // but to be absolutely safe and prevent off-by-one, we can add 1 day to the end date if it's multi-day or single-day.
    // Let's implement safe date range formatting.
    try {
      const sDate = new Date(startYMD);
      const eDate = event.endDate ? new Date(event.endDate) : new Date(startYMD);
      
      // Add one day to end date to make it exclusive as required by RFC3339 for all-day events
      eDate.setDate(eDate.getDate() + 1);
      
      const formatYMD = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const r = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${r}`;
      };

      body.start = { date: startYMD };
      body.end = { date: formatYMD(eDate) };
    } catch (e) {
      body.start = { date: startYMD };
      body.end = { date: endYMD };
    }
  } else {
    body.start = { dateTime: event.startDate };
    body.end = { dateTime: event.endDate || event.startDate };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Google Calendar error';
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed?.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Lists the upcoming 10 events from the user's primary Google Calendar.
 */
export async function listUpcomingEvents(
  accessToken: string
): Promise<any[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&orderBy=startTime&singleEvents=true`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Failed to fetch calendar events';
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed?.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.items || [];
}
