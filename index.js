import { app, server } from "./socket/socket.js";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import express from "express";
import userRouter from "./routes/userRoutes.js";
import transactionRoute from "./routes/transactionRoutes.js";
import cors from "cors";
import messageRouter from "./routes/chatRoutes.js";
dotenv.config();
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST"],
    origin: "http://localhost:5173",
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(userRouter);
app.use(messageRouter);
app.use(transactionRoute);
const PORT = 8000;

server.listen(PORT, async () => {
  console.log("Listening to port:", PORT);
  await connectDB();
});
