// Verify Authorization: Bearer <token> on protected routes
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }

  const parts = authHeader.split(" ");
  const isBearer = parts.length === 2 && parts[0] === "Bearer";
  if (!isBearer) {
    return res.status(400).json({ message: "Malformed Authorization header" });
  }
  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
    