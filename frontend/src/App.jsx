import { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    incident_type: "FIRE",
    description: "",
    latitude: "",
    longitude: "",
  });

  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const [incidentId, setIncidentId] = useState("");
  const [incident, setIncident] = useState(null);
  const [statusError, setStatusError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported.");
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));

        setLocationStatus("Location captured successfully.");
      },
      () => {
        setLocationStatus("Unable to get your location.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("Submitting emergency report...");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/incidents",
        {
          incident_type: form.incident_type,
          description: form.description,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }
      );

      setMessage(
        `Emergency reported successfully. Incident ID: ${response.data.incident.id}`
      );

      setForm({
        incident_type: "FIRE",
        description: "",
        latitude: "",
        longitude: "",
      });

      setLocationStatus("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit emergency report.");
    }
  };

  const checkIncidentStatus = async () => {
    setIncident(null);
    setStatusError("");

    if (!incidentId) {
      setStatusError("Please enter an incident ID.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/incidents/${incidentId}`
      );

      setIncident(response.data.incident);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 404) {
        setStatusError("Incident not found.");
      } else {
        setStatusError("Unable to retrieve incident status.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AEGIS</h1>

      <h2>Emergency Incident Report</h2>

      <form onSubmit={handleSubmit}>
        <label>
          <strong>Incident Type</strong>
        </label>

        <br />

        <select
          name="incident_type"
          value={form.incident_type}
          onChange={handleChange}
        >
          <option value="FIRE">Fire</option>
          <option value="ACCIDENT">Accident</option>
          <option value="MEDICAL">Medical Emergency</option>
          <option value="FLOOD">Flood</option>
          <option value="OTHER">Other</option>
        </select>

        <br />
        <br />

        <label>
          <strong>Description</strong>
        </label>

        <br />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the emergency"
          rows="5"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
          }}
          required
        />

        <br />
        <br />

        <h3>Emergency Location</h3>

        <button
          type="button"
          onClick={getLocation}
        >
          📍 Use My Location
        </button>

        <p>{locationStatus}</p>

        <label>
          <strong>Latitude</strong>
        </label>

        <br />

        <input
          type="number"
          step="any"
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <label>
          <strong>Longitude</strong>
        </label>

        <br />

        <input
          type="number"
          step="any"
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <button type="submit">
          🚨 Report Emergency
        </button>
      </form>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <hr />

      <h2>Check Emergency Status</h2>

      <p>
        Enter your incident ID to check its current status.
      </p>

      <input
        type="number"
        value={incidentId}
        onChange={(e) => setIncidentId(e.target.value)}
        placeholder="Incident ID"
      />

      <button
        type="button"
        onClick={checkIncidentStatus}
        style={{ marginLeft: "10px" }}
      >
        Check Status
      </button>

      {statusError && (
        <p>
          <strong>{statusError}</strong>
        </p>
      )}

      {incident && (
        <div>
          <h3>Incident #{incident.id}</h3>

          <p>
            <strong>Type:</strong> {incident.incident_type}
          </p>

          <p>
            <strong>Description:</strong> {incident.description}
          </p>

          <p>
            <strong>Status:</strong> {incident.status}
          </p>

          <p>
            <strong>Latitude:</strong> {incident.latitude}
          </p>

          <p>
            <strong>Longitude:</strong> {incident.longitude}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;