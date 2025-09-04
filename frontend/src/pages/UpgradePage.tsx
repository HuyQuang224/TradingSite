import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UpgradePage() {
  const navigate = useNavigate();
  const [payment, setPayment] = useState({
    email: "",
    fullName: "",
    amount: "9.99", // mặc định Pro 9.99$
    bank: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const { fetchUserProfile } = useAuth();

  const handleUpgrade = async () => {
    if (!payment.email || !payment.fullName || !payment.amount || !payment.bank) {
      alert("❌ Please fill all payment details");
      return;
    }

    try {
      // Giả lập thanh toán thành công
      const res = await updateProfile({ is_premium: true });
      // Nếu backend trả về token mới, cập nhật vào localStorage và fetch lại profile
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        await fetchUserProfile(res.data.token);
      }
      alert("🎉 Payment successful! Your account is now Pro 🚀");
      navigate("/charts");
    } catch {
      alert("❌ Upgrade failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-10">Upgrade to Pro</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Free Plan */}
          <div className="border rounded-xl p-6 shadow-sm bg-gray-50">
            <h3 className="text-xl font-semibold mb-4">Free</h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Multi-Charts</li>
              <li>All Indicators</li>
              <li>News</li>
            </ul>
            <p className="mt-6 text-lg font-bold text-gray-800">0$/month</p>
          </div>

          {/* Pro Plan */}
          <div className="border rounded-xl p-6 shadow-lg bg-yellow-50">
            <h3 className="text-xl font-semibold mb-4">Pro 🚀</h3>
            <ul className="list-disc ml-6 text-gray-700">
              <li>All Free Feature</li>
              <li>Backtesting Strategies</li>
            </ul>
            <p className="mt-6 text-lg font-bold text-gray-800">$9.99/month</p>
          </div>
        </div>

        {/* Payment form */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              name="email"
              value={payment.email}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
              placeholder="Email"
              type="email"
            />
            <input
              name="fullName"
              value={payment.fullName}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
              placeholder="Full Name"
            />
            <input
              name="amount"
              value={payment.amount}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
              placeholder="Amount"
              type="number"
              min="1"
            />
            <select
              name="bank"
              value={payment.bank}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">-- Select Bank --</option>
              <option value="Vietcombank">Vietcombank</option>
              <option value="Techcombank">Techcombank</option>
              <option value="ACB">ACB</option>
              <option value="VPBank">VPBank</option>
              <option value="MB">MB Bank</option>
            </select>
          </div>
        </div>

        {/* Confirm button */}
        <div className="text-center">
          <button
            onClick={handleUpgrade}
            className="px-8 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
          >
            Confirm Payment & Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
