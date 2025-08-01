import { useState } from "react";

// Backend Api
import API_BASE from "../config";

// React Router
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setMessage("Login successful! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Login</h2>
      {/* Boostrap alert */}
      {message && (
        <div
          className={`alert ${
            message.includes("successful") ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleLogin}
        className="mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>

      <p className="text-center mt-3">
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
