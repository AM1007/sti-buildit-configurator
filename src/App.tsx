import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider, useTranslation } from "./i18n";
import { useAuthStore } from "./stores/authStore";
import { useProjectStore } from "./stores/projectStore";
import { toast } from "./utils/toast";
import { HomePage } from "./pages/HomePage";
import { ConfiguratorPage } from "./pages/ConfiguratorPage";
import { MyListPage } from "./pages/MyListPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { AccountPage } from "./pages/AccountPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const initialize = useAuthStore((s) => s.initialize);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const guestConfigurations = useProjectStore((s) => s.guestConfigurations);
  const mergeGuestToRemote = useProjectStore((s) => s.mergeGuestToRemote);

  const prevStatusRef = useRef(status);
  const isMergingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    const guestCount = guestConfigurations.length;

    if (
      (prevStatus === "unauthenticated" || prevStatus === "idle") &&
      status === "authenticated" &&
      user &&
      guestCount > 0 &&
      !isMergingRef.current
    ) {
      isMergingRef.current = true;
      mergeGuestToRemote(user.id)
        .then(() => {
          toast.success(
            t("merge.success", { count: String(guestCount) })
          );
        })
        .catch(() => {
          toast.error(t("merge.error"));
        })
        .finally(() => {
          isMergingRef.current = false;
        });
    }
  }, [status, user, guestConfigurations.length, mergeGuestToRemote, t]);

  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === "idle") return null;
  if (status === "authenticated") return <Navigate to="/" replace />;

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === "idle") return null;
  if (status !== "authenticated") return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AuthInitializer>
          <ScrollToTop />
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            <Route
              path="/configurator/:slug"
              element={
                <Layout>
                  <ConfiguratorPage />
                </Layout>
              }
            />

            <Route
              path="/my-list"
              element={
                <Layout>
                  <MyListPage />
                </Layout>
              }
            />

            <Route
              path="/projects"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="/projects/:id"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ProjectDetailPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="/login"
              element={
                <Layout>
                  <GuestOnly>
                    <LoginPage />
                  </GuestOnly>
                </Layout>
              }
            />

            <Route
              path="/register"
              element={
                <Layout>
                  <GuestOnly>
                    <RegisterPage />
                  </GuestOnly>
                </Layout>
              }
            />

            <Route
              path="/reset-password"
              element={
                <Layout>
                  <GuestOnly>
                    <ResetPasswordPage />
                  </GuestOnly>
                </Layout>
              }
            />

            <Route
              path="/account"
              element={
                <Layout>
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;