import { Routes, Route, Navigate } from "react-router-dom";
import { Home }  from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import { Game }  from "./pages/Game";

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Home />} />
      <Route path="/lobby/:game" element={<Lobby />} />
      <Route path="/game/:game"  element={<Game />} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  );
}
