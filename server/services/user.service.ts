import { Response } from "express";
import User from "../models/user.model";
import { redis } from "../utils/redis";

// get user by id service
export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    return res.status(201).json({
      success: true,
      user,
    });
  }
};
