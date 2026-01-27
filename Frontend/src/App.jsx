import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GlobalChat from "./pages/GlobalChat";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/global-chat" element={<GlobalChat />} />
      </Route>
    </Routes>
  );
}

export default App;
