import mongoose, { type InferSchemaType } from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
      ref: "User",
    },
    birthYear: { type: Number },
    cycleLengthTypical: { type: Number, default: 28 },
    periodLengthTypical: { type: Number, default: 5 },
    goalMode: {
      type: String,
      enum: ["track", "conceive", "avoid"],
      default: "track",
    },
    onboardingCompleted: { type: Boolean, default: false },
    ageGroup: {
      type: String,
      enum: ["teen", "adult"],
      default: null,
    },
    aiPreferences: {
      toneStyle: {
        type: String,
        enum: ["gentle", "encouraging", "celebratory"],
        default: "encouraging",
      },
      privacyMode: {
        type: String,
        enum: ["full_analysis", "patterns_only"],
        default: "full_analysis",
      },
      emotionalSupportLevel: {
        type: String,
        enum: ["minimal", "moderate", "full"],
        default: "full",
      },
      lastAIInteraction: { type: Date },
    },
    gamification: {
      currentStreak: { type: Number, default: 0 },
      bestStreak: { type: Number, default: 0 },
      totalLogs: { type: Number, default: 0 },
      achievements: [{ type: String }],
    },
  },
  { timestamps: true }
);

export type ProfileDoc = InferSchemaType<typeof ProfileSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Profile =
  (mongoose.models.Profile as mongoose.Model<ProfileDoc>) ||
  mongoose.model<ProfileDoc>("Profile", ProfileSchema);

