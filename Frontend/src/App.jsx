import { Routes, Route } from "react-router-dom";
import Container from "./components/Container.jsx";
import Nav from "./components/Nav.jsx";
import Home from "./pages/Home.jsx";
import GlobalChat from "./pages/GlobalChat.jsx";

export default function App() {
  return (
    <Container>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/global" element={<GlobalChat />} />
      </Routes>
    </Container>
  );
}
