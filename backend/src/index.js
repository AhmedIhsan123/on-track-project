import "./env.js";
import "express-async-errors";
import express from "express";
import cors from "cors";
import { supabase } from "./db/supabase.js";
import authRouter from "./routes/auth.js";
import applicationsRouter from "./routes/applications.js";
import scraperRouter from "./routes/scraper.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

app.get("/health", async (req, res) => {
	const { error } = await supabase.from("users").select("id").limit(1);
	res.json({
		status: "ok",
		db: error ? `error: ${error.message}` : "connected",
	});
});

app.use("/auth", authRouter);
app.use("/applications", applicationsRouter);
app.use("/scraper", scraperRouter);

// 404 — route not registered
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler (express-async-errors funnels thrown errors here)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
