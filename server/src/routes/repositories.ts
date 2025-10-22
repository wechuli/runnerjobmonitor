import { Router, Request, Response } from "express";
import AppDataSource from "../data-source";
import { Installation } from "../models/Installation";
import { GitHubService } from "../services/github";

const router = Router();

// GET /api/orgs/:org/repos - List repositories for an organization
router.get("/:org/repos", async (req: Request, res: Response) => {
  try {
    const { org } = req.params;

    // Find the installation by organization login
    const installationRepo = AppDataSource.getRepository(Installation);
    const installation = await installationRepo.findOne({
      where: { accountLogin: org },
    });

    if (!installation) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Get repositories from GitHub API
    const githubService = new GitHubService(
      parseInt(installation!.githubInstallationId)
    );
    const repos = await githubService.getInstallationRepositories(
      parseInt(installation.githubInstallationId)
    );

    const repositories = repos.map((repo: any) => ({
      owner: repo.owner?.login || org,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
    }));

    res.json(repositories);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

export default router;
