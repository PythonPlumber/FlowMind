import mongoose, { type InferSchemaType } from "mongoose";

const AIRateLimitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
      enum: ["ai_analysis", "ai_chat"],
      index: true,
    },
    windowStart: {
      type: Date,
      required: true,
      index: true,
    },
    resetAt: {
      type: Date,
      required: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: false }
);

AIRateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });
AIRateLimitSchema.index({ userId: 1, action: 1, windowStart: 1 }, { unique: true });

export type AIRateLimitDoc = InferSchemaType<typeof AIRateLimitSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AIRateLimit =
  (mongoose.models.AIRateLimit as mongoose.Model<AIRateLimitDoc>) ||
  mongoose.model<AIRateLimitDoc>("AIRateLimit", AIRateLimitSchema);
