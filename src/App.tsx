import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { AuthInitializer } from "./components/AuthInitializer";
import { GuestOnly, ProtectedRoute } from "./components/RouteGuards";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { ConfiguratorPage } from "./pages/ConfiguratorPage";
import { MyListPage } from "./pages/MyListPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { UpdatePasswordPage } from "./pages/UpdatePasswordPage";
import { AccountPage } from "./pages/AccountPage";
import { NotFoundPage } from "./pages/NotFoundPage";

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
              path="/update-password"
              element={
                <Layout>
                  <UpdatePasswordPage />
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