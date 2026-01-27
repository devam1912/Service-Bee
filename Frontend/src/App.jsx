import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import GlobalChat from "./pages/GlobalChat";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/global"
        element={
          user ? (
            <Layout>
              <GlobalChat />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route path="*" element={<Navigate to="/global" />} />
    </Routes>
  );
}
