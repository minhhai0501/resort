import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import Booking from "./models/Booking.js";

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await Booking.deleteMany();
    await Room.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      fullName: "Resort Admin",
      email: "admin@resort.com",
      password: "admin123",
      phone: "0900000001",
      role: "admin",
    });

    const user = await User.create({
      fullName: "Nguyen Van A",
      email: "user@resort.com",
      password: "user123",
      phone: "0900000002",
      role: "user",
    });

    const rooms = await Room.insertMany([
      {
        name: "Ocean Breeze Standard",
        roomNumber: "A101",
        type: "Standard",
        pricePerNight: 1200000,
        capacity: 2,
        status: "available",
        amenities: ["Wifi", "Breakfast", "Balcony"],
        description: "Phòng tiêu chuẩn hướng vườn, phù hợp cho cặp đôi.",
      },
      {
        name: "Sunset Deluxe",
        roomNumber: "B203",
        type: "Deluxe",
        pricePerNight: 1800000,
        capacity: 3,
        status: "available",
        amenities: ["Wifi", "Breakfast", "Sea View", "Bathtub"],
        description: "Phòng deluxe view biển, nội thất hiện đại.",
      },
      {
        name: "Coral Suite",
        roomNumber: "C305",
        type: "Suite",
        pricePerNight: 2600000,
        capacity: 4,
        status: "available",
        amenities: ["Wifi", "Breakfast", "Sea View", "Mini Bar", "Living Room"],
        description: "Suite cao cấp với phòng khách riêng biệt.",
      },
      {
        name: "Palm Villa",
        roomNumber: "V01",
        type: "Villa",
        pricePerNight: 4200000,
        capacity: 6,
        status: "maintenance",
        amenities: ["Private Pool", "Breakfast", "Kitchen", "Beach Access"],
        description: "Villa riêng tư với hồ bơi và khu bếp nhỏ.",
      },
    ]);

    await Booking.create({
      bookingCode: "BK-SEED-001",
      user: user._id,
      room: rooms[1]._id,
      checkIn: new Date("2026-05-10"),
      checkOut: new Date("2026-05-12"),
      nights: 2,
      guests: 2,
      totalPrice: 3600000,
      status: "confirmed",
      specialRequest: "Giường đôi lớn",
    });

    console.log("Seed dữ liệu thành công");
    console.log("Admin: admin@resort.com / admin123");
    console.log("User : user@resort.com / user123");
    process.exit(0);
  } catch (error) {
    console.error("Seed thất bại", error);
    process.exit(1);
  }
};

seed();
