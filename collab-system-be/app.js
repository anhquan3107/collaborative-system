import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js"

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../collab-system-fe")));
app.use("/api", routes);                            // Mount API at /api

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../collab-system-fe/index.html"));
});

export default app;
