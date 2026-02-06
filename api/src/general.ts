import { Elysia } from "elysia";
import { SentiVoxBase } from "./base";
import { tokenizeText } from "./context-free/tokenizer";
import { JSON_KEYS } from "./utils/keys";
import { addFreeTokens, getTokenCount } from "./utils/redis";

export const generalApp = new Elysia()
  .get("/", () => SentiVoxBase.messages.welcome)
  .get("/health", () => SentiVoxBase.messages.health)
  .get("/langs", () => SentiVoxBase.lang.supported)
  .post("/tokenize", async ({ body, set }) => {
    const { [JSON_KEYS.apiKey]: apiKey, [JSON_KEYS.comment]: comment } =
      body as {
        [JSON_KEYS.apiKey]: string;
        [JSON_KEYS.comment]: string;
      };

    if (!apiKey) {
      set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
      return { error: "Missing API Key" };
    }

    return tokenizeText(comment);
  })
  .post("/tokenCount", async ({ body, set }) => {
    try {
      const { [JSON_KEYS.apiKey]: apiKey } = body as {
        [JSON_KEYS.apiKey]: string;
      };

      if (!apiKey) {
        set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
        return { error: "Missing API Key" };
      }

      const token_count = await getTokenCount(apiKey);

      set.status = SentiVoxBase.statusCode.SUCCESS;
      if (token_count === null) {
        return { error: "Invalid API Key" };
      }
      return {
        [JSON_KEYS.tokenCount]: token_count,
      };
    } catch (err) {
      console.error(err);
      return err;
    }
  })
  .post("/grantFreeTokens", async ({ body, set }) => {
    try {
      const { [JSON_KEYS.apiKey]: apiKey, [JSON_KEYS.password]: password } =
        body as {
          [JSON_KEYS.apiKey]: string;
          [JSON_KEYS.password]: string;
        };

      if (!apiKey) {
        set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
        return { error: "Missing API Key" };
      }

      set.status = SentiVoxBase.statusCode.SUCCESS;

      if (password === process.env.FREE_TOKEN_PASSWORD) {
        await addFreeTokens(apiKey);
        return {
          message: "Success",
        };
      }

      return { error: "Invalid Password!" };
    } catch (err) {
      console.error(err);
      return err;
    }
  });
