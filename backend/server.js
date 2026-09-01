require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes =
  require("./routes/auth");

const incidentRoutes =
  require("./routes/incidents");

const app = express();

const PORT =
  process.env.PORT || 5000;


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json()
);


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "AEGIS backend is running.",
  });
});


// ======================================================
// ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/incidents",
  incidentRoutes
);


// ======================================================
// 404
// ======================================================

app.use(
  (req, res) => {
    res.status(404).json({
      message:
        "API route not found.",
    });
  }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (error, req, res, next) => {

    console.error(
      "Unhandled server error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error.",
    });
  }
);


// ======================================================
// START
// ======================================================

app.listen(
  PORT,
  () => {
    console.log(
      `AEGIS backend running on http://localhost:${PORT}`
    );
  }
);