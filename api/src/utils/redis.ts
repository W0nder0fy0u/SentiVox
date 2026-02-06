import { redis } from "bun";
import { SentiVoxBase } from "../base";

const PREFIX_LAST_UPDATED = "LU:[";
const PREFIX_TOKEN_COUNT = "TC:[";
const DAILY_FREE_TOKEN_COUNT = SentiVoxBase.docs.dailyFreeTokenCount;
const TOKEN_DEDUCT_SCRIPT = `
local lastUpdatedKey = KEYS[1]
local tokenCountKey = KEYS[2]
local currentDate = ARGV[1]
local dailyFreeTokens = tonumber(ARGV[2])
local deductAmount = tonumber(ARGV[3])

local last_updated = redis.call('GET', lastUpdatedKey)
local current_tokens_raw = redis.call('GET', tokenCountKey)

-- Check if the keys actually exist in Redis.
-- If either is missing, it means the API key is invalid/uninitialized.
if not last_updated or not current_tokens_raw then
    return -2  -- Custom error code for "Key not found"
end

local current_tokens = tonumber(current_tokens_raw)

-- Logic for Daily Reset
if last_updated < currentDate then
    last_updated = currentDate
    current_tokens = dailyFreeTokens
    redis.call('SET', lastUpdatedKey, currentDate)
    -- We don't return here; we continue to the deduction logic below
end

-- Logic for Deduction
if current_tokens < deductAmount then
    return -1 -- Not enough tokens
else
    local remaining = current_tokens - deductAmount
    redis.call('SET', tokenCountKey, remaining)
    return remaining
end
`;

/*
 * On redis the data format is like this:
 *
 * For tokens count
 *   "TC:[api_key" = token_count
 *
 * For last updated
 *   "LU:[api_key" = last_updated_date
 */

export async function deductToken(__api_key: string, __deduct_amount: number) {
  if (redis) {
    const currentDate = new Date().toISOString().split("T")[0];

    const result = await redis.send("EVAL", [
      TOKEN_DEDUCT_SCRIPT,
      "2",
      PREFIX_LAST_UPDATED + __api_key,
      PREFIX_TOKEN_COUNT + __api_key,
      currentDate,
      DAILY_FREE_TOKEN_COUNT.toString(),
      __deduct_amount.toString(),
    ]);

    // -1 = Not enough tokens (different from null)
    // -2 = Key doesn't exist
    if (result === -2 || result === -1) {
      return null;
    }

    return result;
  } else {
    throw new Error("Redis is not connected!");
  }
}

export async function getTokenCount(__api_key: string) {
  if (redis) {
    return await redis.get(PREFIX_TOKEN_COUNT + __api_key);
  } else {
    throw new Error("Redis is not connected!");
  }
}

export async function addFreeTokens(__api_key: string) {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Set the last updated date
  await redis.set(PREFIX_LAST_UPDATED + __api_key, currentDate);

  // Set the initial token count
  await redis.set(
    PREFIX_TOKEN_COUNT + __api_key,
    DAILY_FREE_TOKEN_COUNT.toString()
  );
}
