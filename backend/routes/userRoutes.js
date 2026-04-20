import express from "express";
import {
  getUsers,
  getUserById,
  createUserByAdmin,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.route("/").get(getUsers).post(createUserByAdmin);
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default router;
