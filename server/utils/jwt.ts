require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

// Parse out the leading numbers from "5m" and "3d"
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRES || "5", 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRES || "3", 10);

// Dynamic calculation to avoid stale "Date.now()"
// Adjust the math below (* 60 * 1000 for minutes, or * 24 * 60 * 60 * 1000 for days) depending on your .env style
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 1000), // e.g., minutes to ms
  maxAge: accessTokenExpire * 60 * 1000,
  httpOnly: true,
  sameSite: "none", // only for codespaces, in production it should be "lax" or "strict"
  secure: true, // only for codespaces, in production it should be removed
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000), // e.g., days to ms
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "none", // only for codespaces, in production it should be "lax" or "strict"
  secure: true, // only for codespaces, in production it should be removed
};

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // Upload session to redis
  redis.set(user._id.toString(), JSON.stringify(user));

  // Turn on production overrides if needed
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
