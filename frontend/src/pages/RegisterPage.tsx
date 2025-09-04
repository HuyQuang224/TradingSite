import React, { useState } from "react";
import { registerUser } from "../services/api";
import { User, Mail, Lock, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";   // 👈 thêm dòng này

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        location: "",
    });

    const navigate = useNavigate();   // 👈 khởi tạo hook navigate

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await registerUser(form);
            alert("Register success: " + res.data.user.username);

            // 👇 sau khi đăng ký xong thì chuyển sang login
            navigate("/login");
        } catch (err: any) {
            alert("Register failed: " + err.response?.data?.error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-lg h-176 animate-fade-in"
            >
                <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
                    Create Account
                </h2>

                {/* Username */}
                <div className="relative mb-5">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        name="username"
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Username"
                        required
                    />
                </div>

                {/* Password */}
                <div className="relative mb-5">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="password"
                        name="password"
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Password"
                        required
                    />
                </div>

                {/* Email */}
                <div className="relative mb-5">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Email"
                        required
                    />
                </div>

                {/* First name */}
                <input
                    name="first_name"
                    onChange={handleChange}
                    className="w-full mb-5 px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    placeholder="First Name"
                />

                {/* Last name */}
                <input
                    name="last_name"
                    onChange={handleChange}
                    className="w-full mb-5 px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    placeholder="Last Name"
                />

                {/* Phone */}
                <div className="relative mb-5">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        name="phone"
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Phone"
                    />
                </div>

                {/* Location */}
                <div className="relative mb-6">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        name="location"
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        placeholder="Location"
                    />
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:opacity-90 active:scale-95 transition"
                >
                    Register
                </button>

                {/* Login link */}
                <p className="text-sm text-center mt-6 text-gray-600">
                    Already have an account?{" "}
                    <a
                        href="/login"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Log in
                    </a>
                </p>
            </form>
        </div>
    );
}
