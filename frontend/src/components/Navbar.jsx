import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div>
          <h1>Resort Booking</h1>
          <p>{user.role === "admin" ? "Quản trị hệ thống" : "Khách hàng đã đăng nhập"}</p>
        </div>
      </div>

      <nav className="navbar-links">
        {user.role === "admin" ? (
          <>
            <NavLink to="/admin">Dashboard</NavLink>
            <NavLink to="/admin/rooms">Quản lý phòng</NavLink>
            <NavLink to="/admin/users">Quản lý người dùng</NavLink>
            <NavLink to="/admin/bookings">Quản lý booking</NavLink>
            <NavLink to="/profile">Tài khoản</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/rooms">Đặt phòng</NavLink>
            <NavLink to="/my-bookings">Phòng đã đặt</NavLink>
            <NavLink to="/profile">Thông tin cá nhân</NavLink>
          </>
        )}
      </nav>

      <div className="navbar-user">
        <div>
          <strong>{user.fullName}</strong>
          <span>{user.email}</span>
        </div>
        <button className="button secondary small" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
