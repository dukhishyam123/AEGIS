const express = require("express");
const pool = require("../db");

const router = express.Router();

// POST /api/incidents
router.post("/", async (req, res) => {
  try {
    const {
      incident_type,
      description,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (
      !incident_type ||
      !description ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All incident fields are required.",
      });
    }

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude.",
      });
    }

    const result = await pool.query(
      `INSERT INTO incidents
       (incident_type, description, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING id, incident_type, description, latitude, longitude, status, created_at`,
      [incident_type, description, latitude, longitude]
    );

    res.status(201).json({
      message: "Emergency incident reported successfully.",
      incident: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating incident:", error);

    res.status(500).json({
      message: "Failed to create emergency incident.",
    });
  }
});
// GET /api/incidents/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        id,
        incident_type,
        description,
        latitude,
        longitude,
        status,
        created_at
       FROM incidents
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Incident not found.",
      });
    }

    res.status(200).json({
      incident: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching incident:", error);

    res.status(500).json({
      message: "Failed to retrieve incident.",
    });
  }
});
module.exports = router;