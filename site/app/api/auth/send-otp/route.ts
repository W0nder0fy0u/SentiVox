import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/network/otp";
import { VALUES } from "@/lib/values";
import { checkRateLimit, updateRateLimit } from "@/network/supabase";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  return VALUES.ALLOWED_EMAIL_DOMAINS.some((domain) =>
    email.toLowerCase().endsWith(domain)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        {
          error: `Only ${VALUES.ALLOWED_EMAIL_DOMAINS.join(
            " or "
          )} emails are allowed`,
        },
        { status: 400 }
      );
    }

    // Check rate limit using database
    const rateLimitResult = await checkRateLimit(normalizedEmail);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Send OTP
    const otp_sent_result = await sendOTP(normalizedEmail);

    if (!otp_sent_result) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    // Update rate limit in database
    await updateRateLimit(normalizedEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
