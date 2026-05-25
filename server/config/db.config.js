import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;

        // Check if URI exists
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        // Connect to MongoDB
        const conn = await mongoose.connect(MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        
        // Exit process if DB fails 
        process.exit(1);
    }
};

export default connectDB;