import mongoose from "mongoose";

const Trading80CallSchema = new mongoose.Schema(
  {
    externalCallId: { type: String, unique: true, index: true },
    symbol: String,
    side: { type: String, enum: ["BUY", "SELL"] },
    entryPrice: Number,
    target: Number,
    stopLoss: Number,
    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED", "REVERSED"],
      index: true,
    },
    createdAtTrading80: Date,
    lastSyncedAt: Date,
    rawPayload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const Trading80Call = mongoose.model(
  "Trading80Call",
  Trading80CallSchema
);
