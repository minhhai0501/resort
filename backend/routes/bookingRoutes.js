import express from "express";
import {
  getMyBookings,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
} from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/my", getMyBookings);
router.put("/:id/cancel", cancelBooking);
router.route("/").get(roleMiddleware("admin"), getAllBookings).post(createBooking);
router
  .route("/:id")
  .get(getBookingById)
  .put(roleMiddleware("admin"), updateBooking)
  .delete(roleMiddleware("admin"), deleteBooking);

export default router;
