import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected : ${conn.connection.host}`)
    } catch (error) {
        console.log("Failed to connect to DB, An error occurred: ",error);
        process.exit(1);
    }

}