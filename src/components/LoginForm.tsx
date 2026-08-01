"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginForm() {
  const { login } = useAuth();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(pin);
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">آوای مزرعه</h1>
          <p className="text-sm text-gray-500 mt-1">دفترچه ثبت سمپاشی با صدا</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              کد دسترسی (PIN)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className={`w-full text-center text-2xl tracking-[0.5em] border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none ${
                error ? "border-red-500 animate-shake" : "border-gray-300"
              }`}
              placeholder="****"
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">کد دسترسی نادرست است</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            ورود
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">
          اپراتور: 1234 • مدیر: 5678
        </p>
      </div>
    </div>
  );
}
