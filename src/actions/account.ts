"use server";

import { AIAnalysisCache } from "@/models/AIAnalysisCache";
import { AIRateLimit } from "@/models/AIRateLimit";
import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { CustomSymptom } from "@/models/CustomSymptom";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

export async function deleteAccountAction() {
  const userId = await requireUserId();
  await dbConnect();

  await Promise.all([
    Profile.deleteOne({ userId }),
    Period.deleteMany({ userId }),
    DailyLog.deleteMany({ userId }),
    DailyLogSymptom.deleteMany({ userId }),
    CustomSymptom.deleteMany({ userId }),
    AIAnalysisCache.deleteMany({ userId }),
    AIRateLimit.deleteMany({ userId }),
  ]);

  await User.deleteOne({ _id: userId });

  return { ok: true as const };
}
