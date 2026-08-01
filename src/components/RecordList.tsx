"use client";

import { useEffect, useState } from "react";
import db from "@/lib/db";
import type { SprayRecord } from "@/lib/types";

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "پیش‌نویس", color: "bg-gray-100 text-gray-600" },
  pending_manager: { label: "در انتظار بررسی", color: "bg-amber-100 text-amber-700" },
  approved: { label: "تایید شده", color: "bg-green-100 text-green-700" },
  rejected: { label: "رد شده", color: "bg-red-100 text-red-700" },
};

export default function RecordList({ operatorId }: { operatorId?: number }) {
  const [records, setRecords] = useState<SprayRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      let all = await db.sprayRecords.orderBy("createdAt").reverse().toArray();
      if (operatorId) all = all.filter((r) => r.operatorId === operatorId);
      setRecords(all);
    };
    load();
  }, [operatorId]);

  if (records.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">هنوز رکوردی ثبت نشده</div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((r) => {
        const s = statusLabels[r.status] || statusLabels.draft;
        return (
          <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800">{r.fieldName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>
                {s.label}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p> سم: {r.chemicalName}</p>
              <p> مقدار: {r.amount} {r.unit}</p>
              {r.notes && <p>توضیحات: {r.notes}</p>}
              <p className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleString("fa-IR")} •{" "}
                {r.source === "voice" ? "🎙 صوتی" : "⌨️ دستی"}
              </p>
              {r.status === "rejected" && r.rejectionReason && (
                <p className="text-xs text-red-500 mt-1"> دلیل رد: {r.rejectionReason}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
