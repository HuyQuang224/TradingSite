import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await loginUser(form);
            // API trả về { token, user }
            await login(res.data.token); // 👈 chỉ cần token, AuthContext sẽ fetch /auth/me
            navigate("/charts");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-96 animate-fade-in"
            >
                <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
                    Welcome Back
                </h2>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Username */}
                <div className="relative mb-5">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Username"
                        required
                    />
                </div>

                {/* Password */}
                <div className="relative mb-6">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Password"
                        required
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-70"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} /> Logging in...
                        </>
                    ) : (
                        "Log in"
                    )}
                </button>

                {/* Register link */}
                <p className="text-sm text-center mt-6 text-gray-600">
                    Don’t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </form>
        </div>
    );
}
