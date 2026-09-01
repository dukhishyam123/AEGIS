import {
  useEffect,
  useState,
} from "react";

import axios from "axios";


const API =
  "http://localhost:5000/api";

const INCIDENT_API =
  `${API}/incidents`;

const AUTH_API =
  `${API}/auth`;


const INCIDENT_TYPES = [
  "FIRE",
  "ACCIDENT",
  "MEDICAL",
  "FLOOD",
  "CRIME",
  "OTHER",
];


const STATUSES = [
  "REPORTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];


// ======================================================
// APP
// ======================================================

function App() {

  const [token, setToken] =
    useState(
      localStorage.getItem("token")
    );

  const [user, setUser] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            "user"
          );

        return saved
          ? JSON.parse(saved)
          : null;

      } catch {
        return null;
      }

    });


  const login = (
    loggedUser,
    jwt
  ) => {

    localStorage.setItem(
      "token",
      jwt
    );

    localStorage.setItem(
      "user",
      JSON.stringify(
        loggedUser
      )
    );

    setToken(jwt);
    setUser(loggedUser);
  };


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setToken(null);
    setUser(null);
  };


  if (!token || !user) {

    return (
      <AuthPage
        onLogin={login}
      />
    );
  }


  if (
    user.role === "OFFICER" ||
    user.role === "ADMIN"
  ) {

    return (
      <OfficerDashboard
        user={user}
        logout={logout}
      />
    );
  }


  return (
    <CitizenWebsite
      user={user}
      logout={logout}
    />
  );
}


// ======================================================
// AUTH PAGE
// ======================================================

