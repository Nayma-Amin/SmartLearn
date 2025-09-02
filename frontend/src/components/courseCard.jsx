import React, { useState } from "react";
import { FiMoreVertical, FiTrendingUp, FiFolder } from "react-icons/fi";
import "./courseCard.css";

export default function CourseCard({ title, section, teacher }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="course-card">
      <div className="card-top">
        <div className="card-info">
          <h2 className="card-title">{title}</h2>
          <p className="card-section">{section}</p>
        </div>
        <div className="menu-wrapper">
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FiMoreVertical />
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <div className="menu-item">Copy invite link</div>
              <div className="menu-item">Edit</div>
              <div className="menu-item">Copy</div>
              <div className="menu-item">Archive</div>
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
        <p className="teacher-name">{teacher}</p>
      </div>
      <div className="card-footer">
        <FiTrendingUp className="footer-icon" />
        <FiFolder className="footer-icon" />
      </div>
    </div>
  );
}