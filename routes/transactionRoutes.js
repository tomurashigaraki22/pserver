import express from "express";
import { updateBalance } from "../controllers/transactionController.js";
const transactionRoute = express.Router();
transactionRoute.post("/update_balance", updateBalance);
export default transactionRoute;
