import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import IndividualLogin from "./pages/IndividualLogin";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/individual-login" element={<IndividualLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
