import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import issuesRoutes from "./routes/issues";
import { adminLogin, verifyAdminToken, getAdminProfile } from "./controllers/adminController";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin auth routes
app.post("/api/admin-login", adminLogin);
app.get("/api/admin/profile", verifyAdminToken, getAdminProfile);

// Basic routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Hamro Chautari API" });
});

// Import and use issues routes
app.use("/api", issuesRoutes);

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📊 Issues API: http://localhost:${port}/api/issues`);
});

export default app;
