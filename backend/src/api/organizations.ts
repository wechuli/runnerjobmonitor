import { Router } from 'express';
import prisma from '../db';

const router = Router();

// GET /api/organizations - List all installations (organizations) for the authenticated user
router.get('/', async (req, res) => {
  try {
    // In a real implementation, you would get the userId from the session/JWT
    // For now, we'll return all installations
    const installations = await prisma.installation.findMany({
      select: {
        id: true,
        githubInstallationId: true,
        accountLogin: true,
        accountType: true,
        avatarUrl: true,
      },
      orderBy: {
        accountLogin: 'asc',
      },
    });

    const organizations = installations.map((inst) => ({
      id: inst.id,
      login: inst.accountLogin,
      name: inst.accountLogin,
      avatarUrl: inst.avatarUrl,
    }));

    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

export default router;
