import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a structured data extractor for farm spraying records.
Given a Persian/Arabic voice transcript about agricultural spraying, extract the following fields:
- fieldName: name of the field/land (string)
- chemicalName: name of the pesticide/chemical used (string)
- amount: numeric amount (number)
- unit: unit of measurement like "لیتر", "کیلوگرم", "گرم" (string)
- notes: any additional notes (string)

Rules:
- If a field is not mentioned, use null
- Always respond with valid JSON only, no markdown
- Example: {"fieldName":"زمین شمالی","chemicalName":"کارباریل","amount":2.5,"unit":"لیتر","notes":""}`;

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nTranscript: ${transcript}` }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const extracted = JSON.parse(text);

    return NextResponse.json({ extracted });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
