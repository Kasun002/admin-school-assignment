"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { getCommonStudents } from "@/lib/api";
import { emailListRules } from "@/lib/validations";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import EmailListInput from "@/components/ui/EmailListInput";

interface FormValues {
  teachers: string[];
}

export default function CommonStudentsSection() {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<string[] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { teachers: [] } });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setToast(null);
    setStudents(null);
    try {
      const result = await getCommonStudents(data.teachers);
      setStudents(result.students);
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
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Common Students</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Teacher Emails
          </label>
          <Controller
            name="teachers"
            control={control}
            rules={{ ...emailListRules }}
            render={({ field }) => (
              <EmailListInput
                value={field.value}
                onChange={field.onChange}
                placeholder="teacherken@gmail.com"
                error={errors.teachers?.message}
              />
            )}
          />
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading && <Loader />}
          Find Common Students
        </button>
      </form>

      {students !== null && (
        <div className="mt-4">
          {students.length === 0 ? (
            <p className="text-sm text-gray-500">No common students found.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {students.map((email) => (
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
