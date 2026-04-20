import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingScreen from "./LoadingScreen.jsx";

export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/rooms"} replace />;
  }

  return children;
}
