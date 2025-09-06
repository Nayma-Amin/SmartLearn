import React, { useState } from "react";
import "./dashboardLayout.css";
import logo from "../assets/logo.png";
import { Menu } from "lucide-react";

export default function DashboardLayout({ sidebarItems, children, username }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getFirstName = (name) => {
    if (!name) return "User";
    return name.split(" ")[0];
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
          <div className="profile-name">{getFirstName(username)}</div>
        </header>
        <div className="grid">{children}</div>
      </main>
    </div>
  );
}