import { useState } from "react";
import CitizenReport from "./CitizenReport";
import TrackReport from "./TrackReport";

function CitizenDashboard({ onLogout }) {
  const [page, setPage] = useState("home");

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const name = user?.name || "Citizen";
  const email = user?.email || "Email not available";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={logoStyle}>AEGIS</h1>
            <p style={subtitleStyle}>
              Citizen Emergency Portal
            </p>
          </div>

          <button
            onClick={logout}
            style={logoutButtonStyle}
          >
            Logout
          </button>
        </div>

        {/* Navigation */}
        <div style={navStyle}>
          <button
            onClick={() => setPage("home")}
            style={navButtonStyle}
          >
            🏠 Home
          </button>

          <button
            onClick={() => setPage("report")}
            style={navButtonStyle}
          >
            🚨 Report Emergency
          </button>

          <button
            onClick={() => setPage("track")}
            style={navButtonStyle}
          >
            🔎 Track Report
          </button>

          <button
            onClick={() => setPage("profile")}
            style={navButtonStyle}
          >
            👤 My Profile
          </button>

          <button
            onClick={() => setPage("reports")}
            style={navButtonStyle}
          >
            📋 My Reports
          </button>
        </div>

        {/* Content */}
        {page === "home" && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>
              Welcome, {name} 👋
            </h2>

            <p style={textStyle}>
              Welcome to the AEGIS citizen emergency
              portal. From here you can report an
              emergency, track your report, and view
              your account information.
            </p>

            <div style={gridStyle}>
              <button
                onClick={() => setPage("report")}
                style={featureButtonStyle}
              >
                🚨
                <strong>Report Emergency</strong>
                <span>
                  Submit a new emergency incident.
                </span>
              </button>

              <button
                onClick={() => setPage("track")}
                style={featureButtonStyle}
              >
                🔎
                <strong>Track Report</strong>
                <span>
                  Check the status of an incident.
                </span>
              </button>

              <button
                onClick={() => setPage("profile")}
                style={featureButtonStyle}
              >
                👤
                <strong>My Profile</strong>
                <span>
                  View your account information.
                </span>
              </button>

              <button
                onClick={() => setPage("reports")}
                style={featureButtonStyle}
              >
                📋
                <strong>My Reports</strong>
                <span>
                  View your submitted incidents.
                </span>
              </button>
            </div>
          </div>
        )}

        {page === "report" && (
          <CitizenReport />
        )}

        {page === "track" && (
          <TrackReport />
        )}

        {page === "profile" && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>
              👤 My Profile
            </h2>

            <div style={profileBoxStyle}>
              <div style={profileRowStyle}>
                <strong>Name</strong>
                <span>{name}</span>
              </div>

              <div style={profileRowStyle}>
                <strong>Email</strong>
                <span>{email}</span>
              </div>

              <div style={profileRowStyle}>
                <strong>Role</strong>
                <span>CITIZEN</span>
              </div>
            </div>
          </div>
        )}

        {page === "reports" && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>
              📋 My Submitted Reports
            </h2>

            <p style={textStyle}>
              Your submitted emergency incidents will
              appear here.
            </p>

            <div style={comingSoonStyle}>
              <strong>Report History</strong>

              <p>
                We are connecting this section to the
                database next so that only your own
                submitted reports are displayed.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// ===============================
// STYLES
// ===============================

const pageStyle = {
  minHeight: "calc(100vh - 62px)",
  backgroundColor: "#f4f6f8",
  padding: "30px 20px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const headerStyle = {
  backgroundColor: "#172b4d",
  color: "white",
  padding: "25px 30px",
  borderRadius: "14px 14px 0 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoStyle = {
  margin: 0,
  fontSize: "32px",
  letterSpacing: "3px",
};

const subtitleStyle = {
  margin: "5px 0 0",
  opacity: 0.9,
};

const logoutButtonStyle = {
  padding: "10px 18px",
  border: "1px solid rgba(255,255,255,0.5)",
  borderRadius: "7px",
  backgroundColor: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const navStyle = {
  backgroundColor: "white",
  padding: "15px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const navButtonStyle = {
  padding: "10px 15px",
  border: "1px solid #dfe1e6",
  borderRadius: "7px",
  backgroundColor: "white",
  color: "#172b4d",
  cursor: "pointer",
  fontWeight: "bold",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "0 0 14px 14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const titleStyle = {
  marginTop: 0,
  color: "#172b4d",
};

const textStyle = {
  color: "#6b778c",
  lineHeight: "1.6",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginTop: "25px",
};

const featureButtonStyle = {
  minHeight: "150px",
  padding: "20px",
  border: "1px solid #dfe1e6",
  borderRadius: "10px",
  backgroundColor: "white",
  color: "#172b4d",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  fontSize: "28px",
};

const profileBoxStyle = {
  marginTop: "20px",
  border: "1px solid #dfe1e6",
  borderRadius: "10px",
  overflow: "hidden",
};

const profileRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "18px",
  borderBottom: "1px solid #dfe1e6",
  color: "#172b4d",
};

const comingSoonStyle = {
  marginTop: "20px",
  padding: "20px",
  borderRadius: "10px",
  backgroundColor: "#f4f6f8",
  color: "#172b4d",
};

export default CitizenDashboard;