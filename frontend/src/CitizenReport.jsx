import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/incidents";

const INCIDENT_TYPES = [
  "FIRE",
  "ACCIDENT",
  "MEDICAL",
  "FLOOD",
  "CRIME",
  "OTHER",
];

function CitizenReport() {
  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // =====================================================
  // USE MY LOCATION
  // =====================================================

  const useMyLocation = () => {
    setMessage("");
    setSuccess(false);

    if (!navigator.geolocation) {
      setMessage(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(
          position.coords.latitude.toString()
        );

        setLongitude(
          position.coords.longitude.toString()
        );

        setLocationLoading(false);

        setSuccess(true);
        setMessage(
          "Your current location has been detected."
        );
      },
      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLocationLoading(false);

        setMessage(
          "Unable to get your location. Please allow location access."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // SUBMIT INCIDENT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!incidentType) {
      setMessage(
        "Please select an incident type."
      );
      return;
    }

    if (!description.trim()) {
      setMessage(
        "Please enter an incident description."
      );
      return;
    }

    if (
      latitude === "" ||
      longitude === ""
    ) {
      setMessage(
        "Please provide your location or use the 'Use My Location' button."
      );
      return;
    }

    const latitudeNumber =
      Number(latitude);

    const longitudeNumber =
      Number(longitude);

    if (
      Number.isNaN(latitudeNumber) ||
      Number.isNaN(longitudeNumber)
    ) {
      setMessage(
        "Latitude and longitude must be valid numbers."
      );
      return;
    }

    if (
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      setMessage(
        "Latitude must be between -90 and 90."
      );
      return;
    }

    if (
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      setMessage(
        "Longitude must be between -180 and 180."
      );
      return;
    }

    // ===================================================
    // GET JWT
    // ===================================================

    const token =
      localStorage.getItem("token");

    if (!token) {
      setMessage(
        "You are not logged in. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        API_URL,
        {
          incident_type: incidentType,
          description: description.trim(),
          latitude: latitudeNumber,
          longitude: longitudeNumber,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Incident created:",
        response.data
      );

      setSuccess(true);

      setMessage(
        `Emergency reported successfully. Incident ID: #${
          response.data.incident?.id || "N/A"
        }`
      );

      setIncidentType("");
      setDescription("");
      setLatitude("");
      setLongitude("");

    } catch (error) {
      console.error(
        "Error submitting incident:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        setMessage(
          "Your login session has expired. Please login again."
        );
      } else if (
        error.response?.status === 403
      ) {
        setMessage(
          "You do not have permission to submit an incident."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
          "Failed to submit emergency report."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setIncidentType("");
    setDescription("");
    setLatitude("");
    setLongitude("");
    setMessage("");
    setSuccess(false);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}

        <div style={headerStyle}>
          <div>
            <h1 style={headerTitleStyle}>
              🚨 Report Emergency
            </h1>

            <p style={headerTextStyle}>
              Report an emergency incident to
              government authorities.
            </p>
          </div>
        </div>

        {/* FORM */}

        <div style={cardStyle}>

          <h2 style={titleStyle}>
            Emergency Incident Details
          </h2>

          <p style={descriptionStyle}>
            Please provide accurate information
            about the emergency.
          </p>

          <form onSubmit={handleSubmit}>

            {/* INCIDENT TYPE */}

            <label style={labelStyle}>
              Incident Type
            </label>

            <select
              value={incidentType}
              onChange={(event) =>
                setIncidentType(
                  event.target.value
                )
              }
              style={selectStyle}
            >

              <option value="">
                -- Select Incident Type --
              </option>

              {INCIDENT_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

            {/* DESCRIPTION */}

            <label style={labelStyle}>
              Incident Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe what happened..."
              rows={6}
              style={textareaStyle}
            />

            {/* LOCATION */}

            <div style={locationHeaderStyle}>

              <label style={labelStyle}>
                Emergency Location
              </label>

              <button
                type="button"
                onClick={useMyLocation}
                disabled={locationLoading}
                style={locationButtonStyle}
              >
                {locationLoading
                  ? "📍 Getting Location..."
                  : "📍 Use My Location"}
              </button>

            </div>

            {/* LATITUDE */}

            <label style={labelStyle}>
              Latitude
            </label>

            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(event) =>
                setLatitude(
                  event.target.value
                )
              }
              placeholder="Example: 28.6139"
              style={inputStyle}
            />

            {/* LONGITUDE */}

            <label style={labelStyle}>
              Longitude
            </label>

            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(event) =>
                setLongitude(
                  event.target.value
                )
              }
              placeholder="Example: 77.2090"
              style={inputStyle}
            />

            {/* LOCATION INFO */}

            <div style={locationInfoStyle}>
              <strong>
                📍 Location information
              </strong>

              <p style={{ margin: "6px 0 0" }}>
                You can enter coordinates
                manually or click
                <strong>
                  {" "}Use My Location
                </strong>
                {" "}to automatically detect
                your current location.
              </p>
            </div>

            {/* MESSAGE */}

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

            {/* BUTTONS */}

            <div style={buttonContainerStyle}>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...submitButtonStyle,
                  opacity: loading
                    ? 0.7
                    : 1,
                }}
              >
                {loading
                  ? "Submitting..."
                  : "🚨 Submit Emergency Report"}
              </button>

              <button
                type="button"
                onClick={clearForm}
                style={clearButtonStyle}
              >
                Clear
              </button>

            </div>

          </form>

        </div>

        {/* INFORMATION */}

        <div style={infoCardStyle}>

          <h3 style={infoTitleStyle}>
            Important Information
          </h3>

          <ul style={infoListStyle}>
            <li>
              Provide accurate emergency
              information.
            </li>

            <li>
              Use your current location
              whenever possible.
            </li>

            <li>
              After submission, your report
              will be available under
              <strong> My Reports</strong>.
            </li>

            <li>
              Government officers can review
              and update the incident status.
            </li>
          </ul>

        </div>

      </div>
    </div>
  );
}


