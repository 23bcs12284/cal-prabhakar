import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VideoGif from "@/public/work-is-almost-over-happy.gif";
import { CalendarCheck2, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { auth, signIn } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

async function checkCalendarAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { hasAccess: false };
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" },
    select: { scope: true },
  });

  // The only gate that matters: did Google issue a token with calendar scope?
  const hasAccess = account?.scope?.includes(CALENDAR_SCOPE) ?? false;
  return { hasAccess };
}

// Server action — NextAuth's signIn handles CSRF token internally
async function reconnectGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/onboarding/grant-id" });
}

export default async function CalendarOnboarding() {
  const { hasAccess } = await checkCalendarAccess();

  // Already has calendar access → go to dashboard
  if (hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>
            Connect your Google Calendar to manage bookings
          </CardDescription>
          <Image
            src={VideoGif}
            alt="Almost finished gif"
            className="w-full rounded-lg mt-4"
            unoptimized
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg flex gap-2">
            <Info className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Calendar Permission Required</p>
              <p>
                To show your availability and create bookings, we need access to
                your Google Calendar. Click &quot;Connect Google Calendar&quot; and make sure
                to check the calendar permission on the Google consent screen.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You&apos;ll be redirected to Google. On the permissions screen, make sure
            to allow <strong>Google Calendar</strong> access.
          </p>

          <div className="flex flex-col gap-2">
            <form action={reconnectGoogle} className="w-full">
              <Button className="w-full" size="lg" type="submit">
                <CalendarCheck2 className="size-4 mr-2" />
                Connect Google Calendar
              </Button>
            </form>

            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Skip for now</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
