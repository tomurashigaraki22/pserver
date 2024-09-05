import { conversationModel, messageModel } from "../models/chatModel.js";
import userModel from "../models/userModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
export const SendMessage = async (req, res) => {
  try {
    const { senderEmail, message } = req.body;
    if (!senderEmail || !message)
      return res
        .status(400)
        .json({ error: "Please type all neccessary parameters" });
    const user = await userModel.findOne({ email: senderEmail });
    const convoExists = await conversationModel.findOne({ senderEmail });
    let convoId;
    if (!convoExists) {
      const newConvo = await conversationModel.create({
        senderEmail,
        userId: user._id,
      });
      convoId = newConvo._id;
    } else {
      convoId = convoExists._id;
    }
    const newMessage = await messageModel.create({
      conversationId: convoId,

      message,
    });
    const userSocketId = getRecipientSocketId(user._id);
    io.to(userSocketId).emit("newUserMessage", {
      message,
      sender: newMessage.sender,
    });
    io.emit("adminMessage", {
      message,
    });
    res.status(201).json({ status: "Chat sent", message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const FetchAllMessages = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log(userId);
    if (!userId) return res.status(400).json({ message: "UserID is required" });
    const previouseConversations = await conversationModel.findOne({ userId });
    if (!previouseConversations)
      return res.status(404).json({ message: "No previous conversation" });
    const allMessages = await messageModel
      .find({
        conversationId: previouseConversations._id,
      })
      .select("-conversationId")
      .select("-_id")
      .select("-__v");
    res.status(200).json({ allMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const FetchMessagesForAdmins = async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail)
      return res.status(400).json({ message: "Email is a required field" });
    const userConvos = await conversationModel.findOne({
      senderEmail: userEmail,
    });
    if (!userConvos) return res.status(404);
    const allMessages = await messageModel
      .find({
        conversationId: userConvos._id,
      })
      .select("-conversationId -_id -__v");
    res.status(200).json({ allMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
