import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.put("/change-password", authMiddleware, changePassword);
router.post("/logout", authMiddleware, logout);

export default router;
