import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Exploitations from "./pages/Exploitations";
import Parcels from "./pages/Parcels";
import Recommendations from "./pages/Recommendations";
import HistoryRecommendations from "./pages/HistoryRecommendations";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exploitations" element={<Exploitations />} />
          <Route path="/parcels" element={<Parcels />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/histrique-recommandations" element={<HistoryRecommendations />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
