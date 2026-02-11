import { VALUES } from "@/lib/values";
import { COLORS } from "@/lib/colors";
import nodemailer from "nodemailer";
import {
  storeOTP as dbStoreOTP,
  getOTP as dbGetOTP,
  deleteOTP as dbDeleteOTP,
} from "./supabase";

export async function addOTP(
  __email: string,
  __otp: string,
  __otp_valid_time: number
) {
  // Store OTP in database with expiration time
  const success = await dbStoreOTP(__email, __otp, __otp_valid_time);

  if (!success) {
    console.error("Failed to store OTP in database for:", __email);
    throw new Error("Failed to store OTP");
  }
}

export async function verifyOTP(__email: string, __otp: string) {
  const actual_otp = await dbGetOTP(__email);
  return actual_otp === __otp;
}

export async function removeOTP(__email: string) {
  await dbDeleteOTP(__email);
}

const OTP_STRING_LEN = 6;
const CHARS_IN_OTP = "abcdefghijklmnopqrstuvwxyz0123456789";
const OTP_VALID_TIME_IN_SECONDS = 300;

function generateOTP(): string {
  const randomValues = new Uint8Array(OTP_STRING_LEN);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map((x) => CHARS_IN_OTP[x % CHARS_IN_OTP.length])
    .join("");
}

const AUTH_EMAIL = process.env.AUTH_EMAIL;
const AUTH_EMAIL_PASSWORD = process.env.AUTH_EMAIL_PASSWORD;

if (!AUTH_EMAIL || !AUTH_EMAIL_PASSWORD) {
  console.error(
    "You forgot to add AUTH_EMAIL or AUTH_EMAIL_PASSWORD in .env file! Found : ",
    AUTH_EMAIL,
    " : ",
    AUTH_EMAIL_PASSWORD
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_EMAIL_PASSWORD,
  },
});

if (!transporter) {
  console.error("Unable to create Gmail Transporter!");
}

export async function sendOTP(__email: string): Promise<boolean> {
  const otp = generateOTP();

  await addOTP(__email, otp, OTP_VALID_TIME_IN_SECONDS);

  try {
    await transporter.sendMail({
      from: `"${VALUES.APP_NAME}" <${AUTH_EMAIL}>`,
      to: __email,
      subject: `Your OTP for ${VALUES.APP_NAME}`,
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #1f3f5b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1f3f5b; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #121218; border-radius: 12px; border: 1px solid #27272a; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center; background: linear-gradient(135deg, ${
                    COLORS.primaryDark
                  } 0%, ${COLORS.primary} 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                      ${VALUES.APP_NAME}
                    </h1>
                  </td>
                </tr>
 
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #fafafa; font-size: 24px; font-weight: 600;">
                      Verification Code
                    </h2>
                    
                    <p style="margin: 0 0 15px 0; color: #fafafa; font-size: 16px; line-height: 1.6;">
                      Hello there! 👋
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                      Your one-time password (OTP) for <strong>${
                        VALUES.APP_NAME
                      }</strong> is:
                    </p>
 
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                      <tr>
                        <td align="center" style="background-color: rgba(68, 137, 200, 0.1); border: 2px dashed ${
                          COLORS.primary
                        }; border-radius: 12px; padding: 30px;">
                          <span style="font-size: 42px; font-weight: 800; color: ${
                            COLORS.primary
                          }; letter-spacing: 12px; font-family: 'SF Mono', 'Fira Code', monospace; text-shadow: 0 0 15px rgba(68, 137, 200, 0.3);">
                            ${otp}
                          </span>
                        </td>
                      </tr>
                    </table>
 
                    <p style="margin: 0 0 25px 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                      This code will expire in <strong style="color: ${
                        COLORS.primary
                      };">${Math.floor(
        OTP_VALID_TIME_IN_SECONDS / 60
      )} minutes</strong>. Please do not share it with anyone.
                    </p>
 
                    <div style="height: 1px; background-color: #27272a; margin-bottom: 25px;"></div>
 
                    <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.6; font-style: italic;">
                      If you didn't request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
 
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid #27272a; border-radius: 0 0 12px 12px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 13px; font-weight: 500;">
                      © 2026 ${VALUES.APP_NAME}. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Advanced Sentiment Analysis Platform
                    </p>
                  </td>
                </tr>
 
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
    });

    return true;
  } catch (err) {
    console.error("Failed to send mail : " + err);
  }
  return false;
}
