import { useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getErrorMessage } from "../utils.js";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoadingProfile(true);

    try {
      const response = await api.put("/auth/me", profileForm);
      setUser(response.data.user);
      setMessage(response.data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoadingPassword(true);

    try {
      const response = await api.put("/auth/change-password", passwordForm);
      setMessage(response.data.message);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <h2>Thông tin cá nhân</h2>
          <p>Cập nhật hồ sơ và đổi mật khẩu của tài khoản đang đăng nhập.</p>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="two-panel-layout">
        <section className="panel">
          <h3>Cập nhật hồ sơ</h3>
          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <label>
              Họ và tên
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Số điện thoại
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </label>
            <button className="button" type="submit" disabled={loadingProfile}>
              {loadingProfile ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </section>

        <section className="panel">
          <h3>Đổi mật khẩu</h3>
          <form className="form-grid" onSubmit={handlePasswordSubmit}>
            <label>
              Mật khẩu hiện tại
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </label>
            <label>
              Mật khẩu mới
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
            </label>
            <button className="button" type="submit" disabled={loadingPassword}>
              {loadingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
