import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { analyzerApp } from "./analyzer";
import { generalApp } from "./general";
import { SentiVoxBase } from "./base";

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: SentiVoxBase.appName,
          version: SentiVoxBase.appVersion,
          description: SentiVoxBase.appDesc,
          contact: {
            name : SentiVoxBase.appAuthor[0].name,
            url : SentiVoxBase.appAuthor[0].portfolio,
            email : SentiVoxBase.appAuthor[0].email
          }
        },
      },
    })
  )
  .use(generalApp)
  .use(analyzerApp)
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Invalid Endpoint! Refer to documentation on '/docs' endpoint" };
    }
    console.error(error);
    set.status = 500;
    return { error: "Internal Server Error! We are fixing. Kindly wait!!" };
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
