import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export const FROM_EMAIL = "The Daily Libra <hello@thedailylibra.com>";
