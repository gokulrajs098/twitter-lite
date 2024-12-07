import mongoose from "mongoose";

export const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`connected to database${conn.connection.host}`)
    }catch(error){
        console.error(`error connecting to database${error.message}`)
        process.exit(1)
    }
} 