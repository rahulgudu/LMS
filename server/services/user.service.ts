import { Response } from "express";
import User from "../models/user.model";

// get user by id service
export const getUserById = async (id: string, res: Response) => {
  const user = await User.findById(id);
  return res.status(201).json({
    success: true,
    user,
  });
};
