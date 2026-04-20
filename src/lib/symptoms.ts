import { dbConnect } from "@/lib/db";
import { SymptomDefinition } from "@/models/SymptomDefinition";

export const DEFAULT_SYMPTOMS: Array<{
  key: string;
  label: string;
  category: string;
}> = [
  { key: "cramps", label: "Cramps", category: "pain" },
  { key: "headache", label: "Headache", category: "pain" },
  { key: "back_pain", label: "Back pain", category: "pain" },
  { key: "bloating", label: "Bloating", category: "body" },
  { key: "fatigue", label: "Fatigue", category: "energy" },
  { key: "nausea", label: "Nausea", category: "body" },
  { key: "acne", label: "Acne", category: "skin" },
  { key: "breast_tenderness", label: "Breast tenderness", category: "body" },
  { key: "mood_swings", label: "Mood swings", category: "mood" },
  { key: "anxiety", label: "Anxiety", category: "mood" },
  { key: "sadness", label: "Sadness", category: "mood" },
  { key: "insomnia", label: "Trouble sleeping", category: "sleep" },
];

const globalForSeed = globalThis as unknown as { __symptomsSeeded?: boolean };

export async function ensureDefaultSymptomsSeeded() {
  if (globalForSeed.__symptomsSeeded) return;
  await dbConnect();

  await Promise.all(
    DEFAULT_SYMPTOMS.map((s) =>
      SymptomDefinition.updateOne(
        { key: s.key },
        { $set: { label: s.label, category: s.category } },
        { upsert: true }
      )
    )
  );

  globalForSeed.__symptomsSeeded = true;
}

