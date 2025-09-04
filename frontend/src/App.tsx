import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ChartPage from "./pages/ChartPage";
import NewsPage from "./pages/NewsPage";
import BacktestPage from "./pages/BacktestPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import UpgradePage from "./pages/UpgradePage";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <NavBar/>
                <Routes>
                    <Route path="/" element={<Navigate to="/charts" />} />
                    <Route path="/charts" element={<ChartPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/backtest" element={<BacktestPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/upgrade" element={<UpgradePage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
