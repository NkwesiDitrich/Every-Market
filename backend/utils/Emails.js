const sgMail = require("@sendgrid/mail");

const from = {
  email: process.env.SENDGRID_FROM_EMAIL,
  name: process.env.SENDGRID_FROM_NAME || "Every Market",
};

/**
 * Send an email.
 *
 * - In production (PRODUCTION === "true"):
 *   - Requires SENDGRID_API_KEY and SENDGRID_FROM_EMAIL, otherwise throws.
 * - In development:
 *   - If SendGrid env vars are missing, logs the email to console and returns without throwing,
 *     so local signup / OTP flows still work.
 */
exports.sendMail = async (receiverEmail, subject, body) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const isProduction = process.env.PRODUCTION === "true";

  // If running in development and email is not configured,
  // just log the would-be email and exit without error.
  if (!isProduction && (!apiKey || !from.email)) {
    console.log("[DEV] Email send skipped (missing SENDGRID config).");
    console.log({
      to: receiverEmail,
      from,
      subject,
      html: body,
    });
    return;
  }

  // In production, enforce proper configuration.
  if (!apiKey) {
    const errorMsg = "SENDGRID_API_KEY is required. Set it in your production .env.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  sgMail.setApiKey(apiKey);
  
  if (!from.email) {
    const errorMsg = "SENDGRID_FROM_EMAIL is required. Use a verified sender in production.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    await sgMail.send({
      to: receiverEmail,
      from,
      subject,
      html: body,
    });
    console.log(`Email sent successfully to ${receiverEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${receiverEmail}:`, error.message);
    if (error.response) {
      console.error(error.response.body);
    }
    
    if (!isProduction && error.code === 401) {
      console.error("[DEV] SendGrid Unauthorized (401). Falling back to console log.");
      console.log({
        to: receiverEmail,
        from,
        subject,
        html: body,
      });
      return;
    }
    throw error;
  }
};
