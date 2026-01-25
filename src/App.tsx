import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./i18n";
import { HomePage } from "./pages/HomePage";
import { ConfiguratorPage } from "./pages/ConfiguratorPage";
import { MyListPage } from "./pages/MyListPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
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
            path="*"
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}

export default App;