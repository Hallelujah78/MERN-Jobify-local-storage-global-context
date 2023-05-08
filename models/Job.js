import mongoose from "mongoose";
import User from "./User.js";

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "please provide a company"],
      maxLength: 50,
    },
    position: {
      type: String,
      required: [true, "please provide a position"],
      maxLength: 100,
    },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time",
    },
    location: {
      type: String,
      required: [true, "please provide a value for location"],
      default: "my city",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "please provide a user"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
