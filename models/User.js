import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    points: {
      type: Number,
      default: 10,
      min: 0,
    },
    payout: {
      type: Number,
      default: 0,
    },
    alwaysWin: {
      type: Boolean,
      default: false,
    },
    registrationDate: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
