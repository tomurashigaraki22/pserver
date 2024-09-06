import express from "express";
import {
  getInevestmetPlanAmount,
  loginFunction,
  signupFunction,
  getBalance,
} from "../controllers/userController.js";
const userRouter = express.Router();
userRouter.post("/signups", signupFunction);
userRouter.post("/logins", loginFunction);
userRouter.post("/getinvestmentdetails", getInevestmetPlanAmount);
userRouter.post("/get_balance", getBalance);
export default userRouter;
