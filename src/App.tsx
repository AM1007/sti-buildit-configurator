import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MyListPage } from "./pages/MyListPage";
import { Layout } from "./components/Layout";

function ConfiguratorRedirect() {
  const { modelSlug } = useParams<{ modelSlug: string }>();
  
  // TODO: Add scroll-to-configurator after redirect if needed
  return <Navigate to={`/?model=${modelSlug}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
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
          path="/configurator/:modelSlug"
          element={<ConfiguratorRedirect />}
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
              <HomePage />
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;