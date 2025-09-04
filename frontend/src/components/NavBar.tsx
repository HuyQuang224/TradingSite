import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/charts", label: "Charts" },
    { path: "/news", label: "News" },
    { path: "/backtest", label: "Backtest" },
  ];

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md text-white">
      {/* Left (Brand/Logo) */}
      <div className="text-xl font-extrabold tracking-wide">
        <Link to="/">📊 TradingSite</Link>
      </div>

      {/* Center (Nav Links) */}
      <div className="flex gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`relative font-medium transition 
              hover:opacity-80 ${
                location.pathname === link.path
                  ? "after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[2px] after:bg-white"
                  : ""
              }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right (Auth Section) */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* Username + Pro badge */}
            <Link
              to="/account"
              className="flex items-center gap-2 font-semibold hover:underline"
            >
              {user.username}
              {user.is_premium && (
                <span className="px-2 py-0.5 text-xs bg-yellow-400 text-white rounded-full">
                  PRO
                </span>
              )}
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-4 py-1 bg-red-500 rounded-lg font-medium hover:bg-red-600 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-1 rounded-lg border border-white hover:bg-white hover:text-indigo-600 transition"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-1 bg-white text-indigo-600 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
