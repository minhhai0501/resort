import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildConflictQuery, calculateNights, isDateRangeValid } from "../utils/bookingUtils.js";

const populateBooking = (query) =>
  query
    .populate("user", "fullName email phone role")
    .populate("room", "name roomNumber type pricePerNight capacity status");

const makeBookingCode = () => `BK-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

const resolveBookingUserId = async (currentUser, requestedUserId) => {
  if (currentUser.role === "admin" && requestedUserId) {
    const targetUser = await User.findById(requestedUserId);
    if (!targetUser || !targetUser.isActive) {
      const error = new Error("Người dùng mục tiêu không hợp lệ");
      error.statusCode = 400;
      throw error;
    }
    return targetUser._id;
  }

  return currentUser._id;
};

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await populateBooking(
    Booking.find({ user: req.user._id }).sort({ createdAt: -1 })
  );

  res.json(bookings);
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  const bookings = await populateBooking(Booking.find(query).sort({ createdAt: -1 }));
  res.json(bookings);
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await populateBooking(Booking.findById(req.params.id));

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy booking");
  }

  const isOwner = String(booking.user._id) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền xem booking này");
  }

  res.json(booking);
});

export const createBooking = asyncHandler(async (req, res) => {
  const { room: roomId, userId, checkIn, checkOut, guests, specialRequest, status } = req.body;

  if (!roomId || !checkIn || !checkOut || !guests) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ thông tin đặt phòng");
  }

  if (!isDateRangeValid(checkIn, checkOut)) {
    res.status(400);
    throw new Error("Ngày nhận và trả phòng không hợp lệ");
  }

  const room = await Room.findById(roomId);

  if (!room || !room.isActive) {
    res.status(404);
    throw new Error("Không tìm thấy phòng");
  }

  if (Number(guests) > room.capacity) {
    res.status(400);
    throw new Error("Số lượng khách vượt quá sức chứa của phòng");
  }

  const existingConflict = await Booking.findOne(buildConflictQuery(room._id, checkIn, checkOut));

  if (existingConflict) {
    res.status(400);
    throw new Error("Phòng đã được đặt trong khoảng thời gian này");
  }

  const bookingUserId = await resolveBookingUserId(req.user, userId);
  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * room.pricePerNight;

  const booking = await Booking.create({
    bookingCode: makeBookingCode(),
    user: bookingUserId,
    room: room._id,
    checkIn,
    checkOut,
    nights,
    guests,
    totalPrice,
    specialRequest,
    status: req.user.role === "admin" && status ? status : req.user.role === "admin" ? "confirmed" : "pending",
  });

  const populated = await populateBooking(Booking.findById(booking._id));

  res.status(201).json({
    message: "Tạo booking thành công",
    booking: populated,
  });
});

export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy booking");
  }

  const {
    room: roomId,
    userId,
    checkIn,
    checkOut,
    guests,
    specialRequest,
    status,
  } = req.body;

  const room = roomId ? await Room.findById(roomId) : await Room.findById(booking.room);

  if (!room || !room.isActive) {
    res.status(404);
    throw new Error("Không tìm thấy phòng");
  }

  const nextCheckIn = checkIn || booking.checkIn;
  const nextCheckOut = checkOut || booking.checkOut;
  const nextGuests = Number(guests || booking.guests);

  if (!isDateRangeValid(nextCheckIn, nextCheckOut)) {
    res.status(400);
    throw new Error("Ngày nhận và trả phòng không hợp lệ");
  }

  if (nextGuests > room.capacity) {
    res.status(400);
    throw new Error("Số lượng khách vượt quá sức chứa của phòng");
  }

  const hasConflict = await Booking.findOne(
    buildConflictQuery(room._id, nextCheckIn, nextCheckOut, booking._id)
  );

  if (hasConflict) {
    res.status(400);
    throw new Error("Phòng đã được đặt trong khoảng thời gian này");
  }

  const bookingUserId = userId
    ? await resolveBookingUserId(req.user, userId)
    : booking.user;
  const nights = calculateNights(nextCheckIn, nextCheckOut);

  booking.user = bookingUserId;
  booking.room = room._id;
  booking.checkIn = nextCheckIn;
  booking.checkOut = nextCheckOut;
  booking.guests = nextGuests;
  booking.specialRequest = specialRequest ?? booking.specialRequest;
  booking.nights = nights;
  booking.totalPrice = nights * room.pricePerNight;
  if (status) booking.status = status;

  await booking.save();

  const populated = await populateBooking(Booking.findById(booking._id));

  res.json({
    message: "Cập nhật booking thành công",
    booking: populated,
  });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy booking");
  }

  const isOwner = String(booking.user) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Bạn không có quyền hủy booking này");
  }

  if (["checked_in", "checked_out"].includes(booking.status)) {
    res.status(400);
    throw new Error("Booking đã check-in hoặc check-out nên không thể hủy");
  }

  booking.status = "cancelled";
  await booking.save();

  const populated = await populateBooking(Booking.findById(booking._id));

  res.json({
    message: "Hủy booking thành công",
    booking: populated,
  });
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Không tìm thấy booking");
  }

  await booking.deleteOne();
  res.json({ message: "Xóa booking thành công" });
});
