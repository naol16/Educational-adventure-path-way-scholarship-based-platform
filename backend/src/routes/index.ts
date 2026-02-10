// app.ts or index.ts
import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
// ... the rest of your imports
import userRouter from "./userRoutes.js";
import authRouter from "./authRoutes.js";

export default {
    userRouter,
    authRouter,
};