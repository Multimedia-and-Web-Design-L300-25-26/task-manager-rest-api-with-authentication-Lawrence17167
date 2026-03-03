import dotenv from "dotenv";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set JWT_SECRET for testing if not set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret-key";
}

describe("Auth Routes", () => {

  beforeAll(async () => {
    // Ensure MongoDB is connected before tests run
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000
        });
        // Wait a bit for the connection to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        throw error;
      }
    }
  });

  afterAll(async () => {
    // Clean up database after tests
    if (mongoose.connection.readyState === 1) {
      try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
          const collection = collections[key];
          await collection.deleteMany({});
        }
      } catch (error) {
        console.error("Error cleaning up database:", error.message);
      }
    }
  });

  let token;

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.com");
  });

  it("should login user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

});

afterAll(async () => {
  // Clean up database after tests
  if (mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    } catch (error) {
      console.error("Error cleaning up database:", error.message);
    }
  }
});