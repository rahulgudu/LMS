require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";

export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors => corss origin resource sharing
app.use(
  cors({
    origin: process.env.ORIGIN,
  }),
);

// testing route api
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any; // Cast to any here
  err.status = 404;
  next(err);
});
