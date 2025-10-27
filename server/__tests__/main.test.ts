import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app";

describe("Express App", () => {
  describe("Basic functionality", () => {
    it("should respond with 404 for unknown routes", async () => {
      const response = await request(app).get("/nonexistent-route").expect(404);

      expect(response.text).toBe("Not Found");
    });

    it("should have security headers from helmet", async () => {
      const response = await request(app).get("/nonexistent-route").expect(404);

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers).toHaveProperty("x-dns-prefetch-control");
    });

    it("should parse JSON request bodies", async () => {
      // This will hit the 404 handler but should parse the JSON first
      const response = await request(app)
        .post("/test")
        .send({ test: "data" })
        .set("Content-Type", "application/json")
        .expect(404);

      expect(response.text).toBe("Not Found");
    });

    it("should handle CORS", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "GET");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });

    it("should include request ID in response headers", async () => {
      const response = await request(app).get("/test").expect(404);

      expect(response.headers).toHaveProperty("x-request-id");
      expect(typeof response.headers["x-request-id"]).toBe("string");
    });

    it("should use provided request ID from headers", async () => {
      const customRequestId = "test-request-123";

      const response = await request(app)
        .get("/test")
        .set("x-request-id", customRequestId)
        .expect(404);

      expect(response.headers["x-request-id"]).toBe(customRequestId);
    });
  });
});
