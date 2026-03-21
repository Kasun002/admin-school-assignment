"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { suspendStudent } from "@/lib/api";
import { emailRules } from "@/lib/validations";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import Toast from "@/components/ui/Toast";

interface FormValues {
  student: string;
}

interface SuspendModalProps {
  onClose: () => void;
}

export default function SuspendModal({ onClose }: SuspendModalProps) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setToast(null);
    try {
      await suspendStudent({ student: data.student });
      setToast({ message: `${data.student} has been suspended.`, type: "success" });
      reset();
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
    <Modal title="Suspend Student" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">
            Student Email
          </label>
          <input
            type="text"
            placeholder="studentmary@gmail.com"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
              errors.student ? "border-red-400" : "border-gray-300"
            }`}
            {...register("student", { ...emailRules })}
          />
          {errors.student && (
            <p className="mt-1 text-xs text-red-500">{errors.student.message}</p>
          )}
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader />}
            Suspend
          </button>
        </div>
      </form>
    </Modal>
  );
}
