import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import HomeRedirect from "./pages/HomeRedirect.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminRoomsPage from "./pages/AdminRoomsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminBookingsPage from "./pages/AdminBookingsPage.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

function PublicOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/rooms"} replace />;
  return children;
}

function NotFoundPage() {
  return (
    <div className="empty-state">
      <h2>Không tìm thấy trang</h2>
      <p>Đường dẫn bạn vừa truy cập không tồn tại.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginPage />
              </PublicOnly>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnly>
                <RegisterPage />
              </PublicOnly>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomeRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <RoomsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <AdminDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/rooms"
            element={
              <RoleRoute role="admin">
                <AdminRoomsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleRoute role="admin">
                <AdminUsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <RoleRoute role="admin">
                <AdminBookingsPage />
              </RoleRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
