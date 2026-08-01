"use client";

import { useState } from "react";
import type { SprayRecord } from "@/lib/types";
import VoiceRecorder from "./VoiceRecorder";

interface RecordFormProps {
  onSubmit: (record: Omit<SprayRecord, "id" | "createdAt" | "updatedAt">) => void;
  farmId: number;
  operatorId: number;
}

export default function RecordForm({ onSubmit, farmId, operatorId }: RecordFormProps) {
  const [fieldName, setFieldName] = useState("");
  const [chemicalName, setChemicalName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("لیتر");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState<"voice" | "manual">("manual");
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>();
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceRecording = async (blob: Blob) => {
    setAudioBlob(blob);
    setSource("voice");
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const res = await fetch("/api/process-audio", {
        method: "POST",
        body: formData,
      });
      const { transcript: text, extracted } = await res.json();
      setTranscript(text);

      if (extracted.fieldName) setFieldName(extracted.fieldName);
      if (extracted.chemicalName) setChemicalName(extracted.chemicalName);
      if (extracted.amount) setAmount(String(extracted.amount));
      if (extracted.unit) setUnit(extracted.unit);
      if (extracted.notes) setNotes(extracted.notes);
    } catch {
      alert("پردازش صدا با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!fieldName || !chemicalName || !amount) {
      alert("لطفاً فیلدهای ضروری را پر کنید.");
      return;
    }
    onSubmit({
      farmId,
      operatorId,
      fieldName,
      chemicalName,
      amount: parseFloat(amount),
      unit,
      notes,
      audioBlob,
      audioTranscript: transcript,
      rawVoiceInput: transcript,
      status: "pending_manager",
      source,
    });
    setFieldName("");
    setChemicalName("");
    setAmount("");
    setUnit("لیتر");
    setNotes("");
    setAudioBlob(undefined);
    setTranscript("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">ثبت سمپاشی</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
          {source === "voice" ? "🎙 صوتی" : "⌨️ دستی"}
        </span>
      </div>

      <div className="flex justify-center">
        <VoiceRecorder onRecordingComplete={handleVoiceRecording} disabled={isProcessing} />
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-amber-600 animate-pulse">
          در حال پردازش صدا...
        </div>
      )}

      {transcript && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p className="font-bold text-xs text-gray-400 mb-1">رونویسی:</p>
          {transcript}
        </div>
      )}

      <div className="space-y-3">
        <input
          type="text"
          placeholder="نام زمین *"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
        <input
          type="text"
          placeholder="نام سم / کود *"
          value={chemicalName}
          onChange={(e) => setChemicalName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="مقدار *"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            <option value="لیتر">لیتر</option>
            <option value="کیلوگرم">کیلوگرم</option>
            <option value="گرم">گرم</option>
            <option value="ml">ml</option>
          </select>
        </div>
        <textarea
          placeholder="توضیحات (اختیاری)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
      >
        ثبت رکورد
      </button>
    </div>
  );
}
