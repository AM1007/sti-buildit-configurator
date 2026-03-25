import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider, ScrollToTop } from '@shared'
import { Layout } from '@app/layout/Layout'
import { GuestOnly, ProtectedRoute, AuthInitializer } from '@features/auth'

const HomePage = lazy(() =>
  import('@pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const ConfiguratorPage = lazy(() =>
  import('@pages/ConfiguratorPage').then((m) => ({ default: m.ConfiguratorPage })),
)
const MyListPage = lazy(() =>
  import('@pages/MyListPage').then((m) => ({ default: m.MyListPage })),
)
const ProjectsPage = lazy(() =>
  import('@pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  import('@pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const LoginPage = lazy(() =>
  import('@pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const UpdatePasswordPage = lazy(() =>
  import('@pages/UpdatePasswordPage').then((m) => ({ default: m.UpdatePasswordPage })),
)
const AccountPage = lazy(() =>
  import('@pages/AccountPage').then((m) => ({ default: m.AccountPage })),
)
const NotFoundPage = lazy(() =>
  import('@pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

type Guard = 'protected' | 'guest' | null

interface RouteEntry {
  path: string
  component: React.LazyExoticComponent<React.ComponentType>
  guard: Guard
}

const routes: RouteEntry[] = [
  { path: '/', component: HomePage, guard: null },
  { path: '/configurator/:slug', component: ConfiguratorPage, guard: null },
  { path: '/my-list', component: MyListPage, guard: null },
  { path: '/projects', component: ProjectsPage, guard: 'protected' },
  { path: '/projects/:id', component: ProjectDetailPage, guard: 'protected' },
  { path: '/login', component: LoginPage, guard: 'guest' },
  { path: '/register', component: RegisterPage, guard: 'guest' },
  { path: '/reset-password', component: ResetPasswordPage, guard: 'guest' },
  { path: '/update-password', component: UpdatePasswordPage, guard: null },
  { path: '/account', component: AccountPage, guard: 'protected' },
  { path: '*', component: NotFoundPage, guard: null },
]

function wrapWithGuard(element: React.ReactNode, guard: Guard): React.ReactNode {
  if (guard === 'protected') return <ProtectedRoute>{element}</ProtectedRoute>
  if (guard === 'guest') return <GuestOnly>{element}</GuestOnly>
  return element
}

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <AuthInitializer>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={null}>
              <Routes>
                {routes.map(({ path, component: Component, guard }) => (
                  <Route
                    key={path}
                    path={path}
                    element={wrapWithGuard(<Component />, guard)}
                  />
                ))}
              </Routes>
            </Suspense>
          </Layout>
        </AuthInitializer>
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
