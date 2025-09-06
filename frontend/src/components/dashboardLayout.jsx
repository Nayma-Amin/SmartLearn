 import React, { useState } from "react";
import "./dashboardLayout.css";
import logo from "../assets/logo.png";
import { Menu } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function DashboardLayout({ sidebarItems, children, username }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getFirstName = (name) => {
    if (!name) return "User";
    return name.split(" ")[0];
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className={`dashboard ${isCollapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <button
            className="menu-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu size={20} />
          </button>
          <h3>Menue</h3>
        </div>
        <ul>
          {sidebarItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>

      <main className="content">
        <header className="topbar">
          <img src={logo} alt="SmartLearn Logo" className="logo" />
          <h1>Classroom</h1>

          <div className="profile-dropdown">
            <div
              className="profile-name"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {getFirstName(username)} ⬇
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        <div className="grid">{children}</div>
      </main>
    </div>
  );
}