import winston from "winston";
import { getEnvironment } from "./env.js";

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
);

export const logger: winston.Logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: "logs/exceptions.log",
      format: fileFormat,
    }),
  ],
});

// In non-production environments also log to the console with colorized output.
if (getEnvironment().nodeEnv !== "production") {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}
