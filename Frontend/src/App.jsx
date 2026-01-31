import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateBot from "./pages/CreateBot.jsx";
import BotManager from "./pages/BotManager.jsx";
import BotDetails from "./pages/BotDetails.jsx"; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-bot" element={<CreateBot />} />
        <Route path="/bot" element={<BotManager />} />
        <Route path="/bot-details" element={<BotDetails />} /> {/* [NEW ROUTE] */}
      </Routes>
    </BrowserRouter>
  );
}