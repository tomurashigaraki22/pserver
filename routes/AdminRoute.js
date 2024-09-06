import express from "express";
import {
  UpdateInvestmentPlan,
  updateUserBalance,
} from "../controllers/AdminPanelController.js";
const adminRouter = express.Router();
adminRouter.post("/update_user_balance", updateUserBalance);
adminRouter.post("/update_user_plan", UpdateInvestmentPlan);
export default adminRouter;
