import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Register from "./components/Register";
import Home from "./components/Home";
import CargueMasivo from "./components/CargueMasivo";
import CargueIndividual from "./components/CargueIndividual";
import Resultados from "./components/Resultados";
import ResultadosMasivos from "./components/ResultadosMasivos";

function App() {
  return (
    <Router>
      <Routes>
        {/* Mostrar Login al inicio */}
        <Route path="/" element={<Login />} />

        {/* Ruta explícita para /home */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cargue-masivo" element={<CargueMasivo />} />
        <Route path="/cargue-individual" element={<CargueIndividual />} />
        <Route path="/resultados" element={<Resultados />} />
        <Route path="/resultados-masivos" element={<ResultadosMasivos />} />

        {/* Redirección si no encuentra la ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;