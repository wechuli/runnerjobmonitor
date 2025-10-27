import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app";

describe("Health Endpoints", () => {
  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("environment");
      expect(typeof response.body.uptime).toBe("number");
    });
  });

  describe("GET /api/ready", () => {
    it("should return readiness status", async () => {
      const response = await request(app).get("/api/ready").expect(200);

      expect(response.body).toHaveProperty("status", "ready");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
