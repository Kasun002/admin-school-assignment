"use client";

import { useState } from "react";
import { EMAIL_REGEX } from "@/lib/validations";

interface EmailListInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  error?: string;
}

export default function EmailListInput({
  value,
  onChange,
  placeholder = "Enter email and press Add",
  error,
}: EmailListInputProps) {
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");

  const add = () => {
    const email = input.trim();
    if (!email) return;
    if (!EMAIL_REGEX.test(email)) {
      setInputError("Enter a valid email address");
      return;
    }
    if (value.includes(email)) {
      setInputError("Email already added");
      return;
    }
    onChange([...value, email]);
    setInput("");
    setInputError("");
  };

  const remove = (email: string) => {
    onChange(value.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setInputError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            inputError || error ? "border-red-400" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border border-gray-300"
        >
          Add
        </button>
      </div>

      {inputError && <p className="text-xs text-red-500">{inputError}</p>}
      {error && !inputError && <p className="text-xs text-red-500">{error}</p>}

      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((email) => (
            <li
              key={email}
              className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-800"
            >
              <span>{email}</span>
              <button
                type="button"
                onClick={() => remove(email)}
                className="ml-2 text-blue-400 hover:text-red-500 font-medium leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
