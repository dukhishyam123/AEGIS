const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET is not configured in .env"
  );
}


// ======================================================
// AUTHENTICATE TOKEN
// ======================================================

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication token required.",
      });
    }

    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        message: "Invalid authorization format.",
      });
    }

    const token = parts[1];

    jwt.verify(
      token,
      JWT_SECRET,
      (error, decoded) => {
        if (error) {
          console.error(
            "JWT verification error:",
            error.message
          );

          return res.status(401).json({
            message: "Invalid or expired token.",
          });
        }

        req.user = decoded;

        next();
      }
    );

  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
}


// ======================================================
// ROLE AUTHORIZATION
// ======================================================

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to access this resource.",
      });
    }

    next();
  };
}


module.exports = {
  authenticateToken,
  authorizeRoles,
};