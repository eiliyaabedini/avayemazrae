"use client";

import { useEffect, useState } from "react";
import db from "@/lib/db";
import type { SprayRecord } from "@/lib/types";

export default function ManagerReview() {
  const [pending, setPending] = useState<SprayRecord[]>([]);

  const load = async () => {
    const all = await db.sprayRecords.where("status").equals("pending_manager").toArray();
    setPending(all);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: number) => {
    await db.sprayRecords.update(id, { status: "approved", updatedAt: new Date() });
    load();
  };

  const reject = async (id: number) => {
    const reason = prompt("دلیل رد رکورد:");
    if (reason === null) return;
    await db.sprayRecords.update(id, {
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    });
    load();
  };

  if (pending.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        هیچ رکوردی در انتظار بررسی نیست ✅
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((r) => (
        <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="mb-2">
            <span className="font-bold text-gray-800">{r.fieldName}</span>
            <span className="text-xs text-gray-400 mr-2">
              {new Date(r.createdAt).toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1 mb-3">
            <p>سم: {r.chemicalName}</p>
            <p>مقدار: {r.amount} {r.unit}</p>
            {r.notes && <p>توضیحات: {r.notes}</p>}
            {r.audioTranscript && (
              <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                رونویسی: {r.audioTranscript}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => approve(r.id!)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors"
            >
              تایید
            </button>
            <button
              onClick={() => reject(r.id!)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors"
            >
              رد
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
