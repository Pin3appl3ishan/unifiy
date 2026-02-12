import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { PageSpinner } from "./ui/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <PageSpinner label="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
