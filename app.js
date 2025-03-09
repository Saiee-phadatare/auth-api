const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config(); // Load .env in local development

const authRouter = require("./routers/authRouter");
const postRouter = require("./routers/postRouter");

const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
}));
app.use(limiter);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is not defined in environment variables.");
    process.exit(1);
}
if (!process.env.PORT) {
    console.error("❌ ERROR: PORT is not defined. Using default 5000.");
    process.env.PORT = 5000;
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB Connection Error:", err);
});
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected. Attempting to reconnect...");
    mongoose.connect(process.env.MONGO_URI);
});

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.get("/", (req, res) => res.send("Server is Running! 🚀"));

app.listen(process.env.PORT, () => console.log(`🚀 Server started on port ${process.env.PORT}`));
