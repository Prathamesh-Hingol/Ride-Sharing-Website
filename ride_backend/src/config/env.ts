import "dotenv/config";

const REQUIRED_RUNTIME_VARIABLES = [
  "DATABASE_URL", "SESSION_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "REDIRECT_URL", "FRONTEND_URL", "ALLOWED_DOMAINS",
  "EMAIL_USER_SENDER", "EMAIL_APP_PASSWORD", "EMAIL_USER_RECEIVER",
] as const;

const TRUE_VALUES = new Set(["true", "1", "yes"]);

export interface EnvironmentVariables {
  [key: string]: string | undefined;
}

export interface RuntimeEnvironment {
  nodeEnv: string;
  isProduction: boolean;
  serverPort: number;
  frontendOrigins: string[];
  databaseUrl: string;
  databaseSsl: boolean;
  sessionSecret: string;
  cookieSecure: boolean;
  cookieSameSite: "lax" | "strict" | "none";
  googleClientId: string;
  googleClientSecret: string;
  redirectUrl: string;
  allowedDomains: string[];
  emailSender: string;
  emailPassword: string;
  emailReceiver: string;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return TRUE_VALUES.has(value.toLowerCase());
}

function parseOrigins(value: string | undefined): string[] {
  return (value ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 3000);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : Number.NaN;
}

export function validateEnvironment(environment: EnvironmentVariables = process.env): RuntimeEnvironment {
  const missing = REQUIRED_RUNTIME_VARIABLES.filter((name) => !environment[name]);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);

  const nodeEnv = environment.NODE_ENV ?? "development";
  const frontendOrigins = parseOrigins(environment.FRONTEND_URL);
  const serverPort = parsePort(environment.SERVER_PORT ?? environment.PORT);
  const cookieSecure = parseBoolean(environment.COOKIE_SECURE, nodeEnv === "production");
  const cookieSameSite = environment.COOKIE_SAME_SITE ?? (cookieSecure ? "none" : "lax");

  if (Number.isNaN(serverPort)) throw new Error("SERVER_PORT must be a valid TCP port between 1 and 65535");
  if (frontendOrigins.length === 0 || frontendOrigins.some((origin) => !/^https?:\/\//.test(origin))) {
    throw new Error("FRONTEND_URL must contain one or more valid http(s) origins");
  }
  if (!["lax", "strict", "none"].includes(cookieSameSite)) throw new Error("COOKIE_SAME_SITE must be one of: lax, strict, none");
  if (cookieSameSite === "none" && !cookieSecure) throw new Error("COOKIE_SECURE must be true when COOKIE_SAME_SITE is none");
  if (nodeEnv === "production" && environment.SESSION_SECRET!.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters in production");

  return Object.freeze({
    nodeEnv, isProduction: nodeEnv === "production", serverPort, frontendOrigins,
    databaseUrl: environment.DATABASE_URL!, databaseSsl: parseBoolean(environment.DATABASE_SSL, true),
    sessionSecret: environment.SESSION_SECRET!, cookieSecure, cookieSameSite: cookieSameSite as RuntimeEnvironment["cookieSameSite"],
    googleClientId: environment.GOOGLE_CLIENT_ID!, googleClientSecret: environment.GOOGLE_CLIENT_SECRET!,
    redirectUrl: environment.REDIRECT_URL!, allowedDomains: parseOrigins(environment.ALLOWED_DOMAINS),
    emailSender: environment.EMAIL_USER_SENDER!,
    emailPassword: environment.EMAIL_APP_PASSWORD!,
    emailReceiver: environment.EMAIL_USER_RECEIVER!,
  });
}

export function getEnvironment(): RuntimeEnvironment {
  return validateEnvironment(process.env);
}