function AuthPage({
  onLogin,
}) {

  const [mode, setMode] =
    useState("login");

  const [role, setRole] =
    useState("CITIZEN");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);


  const submit = async (
    event
  ) => {

    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (
      mode === "register" &&
      !name.trim()
    ) {
      setMessage(
        "Please enter your name."
      );
      return;
    }

    if (
      !email.trim() ||
      !password
    ) {
      setMessage(
        "Please enter email and password."
      );
      return;
    }

    try {

      setLoading(true);

      const endpoint =
        mode === "register"
          ? `${AUTH_API}/register`
          : `${AUTH_API}/login`;


      const body =
        mode === "register"
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
            }
          : {
              email: email.trim(),
              password,
              role,
            };


      const response =
        await axios.post(
          endpoint,
          body
        );


      if (
        mode === "register"
      ) {

        setSuccess(true);

        setMessage(
          "Registration successful. Logging you in..."
        );

        onLogin(
          response.data.user,
          response.data.token
        );

      } else {

        onLogin(
          response.data.user,
          response.data.token
        );
      }

    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Authentication failed."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={authPage}>

      <div style={authCard}>

        <div style={brand}>
          🚨 AEGIS
        </div>

        <h1 style={authTitle}>
          Emergency Management System
        </h1>

        <p style={muted}>
          Citizen and Government Officer Portal
        </p>


        {/* ROLE */}

        <div style={roleTabs}>

          <button
            onClick={() =>
              setRole("CITIZEN")
            }
            style={
              role === "CITIZEN"
                ? activeRole
                : roleButton
            }
          >
            👤 Citizen
          </button>

          <button
            onClick={() =>
              setRole("OFFICER")
            }
            style={
              role === "OFFICER"
                ? activeRole
                : roleButton
            }
          >
            🏛️ Government Officer
          </button>

        </div>


        {/* MODE */}

        {role === "CITIZEN" && (

          <div style={modeTabs}>

            <button
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              style={
                mode === "login"
                  ? activeMode
                  : modeButton
              }
            >
              Login
            </button>

            <button
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              style={
                mode === "register"
                  ? activeMode
                  : modeButton
              }
            >
              Register
            </button>

          </div>

        )}


        <h2>
          {role === "OFFICER"
            ? "Government Officer Login"
            : mode === "register"
            ? "Citizen Registration"
            : "Citizen Login"}
        </h2>


        <form onSubmit={submit}>

          {mode === "register" &&
            role === "CITIZEN" && (

              <>
                <label style={label}>
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Your full name"
                  style={input}
                />
              </>

            )}


          <label style={label}>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="Email address"
            style={input}
          />


          <label style={label}>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="Password"
            style={input}
          />


          {message && (

            <div
              style={{
                ...messageBox,
                backgroundColor:
                  success
                    ? "#e3fcef"
                    : "#ffebe6",
                color:
                  success
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
            style={primary}
          >
            {loading
              ? "Please wait..."
              : mode === "register" &&
                role === "CITIZEN"
              ? "Create Citizen Account"
              : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}


// ======================================================
// CITIZEN WEBSITE
// ======================================================

function CitizenWebsite({
  user,
  logout,
}) {

  const [page, setPage] =
    useState("home");


  return (
    <div style={app}>

      <CitizenNav
        page={page}
        setPage={setPage}
        user={user}
        logout={logout}
      />


      <main style={main}>

        {page === "home" && (
          <CitizenHome
            user={user}
            setPage={setPage}
          />
        )}

        {page === "report" && (
          <CitizenReport />
        )}

        {page === "reports" && (
          <CitizenReports />
        )}

        {page === "profile" && (
          <CitizenProfile
            user={user}
          />
        )}

      </main>

    </div>
  );
}


// ======================================================
// CITIZEN NAV
// ======================================================

function CitizenNav({
  page,
  setPage,
  user,
  logout,
}) {

  return (
    <nav style={nav}>

      <strong style={logo}>
        🚨 AEGIS
      </strong>

      <div style={navItems}>

        <button
          onClick={() =>
            setPage("home")
          }
          style={navBtn(
            page === "home"
          )}
        >
          🏠 Home
        </button>

        <button
          onClick={() =>
            setPage("report")
          }
          style={navBtn(
            page === "report"
          )}
        >
          🚨 Report Emergency
        </button>

        <button
          onClick={() =>
            setPage("reports")
          }
          style={navBtn(
            page === "reports"
          )}
        >
          📋 My Reports
        </button>

        <button
          onClick={() =>
            setPage("profile")
          }
          style={navBtn(
            page === "profile"
          )}
        >
          👤 My Profile
        </button>

        <button
          onClick={logout}
          style={logoutBtn}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}


// ======================================================
// CITIZEN HOME
// ======================================================

function CitizenHome({
  user,
  setPage,
}) {

  return (
    <>

      <div style={hero}>

        <h1>
          Welcome to AEGIS
        </h1>

        <p>
          Hello,{" "}
          <strong>
            {user.name ||
              user.email}
          </strong>
        </p>

        <p>
          Report emergencies and track
          their progress from one place.
        </p>

        <button
          onClick={() =>
            setPage("report")
          }
          style={primary}
        >
          🚨 Report Emergency
        </button>

      </div>


      <div style={grid}>

        <div style={card}>

          <h2>
            🚨 Emergency Reporting
          </h2>

          <p style={muted}>
            Quickly submit a fire, medical,
            accident, flood or crime report.
          </p>

          <button
            onClick={() =>
              setPage("report")
            }
            style={primary}
          >
            Report Now
          </button>

        </div>


        <div style={card}>

          <h2>
            📋 Track Reports
          </h2>

          <p style={muted}>
            See all emergency reports submitted
            from your account.
          </p>

          <button
            onClick={() =>
              setPage("reports")
            }
            style={secondary}
          >
            My Reports
          </button>

        </div>


        <div style={card}>

          <h2>
            👤 My Profile
          </h2>

          <p style={muted}>
            View your name, email, role and
            reporting history.
          </p>

          <button
            onClick={() =>
              setPage("profile")
            }
            style={secondary}
          >
            View Profile
          </button>

        </div>

      </div>

    </>
  );
}


// ======================================================
// CITIZEN REPORT
// ======================================================

function CitizenReport() {

  const [type, setType] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);


  const location = () => {

    setMessage("");

    if (
      !navigator.geolocation
    ) {

      setMessage(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setLatitude(
          position.coords.latitude
        );

        setLongitude(
          position.coords.longitude
        );

        setLocationLoading(false);

        setSuccess(true);

        setMessage(
          "Location detected successfully."
        );
      },

      (error) => {

        console.error(
          error
        );

        setLocationLoading(false);

        setSuccess(false);

        setMessage(
          "Unable to get location. Please allow browser location permission."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  const submit = async (
    event
  ) => {

    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!type) {

      setMessage(
        "Select an incident type."
      );

      return;
    }

    if (!description.trim()) {

      setMessage(
        "Enter an incident description."
      );

      return;
    }

    if (
      latitude === "" ||
      longitude === ""
    ) {

      setMessage(
        "Enter a location or use My Location."
      );

      return;
    }

    try {

      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await axios.post(
          INCIDENT_API,
          {
            incident_type:
              type,

            description:
              description.trim(),

            latitude:
              Number(latitude),

            longitude:
              Number(longitude),
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      setSuccess(true);

      setMessage(
        `Report submitted successfully. Incident #${response.data.incident.id}`
      );

      setType("");
      setDescription("");
      setLatitude("");
      setLongitude("");

    } catch (error) {

      console.error(
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Failed to submit report."
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div style={card}>

      <h1>
        🚨 Report Emergency
      </h1>

      <p style={muted}>
        Provide accurate information about
        the emergency.
      </p>


      <form onSubmit={submit}>

        <label style={label}>
          Incident Type
        </label>

        <select
          value={type}
          onChange={(e) =>
            setType(
              e.target.value
            )
          }
          style={select}
        >

          <option value="">
            -- Select Type --
          </option>

          {INCIDENT_TYPES.map(
            (item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            )
          )}

        </select>


        <label style={label}>
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          placeholder="Describe the emergency..."
          rows={6}
          style={textarea}
        />


        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >

          <label style={label}>
            Location
          </label>

          <button
            type="button"
            onClick={location}
            style={locationBtn}
          >
            {locationLoading
              ? "Getting Location..."
              : "📍 Use My Location"}
          </button>

        </div>


        <label style={label}>
          Latitude
        </label>

        <input
          type="number"
          step="any"
          value={latitude}
          onChange={(e) =>
            setLatitude(
              e.target.value
            )
          }
          placeholder="Latitude"
          style={input}
        />


        <label style={label}>
          Longitude
        </label>

        <input
          type="number"
          step="any"
          value={longitude}
          onChange={(e) =>
            setLongitude(
              e.target.value
            )
          }
          placeholder="Longitude"
          style={input}
        />


        {message && (

          <div
            style={{
              ...messageBox,
              backgroundColor:
                success
                  ? "#e3fcef"
                  : "#ffebe6",
              color:
                success
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
          style={primary}
        >
          {loading
            ? "Submitting..."
            : "🚨 Submit Report"}
        </button>

      </form>

    </div>
  );
}


// ======================================================
// CITIZEN REPORTS
// ======================================================

function CitizenReports() {

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  const load = async () => {

    try {

      setLoading(true);

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await axios.get(
          `${INCIDENT_API}/my`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setReports(
        response.data.incidents ||
        []
      );

      setMessage("");

    } catch (error) {

      console.error(
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Could not load reports."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);


  return (
    <div>

      <div style={headerRow}>

        <div>

          <h1>
            📋 My Reports
          </h1>

          <p style={muted}>
            Reports submitted by your account.
          </p>

        </div>

        <button
          onClick={load}
          style={secondary}
        >
          🔄 Refresh
        </button>

      </div>


      {loading && (
        <div style={card}>
          Loading reports...
        </div>
      )}


      {message && (
        <div style={error}>
          {message}
        </div>
      )}


      {!loading &&
        !message &&
        reports.length === 0 && (

          <div style={card}>

            <h2>
              No Reports Yet
            </h2>

            <p style={muted}>
              Your submitted emergency reports
              will appear here.
            </p>

          </div>

        )}


      <div style={grid}>

        {reports.map(
          (report) => (

            <div
              key={report.id}
              style={card}
            >

              <div style={headerRow}>

                <h2>
                  Incident #{report.id}
                </h2>

                <span
                  style={{
                    ...badge,
                    backgroundColor:
                      statusBackground(
                        report.status
                      ),
                    color:
                      statusColor(
                        report.status
                      ),
                  }}
                >
                  {report.status}
                </span>

              </div>


              <p>
                <strong>
                  Type:
                </strong>{" "}
                {report.incident_type}
              </p>

              <p>
                <strong>
                  Description:
                </strong>{" "}
                {report.description}
              </p>

              <p>
                <strong>
                  Location:
                </strong>{" "}
                {report.latitude},{" "}
                {report.longitude}
              </p>

              <p style={muted}>
                <strong>
                  Submitted:
                </strong>{" "}
                {new Date(
                  report.created_at
                ).toLocaleString()}
              </p>

            </div>

          )
        )}

      </div>

    </div>
  );
}


// ======================================================
// PROFILE
// ======================================================

function CitizenProfile({
  user,
}) {

  const [count, setCount] =
    useState(0);


  useEffect(() => {

    const load =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );

          const response =
            await axios.get(
              `${INCIDENT_API}/my`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          setCount(
            response.data.count ||
            0
          );

        } catch (error) {

          console.error(
            error
          );
        }
      };

    load();

  }, []);


  return (
    <div style={card}>

      <div style={avatar}>
        👤
      </div>

      <h1>
        {user.name ||
          "Citizen"}
      </h1>

      <p style={muted}>
        Citizen Account
      </p>


      <div style={profileGrid}>

        <div>
          <strong>
            Name
          </strong>

          <p>
            {user.name || "-"}
          </p>
        </div>


        <div>
          <strong>
            Email
          </strong>

          <p>
            {user.email || "-"}
          </p>
        </div>


        <div>
          <strong>
            Role
          </strong>

          <p>
            {user.role}
          </p>
        </div>


        <div>
          <strong>
            Reports Submitted
          </strong>

          <p>
            {count}
          </p>
        </div>

      </div>

    </div>
  );
}


// ======================================================
// OFFICER DASHBOARD
// ======================================================

function OfficerDashboard({
  user,
  logout,
}) {

  const [incidents, setIncidents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [updating, setUpdating] =
    useState(null);


  const loadIncidents =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const params = {};

        if (statusFilter) {
          params.status =
            statusFilter;
        }

        if (typeFilter) {
          params.incident_type =
            typeFilter;
        }

        const response =
          await axios.get(
            INCIDENT_API,
            {
              params,

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setIncidents(
          response.data.incidents ||
          []
        );

        setMessage("");

      } catch (error) {

        console.error(
          error
        );

        setMessage(
          error.response?.data?.message ||
          "Failed to load incidents."
        );

      } finally {

        setLoading(false);
      }
    };


  useEffect(() => {

    loadIncidents();

  }, [
    statusFilter,
    typeFilter,
  ]);


  const updateStatus =
    async (
      id,
      status
    ) => {

      try {

        setUpdating(id);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await axios.put(
            `${INCIDENT_API}/${id}/status`,
            {
              status,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        setIncidents(
          current =>
            current.map(
              incident =>
                incident.id === id
                  ? response.data.incident
                  : incident
            )
        );

      } catch (error) {

        console.error(
          error
        );

        setMessage(
          error.response?.data?.message ||
          "Failed to update status."
        );

      } finally {

        setUpdating(null);
      }
    };


  const clearFilters =
    () => {

      setStatusFilter("");
      setTypeFilter("");
    };


  return (
    <div style={app}>

      <nav style={nav}>

        <strong style={logo}>
          🏛️ AEGIS OFFICER
        </strong>

        <div style={navItems}>

          <span
            style={{
              color: "white",
              padding: "10px",
            }}
          >
            {user.name ||
              user.email}
          </span>

          <button
            onClick={logout}
            style={logoutBtn}
          >
            Logout
          </button>

        </div>

      </nav>


      <main style={main}>

        <div style={hero}>

          <h1>
            Government Officer Dashboard
          </h1>

          <p>
            Monitor and manage reported
            emergency incidents.
          </p>

        </div>


        {/* FILTERS */}

        <div style={filterCard}>

          <h2>
            🔎 Filter Incidents
          </h2>


          <div style={filterGrid}>

            <div>

              <label style={label}>
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={select}
              >

                <option value="">
                  All Statuses
                </option>

                {STATUSES.map(
                  status => (

                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>

                  )
                )}

              </select>

            </div>


            <div>

              <label style={label}>
                Incident Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value
                  )
                }
                style={select}
              >

                <option value="">
                  All Types
                </option>

                {INCIDENT_TYPES.map(
                  type => (

                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>

                  )
                )}

              </select>

            </div>


            <div
              style={{
                display: "flex",
                alignItems: "end",
              }}
            >

              <button
                onClick={clearFilters}
                style={secondary}
              >
                Clear Filters
              </button>

            </div>

          </div>

        </div>


        {message && (
          <div style={error}>
            {message}
          </div>
        )}


        {/* INCIDENTS */}

        <div style={card}>

          <div style={headerRow}>

            <h2>
              Emergency Incidents
            </h2>

            <button
              onClick={loadIncidents}
              style={secondary}
            >
              🔄 Refresh
            </button>

          </div>


          {loading ? (

            <p>
              Loading incidents...
            </p>

          ) : incidents.length === 0 ? (

            <p style={muted}>
              No incidents match the selected
              filters.
            </p>

          ) : (

            <div
              style={{
                overflowX: "auto",
              }}
            >

              <table
                style={table}
              >

                <thead>

                  <tr>

                    <th style={th}>
                      ID
                    </th>

                    <th style={th}>
                      Citizen
                    </th>

                    <th style={th}>
                      Type
                    </th>

                    <th style={th}>
                      Description
                    </th>

                    <th style={th}>
                      Location
                    </th>

                    <th style={th}>
                      Status
                    </th>

                    <th style={th}>
                      Created
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {incidents.map(
                    incident => (

                      <tr
                        key={
                          incident.id
                        }
                      >

                        <td style={td}>
                          #{incident.id}
                        </td>


                        <td style={td}>

                          <strong>
                            {
                              incident.citizen_name ||
                              "Unknown"
                            }
                          </strong>

                          <br />

                          <small>
                            {
                              incident.citizen_email ||
                              "-"
                            }
                          </small>

                        </td>


                        <td style={td}>
                          {
                            incident.incident_type
                          }
                        </td>


                        <td style={td}>
                          {
                            incident.description
                          }
                        </td>


                        <td style={td}>
                          {
                            incident.latitude
                          }
                          ,
                          {
                            incident.longitude
                          }
                        </td>


                        <td style={td}>

                          <select
                            value={
                              incident.status
                            }
                            disabled={
                              updating ===
                              incident.id
                            }
                            onChange={(e) =>
                              updateStatus(
                                incident.id,
                                e.target.value
                              )
                            }
                            style={selectSmall}
                          >

                            {STATUSES.map(
                              status => (

                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {status}
                                </option>

                              )
                            )}

                          </select>

                        </td>


                        <td style={td}>
                          {
                            new Date(
                              incident.created_at
                            ).toLocaleString()
                          }
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}


// ======================================================
// STATUS
// ======================================================

function statusBackground(
  status
) {

  switch (status) {

    case "RESOLVED":
      return "#e3fcef";

    case "IN_PROGRESS":
      return "#deebff";

    case "ACKNOWLEDGED":
      return "#fff0b3";

    case "CLOSED":
      return "#dfe1e6";

    default:
      return "#ffebe6";
  }
}


function statusColor(
  status
) {

  switch (status) {

    case "RESOLVED":
      return "#006644";

    case "IN_PROGRESS":
      return "#0747a6";

    case "ACKNOWLEDGED":
      return "#7a4f01";

    case "CLOSED":
      return "#172b4d";

    default:
      return "#bf2600";
  }
}


// ======================================================
// STYLES
// ======================================================

const app = {
  minHeight: "100vh",
  background: "#f4f6f8",
  fontFamily:
    "Arial, Helvetica, sans-serif",
  color: "#172b4d",
};

const main = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "30px 20px 60px",
};

const nav = {
  background: "#172b4d",
  color: "white",
  padding: "12px 25px",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
};

const logo = {
  fontSize: "22px",
};

const navItems = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
  flexWrap: "wrap",
};

const navBtn = (
  active
) => ({
  padding: "10px 13px",
  border: "none",
  borderRadius: "6px",
  background:
    active
      ? "#0c66e4"
      : "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
});

const logoutBtn = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "6px",
  background: "#bf2600",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const hero = {
  background: "#172b4d",
  color: "white",
  padding: "35px",
  borderRadius: "12px",
  marginBottom: "20px",
};

const card = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow:
    "0 3px 12px rgba(0,0,0,0.08)",
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(280px,1fr))",
  gap: "20px",
};

const primary = {
  padding: "13px 20px",
  border: "none",
  borderRadius: "7px",
  background: "#0c66e4",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

const secondary = {
  padding: "12px 18px",
  border: "1px solid #8c95a3",
  borderRadius: "7px",
  background: "white",
  color: "#172b4d",
  cursor: "pointer",
  fontWeight: "bold",
};

const label = {
  display: "block",
  marginTop: "18px",
  marginBottom: "7px",
  fontWeight: "bold",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: "7px",
  border:
    "1px solid #8c95a3",
  background: "white",
  color: "#172b4d",
  fontSize: "15px",
};

const select = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: "7px",
  border:
    "1px solid #8c95a3",
  background: "white",
  color: "#172b4d",
  fontSize: "15px",
};

const selectSmall = {
  padding: "8px",
  borderRadius: "6px",
  border:
    "1px solid #8c95a3",
  background: "white",
  color: "#172b4d",
};

const textarea = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px",
  borderRadius: "7px",
  border:
    "1px solid #8c95a3",
  background: "white",
  color: "#172b4d",
  fontSize: "15px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
  resize: "vertical",
};

const locationBtn = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "7px",
  background: "#00875a",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const muted = {
  color: "#6b778c",
  lineHeight: "1.6",
};

const messageBox = {
  padding: "14px",
  borderRadius: "8px",
  margin:
    "18px 0",
  fontWeight: "bold",
};

const error = {
  background: "#ffebe6",
  color: "#bf2600",
  padding: "15px",
  borderRadius: "8px",
  marginBottom: "20px",
  fontWeight: "bold",
};

const headerRow = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
};

const badge = {
  padding: "7px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold",
};

const profileGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
  marginTop: "25px",
  textAlign: "left",
};

const avatar = {
  fontSize: "55px",
};

const filterCard = {
  background: "white",
  padding: "22px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow:
    "0 3px 12px rgba(0,0,0,0.08)",
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "15px",
  alignItems: "end",
};

const table = {
  width: "100%",
  borderCollapse:
    "collapse",
  minWidth: "900px",
};

const th = {
  textAlign: "left",
  padding: "13px",
  background: "#f4f5f7",
  borderBottom:
    "2px solid #dfe1e6",
};

const td = {
  padding: "13px",
  borderBottom:
    "1px solid #dfe1e6",
  verticalAlign: "top",
};


// ======================================================
// AUTH STYLES
// ======================================================

const authPage = {
  minHeight: "100vh",
  background: "#f4f6f8",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const authCard = {
  width: "100%",
  maxWidth: "480px",
  background: "white",
  padding: "35px",
  borderRadius: "14px",
  boxShadow:
    "0 5px 25px rgba(0,0,0,0.12)",
};

const brand = {
  textAlign: "center",
  fontSize: "35px",
  fontWeight: "bold",
  color: "#172b4d",
};

const authTitle = {
  textAlign: "center",
  color: "#172b4d",
};

const roleTabs = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: "8px",
  margin:
    "25px 0 15px",
};

const roleButton = {
  padding: "12px",
  border:
    "1px solid #dfe1e6",
  background: "white",
  color: "#172b4d",
  borderRadius: "7px",
  cursor: "pointer",
  fontWeight: "bold",
};

const activeRole = {
  ...roleButton,
  background: "#172b4d",
  color: "white",
};

const modeTabs = {
  display: "flex",
  gap: "5px",
  marginBottom: "20px",
};

const modeButton = {
  flex: 1,
  padding: "10px",
  border: "none",
  background: "#f4f5f7",
  cursor: "pointer",
};

const activeMode = {
  ...modeButton,
  background: "#0c66e4",
  color: "white",
  fontWeight: "bold",
};


export default App;