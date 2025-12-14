import db from "../config/database.js";

export async function findUserByEmail(email) {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
}

export async function getUserById(id) {
  const [rows] = await db.query("SELECT id, username, email FROM users WHERE id = ?", [id]);
  return rows[0];
}

export async function createUser({ username, email, password }) {
  const [result] = await db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  return result.insertId;
}

export async function updateUserPassword(email, hashedPassword) {
  await db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [hashedPassword, email]
  );
}