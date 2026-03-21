"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { retrieveForNotifications } from "@/lib/api";
import { emailRules, notificationRules } from "@/lib/validations";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";

interface FormValues {
  teacher: string;
  notification: string;
}

export default function NotificationsSection() {
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<string[] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setToast(null);
    setRecipients(null);
    try {
      const result = await retrieveForNotifications({
        teacher: data.teacher,
        notification: data.notification,
      });
      setRecipients(result.recipients);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message: string })?.message ?? err.message
        : "Something went wrong.";
      setToast({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Retrieve for Notifications</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Teacher Email
          </label>
          <input
            type="text"
            placeholder="teacherken@gmail.com"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.teacher ? "border-red-400" : "border-gray-300"
            }`}
            {...register("teacher", { ...emailRules })}
          />
          {errors.teacher && (
            <p className="mt-1 text-xs text-red-500">{errors.teacher.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Notification Message
          </label>
          <textarea
            placeholder="Hello students! @studentagnes@gmail.com"
            rows={3}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.notification ? "border-red-400" : "border-gray-300"
            }`}
            {...register("notification", { ...notificationRules })}
          />
          {errors.notification && (
            <p className="mt-1 text-xs text-red-500">{errors.notification.message}</p>
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading && <Loader />}
          Get Recipients
        </button>
      </form>

      {recipients !== null && (
        <div className="mt-4">
          {recipients.length === 0 ? (
            <p className="text-sm text-gray-500">No recipients found.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {recipients.map((email) => (
                <li key={email} className="rounded bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
