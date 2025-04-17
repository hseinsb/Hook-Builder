import React from "react";
import { signOutUser } from "../services/firebaseService";
import "./Header.css";

const Header = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      await signOutUser();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>
            Hook Builder <span className="subtitle">T.R.I.P. Framework</span>
          </h1>
          <p className="tagline">
            Refine your script hooks for engaging TikTok videos
          </p>
        </div>

        <div className="user-section">
          <span className="user-email">{user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
