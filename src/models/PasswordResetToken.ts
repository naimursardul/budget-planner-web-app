import mongoose, { Schema, type Model } from "mongoose";

export interface IPasswordResetToken {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Only the SHA-256 hash of the token is stored. Someone who reads this
    // collection still cannot build a working reset link.
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    // Set the moment a token is redeemed — a link works exactly once.
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// MongoDB deletes each document once it expires, so spent tokens never pile up.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  (mongoose.models.PasswordResetToken as Model<IPasswordResetToken>) ||
  mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);