// =====================================================
// STYLES
// =====================================================

const pageStyle = {
  minHeight: "calc(100vh - 62px)",
  backgroundColor: "#f4f6f8",
  padding: "30px 20px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
};

const headerStyle = {
  backgroundColor: "#172b4d",
  color: "white",
  padding: "28px 30px",
  borderRadius: "14px 14px 0 0",
};

const headerTitleStyle = {
  margin: 0,
  fontSize: "28px",
};

const headerTextStyle = {
  margin: "8px 0 0",
  opacity: 0.9,
};

const cardStyle = {
  backgroundColor: "white",
  padding: "30px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.08)",
};

const titleStyle = {
  marginTop: 0,
  color: "#172b4d",
};

const descriptionStyle = {
  color: "#6b778c",
  marginBottom: "25px",
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
  padding: "13px",
  borderRadius: "7px",
  border: "1px solid #8c95a3",
  backgroundColor: "#ffffff",
  color: "#172b4d",
  fontSize: "15px",
  outline: "none",
};

const selectStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: "7px",
  border: "1px solid #8c95a3",
  backgroundColor: "#ffffff",
  color: "#172b4d",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

const textareaStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: "7px",
  border: "1px solid #8c95a3",
  backgroundColor: "#ffffff",
  color: "#172b4d",
  fontSize: "15px",
  resize: "vertical",
  outline: "none",
  fontFamily: "Arial, sans-serif",
};

const locationHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
};

const locationButtonStyle = {
  padding: "10px 15px",
  marginTop: "20px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#00875a",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const locationInfoStyle = {
  marginTop: "18px",
  padding: "15px",
  borderRadius: "8px",
  backgroundColor: "#deebff",
  color: "#172b4d",
  lineHeight: "1.5",
};

const messageStyle = {
  marginTop: "20px",
  padding: "14px",
  borderRadius: "8px",
  fontWeight: "bold",
  lineHeight: "1.5",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "25px",
  flexWrap: "wrap",
};

const submitButtonStyle = {
  flex: 1,
  minWidth: "220px",
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#0c66e4",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

const clearButtonStyle = {
  padding: "14px 25px",
  border: "1px solid #8c95a3",
  borderRadius: "8px",
  backgroundColor: "white",
  color: "#172b4d",
  cursor: "pointer",
  fontWeight: "bold",
};

const infoCardStyle = {
  backgroundColor: "white",
  padding: "25px 30px",
  marginTop: "20px",
  borderRadius: "0 0 14px 14px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.08)",
};

const infoTitleStyle = {
  marginTop: 0,
  color: "#172b4d",
};

const infoListStyle = {
  color: "#6b778c",
  lineHeight: "1.8",
};

export default CitizenReport;