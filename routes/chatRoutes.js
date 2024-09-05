import express from "express";
import {
  FetchAllMessages,
  FetchMessagesForAdmins,
  SendMessage,
} from "../controllers/chatController.js";
const messageRouter = express.Router();
messageRouter.post("/new_message", SendMessage);
messageRouter.get("/messages", FetchAllMessages);
messageRouter.post("/admin_messages", FetchMessagesForAdmins);
export default messageRouter;
