import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getRooms = asyncHandler(async (req, res) => {
  const { type, status, minPrice, maxPrice, keyword, includeInactive } = req.query;
  const query = {};

  if (!(req.user?.role === "admin" && includeInactive === "true")) {
    query.isActive = true;
  }

  if (type) query.type = type;
  if (status) query.status = status;
  if (minPrice || maxPrice) {
    query.pricePerNight = {};
    if (minPrice) query.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
  }
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { roomNumber: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  const rooms = await Room.find(query).sort({ createdAt: -1 });
  res.json(rooms);
});

export const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room || !room.isActive) {
    res.status(404);
    throw new Error("Không tìm thấy phòng");
  }

  res.json(room);
});

export const createRoom = asyncHandler(async (req, res) => {
  const { name, roomNumber, type, pricePerNight, capacity, status, amenities, description, image } = req.body;

  if (!name || !roomNumber || !type || !pricePerNight || !capacity) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ thông tin phòng");
  }

  const existingRoom = await Room.findOne({ roomNumber });
  if (existingRoom) {
    res.status(400);
    throw new Error("Số phòng đã tồn tại");
  }

  const room = await Room.create({
    name,
    roomNumber,
    type,
    pricePerNight,
    capacity,
    status: status || "available",
    amenities: Array.isArray(amenities)
      ? amenities
      : String(amenities || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    description,
    image,
  });

  res.status(201).json({
    message: "Tạo phòng thành công",
    room,
  });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Không tìm thấy phòng");
  }

  const { name, roomNumber, type, pricePerNight, capacity, status, amenities, description, image, isActive } = req.body;

  if (roomNumber && roomNumber !== room.roomNumber) {
    const existingRoom = await Room.findOne({ roomNumber, _id: { $ne: room._id } });
    if (existingRoom) {
      res.status(400);
      throw new Error("Số phòng đã tồn tại");
    }
  }

  if (typeof name !== "undefined") room.name = name;
  if (typeof roomNumber !== "undefined") room.roomNumber = roomNumber;
  if (typeof type !== "undefined") room.type = type;
  if (typeof pricePerNight !== "undefined") room.pricePerNight = pricePerNight;
  if (typeof capacity !== "undefined") room.capacity = capacity;
  if (typeof status !== "undefined") room.status = status;
  if (typeof amenities !== "undefined") {
    room.amenities = Array.isArray(amenities)
      ? amenities
      : String(amenities || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
  }
  if (typeof description !== "undefined") room.description = description;
  if (typeof image !== "undefined") room.image = image;
  if (typeof isActive !== "undefined") room.isActive = isActive;

  await room.save();

  res.json({
    message: "Cập nhật phòng thành công",
    room,
  });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    res.status(404);
    throw new Error("Không tìm thấy phòng");
  }

  const activeBooking = await Booking.findOne({
    room: room._id,
    status: { $in: ["pending", "confirmed", "checked_in"] },
  });

  if (activeBooking) {
    res.status(400);
    throw new Error("Phòng đang có booking hoạt động, không thể xóa");
  }

  room.isActive = false;
  await room.save();

  res.json({ message: "Ẩn phòng thành công" });
});
