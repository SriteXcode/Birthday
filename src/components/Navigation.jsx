import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();
  const path = location.pathname;

  // Don't show navigation on admin page
  if (path === "/admin") return null;

  return (
    <div className="nav-container">
      <nav className="nav-bar">
        <Link 
          to="/" 
          className={`nav-tab ${path === "/" ? "active" : ""}`}
        >
          <span>🎉</span> Celebration
        </Link>
        <Link 
          to="/sweaty-home" 
          className={`nav-tab ${path === "/sweaty-home" ? "active" : ""}`}
        >
          <span>🏠</span> Sweaty's Home
        </Link>
        <Link 
          to="/timeline" 
          className={`nav-tab ${path === "/timeline" ? "active" : ""}`}
        >
          <span>⏳</span> Timeline
        </Link>
        <Link 
          to="/gallery" 
          className={`nav-tab ${path === "/gallery" ? "active" : ""}`}
        >
          <span>🌌</span> Gallery Space
        </Link>
        <Link 
          to="/surprise" 
          className={`nav-tab ${path === "/surprise" ? "active" : ""}`}
        >
          <span>🎁</span> Surprise Gift
        </Link>
        <Link 
          to="/final" 
          className={`nav-tab ${path === "/final" ? "active" : ""}`}
        >
          <span>✉️</span> My Words
        </Link>
      </nav>
    </div>
  );
}
