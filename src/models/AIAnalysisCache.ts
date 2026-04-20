import mongoose, { type InferSchemaType } from "mongoose";

const AIAnalysisCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    analysisType: {
      type: String,
      required: true,
      enum: ["pattern_detection", "health_coaching", "emotional_support", "monthly_summary", "symptom_suggestion"],
      index: true,
    },
    dataHash: {
      type: String,
      required: true,
      index: true,
    },
    response: {
      type: String,
      required: true,
    },
    metadata: {
      cyclesAnalyzed: { type: Number },
      dateRange: {
        from: { type: Date },
        to: { type: Date },
      },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// TTL index to automatically delete expired cache entries
AIAnalysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster cache lookups
AIAnalysisCacheSchema.index({ userId: 1, analysisType: 1, dataHash: 1 });

export type AIAnalysisCacheDoc = InferSchemaType<typeof AIAnalysisCacheSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AIAnalysisCache =
  (mongoose.models.AIAnalysisCache as mongoose.Model<AIAnalysisCacheDoc>) ||
  mongoose.model<AIAnalysisCacheDoc>("AIAnalysisCache", AIAnalysisCacheSchema);
