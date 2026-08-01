"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import LoginForm from "@/components/LoginForm";
import { useState, useEffect } from "react";
import db from "@/lib/db";
import RecordForm from "@/components/RecordForm";
import RecordList from "@/components/RecordList";
import ManagerReview from "@/components/ManagerReview";
import SeedData from "@/components/SeedData";
import type { SprayRecord } from "@/lib/types";

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [tab, setTab] = useState<"record" | "list" | "review">("record");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <LoginForm />;

  const handleNewRecord = async (record: Omit<SprayRecord, "id" | "createdAt" | "updatedAt">) => {
    await db.sprayRecords.add({
      ...record,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SprayRecord);
    setTab("list");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-emerald-700">آوای مزرعه</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {user.role === "manager" ? "📋 مدیر" : "🚜 اپراتور"}
            </span>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-24">
        {tab === "record" && user.role === "operator" && (
          <RecordForm
            onSubmit={handleNewRecord}
            farmId={user.farmId}
            operatorId={user.id!}
          />
        )}
        {tab === "record" && user.role === "manager" && (
          <div className="text-center text-gray-400 py-10">
            <p className="text-lg mb-2">📋 مدیر مزرعه</p>
            <p className="text-sm">از تب‌های زیر برای بررسی استثناها استفاده کنید</p>
          </div>
        )}
        {tab === "list" && <RecordList />}
        {tab === "review" && user.role === "manager" && <ManagerReview />}
        {tab === "review" && user.role === "operator" && (
          <div className="text-center text-gray-400 py-10">
            <p>فقط مدیر مزرعه به این بخش دسترسی دارد</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setTab("record")}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              tab === "record" ? "text-emerald-600 border-t-2 border-emerald-600" : "text-gray-400"
            }`}
          >
            🎙 ثبت
          </button>
          <button
            onClick={() => setTab("list")}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              tab === "list" ? "text-emerald-600 border-t-2 border-emerald-600" : "text-gray-400"
            }`}
          >
            📋 رکوردها
          </button>
          {user.role === "manager" && (
            <button
              onClick={() => setTab("review")}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                tab === "review" ? "text-emerald-600 border-t-2 border-emerald-600" : "text-gray-400"
              }`}
            >
              ✅ بررسی
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <SeedData />
      <AppContent />
    </AuthProvider>
  );
}
