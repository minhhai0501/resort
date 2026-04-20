import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency, getErrorMessage } from "../utils.js";

const initialBookingState = {
  checkIn: "",
  checkOut: "",
  guests: 1,
  specialRequest: "",
};

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ keyword: "", type: "", status: "" });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingForm, setBookingForm] = useState(initialBookingState);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchKeyword =
        !filters.keyword ||
        room.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(filters.keyword.toLowerCase());
      const matchType = !filters.type || room.type === filters.type;
      const matchStatus = !filters.status || room.status === filters.status;
      return matchKeyword && matchType && matchStatus;
    });
  }, [rooms, filters]);

  const handleBook = async (event) => {
    event.preventDefault();
    if (!selectedRoom) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/bookings", {
        room: selectedRoom._id,
        ...bookingForm,
      });
      setMessage(response.data.message);
      setSelectedRoom(null);
      setBookingForm(initialBookingState);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Đang tải danh sách phòng...</div>;
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Danh sách phòng</h2>
          <p>{user.role === "admin" ? "Admin xem nhanh tình trạng phòng" : "Chọn phòng và đặt trực tiếp sau khi đăng nhập"}</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="panel filter-grid">
        <label>
          Từ khóa
          <input
            placeholder="Tên phòng hoặc số phòng"
            value={filters.keyword}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
          />
        </label>
        <label>
          Loại phòng
          <select value={filters.type} onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}>
            <option value="">Tất cả</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Villa">Villa</option>
          </select>
        </label>
        <label>
          Trạng thái
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="">Tất cả</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </label>
      </section>

      <section className="card-grid">
        {filteredRooms.map((room) => (
          <article className="room-card" key={room._id}>
            <div className="room-card-top">
              <div>
                <h3>{room.name}</h3>
                <p>Phòng {room.roomNumber} · {room.type}</p>
              </div>
              <span className={`badge ${room.status}`}>{room.status}</span>
            </div>
            <p>{room.description || "Không có mô tả"}</p>
            <div className="detail-list">
              <span>Giá: {formatCurrency(room.pricePerNight)} / đêm</span>
              <span>Sức chứa: {room.capacity} khách</span>
              <span>Tiện ích: {room.amenities?.join(", ") || "-"}</span>
            </div>

            {user.role !== "admin" && room.status === "available" && (
              <button className="button" onClick={() => setSelectedRoom(room)}>
                Đặt phòng này
              </button>
            )}
          </article>
        ))}
      </section>

      {!filteredRooms.length && <div className="empty-state">Không có phòng phù hợp với bộ lọc hiện tại.</div>}

      {selectedRoom && user.role !== "admin" && (
        <section className="panel booking-panel">
          <div className="section-title-row">
            <div>
              <h3>Đặt phòng: {selectedRoom.name}</h3>
              <p>Phòng {selectedRoom.roomNumber} · Giá {formatCurrency(selectedRoom.pricePerNight)} / đêm</p>
            </div>
            <button className="button secondary" onClick={() => setSelectedRoom(null)}>
              Đóng
            </button>
          </div>

          <form className="form-grid two-columns" onSubmit={handleBook}>
            <label>
              Ngày nhận phòng
              <input
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                required
              />
            </label>
            <label>
              Ngày trả phòng
              <input
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                required
              />
            </label>
            <label>
              Số khách
              <input
                type="number"
                min="1"
                max={selectedRoom.capacity}
                value={bookingForm.guests}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, guests: e.target.value }))}
                required
              />
            </label>
            <label>
              Yêu cầu đặc biệt
              <input
                value={bookingForm.specialRequest}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, specialRequest: e.target.value }))}
                placeholder="Ví dụ: giường đôi, tầng cao..."
              />
            </label>
            <div className="full-span form-actions">
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? "Đang gửi booking..." : "Xác nhận đặt phòng"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
