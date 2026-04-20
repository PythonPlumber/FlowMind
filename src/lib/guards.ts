import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

export async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/auth/sign-in");

  await dbConnect();
  const userExists = await User.findById(userId).select({ _id: 1 }).lean();
  if (!userExists) redirect("/auth/sign-in");

  return userId;
}

export async function getProfileForUser(userId: string) {
  await dbConnect();
  return Profile.findOne({ userId }).lean();
}

export async function requireOnboardedProfile() {
  const userId = await requireUserId();
  const profile = await getProfileForUser(userId);
  if (!profile?.onboardingCompleted) redirect("/onboarding");
  return { userId, profile };
}

