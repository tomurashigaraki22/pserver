import { app, server } from "./socket/socket.js";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import express from "express";
import userRouter from "./routes/userRoutes.js";
import transactionRoute from "./routes/transactionRoutes.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import messageRouter from "./routes/chatRoutes.js";
import adminRouter from "./routes/AdminRoute.js";
dotenv.config();
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST"],
    origin: "http://localhost:5173",
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(express.json({ limit: "50mb" }));
app.use(userRouter);
app.use(messageRouter);
app.use(transactionRoute);
app.use(adminRouter);
const PORT = 8000;

server.listen(PORT, async () => {
  console.log("Listening to port:", PORT);
  await connectDB();
});
