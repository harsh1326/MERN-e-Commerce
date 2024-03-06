import express from "express";
import colors from "colors";
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from "./config/db.js";
import authRoutes from  "./routes/authRoutes.js"
import categoryRoute from "./routes/categoryRoute.js"
import ProductRoute from "./routes/productRoutes.js"
import { fileURLToPath } from 'url';
import path from "path"

import cors from 'cors'

// configure env
dotenv.config()

// Database Config
connectDB();

// Rest Object
const app = express();

// MiddleWare
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Resolve __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files
app.use(express.static(path.join(__dirname, "./client/build")));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", ProductRoute);

app.use('*', function(req,res){
    res.sendFile(path.join(__dirname, './client/build/index.html'))
});

const PORT = process.env.PORT || 5000; // Set a default port if PORT environment variable is not defined

app.listen(PORT, ()=>{
    console.log(`Server Running on ${PORT}`.bgCyan.white);
});
