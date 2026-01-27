import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./api/v1/index.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
dotenv.config();
connectDB();
const app=express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/api",apiRoutes);

const PORT=process.env.PORT || 8081;
app.listen(PORT,()=>console.log(`server is running at port ${PORT}`));