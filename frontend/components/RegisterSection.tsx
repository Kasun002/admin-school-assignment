"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { registerStudents } from "@/lib/api";
import { emailRules, emailListRules } from "@/lib/validations";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";
import EmailListInput from "@/components/ui/EmailListInput";

interface FormValues {
  teacher: string;
  students: string[];
}

export default function RegisterSection() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { students: [] } });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setToast(null);
    try {
      await registerStudents({ teacher: data.teacher, students: data.students });
      setToast({ message: "Students registered successfully.", type: "success" });
      reset({ teacher: "", students: [] });
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
      <h2 className="mb-4 text-lg font-semibold text-gray-700">Register Students</h2>
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
            Student Emails
          </label>
          <Controller
            name="students"
            control={control}
            rules={{ ...emailListRules }}
            render={({ field }) => (
              <EmailListInput
                value={field.value}
                onChange={field.onChange}
                placeholder="studentjon@gmail.com"
                error={errors.students?.message}
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
          Register
        </button>
      </form>
    </section>
  );
}
