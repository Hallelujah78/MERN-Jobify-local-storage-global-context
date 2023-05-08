import {
  login,
  register,
  logout,
  updateUser,
} from "../controllers/authController.js";
import express from "express";
import testUser from "../middleware/testUser.js";
import authenticateUser from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 1000 * 60,
  max: 10,
  message: "Too many requests from this IP, please try again after 15 minute",
});

const router = express.Router();

router.route("/login").post(apiLimiter, login);
router.route("/register").post(apiLimiter, register);

router.route("/updateUser").patch(authenticateUser, testUser, updateUser);

export default router;
