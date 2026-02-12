import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingModal from "./components/Onboarding/OnboardingModal";
import { PageSpinner } from "./components/ui/Spinner";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Canvas = lazy(() => import("./pages/Canvas"));
const SharedScene = lazy(() => import("./pages/SharedScene"));
const Landing = lazy(() => import("./pages/Landing"));

// Root route: logged-in → dashboard, anonymous → canvas
function RootRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <PageSpinner label="Loading..." />;
  }

  // Logged-in users go to dashboard/workspace
  if (user) {
    return <Navigate to="/workspace" replace />;
  }

  // Anonymous users get canvas directly
  return <Canvas isAnonymous />;
}

// Wrapper for authenticated routes - handles onboarding
function AuthenticatedRoutes() {
  const { profile, profileLoading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if profile exists but onboardingComplete is false
    if (profile && !profile.onboardingComplete) {
      setShowOnboarding(true);
    } else if (profile?.onboardingComplete) {
      setShowOnboarding(false);
    }
  }, [profile]);

  // Only show loading if we have no profile AND are actively loading
  // If we already have a profile, keep showing the app (even if refreshing in background)
  // This prevents the "Loading profile" flash on tab switches
  if (!profile && profileLoading) {
    return <PageSpinner label="Loading your profile..." />;
  }

  // Show onboarding modal if needed
  if (showOnboarding) {
    return (
      <OnboardingModal
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  // Render child routes
  return <Outlet />;
}

export default function App() {
  const { initialize, loading } = useAuthStore();

  // Initialize auth on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while initializing auth
  if (loading) {
    return <PageSpinner label="Loading..." />;
  }

  return (
    <Suspense fallback={<PageSpinner label="Loading..." />}>
      <Routes>
        {/* Root: anonymous canvas or redirect to workspace */}
        <Route path="/" element={<RootRoute />} />

        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Shared scene - public access via share token */}
        <Route path="/scene/:sceneId/shared/:token" element={<SharedScene />} />

        {/* Protected routes - wrapped with onboarding check */}
        <Route element={<ProtectedRoute><AuthenticatedRoutes /></ProtectedRoute>}>
          <Route path="/workspace" element={<Dashboard />} />
          <Route path="/scene/:id" element={<Canvas />} />
        </Route>
        <Route
          path="/dashboard"
          element={<Navigate to="/workspace" replace />}
        />
        {/* Legacy route redirect */}
        <Route
          path="/canvas/:id"
          element={<Navigate to="/workspace" replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
