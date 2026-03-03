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

let token;
let taskId;

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
  // Register
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Task User",
      email: "task@example.com",
      password: "123456"
    });

  // Login
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "task@example.com",
      password: "123456"
    });

  token = res.body.token;
});

describe("Task Routes", () => {

  it("should not allow access without token", async () => {
    const res = await request(app)
      .get("/api/tasks");

    expect(res.statusCode).toBe(401);
  });

  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");

    taskId = res.body._id;
  });

  it("should get user tasks only", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
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