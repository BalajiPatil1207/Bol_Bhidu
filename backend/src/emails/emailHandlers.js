import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

/**
 * Sends a welcome email to a new user
 * @param {string} email 
 * @param {string} name 
 * @param {string} clientUrl 
 */
export const sendWelcomeEmail = async (email, name, clientUrl) => {
  try {
    const response = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: [email],
      subject: "Welcome to Messenger",
      html: createWelcomeEmailTemplate(name, clientUrl),
    });
    return response;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Could not send welcome email");
  }
};
