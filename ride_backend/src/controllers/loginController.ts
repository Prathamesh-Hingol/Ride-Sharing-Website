import { google } from "googleapis";
import type { Request, Response } from "express";
import { isEmailAllowed } from "../utils.js";
import { findByGoogleId, create, update } from "../models/userModel.js";
import { logger } from "../config/logger.js";
import { getEnvironment } from "../config/env.js";

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

/**
 * Build the OAuth2 client on first use — deferred so the module can be
 * imported in tests without requiring all env vars to be present.
 */
function getOauthClient() {
  const env = getEnvironment();
  return new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, env.redirectUrl);
}

export const loginRedirect = (req: Request, res: Response): void => {
  const env = getEnvironment();
  const FRONTEND_URL = env.frontendOrigins[0];

  if (req.session.user) {
    res.redirect(`${FRONTEND_URL}/profile?status=already_authenticated`);
    return;
  }

  const authUrl = getOauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: SCOPES,
  });
  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const env = getEnvironment();
  const FRONTEND_URL = env.frontendOrigins[0];
  const { code, error, error_description } = req.query as Record<string, string | undefined>;

  logger.info("OAuth callback received:");
  logger.info(`Code length: ${code ? code.length : "No code"}`);
  logger.info(`Error: ${error}`);
  logger.info(`Session ID: ${req.sessionID}`);

  if (error) {
    logger.warn(`OAuth error: ${error} - ${error_description}`);
    res.redirect(
      `${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent("Authentication cancelled or failed")}`,
    );
    return;
  }

  if (!code) {
    res.redirect(
      `${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent("Authorization code not provided")}`,
    );
    return;
  }

  try {
    const oauthClient = getOauthClient();
    oauthClient.setCredentials({});

    logger.info("Attempting to exchange code for tokens...");
    const { tokens } = await oauthClient.getToken(code);
    logger.info("Tokens received successfully");
    oauthClient.setCredentials(tokens);

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: env.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      res.redirect(`${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent("Invalid token payload")}`);
      return;
    }

    if (!isEmailAllowed(payload.email)) {
      logger.error(`Email domain not allowed: ${payload.email}`);
      res.redirect(
        `${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent("Email domain not allowed")}`,
      );
      return;
    }

    let user = await findByGoogleId(payload.sub);

    if (user) {
      const updated = await update(user.id, { name: payload.name, picture: payload.picture });
      if (updated) user = updated;
    } else {
      user = await create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    }

    req.session.user = {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      name: user.name ?? null,
      picture: user.picture ?? null,
      isAdmin: user.isadmin ?? null,
    };

    req.session.refreshToken = tokens.refresh_token ?? undefined;
    res.redirect(`${FRONTEND_URL}/profile?status=success`);
  } catch (err) {
    const error = err as Error;
    logger.error(`Error during authentication: ${error}`);

    if (error.message.includes("invalid_grant")) {
      logger.error("Invalid grant — possible causes: code already used, expired, clock skew, or wrong redirect URI");
    }
    res.redirect(`${FRONTEND_URL}/signin?status=error&message=${encodeURIComponent(error.message)}`);
  }
};

export const getStatus = (req: Request, res: Response): void => {
  if (!req.session.user) {
    res.status(401).json({ isAuthenticated: false, user: null });
    return;
  }
  res.status(200).json({ isAuthenticated: true, user: req.session.user });
};

export const logout = (req: Request, res: Response): void => {
  if (!req.session.user) {
    res.status(400).json({ error: "No user session found" });
    return;
  }
  req.session.destroy((err: Error | null) => {
    if (err) {
      logger.error("Error during logout:", err);
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("rideshare.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};
