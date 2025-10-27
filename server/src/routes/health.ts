import { Router } from "express";
import { StatusCodes } from "http-status-codes";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(StatusCodes.OK).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

export default healthRouter;
