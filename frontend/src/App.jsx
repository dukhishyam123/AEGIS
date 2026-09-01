import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/incidents";

const STATUS_OPTIONS = [
  "REPORTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
];

function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(API_URL);

      setIncidents(response.data.incidents || response.data || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      setMessage("Failed to load incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setMessage("");

      const response = await axios.put(`${API_URL}/${id}/status`, {
        status,
      });

      const updatedIncident = response.data.incident;

      setIncidents((currentIncidents) =>
        currentIncidents.map((incident) =>
          incident.id === id ? updatedIncident : incident
        )
      );

      setMessage(`Incident #${id} updated to ${status}.`);
    } catch (error) {
      console.error("Error updating status:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to update incident status.";

      setMessage(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "28px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0, color: "#172b4d" }}>
            AEGIS Government Officer Dashboard
          </h1>

          <p style={{ color: "#6b778c", marginBottom: "20px" }}>
            Monitor and manage reported emergency incidents.
          </p>

          <button
            onClick={fetchIncidents}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#0c66e4",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Refresh Incidents
          </button>

          {message && (
            <p
              style={{
                marginTop: "15px",
                color: "#172b4d",
                fontWeight: "bold",
              }}
            >
              {message}
            </p>
          )}
        </div>

        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#172b4d" }}>
            Emergency Incidents
          </h2>

          {loading ? (
            <p>Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p>No emergency incidents found.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr style={{ background: "#f4f5f7" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Latitude</th>
                  <th style={thStyle}>Longitude</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Created</th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td style={tdStyle}>{incident.id}</td>

                    <td style={tdStyle}>
                      {incident.incident_type}
                    </td>

                    <td style={tdStyle}>
                      {incident.description}
                    </td>

                    <td style={tdStyle}>
                      {incident.latitude}
                    </td>

                    <td style={tdStyle}>
                      {incident.longitude}
                    </td>

                    <td style={tdStyle}>
                      <select
                        value={incident.status}
                        disabled={updatingId === incident.id}
                        onChange={(event) =>
                          updateStatus(
                            incident.id,
                            event.target.value
                          )
                        }
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #dfe1e6",
                          cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === incident.id && (
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "#6b778c",
                          }}
                        >
                          Updating...
                        </span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {incident.created_at
                        ? new Date(
                            incident.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "14px",
  textAlign: "left",
  borderBottom: "2px solid #dfe1e6",
  color: "#172b4d",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #dfe1e6",
  verticalAlign: "top",
};

export default App;