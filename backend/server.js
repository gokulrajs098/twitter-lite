import express from "express";
import authRoutes from "./routes/auth.route.js";
import  userRoutes  from "./routes/user.route.js";
import  postRoutes  from "./routes/post.route.js";
import  notificationRoutes  from "./routes/notification.route.js";

import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from 'url';
import path from "path";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log(process.env.MONGO_URI)

const app = express()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const PORT = process.env.PORT
app.use(express.json()); // To parse request body in json format
app.use(express.urlencoded({extended:true})); // To parse form data
app.use(cookieParser())

app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)


app.listen(PORT, ()=>{
    connectDB()
    console.log(`sever is running in http://localhost:${PORT || 5000}`)

})