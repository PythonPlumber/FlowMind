import mongoose, { type InferSchemaType } from "mongoose";

const PeriodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

PeriodSchema.index({ userId: 1, startDate: -1 });

export type PeriodDoc = InferSchemaType<typeof PeriodSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Period =
  (mongoose.models.Period as mongoose.Model<PeriodDoc>) ||
  mongoose.model<PeriodDoc>("Period", PeriodSchema);

