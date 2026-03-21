"use client";

import { useState } from "react";
import RegisterSection from "@/components/RegisterSection";
import CommonStudentsSection from "@/components/CommonStudentsSection";
import NotificationsSection from "@/components/NotificationsSection";
import SuspendModal from "@/components/SuspendModal";

export default function Home() {
  const [suspendOpen, setSuspendOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">School Admin</h1>
            <p className="text-xs text-gray-500 mt-0.5">Teacher administration panel</p>
          </div>
          <button
            onClick={() => setSuspendOpen(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Suspend Student
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RegisterSection />
          <CommonStudentsSection />
        </div>
        <NotificationsSection />
      </main>

      {suspendOpen && <SuspendModal onClose={() => setSuspendOpen(false)} />}
    </div>
  );
}
