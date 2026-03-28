import prisma from "@/app/lib/db";
import { getCalendarEvents } from "@/app/lib/calendar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Prisma } from "@prisma/client";
import {
  addMinutes,
  format,
  isAfter,
  isBefore,
  parse,
} from "date-fns";
import Link from "next/link";

async function getData(userName: string, selectedDate: Date) {
  const currentDay = format(selectedDate, "EEEE");

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const data = await prisma.availability.findFirst({
    where: {
      day: currentDay as Prisma.EnumDayFilter,
      User: {
        userName: userName,
      },
    },
    select: {
      fromTime: true,
      tillTime: true,
      id: true,
      User: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!data?.User) {
    throw new Error("User not found");
  }

  // Get the user's Google account with access token
  const account = await prisma.account.findFirst({
    where: {
      userId: data.User.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("Google Calendar not connected");
  }

  // Get busy times from Google Calendar
  const calendarEvents = await getCalendarEvents(
    account.access_token,
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );

  return {
    data,
    calendarEvents,
  };
}

interface iAppProps {
  selectedDate: Date;
  userName: string;
  duration: number;
}

function calculateAvailableTimeSlots(
  date: string,
  dbAvailability: {
    fromTime: string | undefined;
    tillTime: string | undefined;
  },
  calendarEvents: any[],
  duration: number
) {
  const now = new Date();

  const availableFrom = parse(
    `${date} ${dbAvailability.fromTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  const availableTill = parse(
    `${date} ${dbAvailability.tillTime}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  // Convert calendar events to busy slots
  const busySlots = calendarEvents.map((event) => ({
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
  }));

  const allSlots = [];
  let currentSlot = availableFrom;
  while (isBefore(currentSlot, availableTill)) {
    allSlots.push(currentSlot);
    currentSlot = addMinutes(currentSlot, duration);
  }

  const freeSlots = allSlots.filter((slot) => {
    const slotEnd = addMinutes(slot, duration);

    return (
      isAfter(slot, now) &&
      !busySlots.some(
        (busy: { start: any; end: any }) =>
          (!isBefore(slot, busy.start) && isBefore(slot, busy.end)) ||
          (isAfter(slotEnd, busy.start) && !isAfter(slotEnd, busy.end)) ||
          (isBefore(slot, busy.start) && isAfter(slotEnd, busy.end))
      )
    );
  });

  return freeSlots.map((slot) => format(slot, "HH:mm"));
}

export async function TimeTable({
  selectedDate,
  userName,
  duration,
}: iAppProps) {
  try {
    const { data, calendarEvents } = await getData(userName, selectedDate);

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const dbAvailability = {
      fromTime: data?.fromTime,
      tillTime: data?.tillTime,
    };

    const availableSlots = calculateAvailableTimeSlots(
      formattedDate,
      dbAvailability,
      calendarEvents,
      duration
    );

    return (
      <div>
        <p className="text-base font-semibold">
          {format(selectedDate, "EEE")}{" "}
          <span className="text-sm text-muted-foreground">
            {format(selectedDate, "MMM. d")}
          </span>
        </p>

        <div className="mt-3 max-h-[300px] overflow-y-auto">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <Link
                href={`?date=${format(selectedDate, "yyyy-MM-dd")}&time=${slot}`}
                key={index}
              >
                <Button className="w-full mb-2" variant="outline">
                  {slot}
                </Button>
              </Link>
            ))
          ) : (
            <p>No time slots available</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 rounded">
        <p className="text-sm">Calendar not connected. Please connect your Google Calendar to see available slots.</p>
      </div>
    );
  }
}
