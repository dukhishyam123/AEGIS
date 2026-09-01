import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

function CitizenAuth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!email || !password || (mode === "register" && !name)) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        mode === "register"
          ? `${API_URL}/register`
          : `${API_URL}/login`;

      const requestData =
        mode === "register"
          ? {
              name,
              email,
              password,
              role: "CITIZEN",
            }
          : {
              email,
              password,
            };

      const response = await axios.post(
        endpoint,
        requestData
      );

      if (mode === "login") {
        const token = response.data.token;

        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("role", "CITIZEN");

          if (response.data.user) {
            localStorage.setItem(
              "user",
              JSON.stringify(response.data.user)
            );
          }

          setSuccess(true);
          setMessage("Login successful.");

          if (onLogin) {
            onLogin(response.data.user);
          }
        }
      } else {
        setSuccess(true);

        setMessage(
          "Registration successful. You can now login."
        );

        setMode("login");
        setPassword("");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        <div style={headerStyle}>
          <h1 style={logoStyle}>AEGIS</h1>

          <p style={subtitleStyle}>
            Emergency Response System
          </p>
        </div>

        <div style={cardStyle}>

          <div style={tabContainerStyle}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              style={
                mode === "login"
                  ? activeTabStyle
                  : tabStyle
              }
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              style={
                mode === "register"
                  ? activeTabStyle
                  : tabStyle
              }
            >
              Register
            </button>
          </div>

          <h2 style={titleStyle}>
            {mode === "login"
              ? "Citizen Login"
              : "Create Citizen Account"}
          </h2>

          <p style={textStyle}>
            {mode === "login"
              ? "Login to report and track emergency incidents."
              : "Create an account to use AEGIS emergency services."}
          </p>

          <form onSubmit={handleSubmit}>

            {mode === "register" && (
              <>
                <label style={labelStyle}>
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  style={inputStyle}
                />
              </>
            )}

            <label style={labelStyle}>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              style={inputStyle}
            />

            <label style={labelStyle}>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              style={inputStyle}
            />

            {message && (
              <div
                style={{
                  ...messageStyle,
                  backgroundColor: success
                    ? "#e3fcef"
                    : "#ffebe6",
                  color: success
                    ? "#006644"
                    : "#bf2600",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...submitButtonStyle,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "🔐 Login"
                : "📝 Create Account"}
            </button>
          </form>

          <div style={switchStyle}>
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === "login"
                    ? "register"
                    : "login"
                );
                setMessage("");
              }}
              style={switchButtonStyle}
            >
              {mode === "login"
                ? " Register"
                : " Login"}
            </button>
          </div>

        </div>

        <p style={footerStyle}>
          AEGIS — Secure Emergency Incident Platform
        </p>

      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 62px)",
  backgroundColor: "#f4f6f8",
  padding: "40px 20px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "500px",
  margin: "0 auto",
};

const headerStyle = {
  backgroundColor: "#172b4d",
  color: "white",
  padding: "28px",
  borderRadius: "14px 14px 0 0",
  textAlign: "center",
};

const logoStyle = {
  margin: 0,
  fontSize: "34px",
  letterSpacing: "3px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  opacity: 0.9,
};

const cardStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "0 0 14px 14px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const tabContainerStyle = {
  display: "flex",
  borderBottom: "1px solid #dfe1e6",
  marginBottom: "25px",
};

const tabStyle = {
  flex: 1,
  padding: "12px",
  border: "none",
  backgroundColor: "white",
  color: "#6b778c",
  cursor: "pointer",
  fontWeight: "bold",
};

const activeTabStyle = {
  ...tabStyle,
  color: "#0c66e4",
  borderBottom: "3px solid #0c66e4",
};

const titleStyle = {
  marginTop: 0,
  color: "#172b4d",
};

const textStyle = {
  color: "#6b778c",
  lineHeight: "1.5",
};

const labelStyle = {
  display: "block",
  marginTop: "20px",
  marginBottom: "8px",
  color: "#172b4d",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "7px",
  border: "1px solid #b7bcc5",
  fontSize: "15px",
  color: "#172b4d",
  backgroundColor: "white",
};

const messageStyle = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "8px",
  fontWeight: "bold",
};

const submitButtonStyle = {
  width: "100%",
  marginTop: "25px",
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#0c66e4",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const switchStyle = {
  textAlign: "center",
  marginTop: "22px",
  color: "#6b778c",
};

const switchButtonStyle = {
  border: "none",
  background: "none",
  color: "#0c66e4",
  fontWeight: "bold",
  cursor: "pointer",
};

const footerStyle = {
  textAlign: "center",
  color: "#6b778c",
  marginTop: "20px",
  fontSize: "13px",
};

export default CitizenAuth;