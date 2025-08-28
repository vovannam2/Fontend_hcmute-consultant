import { useState } from "react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import AuthLayout from "../../components/layout/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login:", { email, password });
    // TODO: gọi API login ở đây (authService.login)
  };

  return (
    <AuthLayout>
      <Logo />
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
        Đăng nhập hệ thống
      </h2>

      <form onSubmit={handleLogin}>
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email sinh viên..."
        />

        <InputField
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu..."
        />

        <Button text="Đăng nhập" type="submit" variant="primary" />
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Chưa có tài khoản?{" "}
        <a href="/register" className="text-blue-600 hover:underline">
          Đăng ký ngay
        </a>
      </p>
    </AuthLayout>
  );
}
