const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


// ======================================================
// REGISTER CITIZEN
// POST /api/auth/register
// ======================================================

router.post("/register", async (req, res) => {
  try {

    const {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existing =
      await pool.query(
        `SELECT id
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [normalizedEmail]
      );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    const result =
      await pool.query(
        `INSERT INTO users
         (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'CITIZEN')
         RETURNING
           id,
           name,
           email,
           role`,
        [
          name.trim(),
          normalizedEmail,
          passwordHash,
        ]
      );

    const user =
      result.rows[0];

    const token =
      jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

    return res.status(201).json({
      message:
        "Citizen account created successfully.",
      token,
      user,
    });

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to register citizen.",
    });
  }
});


// ======================================================
// LOGIN
// POST /api/auth/login
// ======================================================

router.post("/login", async (req, res) => {

  try {

    const {
      email,
      password,
      role,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const result =
      await pool.query(
        `SELECT
           id,
           name,
           email,
           password_hash,
           role
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [normalizedEmail]
      );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const user =
      result.rows[0];

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // If frontend requested a specific role,
    // make sure the account actually has it.
    if (
      role &&
      user.role !== role
    ) {
      return res.status(403).json({
        message:
          `This account is not registered as ${role}.`,
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

    return res.status(200).json({
      message: "Login successful.",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message:
        "Login failed.",
    });
  }
});


module.exports = router;