import { Elysia, t } from "elysia";
import { SentiVoxBase } from "./base";
import {
  startBatchAnalysis,
  startSingleAnalysis,
} from "./context-free/cf-analyze";
import { JSON_KEYS } from "./utils/keys";
import { deductToken } from "./utils/redis";

export const analyzerApp = new Elysia().group("/cf", (app) =>
  app
    .post(
      "/single",
      async ({ body, set }) => {
        try {
          const { "api-key": apiKey, comment: comment } = body as {
            [JSON_KEYS.apiKey]: string;
            [JSON_KEYS.comment]: string;
          };

          if (!apiKey) {
            set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
            return { error: "Missing API Key" };
          }

          const tokens = await deductToken(apiKey, comment.length);

          if (tokens === null) {
            set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
            return { error: "Quota exceeded or invalid API key!" };
          }

          return await startSingleAnalysis(comment);
        } catch (err) {
          console.error(err);
          return err;
        }
      },
      {
        body: t.Object(
          {
            [JSON_KEYS.apiKey]: t.String(),
            [JSON_KEYS.comment]: t.String(),
          },
          {
            error: (error) => {
              return {
                status: SentiVoxBase.statusCode.INVALID_JSON_FORMAT,
                message: "Invalid JSON format. Refer to documentation.",
                error: `${error}`,
                details:
                  SentiVoxBase.docs["context-free-analysis"][
                    "single-comment-analysis"
                  ],
              };
            },
          }
        ),
      }
    )
    .post(
      "/batch",
      async ({ body, set }) => {
        const { "api-key": apiKey, "comment-list": commentList } = body as {
          [JSON_KEYS.apiKey]: string;
          [JSON_KEYS.commentList]: string[];
        };

        // validating format
        if (!apiKey) {
          set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
          return { error: "Missing API Key" };
        }

        let total_len = 0;

        for (const single_comment of commentList)
          total_len += single_comment.length;

        const tokens = await deductToken(apiKey, total_len);

        if (tokens === null) {
          set.status = SentiVoxBase.statusCode.MISSING_OR_INVALID_AUTH;
          return { error: "Quota exceeded or invalid API key!" };
        }

        return await startBatchAnalysis(commentList);
      },
      {
        body: t.Object(
          {
            [JSON_KEYS.apiKey]: t.String(),
            [JSON_KEYS.commentList]: t.Array(t.String()),
          },
          {
            error: (error) => {
              return {
                status: SentiVoxBase.statusCode.INVALID_JSON_FORMAT,
                message:
                  "Invalid JSON format. Refer to documentation. Error string: " +
                  error,
                details:
                  SentiVoxBase.docs["context-free-analysis"][
                    "batch-comment-analysis"
                  ],
              };
            },
          }
        ),
      }
    )
);
