import mongoose, { Schema, model } from "mongoose";
const messageSchema = new Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "conversationModel",
  },
  message: {
    type: String,
  },
  sender: {
    type: String,
    required: true,
    default: "You",
  },
  image: {
    type: String,
  },
});
const conversationSchema = new Schema({
  senderEmail: {
    type: String,
    required: true,
  },
  userId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
  },
});
const conversationModel = await model("conversationModel", conversationSchema);
const messageModel = await model("messageModel", messageSchema);
export { conversationModel, messageModel };
