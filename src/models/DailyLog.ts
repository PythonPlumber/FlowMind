import mongoose, { type InferSchemaType } from "mongoose";

const DailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    logDate: { type: Date, required: true, index: true },
    periodId: { type: mongoose.Schema.Types.ObjectId, ref: "Period" },
    flow: {
      type: String,
      enum: ["spotting", "light", "medium", "heavy"],
    },
    mood: { type: Number, min: 1, max: 5 },
    notes: { type: String },
    bbt: { type: Number },
    mucusType: { type: String },
    sex: { type: Boolean },
    contraception: { type: String },
  },
  { timestamps: true }
);

DailyLogSchema.index({ userId: 1, logDate: 1 }, { unique: true });

export type DailyLogDoc = InferSchemaType<typeof DailyLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyLog =
  (mongoose.models.DailyLog as mongoose.Model<DailyLogDoc>) ||
  mongoose.model<DailyLogDoc>("DailyLog", DailyLogSchema);

