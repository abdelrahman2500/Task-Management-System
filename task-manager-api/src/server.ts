import app from "./app.js";
import { logger } from "./config/logger.js";

logger.info("Server starting...");

const port = process.env["PORT"] || 3000;
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
