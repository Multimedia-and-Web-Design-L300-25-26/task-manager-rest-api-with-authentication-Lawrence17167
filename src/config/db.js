import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.warn("MONGO_URI not set, skipping database connection");
      return;
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Don't exit in test environment, allow graceful failure
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }
};

export default connectDB;