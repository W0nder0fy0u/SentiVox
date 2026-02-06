import { XXH3_128 } from "xxh3-ts";

export function hashWord(__data: string): bigint {
  return XXH3_128(Buffer.from(__data), 0n);
}
