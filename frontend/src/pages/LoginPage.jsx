import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(form);
      navigate(response.user.role === "admin" ? "/admin" : "/rooms");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng nhập hệ thống</h2>
        <p>Người dùng và admin đều phải đăng nhập trước khi thao tác.</p>

        {error && <div className="alert error">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Mật khẩu
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

      

        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
