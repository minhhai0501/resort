import { useEffect, useState } from "react";
import api from "../api.js";
import { formatCurrency, getErrorMessage } from "../utils.js";

const initialForm = {
  name: "",
  roomNumber: "",
  type: "Standard",
  pricePerNight: "",
  capacity: 1,
  status: "available",
  amenities: "",
  description: "",
  isActive: true,
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rooms?includeInactive=true");
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
        pricePerNight: Number(form.pricePerNight),
        capacity: Number(form.capacity),
      };

      const response = editingId
        ? await api.put(`/rooms/${editingId}`, payload)
        : await api.post("/rooms", payload);

      setMessage(response.data.message);
      resetForm();
      fetchRooms();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name,
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      status: room.status,
      amenities: room.amenities?.join(", ") || "",
      description: room.description || "",
      isActive: room.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/rooms/${id}`);
      setMessage(response.data.message);
      fetchRooms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Quản lý phòng</h2>
          <p>Admin có thể tạo, sửa, ẩn phòng và quản lý trạng thái từng phòng.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="panel">
        <div className="section-title-row">
          <h3>{editingId ? "Cập nhật phòng" : "Thêm phòng mới"}</h3>
          {editingId && (
            <button className="button secondary" onClick={resetForm}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form className="form-grid three-columns" onSubmit={handleSubmit}>
          <label>
            Tên phòng
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </label>
          <label>
            Số phòng
            <input value={form.roomNumber} onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))} required />
          </label>
          <label>
            Loại phòng
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
              <option value="Villa">Villa</option>
            </select>
          </label>
          <label>
            Giá / đêm
            <input type="number" min="0" value={form.pricePerNight} onChange={(e) => setForm((p) => ({ ...p, pricePerNight: e.target.value }))} required />
          </label>
          <label>
            Sức chứa
            <input type="number" min="1" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} required />
          </label>
          <label>
            Trạng thái
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="available">available</option>
              <option value="occupied">occupied</option>
              <option value="maintenance">maintenance</option>
            </select>
          </label>
          <label className="full-span">
            Tiện ích
            <input value={form.amenities} onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))} placeholder="Wifi, Breakfast, Balcony" />
          </label>
          <label className="full-span">
            Mô tả
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows="3" />
          </label>
          <label className="checkbox-inline">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Hiển thị phòng
          </label>
          <div className="full-span form-actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : editingId ? "Cập nhật phòng" : "Thêm phòng"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h3>Danh sách phòng</h3>
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu phòng...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Số phòng</th>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Hiển thị</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td>{room.roomNumber}</td>
                    <td>{room.name}</td>
                    <td>{room.type}</td>
                    <td>{formatCurrency(room.pricePerNight)}</td>
                    <td>{room.status}</td>
                    <td>{room.isActive ? "Có" : "Không"}</td>
                    <td className="actions-cell">
                      <button className="button small secondary" onClick={() => handleEdit(room)}>
                        Sửa
                      </button>
                      <button className="button small danger" onClick={() => handleDelete(room._id)}>
                        Ẩn
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
