import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = "mongodb://localhost:27017";
    if (!uri) throw new Error("MONGO_URI is not set");

    try {
        await mongoose.connect(uri, {dbName: 'chatty'})
        console.log("MongoDB connected!")
    } catch (error) {
        console.error("MongoDB connection error", error);
        process.exit(1);
    }
}