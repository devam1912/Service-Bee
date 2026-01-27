import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GlobalChat from "./pages/GlobalChat";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/global-chat" element={<GlobalChat />} />
      </Route>
    </Routes>
  );
}
