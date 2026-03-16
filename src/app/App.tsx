import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider, GuestOnly, ProtectedRoute, Layout, ScrollToTop } from '@shared'
import { AuthInitializer } from '@features'
import {
  HomePage,
  MyListPage,
  ProjectsPage,
  ProjectDetailPage,
  ConfiguratorPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  UpdatePasswordPage,
  AccountPage,
  NotFoundPage,
} from '@pages'

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
  )
}

export default App
