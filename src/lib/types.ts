export type UserRole = "operator" | "manager";

export interface User {
  id?: number;
  name: string;
  pin: string;
  role: UserRole;
  farmId: number;
  createdAt: Date;
}

export interface Farm {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface SprayRecord {
  id?: number;
  farmId: number;
  operatorId: number;
  fieldName: string;
  chemicalName: string;
  amount: number;
  unit: string;
  notes: string;
  audioBlob?: Blob;
  audioTranscript?: string;
  rawVoiceInput?: string;
  status: "draft" | "pending_manager" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  source: "voice" | "manual";
}
