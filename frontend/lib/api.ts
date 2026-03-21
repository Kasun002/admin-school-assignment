import axios from "axios";
import type {
  RegisterPayload,
  SuspendPayload,
  RetrieveNotificationsPayload,
  CommonStudentsResponse,
  NotificationRecipientsResponse,
} from "@/types";

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

export async function registerStudents(payload: RegisterPayload): Promise<void> {
  await client.post("/api/register", payload);
}

export async function getCommonStudents(
  teachers: string[]
): Promise<CommonStudentsResponse> {
  const params = new URLSearchParams();
  teachers.forEach((t) => params.append("teacher", t));
  const { data } = await client.get<CommonStudentsResponse>(
    `/api/commonstudents?${params.toString()}`
  );
  return data;
}

export async function suspendStudent(payload: SuspendPayload): Promise<void> {
  await client.post("/api/suspend", payload);
}

export async function retrieveForNotifications(
  payload: RetrieveNotificationsPayload
): Promise<NotificationRecipientsResponse> {
  const { data } = await client.post<NotificationRecipientsResponse>(
    "/api/retrievefornotifications",
    payload
  );
  return data;
}
