// Verify Authorization: Bearer <token> on protected routes
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  // 1) Read the Authorization header (e.g., "Bearer xxx.yyy.zzz")
  const authHeader = req.headers.authorization;

  // 2) If missing, block access
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header provided" });
  }

  // 3) Extract the token (split "Bearer <token>")
  const parts = authHeader.split(" ");
  const isBearer = parts.length === 2 && parts[0] === "Bearer";
  if (!isBearer) {
    return res.status(400).json({ message: "Malformed Authorization header" });
  }
  const token = parts[1];

  try {
    // 4) Verify token with our JWT secret (from .env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5) Attach decoded info to request for downstream handlers (e.g. req.user.id)
    req.user = decoded;

    // 6) Continue to the next middleware/route handler
    next();
  } catch (err) {
    // 7) Token invalid or expired
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
    