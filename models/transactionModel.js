import mongoose, { Schema, model } from "mongoose";
const transactionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "Deposit",
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    required: true,
    type: String,
  },
});
const transactionModel = await model("transactionModel", transactionSchema);
export default transactionModel;
