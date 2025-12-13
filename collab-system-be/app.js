import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 60 * 1000 } // OTP expires in 5 minutes
}));

app.use(express.static(path.join(__dirname, "../collab-system-fe")));
app.use("/api", routes);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../collab-system-fe/index.html"));
});

export default app;
