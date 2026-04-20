import express from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.route("/").get(getRooms).post(roleMiddleware("admin"), createRoom);
router
  .route("/:id")
  .get(getRoomById)
  .put(roleMiddleware("admin"), updateRoom)
  .delete(roleMiddleware("admin"), deleteRoom);

export default router;
