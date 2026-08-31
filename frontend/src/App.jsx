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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      await axios.post("http://localhost:5000/api/incidents", {
        incident_type: form.incident_type,
        description: form.description,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      setMessage("Emergency reported successfully.");

      setForm({
        incident_type: "FIRE",
        description: "",
        latitude: "",
        longitude: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit emergency report.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", fontFamily: "Arial" }}>
      <h1>AEGIS</h1>
      <h2>Emergency Incident Report</h2>

      <form onSubmit={handleSubmit}>
        <label>Incident Type</label>
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

        <br /><br />

        <label>Description</label>
        <br />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the emergency"
          rows="5"
          style={{ width: "100%" }}
          required
        />

        <br /><br />

        <label>Latitude</label>
        <br />
        <input
          type="number"
          step="any"
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Longitude</label>
        <br />
        <input
          type="number"
          step="any"
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          required
        />

        <br /><br />

        <button type="submit">
          Report Emergency
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default App;