import { useEffect, useState } from "react";
import api from "../api.js";
import { formatCurrency, formatDate, getErrorMessage } from "../utils.js";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: [], rooms: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [usersRes, roomsRes, bookingsRes] = await Promise.all([
          api.get("/users"),
          api.get("/rooms?includeInactive=true"),
          api.get("/bookings"),
        ]);

        setStats({
          users: usersRes.data,
          rooms: roomsRes.data,
          bookings: bookingsRes.data,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="empty-state">Đang tải dashboard quản trị...</div>;
  }

  const activeUsers = stats.users.filter((item) => item.isActive).length;
  const activeRooms = stats.rooms.filter((item) => item.isActive).length;
  const revenue = stats.bookings
    .filter((item) => ["confirmed", "checked_in", "checked_out"].includes(item.status))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Dashboard quản trị</h2>
          <p>Số lượng người dùng, phòng và booking trong hệ thống.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}

      <section className="stats-grid">
        <article className="stat-card">
          <h3>{activeUsers}</h3>
          <p>Người dùng đang hoạt động</p>
        </article>
        <article className="stat-card">
          <h3>{activeRooms}</h3>
          <p>Phòng đang hiển thị</p>
        </article>
        <article className="stat-card">
          <h3>{stats.bookings.length}</h3>
          <p>Tổng số booking</p>
        </article>
        <article className="stat-card">
          <h3>{formatCurrency(revenue)}</h3>
          <p>Doanh thu dự kiến</p>
        </article>
      </section>

      <div className="two-panel-layout">
        <section className="panel">
          <div className="section-title-row">
            <h3>Booking gần đây</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Khách</th>
                  <th>Phòng</th>
                  <th>Ngày nhận</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.bookingCode}</td>
                    <td>{booking.user?.fullName}</td>
                    <td>{booking.room?.roomNumber}</td>
                    <td>{formatDate(booking.checkIn)}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="section-title-row">
            <h3>Tình trạng phòng</h3>
          </div>
          <div className="detail-list spaced">
            <span>Available: {stats.rooms.filter((room) => room.status === "available").length}</span>
            <span>Occupied: {stats.rooms.filter((room) => room.status === "occupied").length}</span>
            <span>Maintenance: {stats.rooms.filter((room) => room.status === "maintenance").length}</span>
            <span>Phòng ẩn: {stats.rooms.filter((room) => !room.isActive).length}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
