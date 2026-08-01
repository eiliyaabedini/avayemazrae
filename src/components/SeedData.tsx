"use client";

import { useEffect } from "react";
import db from "@/lib/db";

export default function SeedData() {
  useEffect(() => {
    const seed = async () => {
      const farmCount = await db.farms.count();
      if (farmCount === 0) {
        await db.farms.add({ name: "مزرعه نمونه", createdAt: new Date() });
      }
      const userCount = await db.users.count();
      if (userCount === 0) {
        await db.users.bulkAdd([
          {
            name: "اپراتور ۱",
            pin: "1234",
            role: "operator",
            farmId: 1,
            createdAt: new Date(),
          },
          {
            name: "مدیر مزرعه",
            pin: "5678",
            role: "manager",
            farmId: 1,
            createdAt: new Date(),
          },
        ]);
      }
    };
    seed();
  }, []);
  return null;
}
