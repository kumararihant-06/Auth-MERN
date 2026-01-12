import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import authRoutes from "../backend/routes/auth.routes.js"
const app = express();
dotenv.config()

app.get("/", (req, res) => {
  res.send("hello");
  console.log("hitting /");
});

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log(`Server running on port : ${process.env.PORT}`);
  connectDB();
});

