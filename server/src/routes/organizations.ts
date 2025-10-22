import { Router, Request, Response } from "express";
import AppDataSource from "../data-source";
import { Installation } from "../models/Installation";

const router = Router();

// GET /api/organizations - List all installations (organizations) for the authenticated user
router.get("/", async (req: Request, res: Response) => {
  try {
    // In a real implementation, you would get the userId from the session/JWT
    // For now, we'll return all installations
    const installationRepo = AppDataSource.getRepository(Installation);
    const installations = await installationRepo.find({
      select: [
        "id",
        "githubInstallationId",
        "accountLogin",
        "accountType",
        "avatarUrl",
      ],
      order: { accountLogin: "ASC" },
    });

    const organizations = installations.map((inst) => ({
      id: inst.id,
      login: inst.accountLogin,
      name: inst.accountLogin,
      avatarUrl: inst.avatarUrl,
    }));

    res.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

export default router;
