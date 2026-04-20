import mongoose, { type InferSchemaType } from "mongoose";

const SymptomDefinitionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export type SymptomDefinitionDoc = InferSchemaType<
  typeof SymptomDefinitionSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const SymptomDefinition =
  (mongoose.models.SymptomDefinition as mongoose.Model<SymptomDefinitionDoc>) ||
  mongoose.model<SymptomDefinitionDoc>(
    "SymptomDefinition",
    SymptomDefinitionSchema
  );

