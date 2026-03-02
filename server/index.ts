import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Register API routes
registerRoutes(app);

// Serve static files in production
const clientDist = path.join(__dirname, "..", "dist", "public");
app.use(express.static(clientDist));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = parseInt(process.env.PORT || "5000");
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Broker's Command Center running on http://0.0.0.0:${PORT}`);
});
