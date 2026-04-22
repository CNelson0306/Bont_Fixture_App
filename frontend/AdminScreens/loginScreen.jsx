// src/pages/LoginScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");
    if (username === "admin" && password === "password") {
      navigate("/admin-home-screen");
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Admin Login</h1>
        <div className="page__title-spacer" />
      </header>

      <div className="login__body">
        <div className="login__card">
          <div className="login__icon">🔒</div>

          <div className="login__field">
            <label className="login__label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              type="text"
              placeholder="Enter username"
              value={username}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="password">
              Password
            </label>
            <div className="login__password-wrap">
              <input
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
              />
              <button
                className="login__toggle"
                onClick={() => setShowPassword((s) => !s)}
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="login__error">{error}</p>}

          <button
            className="btn btn--primary login__submit"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
