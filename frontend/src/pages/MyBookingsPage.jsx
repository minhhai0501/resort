import { useEffect, useState } from "react";
import api from "../api.js";
import { formatCurrency, formatDate, getErrorMessage } from "../utils.js";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/my");
      setBookings(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setError("");
    setMessage("");

    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      setMessage(response.data.message);
      fetchBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) {
    return <div className="empty-state">Đang tải danh sách booking của bạn...</div>;
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Phòng đã đặt</h2>
          <p>Xem lịch sử booking, trạng thái và tổng chi phí của bạn.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {!bookings.length ? (
        <div className="empty-state">Bạn chưa có booking nào.</div>
      ) : (
        <div className="card-grid">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking._id}>
              <div className="section-title-row">
                <div>
                  <h3>{booking.room?.name}</h3>
                  <p>Mã booking: {booking.bookingCode}</p>
                </div>
                <span className={`badge ${booking.status}`}>{booking.status}</span>
              </div>

              <div className="detail-list">
                <span>Phòng: {booking.room?.roomNumber} · {booking.room?.type}</span>
                <span>Nhận phòng: {formatDate(booking.checkIn)}</span>
                <span>Trả phòng: {formatDate(booking.checkOut)}</span>
                <span>Số đêm: {booking.nights}</span>
                <span>Số khách: {booking.guests}</span>
                <span>Tổng tiền: {formatCurrency(booking.totalPrice)}</span>
                <span>Yêu cầu: {booking.specialRequest || "-"}</span>
              </div>

              {["pending", "confirmed"].includes(booking.status) && (
                <button className="button danger" onClick={() => handleCancel(booking._id)}>
                  Hủy booking
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
