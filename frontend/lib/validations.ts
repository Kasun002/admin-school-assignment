export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailRules = {
  required: "Email is required",
  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
} as const;

export const emailListRules = {
  validate: (val: string[]) =>
    (val && val.length > 0) || "Add at least one email",
} as const;

export const notificationRules = {
  required: "Notification message is required",
  minLength: { value: 1, message: "Notification message cannot be empty" },
} as const;
