export interface RegisterPayload {
  teacher: string;
  students: string[];
}

export interface SuspendPayload {
  student: string;
}

export interface RetrieveNotificationsPayload {
  teacher: string;
  notification: string;
}

export interface CommonStudentsResponse {
  students: string[];
}

export interface NotificationRecipientsResponse {
  recipients: string[];
}

export interface ApiError {
  message: string;
}
