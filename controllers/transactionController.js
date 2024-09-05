import { now } from "mongoose";
import transactionModel from "../models/transactionModel.js";
import userModel from "../models/userModel.js";
import { io } from "../socket/socket.js";

export const updateBalance = async (req, res) => {
  try {
    const { email, amount, username, plan } = req.body;

    // Log the request body
    console.log("Request body:", req.body);

    // Validate input
    if (!email || !amount || !username) {
      console.log("Invalid input:", { email, amount, username });
      return res.status(400).json({ message: "Invalid input" });
    }

    // Convert amount to number
    const amountAsNumber = parseFloat(amount);
    if (isNaN(amountAsNumber)) {
      console.log("Invalid amount:", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Find user
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(404).json({ message: "No user found" });
    }

    // Log current balance
    console.log(
      "Current balance for user:",
      user.email,
      "Balance:",
      user.balance
    );

    //Only update balance after transaction has been confirmed
    /* const newBalance = user.balance + amountAsNumber;
    user.balance = newBalance; */
    const now = new Date();
    const newTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newTransaction = await transactionModel.create({
      userId: user._id,
      status: "Pending",
      type: "Deposit",
      date: new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now),
      time: newTime,
    });
    await user.transactions.push(newTransaction._id);
    await user.save();

    //Send socket response
    io.to(user._id).emit({
      status: 200,
      message: "Balance updated successfully.",
    });

    // Send response
    res.status(200).json({
      message: "Balance updated successfully!",
      status: 200,
      amount: amountAsNumber /* 
      newBalance: newBalance, */,
    });
  } catch (err) {
    // Log error
    console.error("Error updating balance:", err);
    res.status(500).json({ message: "Error updating balance" });
  }
};
