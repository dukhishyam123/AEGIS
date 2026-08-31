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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setForm((currentForm) => ({
          ...currentForm,
          latitude,
          longitude,
        }));

        setLocationStatus("Location captured successfully.");
      },
      (error) => {
        console.error("Location error:", error);

        if (error.code === 1) {
          setLocationStatus(
            "Location permission was denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setLocationStatus(
            "Your location could not be determined."
          );
        } else if (error.code === 3) {
          setLocationStatus(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationStatus(
            "Unable to get your location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
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

      console.log("Incident created:", response.data);

      setMessage(
        "Emergency reported successfully."
      );

      setForm({
        incident_type: "FIRE",
        description: "",
        latitude: "",
        longitude: "",
      });

      setLocationStatus("");
    } catch (error) {
      console.error("Submission error:", error);

      setMessage(
        "Failed to submit emergency report."
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AEGIS</h1>

      <h2>Emergency Incident Report</h2>

      <p>
        Submit an emergency report so that it can be
        recorded and processed by AEGIS.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Incident Type */}

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
          <option value="MEDICAL">
            Medical Emergency
          </option>
          <option value="FLOOD">Flood</option>
          <option value="OTHER">Other</option>
        </select>

        <br />
        <br />

        {/* Description */}

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

        {/* Location */}

        <h3>Emergency Location</h3>

        <button
          type="button"
          onClick={getLocation}
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          📍 Use My Location
        </button>

        <p>{locationStatus}</p>

        {/* Latitude */}

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
          placeholder="Example: 28.6139"
          required
        />

        <br />
        <br />

        {/* Longitude */}

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
          placeholder="Example: 77.2090"
          required
        />

        <br />
        <br />

        {/* Submit */}

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🚨 Report Emergency
        </button>
      </form>

      {/* Result message */}

      {message && (
        <p
          style={{
            marginTop: "20px",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default App;