import React, { useState } from "react";
import { signInWithEmail } from "../services/firebaseService";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await signInWithEmail(email, password);
      onLoginSuccess(user);
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage =
        "Failed to log in. Please check your credentials and try again.";

      if (error.message === "Unauthorized user") {
        errorMessage = "You are not authorized to access this application.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many unsuccessful login attempts. Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Hook Builder</h1>
        <h2 className="login-subtitle">T.R.I.P. Framework</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="login-footer">
          <p>Access restricted to authorized users only.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
