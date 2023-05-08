import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide a name"],
    minlength: 3,
    maxLength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "please provide a valid email"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "please provide a valid email",
    },
  },
  password: { type: String, required: [true, "please provide a password"] },
  lastName: { type: String, maxlength: 20, default: "last name" },
  location: { type: String, default: "my city", trim: true, maxLength: 20 },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcryptjs.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("User", UserSchema);
