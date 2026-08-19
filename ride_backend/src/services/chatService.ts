import { prisma } from "../config/prisma.js";

export interface RideMember {
  id: number;
  name: string | null;
}

export interface MessageInput {
  rideID: number;
  user_id: number;
  name: string | null;
  message: string;
  timestamp?: Date;
}

export interface FormattedChatMessage {
  rideId: string;
  user_id: string;
  name: string | null;
  message: string;
  timestamp: string;
}

/**
 * Get all members of a ride (creator + accepted requesters).
 */
export async function getRideMembers({ rideID }: { rideID: number }): Promise<RideMember[]> {
  const ride = await prisma.rides.findUnique({
    where: { rideID },
    select: { createdBy: true },
  });
  if (!ride) return [];

  const acceptedRequests = await prisma.requests.findMany({
    where: { rideID, requestStatus: "Accepted" },
    select: { requestBy: true },
  });

  const memberIds = [ride.createdBy, ...acceptedRequests.map((r) => r.requestBy)];

  return prisma.users.findMany({
    where: { id: { in: memberIds } },
    select: { id: true, name: true },
  });
}

/**
 * Persist a chat message to the groupChat table.
 */
export async function addMessage({ rideID, user_id, name, message, timestamp }: MessageInput): Promise<void> {
  const ts = timestamp ?? new Date();
  const messageTime = ts.toTimeString().split(" ")[0];
  const messageDate = ts.toISOString().split("T")[0];

  await prisma.groupChat.create({
    data: {
      rideID,
      rideOwner: name,
      messageBy: user_id,
      message,
      messageTime,
      messageDate,
    },
  });
}

/**
 * Fetch all messages for a ride in chronological order (oldest to newest).
 */
export async function getOlderMessages({ rideID }: { rideID: number }): Promise<FormattedChatMessage[]> {
  const messages = await prisma.groupChat.findMany({
    where: { rideID },
    include: {
      sender: { select: { name: true } },
    },
    orderBy: [{ messageDate: "asc" }, { messageTime: "asc" }, { id: "asc" }],
  });

  return messages.map((m) => ({
    rideId: String(m.rideID),
    user_id: String(m.messageBy),
    name: m.sender?.name ?? m.rideOwner ?? "Unknown",
    message: m.message,
    timestamp: `${m.messageDate} ${m.messageTime}`,
  }));
}
