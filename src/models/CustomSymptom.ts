import mongoose, { type InferSchemaType } from "mongoose";

const CustomSymptomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    label: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

CustomSymptomSchema.index({ userId: 1, label: 1 }, { unique: true });

export type CustomSymptomDoc = InferSchemaType<typeof CustomSymptomSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CustomSymptom =
  (mongoose.models.CustomSymptom as mongoose.Model<CustomSymptomDoc>) ||
  mongoose.model<CustomSymptomDoc>("CustomSymptom", CustomSymptomSchema);

