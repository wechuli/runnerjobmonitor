import { Router, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JobMetrics } from "../models/JobMetrics";
import { z } from "zod";

const router = Router();

// Zod schema for validation
const jobMetricsSchema = z.object({
  timestamp: z.string(),
  job_uuid: z.string().uuid(),
  github_context: z.object({
    user: z.string(),
    repositories: z.array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    ),
  }),
  system: z.object({
    info: z.object({
      hostname: z.string(),
      kernel: z.string(),
      uptime_seconds: z.number(),
    }),
    cpu: z.object({
      cores: z.number(),
      model: z.string(),
      load: z.object({
        avg_1min: z.number(),
        avg_5min: z.number(),
        avg_15min: z.number(),
      }),
      current_usage: z.object({
        usage_percent: z.number(),
      }),
    }),
    memory: z.object({
      total_bytes: z.number(),
      used_bytes: z.number(),
      free_bytes: z.number(),
      available_bytes: z.number(),
      usage_percent: z.number(),
    }),
    disk: z.array(
      z.object({
        filesystem: z.string(),
        size_bytes: z.number(),
        used_bytes: z.number(),
        available_bytes: z.number(),
        use_percentage: z.number(),
        mounted_on: z.string(),
      })
    ),
    network: z.array(
      z.object({
        interface: z.string(),
        state: z.string(),
        stats: z.object({
          rx_bytes: z.number(),
          tx_bytes: z.number(),
        }),
      })
    ),
    top_processes: z.array(
      z.object({
        pid: z.number(),
        cpu: z.number(),
        mem: z.number(),
        user: z.string(),
        command: z.string(),
      })
    ),
  }),
});

// POST /api/metrics - Store job metrics
router.post("/", async (req: Request, res: Response): Promise<void> => {
  console.log("📥 Received POST request to /api/metrics");
  console.log("Request body keys:", Object.keys(req.body));

  try {
    // Validate the request body
    console.log("🔍 Validating request data...");
    const validatedData = jobMetricsSchema.parse(req.body);
    console.log("✅ Validation passed");

    // Create and save the job metrics
    console.log("💾 Saving to MongoDB...");
    const jobMetrics = new JobMetrics(validatedData);
    const savedMetrics = await jobMetrics.save();
    console.log("✅ Saved successfully, ID:", savedMetrics._id);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Job metrics stored successfully",
      data: {
        id: savedMetrics._id,
        job_uuid: savedMetrics.job_uuid,
        timestamp: savedMetrics.timestamp,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid request data",
        errors: error.issues,
      });
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to store job metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/metrics/:job_uuid - Get all metrics for a specific job UUID
router.get("/:job_uuid", async (req: Request, res: Response): Promise<void> => {
  try {
    const { job_uuid } = req.params;
    console.log("🔍 GET /:job_uuid called with:", job_uuid);

    const metrics = await JobMetrics.find({ job_uuid }).sort({ timestamp: -1 });
    console.log(`📊 Found ${metrics.length} metrics for job_uuid: ${job_uuid}`);

    if (metrics.length === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `No metrics found for job UUID: ${job_uuid}`,
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      count: metrics.length,
      data: metrics,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve job metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/metrics - Get all metrics with optional pagination
// router.get("/", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const skip = (page - 1) * limit;

//     const [metrics, total] = await Promise.all([
//       JobMetrics.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
//       JobMetrics.countDocuments(),
//     ]);

//     res.status(StatusCodes.OK).json({
//       success: true,
//       data: metrics,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Failed to retrieve job metrics",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// });

export default router;
