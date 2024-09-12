import { conversationModel, messageModel } from "../models/chatModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
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
    console.log(user._id);
    const userSocketId = getRecipientSocketId(user._id);
    io.to(userSocketId).emit("newMessage", {
      message,
      sender: newMessage.sender,
    });
    console.log(userSocketId);

    io.emit("adminMessage", {
      message,
      sender: newMessage.sender,
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
    if (!userConvos) {
      console.log("Convos not found");
      return res
        .status(404)
        .json({ message: "This user have not sent you a message" });
    }
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
export const sendAdminMessages = async (req, res) => {
  try {
    const { message, recipientEmail } = req.body;
    console.log(req.body);
    if (!message || !recipientEmail)
      return res.status(400).json({ message: "Missing required parameters" });
    const userExists = await userModel.findOne({ email: recipientEmail });
    if (!userExists) return res.status(404).json({ message: "User not found" });
    let convoExists = await conversationModel.findOne({
      senderEmail: recipientEmail,
    });
    let convoId;
    if (convoExists) {
      convoId = convoExists._id;
    } else {
      const newConvo = await conversationModel.create({
        senderEmail: recipientEmail,
        userId: userExists._id,
      });
      convoId = newConvo._id;
    }
    const newMessage = await messageModel.create({
      conversationId: convoId,
      message,
      sender: "Support",
    });
    const recipientSocketId = getRecipientSocketId(userExists._id);
    io.to(recipientSocketId).emit("newMessage", {
      message,
      sender: newMessage.sender,
    });
    io.emit("adminMessage", { message, sender: newMessage.sender });
    res.status(200).json({ newMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const handleImageUpload = async (req, res) => {
  try {
    // Extract imageBase and senderEmail from the request body
    const { imageBase, senderEmail } = req.body;

    // Ensure imageBase and senderEmail are present
    if (!imageBase || !senderEmail) {
      return res
        .status(400)
        .json({ message: "No image file or sender email provided" });
    }

    const user = await userModel.findOne({ email: senderEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const convo = await conversationModel.findOne({ senderEmail });
    let convoId;
    if (!convo) {
      const newConvo = await conversationModel.create({
        userEmail: senderEmail,
        userId: user._id,
      });
      convoId = newConvo._id;
    } else {
      convoId = convo._id;
    }

    const imageBase64 = imageBase.startsWith("data:image")
      ? imageBase
      : `data:image/jpeg;base64,${imageBase}`;
    const handleUpload = await cloudinary.uploader.upload(imageBase64, {
      folder: "images",
      upload_preset: "ml_default", // Add your upload preset if necessary
    });

    const imageUrl = handleUpload.secure_url;

    // Create a new message with the image URL
    const newMessage = await messageModel.create({
      image: imageUrl,
      conversationId: convoId,
    });

    // Notify recipient via socket
    const recipientSocketId = getRecipientSocketId(user._id);
    io.to(recipientSocketId).emit("newImage", {
      sender: newMessage.sender,
      image: newMessage.image,
    });
    io.emit("newAdminImage", {
      sender: newMessage.sender,
      image: newMessage.image,
    });

    // Respond to the client
    res.status(200).json({ message: "Image sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const handleAdminImageUpload = async (req, res) => {
  try {
    const { imageBase, senderEmail } = req.body;

    if (!imageBase || !senderEmail) {
      return res
        .status(400)
        .json({ message: "No image file or sender email provided" });
    }

    const user = await userModel.findOne({ email: senderEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const convo = await conversationModel.findOne({ senderEmail });
    let convoId;
    if (!convo) {
      const newConvo = await conversationModel.create({
        userEmail: senderEmail,
        userId: user._id,
      });
      convoId = newConvo._id;
    } else {
      convoId = convo._id;
    }

    const imageBase64 = imageBase.startsWith("data:image")
      ? imageBase
      : `data:image/jpeg;base64,${imageBase}`;
    const handleUpload = await cloudinary.uploader.upload(imageBase64, {
      folder: "images",
      upload_preset: "ml_default", // Add your upload preset if necessary
    });

    const imageUrl = handleUpload.secure_url;

    // Create a new message with the image URL
    const newMessage = await messageModel.create({
      image: imageUrl,
      conversationId: convoId,
      sender: "Support",
    });

    // Notify recipient via socket
    const recipientSocketId = getRecipientSocketId(user._id);
    io.to(recipientSocketId).emit("newImage", {
      sender: newMessage.sender,
      image: newMessage.image,
    });
    io.emit("newAdminImage", {
      sender: newMessage.sender,
      image: newMessage.image,
    });

    // Respond to the client
    res.status(200).json({ message: "Image sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
