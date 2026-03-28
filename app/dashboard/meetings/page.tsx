import { EmptyState } from "@/app/components/EmptyState";
import { SubmitButton } from "@/app/components/SubmitButtons";
import prisma from "@/app/lib/db";
import { requireUser } from "@/app/lib/hooks";
import { getCalendarEvents } from "@/app/lib/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Video } from "lucide-react";

type CalendarError = "NO_ACCOUNT" | "NO_CALENDAR_SCOPE" | "NO_TOKEN" | "API_ERROR";

async function getData(userId: string): Promise<
  | { ok: true; events: any[] }
  | { ok: false; reason: CalendarError }
> {
  // Get user's Google account
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    select: { access_token: true, scope: true },
  });

  if (!account) {
    return { ok: false, reason: "NO_ACCOUNT" };
  }

  // Check calendar scope is present in the stored token scope
  if (!account.scope?.includes("https://www.googleapis.com/auth/calendar")) {
    return { ok: false, reason: "NO_CALENDAR_SCOPE" };
  }

  if (!account.access_token) {
    return { ok: false, reason: "NO_TOKEN" };
  }

  try {
    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const events = await getCalendarEvents(
      account.access_token,
      now.toISOString(),
      in60Days.toISOString()
    );

    // Return all upcoming events (not just those with video links)
    return { ok: true, events };
  } catch {
    return { ok: false, reason: "API_ERROR" };
  }
}

export default async function MeetingsRoute() {
  const session = await requireUser();
  const result = await getData(session.user?.id as string);

  if (!result.ok) {
    // No Google account or no calendar scope → prompt to connect
    if (
      result.reason === "NO_ACCOUNT" ||
      result.reason === "NO_CALENDAR_SCOPE" ||
      result.reason === "NO_TOKEN"
    ) {
      return (
        <EmptyState
          title="Calendar not connected"
          description="Please reconnect your Google account and allow calendar access to view meetings."
          buttonText="Connect Google Calendar"
          href="/onboarding/grant-id"
        />
      );
    }

    // API error (token expired, etc.)
    return (
      <EmptyState
        title="Could not load meetings"
        description="There was a problem fetching your calendar. Try reconnecting your Google account."
        buttonText="Reconnect Google Calendar"
        href="/onboarding/grant-id"
      />
    );
  }

  const data = result.events;

  return (
    <>
      {data.length < 1 ? (
        <EmptyState
          title="No meetings found"
          description="You don't have any upcoming meetings yet."
          buttonText="Create a new event type"
          href="/dashboard/new"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>
              See your upcoming meetings and video conference links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.map((item: any, index: number) => (
              <div key={item.id}>
                <div className="grid grid-cols-3 justify-between items-center">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(item.start.dateTime), "EEE, dd MMM")}
                    </p>

                    <p className="text-muted-foreground text-xs pt-1">
                      {format(new Date(item.start.dateTime), "hh:mm a")} -{" "}
                      {format(new Date(item.end.dateTime), "hh:mm a")}
                    </p>

                    {(item.conferenceData?.entryPoints?.[0]?.uri ||
                      item.hangoutLink) && (
                      <div className="flex items-center mt-1">
                        <Video className="size-4 mr-2 text-primary" />
                        <a
                          className="text-xs text-primary underline underline-offset-4"
                          href={
                            item.conferenceData?.entryPoints?.[0]?.uri ||
                            item.hangoutLink
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start">
                    <h2 className="text-sm font-medium">{item.summary}</h2>
                    <p className="text-sm text-muted-foreground">
                      {item.attendees
                        ?.map((a: any) => a.displayName || a.email)
                        .join(", ") || "Organizer"}
                    </p>
                  </div>

                  <div className="flex ml-auto">
                    <SubmitButton
                      text="Manage"
                      variant="outline"
                      className="w-fit"
                    />
                  </div>
                </div>
                {index < data.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
