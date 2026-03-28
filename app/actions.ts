"use server";

import prisma from "./lib/db";
import { requireUser } from "./lib/hooks";
import { parseWithZod } from "@conform-to/zod";
import {
  eventTypeSchema,
  onboardingSchemaValidation,
  settingsSchema,
} from "./lib/zodSchemas";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteCalendarEvent, createCalendarEvent } from "./lib/calendar";

export async function OnboardingAction(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = await parseWithZod(formData, {
    schema: onboardingSchemaValidation({
      async isUsernameUnique() {
        const exisitingUsername = await prisma.user.findUnique({
          where: {
            userName: formData.get("userName") as string,
          },
        });

        return !exisitingUsername;
      },
    }),

    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      userName: submission.value.userName,
      name: submission.value.fullName,
      availability: {
        createMany: {
          data: [
            {
              day: "Monday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Tuesday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Wednesday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Thursday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Friday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Saturday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
            {
              day: "Sunday",
              fromTime: "08:00",
              tillTime: "18:00",
            },
          ],
        },
      },
    },
  });

  return redirect("/onboarding/grant-id");
}

export async function SettingsAction(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: settingsSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const user = await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      name: submission.value.fullName,
      image: submission.value.profileImage,
    },
  });

  return redirect("/dashboard");
}

export async function updateAvailabilityAction(formData: FormData) {
  const session = await requireUser();

  const rawData = Object.fromEntries(formData.entries());

  const availabilityData = Object.keys(rawData)
    .filter((key) => key.startsWith("id-"))
    .map((key) => {
      const id = key.replace("id-", "");

      return {
        id,
        isActive: rawData[`isActive-${id}`] === "on",
        fromTime: rawData[`fromTime-${id}`] as string,
        tillTime: rawData[`tillTime-${id}`] as string,
      };
    });

  try {
    await prisma.$transaction(
      availabilityData.map((item) =>
        prisma.availability.update({
          where: {
            id: item.id,
          },
          data: {
            isActive: item.isActive,
            fromTime: item.fromTime,
            tillTime: item.tillTime,
          },
        })
      )
    );

    revalidatePath("/dashboard/availability");
  } catch (error) {
    console.log(error);
  }
}

export async function CreateEventTypeAction(
  prevState: any,
  formData: FormData
) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: eventTypeSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.eventType.create({
    data: {
      title: submission.value.title,
      duration: submission.value.duration,
      url: submission.value.url,
      description: submission.value.description,
      videoCallSoftware: submission.value.videoCallSoftware,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard");
}

export async function CreateMeetingAction(formData: FormData) {
  const getUserData = await prisma.user.findUnique({
    where: {
      userName: formData.get("username") as string,
    },
    select: {
      id: true,
    },
  });

  if (!getUserData) {
    throw new Error("User not Found");
  }

  // Get user's Google account with access token
  const account = await prisma.account.findFirst({
    where: {
      userId: getUserData.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("Google Calendar not connected");
  }

  const eventTypeData = await prisma.eventType.findUnique({
    where: {
      id: formData.get("eventTypeId") as string,
    },
    select: {
      title: true,
      description: true,
    },
  });

  if (!eventTypeData) {
    throw new Error("Event type not found");
  }

  const fromTime = formData.get("fromTime") as string;
  const eventDate = formData.get("eventDate") as string;
  const meetingLength = Number(formData.get("meetingLength"));
  const provider = formData.get("provider") as string;

  const startDateTime = new Date(`${eventDate}T${fromTime}:00`);
  const endDateTime = new Date(startDateTime.getTime() + meetingLength * 60000);

  await createCalendarEvent(account.access_token, {
    summary: eventTypeData.title || "Meeting",
    description: eventTypeData.description || "",
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "UTC",
    },
    conferenceData: {
      createRequest: {
        requestId: Date.now().toString(),
        conferenceSolutionKey: {
          key: provider === "Microsoft Teams" ? "telechat" : "hangoutsMeet",
        },
      },
    },
    attendees: [
      {
        email: formData.get("email") as string,
        displayName: formData.get("name") as string,
        responseStatus: "accepted",
      },
    ],
  });

  return redirect("/success");
}

export async function cancelMeetingAction(formData: FormData) {
  const session = await requireUser();

  const userData = await prisma.user.findUnique({
    where: {
      id: session.user?.id,
    },
    select: {
      id: true,
    },
  });

  if (!userData) {
    throw new Error("User not found");
  }

  // Get user's Google account with access token
  const account = await prisma.account.findFirst({
    where: {
      userId: userData.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("Google Calendar not connected");
  }

  await deleteCalendarEvent(
    account.access_token,
    formData.get("eventId") as string
  );

  revalidatePath("/dashboard/meetings");
}

export async function EditEventTypeAction(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: eventTypeSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.eventType.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
    data: {
      title: submission.value.title,
      duration: submission.value.duration,
      url: submission.value.url,
      description: submission.value.description,
      videoCallSoftware: submission.value.videoCallSoftware,
    },
  });

  return redirect("/dashboard");
}

export async function UpdateEventTypeStatusAction(
  prevState: any,
  {
    eventTypeId,
    isChecked,
  }: {
    eventTypeId: string;
    isChecked: boolean;
  }
) {
  try {
    const session = await requireUser();

    const data = await prisma.eventType.update({
      where: {
        id: eventTypeId,
        userId: session.user?.id as string,
      },
      data: {
        active: isChecked,
      },
    });

    revalidatePath(`/dashboard`);
    return {
      status: "success",
      message: "EventType Status updated successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Something went wrong",
    };
  }
}

export async function DeleteEventTypeAction(formData: FormData) {
  const session = await requireUser();

  const data = await prisma.eventType.delete({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard");
}
