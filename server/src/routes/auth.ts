import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import ca from "zod/v4/locales/ca.js";

const oauthRouter = Router();

oauthRouter.post("/callback", async (_req, res) => {
  // print the request data
  console.log(_req.body);

  const client_id = process.env.CLIENT_ID as string;
  const client_secret = process.env.CLIENT_SECRET as string;
  const code = _req.body.code;
  const state = _req.body.state;
  const tokenUrl = "https://github.com/login/oauth/access_token";

  const tokenData = new URLSearchParams();
  tokenData.append("grant_type", "authorization_code");
  tokenData.append("client_id", client_id);
  tokenData.append("client_secret", client_secret);
  tokenData.append("code", code as string);
  tokenData.append("redirect_uri", "http://localhost:8080/api/auth/callback");

  try {
    const tokenResponse = await axios.post(tokenUrl, tokenData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const tokens = tokenResponse.data;
    console.log("Tokens received:", tokens);
    res.status(StatusCodes.OK).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Error during token exchange:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Token exchange failed",
    });
  }
});

export default oauthRouter;
