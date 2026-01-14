import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/connectDB.js";
import authRoutes from "../backend/routes/auth.routes.js";

dotenv.config();
const PORT = process.env.PORT || 3000

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log(`Server running on port : ${PORT}`);
  connectDB();
});
