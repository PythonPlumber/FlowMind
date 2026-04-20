import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;

  await dbConnect();

  const exists = await User.findOne({ email }).select({ _id: 1 }).lean();
  if (exists) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email, passwordHash });

  return NextResponse.json({ ok: true });
}

