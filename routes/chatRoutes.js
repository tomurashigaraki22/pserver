import express from "express";
import {
  FetchAllMessages,
  FetchMessagesForAdmins,
  sendAdminMessages,
  SendMessage,
} from "../controllers/chatController.js";
const messageRouter = express.Router();
messageRouter.post("/new_message", SendMessage);
messageRouter.get("/messages", FetchAllMessages);
messageRouter.post("/admin_messages", FetchMessagesForAdmins);
messageRouter.post("/new_admin_message", sendAdminMessages);
export default messageRouter;
