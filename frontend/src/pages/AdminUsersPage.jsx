import { useEffect, useState } from "react";
import api from "../api.js";
import { getErrorMessage } from "../utils.js";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  isActive: true,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      const payload = editingId
        ? {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            role: form.role,
            isActive: form.isActive,
          }
        : form;

      const response = editingId
        ? await api.put(`/users/${editingId}`, payload)
        : await api.post("/users", payload);

      setMessage(response.data.message);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (id) => {
    setError("");
    setMessage("");

    try {
      const response = await api.delete(`/users/${id}`);
      setMessage(response.data.message);
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Quản lý người dùng</h2>
          <p>Admin tạo tài khoản, cập nhật vai trò và khóa tài khoản khi cần.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <section className="panel">
        <div className="section-title-row">
          <h3>{editingId ? "Cập nhật người dùng" : "Tạo người dùng mới"}</h3>
          {editingId && (
            <button className="button secondary" onClick={resetForm}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form className="form-grid three-columns" onSubmit={handleSubmit}>
          <label>
            Họ và tên
            <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </label>
          <label>
            Số điện thoại
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </label>
          {!editingId && (
            <label>
              Mật khẩu
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
            </label>
          )}
          <label>
            Vai trò
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label className="checkbox-inline">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Tài khoản hoạt động
          </label>
          <div className="full-span form-actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : editingId ? "Cập nhật người dùng" : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h3>Danh sách người dùng</h3>
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu người dùng...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Vai trò</th>
                  <th>Hoạt động</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>{user.role}</td>
                    <td>{user.isActive ? "Có" : "Không"}</td>
                    <td className="actions-cell">
                      <button className="button small secondary" onClick={() => handleEdit(user)}>
                        Sửa
                      </button>
                      <button className="button small danger" onClick={() => handleDeactivate(user._id)}>
                        Khóa
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
