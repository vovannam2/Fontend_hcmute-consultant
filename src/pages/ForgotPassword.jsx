import { useState } from "react";
import { forgotPassword, resetPassword } from "../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(""); // đổi từ otp thành code
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    setLoading(true);
    try {
      await forgotPassword({ email });
      alert("OTP đã được gửi về email!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      alert("Đổi mật khẩu thành công!");
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">
        {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
      </h2>

      {step === 1 ? (
        <>
          <input
            type="email"
            placeholder="Nhập email"
            className="w-full border p-2 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={handleForgot}
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Gửi OTP"}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Nhập OTP"
            className="w-full border p-2 mb-4"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            className="w-full border p-2 mb-4"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            className="w-full bg-green-500 text-white p-2 rounded"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </>
      )}
    </div>
  );
}
