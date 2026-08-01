<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project: آوای مزرعه (AvayeMazrae / FieldVoice)

A voice-driven farm spraying record-keeping PWA for the Iranian agricultural market. Operators log pesticide/fertilizer spraying via natural speech; AI transcribes and extracts structured fields; operators confirm; managers review exceptions.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS v4
- **Language:** TypeScript
- **Offline storage:** Dexie (IndexedDB wrapper) — `src/lib/db.ts`
- **PWA:** next-pwa (installable on mobile)
- **AI transcription:** OpenAI Whisper API (`src/app/api/transcribe/route.ts`)
- **AI field extraction:** Google Gemini (`src/app/api/extract/route.ts`)
- **AI combined (audio → transcript + fields):** Gemini multimodal (`src/app/api/process-audio/route.ts`)

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main app shell: tab nav (Record / List / Review), role-based views
│   ├── globals.css
│   └── api/
│       ├── transcribe/route.ts     # POST: audio → Whisper → transcript
│       ├── extract/route.ts        # POST: transcript → Gemini → structured JSON fields
│       └── process-audio/route.ts  # POST: audio → Gemini multimodal → transcript + extracted fields
├── components/
│   ├── VoiceRecorder.tsx       # MediaRecorder API mic recording
│   ├── RecordForm.tsx          # Voice + manual entry form, auto-fills from AI extraction
│   ├── RecordList.tsx          # Lists all spray records
│   ├── ManagerReview.tsx       # Manager exception inbox (approve/reject)
│   ├── LoginForm.tsx           # PIN-based authentication
│   └── SeedData.tsx            # Seeds initial demo data (farms, users)
└── lib/
    ├── db.ts                   # Dexie database: farms, users, sprayRecords
    ├── types.ts                # TypeScript interfaces: User, Farm, SprayRecord
    └── auth-context.tsx        # Auth context provider (PIN-based)
```

## Data Model (`src/lib/types.ts`)

- **User** — `id`, `name`, `pin`, `role` (`"operator" | "manager"`), `farmId`, `createdAt`
- **Farm** — `id`, `name`, `createdAt`
- **SprayRecord** — `farmId`, `operatorId`, `fieldName`, `chemicalName`, `amount`, `unit`, `notes`, `audioBlob?`, `audioTranscript?`, `rawVoiceInput?`, `status` (`"draft" | "pending_manager" | "approved" | "rejected"`), `rejectionReason?`, `createdAt`, `updatedAt`, `source` (`"voice" | "manual"`)

## Key Conventions

- **Language:** UI text is in Persian/Farsi. All user-facing strings should remain in Persian.
- **Direction:** RTL layout (right-aligned inputs, `text-right` classes).
- **Storage:** All data is stored locally in the browser via Dexie/IndexedDB. There is no remote database in the MVP.
- **Auth:** PIN-based, stored in IndexedDB. No JWT or remote auth in the MVP.
- **AI pipeline:** `RecordForm` calls `/api/process-audio` (combined transcription + extraction). The separate `/api/transcribe` and `/api/extract` routes exist for step-by-step processing if needed.
- **Environment variables:** `OPENAI_API_KEY` (Whisper), `GEMINI_API_KEY` (Gemini). These are server-side only.

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Workflow (from PRD)

1. **Record voice or manual entry** (even offline)
2. **AI transcribes & extracts structured fields**
3. **Automatic validation** (completeness/contradiction)
4. **Operator confirms** the draft
5. **Manager reviews exceptions** (incomplete/contradictory records)
6. **Final approval & export** (PDF/CSV — not yet implemented)

## Out of Scope (MVP)

- Pesticide recommendation or legal compliance validation
- Full farm management (ERP)
- Continuous recording or worker surveillance
- Multi-language / multi-country support
