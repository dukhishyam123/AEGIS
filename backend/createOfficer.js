require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createOfficer() {
  try {
    const password = "officer123";

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           role = 'OFFICER'
       WHERE email = $2
       RETURNING id, name, email, role`,
      [passwordHash, "officer@test.com"]
    );

    console.log("Officer updated:");
    console.log(result.rows[0]);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

createOfficer();