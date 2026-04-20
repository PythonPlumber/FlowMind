import mongoose, { type InferSchemaType } from "mongoose";

const DailyLogSymptomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    dailyLogId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "DailyLog",
    },
    symptomKey: { type: String },
    customSymptomId: { type: mongoose.Schema.Types.ObjectId, ref: "CustomSymptom" },
    severity: { type: Number, min: 0, max: 3, default: 1 },
  },
  { timestamps: true }
);

DailyLogSymptomSchema.index({ userId: 1, dailyLogId: 1 });

export type DailyLogSymptomDoc = InferSchemaType<
  typeof DailyLogSymptomSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyLogSymptom =
  (mongoose.models.DailyLogSymptom as mongoose.Model<DailyLogSymptomDoc>) ||
  mongoose.model<DailyLogSymptomDoc>("DailyLogSymptom", DailyLogSymptomSchema);

