import express from "express";
import {
  FetchAllMessages,
  FetchMessagesForAdmins,
  handleAdminImageUpload,
  handleImageUpload,
  sendAdminMessages,
  SendMessage,
} from "../controllers/chatController.js";
const messageRouter = express.Router();
messageRouter.post("/new_message", SendMessage);
messageRouter.get("/messages", FetchAllMessages);
messageRouter.post("/admin_messages", FetchMessagesForAdmins);
messageRouter.post("/upload_image", handleImageUpload);
messageRouter.post("/new_admin_message", sendAdminMessages);
messageRouter.post("/upload_image_admin", handleAdminImageUpload);
export default messageRouter;
