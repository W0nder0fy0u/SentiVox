import { NextRequest, NextResponse } from "next/server";
import { verifyOTP, removeOTP } from "@/network/otp";
import { checkUserExists, getUserByEmail } from "@/network/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = otp.toLowerCase().trim();

    console.log(`[OTP Verify] Attempting verification for: ${normalizedEmail}`);

    // Verify OTP
    const isValid = await verifyOTP(normalizedEmail, normalizedOtp);

    if (!isValid) {
      console.log(
        `[OTP Verify] Invalid or expired OTP for: ${normalizedEmail}`
      );
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    console.log(
      `[OTP Verify] OTP verified successfully for: ${normalizedEmail}`
    );

    // OTP is valid - remove it from database to prevent reuse
    await removeOTP(normalizedEmail);

    // Check if user exists in database
    const userExists = await checkUserExists(normalizedEmail);

    if (userExists) {
      // Existing user - fetch their data
      const user = await getUserByEmail(normalizedEmail);

      if (!user) {
        console.error(
          `[OTP Verify] User exists but failed to fetch data for: ${normalizedEmail}`
        );
        return NextResponse.json(
          { error: "Failed to retrieve user data. Please try again." },
          { status: 500 }
        );
      }

      console.log(`[OTP Verify] Existing user logged in: ${normalizedEmail}`);
      return NextResponse.json({
        success: true,
        exists: true,
        user: user,
      });
    } else {
      // New user - they need to complete registration
      console.log(
        `[OTP Verify] New user needs registration: ${normalizedEmail}`
      );
      return NextResponse.json({
        success: true,
        exists: false,
      });
    }
  } catch (error) {
    console.error("[OTP Verify] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
