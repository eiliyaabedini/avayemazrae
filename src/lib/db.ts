import Dexie, { type EntityTable } from "dexie";
import type { Farm, SprayRecord, User } from "./types";

const db = new Dexie("AvayeMazraeDB") as Dexie & {
  farms: EntityTable<Farm, "id">;
  users: EntityTable<User, "id">;
  sprayRecords: EntityTable<SprayRecord, "id">;
};

db.version(1).stores({
  farms: "++id, name",
  users: "++id, name, pin, role, farmId",
  sprayRecords:
    "++id, farmId, operatorId, fieldName, chemicalName, status, createdAt",
});

export default db;
