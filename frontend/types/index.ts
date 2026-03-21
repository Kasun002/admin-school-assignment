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

export interface StudentWithTeachers {
  email: string;
  isSuspended: boolean;
  teachers: string[];
}

export interface PaginatedStudentsResponse {
  data: StudentWithTeachers[];
  total: number;
  page: number;
  limit: number;
}
