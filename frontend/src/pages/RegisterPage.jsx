import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate("/rooms");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <h2>Tạo tài khoản người dùng</h2>
        <p>Sau khi đăng ký, hệ thống sẽ tự đăng nhập và chuyển đến trang đặt phòng.</p>

        {error && <div className="alert error">{error}</div>}

        <form className="form-grid two-columns" onSubmit={handleSubmit}>
          <label>
            Họ và tên
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>

          <label>
            Số điện thoại
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Mật khẩu
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <label>
            Xác nhận mật khẩu
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-actions full-span">
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <p>
          Đã có tài khoản? <Link to="/login">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
