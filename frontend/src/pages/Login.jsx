import { useState } from "react";
import { login, getMe } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("handleLogin called with email:", email, "password:", password);

    try {
      await login(email, password);
      console.log("login API successful");

      // ✅ Fetch user details to determine role and redirect
      const userRes = await getMe();
      const role = userRes.data.role;
      
      if (role === "ADMIN") {
        window.location.href = "/admin";
      } else if (role === "DEPARTMENT") {
        window.location.href = "/department";
      } else {
        window.location.href = "/student";
      }

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="p-6 bg-white shadow rounded w-96">
        <h2 className="text-xl mb-4">Login</h2>

        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-blue-500 text-white p-2">
          Sign In
        </button>
      </form>
    </div>
  );
}