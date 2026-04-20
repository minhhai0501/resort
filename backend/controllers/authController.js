import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

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

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(400);
    throw new Error("Email đã được sử dụng");
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    phone,
  });

  const token = generateToken(user);

  res.status(201).json({
    message: "Đăng ký thành công",
    token,
    user: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Vui lòng nhập email và mật khẩu");
  }

  const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const token = generateToken(user);

  res.json({
    message: "Đăng nhập thành công",
    token,
    user: sanitizeUser(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const { fullName, phone, email } = req.body;
  const user = await User.findById(req.user._id);

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

  user.fullName = fullName ?? user.fullName;
  user.phone = phone ?? user.phone;

  await user.save();

  res.json({
    message: "Cập nhật thông tin thành công",
    user: sanitizeUser(user),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(400);
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Đổi mật khẩu thành công" });
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
});
