const express = require("express");
const pool = require("../db");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth");

const router = express.Router();


// ======================================================
// POST /api/incidents
// CITIZEN CREATES INCIDENT
// ======================================================

router.post(
  "/",
  authenticateToken,
  authorizeRoles("CITIZEN"),
  async (req, res) => {

    try {

      const {
        incident_type,
        description,
        latitude,
        longitude,
      } = req.body;

      if (
        !incident_type ||
        !description ||
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          message:
            "All incident fields are required.",
        });
      }

      const lat =
        Number(latitude);

      const lng =
        Number(longitude);

      if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
      ) {
        return res.status(400).json({
          message:
            "Latitude and longitude must be valid numbers.",
        });
      }

      if (
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          message:
            "Invalid latitude or longitude.",
        });
      }

      const result =
        await pool.query(
          `INSERT INTO incidents
           (
             user_id,
             incident_type,
             description,
             latitude,
             longitude
           )
           VALUES
           ($1, $2, $3, $4, $5)
           RETURNING
             id,
             user_id,
             incident_type,
             description,
             latitude,
             longitude,
             status,
             created_at`,
          [
            req.user.id,
            incident_type,
            description.trim(),
            lat,
            lng,
          ]
        );

      return res.status(201).json({
        message:
          "Emergency incident reported successfully.",

        incident:
          result.rows[0],
      });

    } catch (error) {

      console.error(
        "Error creating incident:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create emergency incident.",
      });
    }
  }
);


// ======================================================
// GET /api/incidents/my
// CITIZEN'S OWN REPORTS
// ======================================================

router.get(
  "/my",
  authenticateToken,
  authorizeRoles("CITIZEN"),
  async (req, res) => {

    try {

      const result =
        await pool.query(
          `SELECT
             id,
             user_id,
             incident_type,
             description,
             latitude,
             longitude,
             status,
             created_at
           FROM incidents
           WHERE user_id = $1
           ORDER BY created_at DESC`,
          [req.user.id]
        );

      return res.status(200).json({
        count: result.rows.length,
        incidents: result.rows,
      });

    } catch (error) {

      console.error(
        "Error fetching citizen reports:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to retrieve your reports.",
      });
    }
  }
);


// ======================================================
// GET /api/incidents
// OFFICER / ADMIN DASHBOARD
// ======================================================

router.get(
  "/",
  authenticateToken,
  authorizeRoles("OFFICER", "ADMIN"),
  async (req, res) => {

    try {

      const {
        status,
        incident_type,
      } = req.query;

      let query = `
        SELECT
          incidents.id,
          incidents.user_id,
          incidents.incident_type,
          incidents.description,
          incidents.latitude,
          incidents.longitude,
          incidents.status,
          incidents.created_at,
          users.name AS citizen_name,
          users.email AS citizen_email
        FROM incidents
        LEFT JOIN users
          ON incidents.user_id = users.id
      `;

      const values = [];
      const conditions = [];

      if (status) {

        values.push(status);

        conditions.push(
          `incidents.status = $${values.length}`
        );
      }

      if (incident_type) {

        values.push(
          incident_type
        );

        conditions.push(
          `incidents.incident_type = $${values.length}`
        );
      }

      if (conditions.length > 0) {

        query +=
          " WHERE " +
          conditions.join(" AND ");
      }

      query +=
        " ORDER BY incidents.created_at DESC";

      const result =
        await pool.query(
          query,
          values
        );

      return res.status(200).json({
        count: result.rows.length,
        incidents: result.rows,
      });

    } catch (error) {

      console.error(
        "Error fetching incidents:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to retrieve incidents.",
      });
    }
  }
);


// ======================================================
// GET /api/incidents/:id
// AUTHENTICATED USER
// ======================================================

router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const result =
        await pool.query(
          `SELECT
             id,
             user_id,
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

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Incident not found.",
        });
      }

      const incident =
        result.rows[0];

      // Citizens can only view their own
      // individual incident.
      if (
        req.user.role === "CITIZEN" &&
        incident.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to view this incident.",
        });
      }

      return res.status(200).json({
        incident,
      });

    } catch (error) {

      console.error(
        "Error fetching incident:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to retrieve incident.",
      });
    }
  }
);


// ======================================================
// PUT /api/incidents/:id/status
// OFFICER / ADMIN ONLY
// ======================================================

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("OFFICER", "ADMIN"),
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses = [
        "REPORTED",
        "ACKNOWLEDGED",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ];

      if (
        !status ||
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid incident status.",
        });
      }

      const result =
        await pool.query(
          `UPDATE incidents
           SET status = $1
           WHERE id = $2
           RETURNING
             id,
             user_id,
             incident_type,
             description,
             latitude,
             longitude,
             status,
             created_at`,
          [
            status,
            id,
          ]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Incident not found.",
        });
      }

      return res.status(200).json({
        message:
          "Incident status updated successfully.",

        incident:
          result.rows[0],
      });

    } catch (error) {

      console.error(
        "Error updating status:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update incident status.",
      });
    }
  }
);


module.exports = router;