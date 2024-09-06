import mongoose, { Schema, model } from "mongoose";
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    required: true,
    type: String,
  },
  number: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
    required: false,
  },
  amount: {
    type: String,
    required: true,
    default: "0",
  },
  balance: {
    type: Number,
    required: true,
    default: 0.0,
  },
  transactions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "transactionModel" },
  ],
});
const userModel = await model("userModel", userSchema);
export default userModel;
