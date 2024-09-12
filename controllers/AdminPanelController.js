import userModel from "../models/userModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";

export const updateUserBalance = async (req, res) => {
  try {
    const { userEmail, newBalance } = req.body;
    console.log(req.body);
    if (!userEmail || !newBalance)
      return res.status(400).json({ message: "Missing required parameters" });
    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    const newBalanceToNumber = parseFloat(newBalance);
    user.balance = newBalanceToNumber;
    await user.save();
    const recipientId = getRecipientSocketId(user._id);
    io.to(recipientId).emit("balanceUpdated", { newBalanceToNumber });
    res.status(200).json({  newBalanceToNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const UpdateInvestmentPlan = async (req, res) => {
  try {
    const { newPlan, userEmail, selectedAmount } = req.body;
    if (!newPlan || !userEmail || !selectedAmount)
      return res.status(400).json({ message: "Missing required parameters" });
    const user = await userModel.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.plan = newPlan;
    user.amount = parseFloat(selectedAmount);
    await user.save();
    const recipienttId = getRecipientSocketId(user._id);
    io.to(recipienttId).emit("planUpdated", {
      updatedPlan: newPlan,
      updatedAmount: parseFloat(selectedAmount),
    });
    res.status(200).json({ message: "Balance updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
