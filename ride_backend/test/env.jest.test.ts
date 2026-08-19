import { validateEnvironment, type EnvironmentVariables } from "../src/config/env.js";

const validEnvironment: EnvironmentVariables = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/rides",
  SESSION_SECRET: "a-long-development-session-secret",
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  REDIRECT_URL: "http://localhost:3000/auth/google/callback",
  FRONTEND_URL: "http://localhost:5173",
  ALLOWED_DOMAINS: "iiti.ac.in",
  EMAIL_USER_SENDER: "sender@example.com",
  EMAIL_APP_PASSWORD: "app-password",
  EMAIL_USER_RECEIVER: "receiver@example.com",
};

describe("environment validation", () => {
  test("normalizes development configuration", () => {
    const config = validateEnvironment(validEnvironment);
    expect(config.serverPort).toBe(3000);
    expect(config.frontendOrigins).toEqual(["http://localhost:5173"]);
    expect(config.cookieSecure).toBe(false);
    expect(config.cookieSameSite).toBe("lax");
  });

  test("rejects missing required values", () => {
    const invalidEnvironment = { ...validEnvironment };
    delete invalidEnvironment.SESSION_SECRET;
    expect(() => validateEnvironment(invalidEnvironment)).toThrow("SESSION_SECRET");
  });

  test("requires secure cookies for cross-site cookies", () => {
    expect(() => validateEnvironment({ ...validEnvironment, COOKIE_SAME_SITE: "none", COOKIE_SECURE: "false" }))
      .toThrow("COOKIE_SECURE");
  });
});
