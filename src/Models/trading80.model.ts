import mongoose from "mongoose";

const Trading80CallSchema = new mongoose.Schema(
  {
    providerCallId: { type: String, unique: true, index: true },

    symbol: { type: String, index: true },

    side: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },

    entryPrice: { type: Number, required: true },

    targetReturnPercent: Number,

    stopLossPrice: Number,

    tradeStatus: {
      type: String,
      enum: ["OPEN", "CLOSED", "REVERSED"],
      index: true,
      required: true,
    },

    signalGeneratedAt: Date,

    lastSyncedAt: Date,
  },
  { timestamps: true }
);

export const Trading80Call = mongoose.model(
  "Trading80Call",
  Trading80CallSchema
);
