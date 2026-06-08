require("dotenv").config();
import mongoose, { Model } from "mongoose";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (email: string) => emailRegexPattern.test(email),
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// hash password
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// sign access token
userSchema.methods.SignAccessToken = function () {
  const accessTokenSecret = process.env.ACCESS_TOKEN as string;
  const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES || "5m";

  return jwt.sign({ id: this._id }, accessTokenSecret, {
    expiresIn: accessTokenExpiresIn,
  } as jwt.SignOptions);
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  const refreshTokenSecret = process.env.REFRESH_TOKEN as string;
  const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES || "3d";

  return jwt.sign({ id: this._id }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn,
  } as jwt.SignOptions);
};

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
