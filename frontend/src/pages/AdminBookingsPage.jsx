import { useEffect, useState } from "react";
import api from "../api.js";
import { formatCurrency, formatDate, formatDateInput, getErrorMessage } from "../utils.js";

const initialForm = {
  userId: "",
  room: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
  status: "pending",
  specialRequest: "",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, usersRes, roomsRes] = await Promise.all([
        api.get("/bookings"),
        api.get("/users?isActive=true"),
        api.get("/rooms?includeInactive=true"),
      ]);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setRooms(roomsRes.data.filter((room) => room.isActive));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        guests: Number(form.guests),
      };

      const response = editingId
        ? await api.put(`/bookings/${editingId}`, payload)
        : await api.post("/bookings", payload);

      setMessage(response.data.message);
      resetForm();
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking._id);
    setForm({
      userId: booking.user?._id || "",
      room: booking.room?._id || "",
      checkIn: formatDateInput(booking.checkIn),
      checkOut: formatDateInput(booking.checkOut),
      guests: booking.guests,
      status: booking.status,
      specialRequest: booking.specialRequest || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/bookings/${id}`);
      setMessage(response.data.message);
      fetchData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Quản lý booking</h2>
          <p>Admin có thể tạo booking hộ khách, sửa trạng thái, đổi ngày và xóa booking.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="panel">
        <div className="section-title-row">
          <h3>{editingId ? "Cập nhật booking" : "Tạo booking mới"}</h3>
          {editingId && (
            <button className="button secondary" onClick={resetForm}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form className="form-grid three-columns" onSubmit={handleSubmit}>
          <label>
            Người dùng
            <select value={form.userId} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))} required>
              <option value="">Chọn người dùng</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName} - {user.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phòng
            <select value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))} required>
              <option value="">Chọn phòng</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber} - {room.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trạng thái
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="checked_in">checked_in</option>
              <option value="checked_out">checked_out</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label>
            Ngày nhận phòng
            <input type="date" value={form.checkIn} onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))} required />
          </label>
          <label>
            Ngày trả phòng
            <input type="date" value={form.checkOut} onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))} required />
          </label>
          <label>
            Số khách
            <input type="number" min="1" value={form.guests} onChange={(e) => setForm((p) => ({ ...p, guests: e.target.value }))} required />
          </label>
          <label className="full-span">
            Yêu cầu đặc biệt
            <input value={form.specialRequest} onChange={(e) => setForm((p) => ({ ...p, specialRequest: e.target.value }))} />
          </label>
          <div className="full-span form-actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : editingId ? "Cập nhật booking" : "Tạo booking"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h3>Danh sách booking</h3>
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu booking...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã booking</th>
                  <th>Khách</th>
                  <th>Phòng</th>
                  <th>Nhận / Trả</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.bookingCode}</td>
                    <td>{booking.user?.fullName}</td>
                    <td>{booking.room?.roomNumber}</td>
                    <td>
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </td>
                    <td>{booking.status}</td>
                    <td>{formatCurrency(booking.totalPrice)}</td>
                    <td className="actions-cell">
                      <button className="button small secondary" onClick={() => handleEdit(booking)}>
                        Sửa
                      </button>
                      <button className="button small danger" onClick={() => handleDelete(booking._id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
