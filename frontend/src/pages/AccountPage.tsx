import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, changePassword } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function AccountPage() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then((res) => {
      setProfile(res.data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfile(profile);
      alert("✅ Profile updated!");
    } catch {
      alert("❌ Update failed");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword(passwords);
      alert("✅ Password changed!");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch {
      alert("❌ Password change failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Account Management
            {profile.is_premium && (
              <span className="ml-3 px-3 py-1 text-xs font-semibold bg-yellow-400 text-white rounded-full">
                PRO
              </span>
            )}
          </h2>
        </div>

        {/* Profile form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input name="email" value={profile.email || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="Email" />
          <input name="phone" value={profile.phone || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="Phone" />
          <input name="first_name" value={profile.first_name || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="First Name" />
          <input name="last_name" value={profile.last_name || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="Last Name" />
          <input name="company" value={profile.company || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="Company" />
          <input name="city" value={profile.city || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="City" />
          <input name="state" value={profile.state || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="State" />
          <input name="location" value={profile.location || ""} onChange={handleChange} className="px-3 py-2 border rounded-lg" placeholder="Location" />
        </div>

        <textarea
          name="about"
          value={profile.about || ""}
          onChange={handleChange}
          className="w-full mb-6 px-3 py-2 border rounded-lg"
          placeholder="About you"
          rows={3}
        />

        <button onClick={handleSave} className="w-full bg-indigo-500 text-white py-2 rounded-lg mb-8 font-semibold hover:bg-indigo-600 transition">
          Save Profile
        </button>

        {/* Change password */}
        <h3 className="text-xl font-semibold mb-4">Change Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          value={passwords.oldPassword}
          onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
          className="w-full mb-3 px-3 py-2 border rounded-lg"
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          className="w-full mb-6 px-3 py-2 border rounded-lg"
        />
        <button onClick={handlePasswordChange} className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition">
          Change Password
        </button>

        {/* Upgrade account */}
        {!profile.is_premium && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/upgrade")}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition"
            >
              🚀 Upgrade Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
