import mongoose, { Schema, type Model } from "mongoose";
import type { CategoryType, Priority } from "@/types";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: CategoryType;
  priority: Priority;
  color: string;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    type: {
      type: String,
      enum: ["income", "expense", "savings", "bill", "debt"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["essential", "high", "moderate", "low", "avoidable"],
      default: "moderate",
    },
    color: { type: String, default: "#C9BCE8" },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ userId: 1, type: 1, order: 1 });
CategorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

export const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema);
