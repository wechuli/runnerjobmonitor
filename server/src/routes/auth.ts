import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "Iv23ctWkbzHS5mHAzOIg";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";

// POST /auth/github/callback - Exchange code for access token
router.post("/github/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    if (!GITHUB_CLIENT_SECRET) {
      return res
        .status(500)
        .json({ error: "GitHub client secret not configured" });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${FRONTEND_URL}/auth/callback`,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      return res.status(400).json({ error: error_description || error });
    }

    // Get user information
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const user = userResponse.data;

    res.json({
      access_token,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    console.error(
      "OAuth callback error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to authenticate with GitHub",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
