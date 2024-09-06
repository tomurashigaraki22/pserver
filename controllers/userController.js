import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import signToken from "../utils/helpers/signToken.js";
export const signupFunction = async (req, res) => {
  try {
    const { email, password, number } = req.body;
    console.log(req.body);

    // Validate input
    if (!email || !password || !number) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Convert email to lowercase and number to integer
    const emailLower = email.toLowerCase();
    const numberInt = Number(number);

    // Check if the email or number already exists
    const userExists = await userModel.findOne({
      $or: [{ email: emailLower }, { number: numberInt }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "An account with this credential already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Extract username from email
    const username = emailLower.split("@")[0];

    // Create a new user
    const newUser = await userModel.create({
      email: emailLower,
      password: hashedPassword,
      number: numberInt,
      username,
    });

    // Sign token and send response
    const token = signToken({
      email: emailLower,
      password: hashedPassword,
      number: numberInt,
      balance: 0.0,
      amount: "0",
      username,
    });
    res.status(201).json({ message: "User registered successfully!", token });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ message: err.message });
  }
};
export const loginFunction = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please fill all fields" });
    const userExists = await userModel
      .findOne({ email })
      .populate({ path: "transactions" });
    if (!userExists) return res.status(404).json({ message: "User not found" });
    const passwordValid = await bcrypt.compare(password, userExists.password);
    if (!passwordValid)
      return res.status(400).json({ message: "Invalid email or password" });
    const jwt = signToken({ userExists });
    res.status(200).json({ message: "Login Successful!", token: jwt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getBalance = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await userModel.findOne({ email });
    if (!user.balance)
      return res
        .status(404)
        .json({ message: "No balance found for this user" });

    res.status(200).json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getInevestmetPlanAmount = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ plan: user.plan, amount: user.amount });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
