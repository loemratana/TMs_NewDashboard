import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const SubMenu = ({ icon, title, text, onClick, active, subItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [headerHovered, setHeaderHovered] = useState(false);

  const handleHeaderClick = () => {
    setIsOpen(!isOpen);
    onClick && onClick();
  };

  const label = title || text;

  return (
    <div style={{ width: "100%" }}>

      {/* Header Row */}
      <div
        onClick={handleHeaderClick}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 18px",
          cursor: "pointer",
          color: active || isOpen
            ? "#ffffff"
            : headerHovered
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.6)",
          background: active || isOpen
            ? "rgba(99,102,241,0.18)"
            : headerHovered
              ? "rgba(255,255,255,0.06)"
              : "transparent",
          borderLeft: active
            ? "3px solid #818cf8"
            : "3px solid transparent",
          transition: "all 0.18s ease",
          userSelect: "none",
          position: "relative",
        }}
      >
        {/* Icon */}
        <span style={{
          width: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 14,
          opacity: active || isOpen ? 1 : 0.85,
        }}>
          {icon}
        </span>

        {/* Label */}
        <span style={{
          flex: 1,
          fontSize: 13.5,
          fontWeight: active || isOpen ? 600 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: 0.1,
        }}>
          {label}
        </span>

        {/* Chevron */}
        {subItems && subItems.length > 0 && (
          <span style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            opacity: 0.5,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}>
            <FaChevronDown />
          </span>
        )}
      </div>

      {/* Sub Items */}
      {isOpen && subItems && subItems.length > 0 && (
        <div style={{
          overflow: "hidden",
          animation: "submenuFadeIn 0.15s ease-out",
        }}>
          {subItems.map((item, index) => (
            <div
              key={index}
              onClick={(e) => { e.stopPropagation(); item.onClick && item.onClick(); }}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 18px 9px 48px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 400,
                color: hoveredItem === index
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.45)",
                background: hoveredItem === index
                  ? "rgba(99,102,241,0.1)"
                  : "transparent",
                borderLeft: "3px solid transparent",
                transition: "all 0.15s ease",
                userSelect: "none",
                position: "relative",
              }}
            >
              {/* Dot indicator */}
              <span style={{
                position: "absolute",
                left: 30,
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: hoveredItem === index
                  ? "#818cf8"
                  : "rgba(255,255,255,0.2)",
                transition: "background 0.15s ease",
                flexShrink: 0,
              }} />
              {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubMenu;

// correct with submenu
