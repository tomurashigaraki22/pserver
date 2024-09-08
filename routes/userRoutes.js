import express from "express";
import {
  getInevestmetPlanAmount,
  loginFunction,
  signupFunction,
  getBalance,
  referralBonus,
} from "../controllers/userController.js";
const userRouter = express.Router();
userRouter.post("/signups", signupFunction);
userRouter.post("/logins", loginFunction);
userRouter.post("/getinvestmentdetails", getInevestmetPlanAmount);
userRouter.post("/get_balance", getBalance);
userRouter.post("/referral_claim", referralBonus);
export default userRouter;
