import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/incidents";

function TrackReport() {
  const [incidentId, setIncidentId] = useState("");
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const trackIncident = async (event) => {
    event.preventDefault();

    setIncident(null);
    setMessage("");

    if (!incidentId) {
      setMessage("Please enter an incident ID.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/${incidentId}`
      );

      setIncident(response.data.incident);
    } catch (error) {
      console.error("Error tracking incident:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to find this incident."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={{ margin: 0 }}>Track Emergency Report</h1>
          <p style={{ marginBottom: 0 }}>
            Check the current status of your reported emergency.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={titleStyle}>Track Your Report</h2>

          <p style={textStyle}>
            Enter the incident ID you received after submitting
            your emergency report.
          </p>

          <form onSubmit={trackIncident}>
            <label style={labelStyle}>
              Incident ID
            </label>

            <input
              type="number"
              min="1"
              value={incidentId}
              onChange={(event) =>
                setIncidentId(event.target.value)
              }
              placeholder="e.g. 4"
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Checking..." : "🔎 Track Report"}
            </button>
          </form>

          {message && (
            <div style={errorStyle}>
              {message}
            </div>
          )}

          {incident && (
            <div style={resultStyle}>
              <h2 style={{ color: "#172b4d" }}>
                Incident #{incident.id}
              </h2>

              <div style={rowStyle}>
                <strong>Type:</strong>
                <span>{incident.incident_type}</span>
              </div>

              <div style={rowStyle}>
                <strong>Description:</strong>
                <span>{incident.description}</span>
              </div>

              <div style={rowStyle}>
                <strong>Status:</strong>
                <span style={statusStyle}>
                  {incident.status}
                </span>
              </div>

              <div style={rowStyle}>
                <strong>Location:</strong>
                <span>
                  {incident.latitude}, {incident.longitude}
                </span>
              </div>

              <div style={rowStyle}>
                <strong>Reported:</strong>
                <span>
                  {incident.created_at
                    ? new Date(
                        incident.created_at
                      ).toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 62px)",
  backgroundColor: "#f4f6f8",
  padding: "35px 20px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "700px",
  margin: "0 auto",
};

const headerStyle = {
  backgroundColor: "#172b4d",
  color: "white",
  padding: "25px 30px",
  borderRadius: "14px 14px 0 0",
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
  border: "1px solid #b7bcc5",
  borderRadius: "7px",
  fontSize: "15px",
  color: "#172b4d",
  backgroundColor: "white",
};

const buttonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#0c66e4",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const errorStyle = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "8px",
  backgroundColor: "#ffebe6",
  color: "#bf2600",
  fontWeight: "bold",
};

const resultStyle = {
  marginTop: "25px",
  padding: "20px",
  border: "1px solid #dfe1e6",
  borderRadius: "10px",
  backgroundColor: "#f8f9fa",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  padding: "12px 0",
  borderBottom: "1px solid #dfe1e6",
  color: "#172b4d",
};

const statusStyle = {
  fontWeight: "bold",
  color: "#0c66e4",
};

export default TrackReport;