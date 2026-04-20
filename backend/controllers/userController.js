import User from "../models/User.js";
import Booking from "../models/Booking.js";
import asyncHandler from "../utils/asyncHandler.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getUsers = asyncHandler(async (req, res) => {
  const { keyword, role, isActive } = req.query;
  const query = {};

  if (keyword) {
    query.$or = [
      { fullName: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
      { phone: { $regex: keyword, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (typeof isActive !== "undefined") {
    query.isActive = isActive === "true";
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  res.json(users.map(sanitizeUser));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  res.json(sanitizeUser(user));
});

export const createUserByAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error("Email đã được sử dụng");
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    phone,
    role: role || "user",
  });

  res.status(201).json({
    message: "Tạo người dùng thành công",
    user: sanitizeUser(user),
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, role, isActive } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
    if (emailExists) {
      res.status(400);
      throw new Error("Email đã được sử dụng");
    }
    user.email = email.toLowerCase();
  }

  if (typeof fullName !== "undefined") user.fullName = fullName;
  if (typeof phone !== "undefined") user.phone = phone;
  if (typeof role !== "undefined") user.role = role;
  if (typeof isActive !== "undefined") user.isActive = isActive;

  await user.save();

  res.json({
    message: "Cập nhật người dùng thành công",
    user: sanitizeUser(user),
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    res.status(400);
    throw new Error("Không thể tự xóa chính mình");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  const activeBooking = await Booking.findOne({
    user: user._id,
    status: { $in: ["pending", "confirmed", "checked_in"] },
  });

  if (activeBooking) {
    res.status(400);
    throw new Error("Người dùng đang có booking hoạt động, không thể xóa");
  }

  user.isActive = false;
  await user.save();

  res.json({ message: "Khóa người dùng thành công" });
});
