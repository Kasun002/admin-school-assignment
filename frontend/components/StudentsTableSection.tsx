"use client";

import { useCallback, useEffect, useState } from "react";
import { getStudents } from "@/lib/api";
import type { PaginatedStudentsResponse } from "@/types";
import Loader from "@/components/ui/Loader";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function StudentsTableSection() {
  const [data, setData] = useState<PaginatedStudentsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number, l: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStudents(p, l);
      setData(result);
    } catch {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page, limit);
  }, [load, page, limit]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  function handleLimitChange(newLimit: number) {
    setPage(1);
    setLimit(newLimit);
  }

  return (
    <div className="rounded-lg bg-white shadow-sm border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">All Students</h2>
        <button
          onClick={() => void load(page, limit)}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <svg
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Registered Teachers</th>
            </tr>
          </thead>
          <tbody>
            {loading && !data && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center">
                  <Loader />
                </td>
              </tr>
            )}
            {!loading && data?.data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
            {data?.data.map((student) => (
              <tr
                key={student.email}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-mono text-gray-700">
                  {student.email}
                </td>
                <td className="px-4 py-3">
                  {student.isSuspended ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {student.teachers.length === 0 ? (
                    <span className="text-gray-400 italic">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {student.teachers.map((t) => (
                        <span
                          key={t}
                          className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="rounded border px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span>
              {data.total === 0
                ? "0 results"
                : `${(page - 1) * limit + 1}–${Math.min(
                    page * limit,
                    data.total
                  )} of ${data.total}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1 || loading}
              className="rounded border px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || loading}
              className="rounded border px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || loading}
              className="rounded border px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || loading}
              className="rounded border px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
