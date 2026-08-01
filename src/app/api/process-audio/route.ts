import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const PROMPT = `You are a farm spraying record assistant. The user will send you a voice recording in Persian/Farsi about agricultural spraying.

Your job:
1. First, transcribe the audio exactly as spoken.
2. Then extract structured fields from the transcript.

Respond with this exact JSON structure (no markdown, no code fences):
{
  "transcript": "the full Persian transcription",
  "extracted": {
    "fieldName": "نام زمین",
    "chemicalName": "نام سم یا کود",
    "amount": 0,
    "unit": "لیتر",
    "notes": "توضیحات اضافی"
  }
}

Rules:
- If a field is not mentioned, use null for strings and 0 for numbers
- Default unit to "لیتر" if not specified
- Keep notes in Persian
- Respond ONLY with valid JSON`;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = audioFile.type || "audio/webm;codecs=opus";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const parsed = JSON.parse(text);
    return NextResponse.json({
      transcript: parsed.transcript,
      extracted: parsed.extracted,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
