import { getEnvironment } from "../config/env.js";

/**
 * Returns true when the email's domain is in the allowed-domains list.
 * Used to restrict login to IIT Indore addresses.
 */
export const isEmailAllowed = (email: string): boolean => {
  const { allowedDomains } = getEnvironment();
  const emailDomain = email?.split("@")[1]?.toLowerCase();
  return allowedDomains.includes(emailDomain);
};
