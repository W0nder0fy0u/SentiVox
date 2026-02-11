"use server";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// User type definition
export interface User {
  email: string;
  name: string;
  apikey: string;
  join_date: string;
}

// Initialize Supabase client with service role for server-side operations
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

const supabase = getSupabaseClient();

/**
 * Check if a user exists in the database by email
 */
export async function checkUserExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("email", email.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    throw new Error(`Database error: ${error.message}`);
  }

  return !!data;
}

/**
 * Get user data by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Database error: ${error.message}`);
  }

  return data as User | null;
}

/**
 * Check if an API key is unique (not already in use)
 */
export async function isApiKeyUnique(apiKey: string): Promise<boolean> {
  const { data: isUnique, error } = await supabase.rpc("is_apikey_unique", {
    lookup_key: apiKey,
  });

  if (error) {
    console.error("Error checking key:", error);
    return false;
  }

  return isUnique; // Returns true or false
}

/**
 * Create a new user in the database
 */
export async function createUser(
  email: string,
  name: string,
  apiKey: string
): Promise<User> {
  const joinDate = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase(),
      name: name.trim(),
      apikey: apiKey,
      join_date: joinDate,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data as User;
}

/**
 * Get user by API key
 */
export async function getUserByApiKey(apiKey: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("apikey", apiKey)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Database error: ${error.message}`);
  }

  return data as User | null;
}

/**
 * Store OTP in database with expiration
 */
export async function storeOTP(
  email: string,
  otp: string,
  expiresInSeconds: number
): Promise<boolean> {
  try {
    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000
    ).toISOString();

    const { error } = await supabase.from("otp_store").upsert(
      {
        email: email.toLowerCase(),
        otp: otp,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      }
    );

    if (error) {
      console.error("Error storing OTP:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception storing OTP:", error);
    return false;
  }
}

/**
 * Get OTP from database and verify it hasn't expired
 */
export async function getOTP(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("otp_store")
      .select("otp, expires_at")
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching OTP:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Check if OTP has expired
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      // OTP expired, delete it
      await deleteOTP(email);
      return null;
    }

    return data.otp;
  } catch (error) {
    console.error("Exception fetching OTP:", error);
    return null;
  }
}

/**
 * Delete OTP from database
 */
export async function deleteOTP(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("otp_store")
      .delete()
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Error deleting OTP:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting OTP:", error);
    return false;
  }
}

/**
 * Check rate limit for OTP requests
 * Returns { allowed: true } if request is allowed
 * Returns { allowed: false, waitTime: seconds } if rate limited
 */
export async function checkRateLimit(
  email: string
): Promise<{ allowed: boolean; waitTime?: number; reason?: string }> {
  try {
    const { data, error } = await supabase
      .from("otp_rate_limit")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking rate limit:", error);
      // Allow request on error to avoid blocking users
      return { allowed: true };
    }

    if (!data) {
      // No rate limit record exists, allow request
      return { allowed: true };
    }

    const now = new Date();
    const lastAttempt = new Date(data.last_attempt_at);
    const firstAttempt = new Date(data.first_attempt_at);

    const COOLDOWN_MS = 60000; // 1 minute
    const HOUR_MS = 3600000; // 1 hour
    const MAX_REQUESTS = 5;

    // Check cooldown (1 minute between requests)
    const timeSinceLastAttempt = now.getTime() - lastAttempt.getTime();
    if (timeSinceLastAttempt < COOLDOWN_MS) {
      const waitTime = Math.ceil((COOLDOWN_MS - timeSinceLastAttempt) / 1000);
      return {
        allowed: false,
        waitTime,
        reason: `Please wait ${waitTime} seconds before requesting another OTP`,
      };
    }

    // Check hourly limit
    const timeSinceFirstAttempt = now.getTime() - firstAttempt.getTime();
    if (data.attempt_count >= MAX_REQUESTS && timeSinceFirstAttempt < HOUR_MS) {
      return {
        allowed: false,
        reason: "Too many OTP requests. Please try again later.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Exception checking rate limit:", error);
    // Allow request on error to avoid blocking users
    return { allowed: true };
  }
}

/**
 * Update rate limit record after OTP request
 */
export async function updateRateLimit(email: string): Promise<boolean> {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from("otp_rate_limit")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    const now = new Date().toISOString();
    const HOUR_MS = 3600000;

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching rate limit:", fetchError);
      return false;
    }

    if (!existing) {
      // Create new rate limit record
      const { error } = await supabase.from("otp_rate_limit").insert({
        email: email.toLowerCase(),
        attempt_count: 1,
        first_attempt_at: now,
        last_attempt_at: now,
      });

      if (error) {
        console.error("Error creating rate limit:", error);
        return false;
      }
    } else {
      // Update existing record
      const firstAttempt = new Date(existing.first_attempt_at);
      const timeSinceFirst = Date.now() - firstAttempt.getTime();

      // Reset count if more than an hour has passed
      const newCount =
        timeSinceFirst >= HOUR_MS ? 1 : existing.attempt_count + 1;
      const newFirstAttempt =
        timeSinceFirst >= HOUR_MS ? now : existing.first_attempt_at;

      const { error } = await supabase
        .from("otp_rate_limit")
        .update({
          attempt_count: newCount,
          first_attempt_at: newFirstAttempt,
          last_attempt_at: now,
        })
        .eq("email", email.toLowerCase());

      if (error) {
        console.error("Error updating rate limit:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Exception updating rate limit:", error);
    return false;
  }
}
