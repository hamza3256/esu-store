import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";
import nextBuild from "next/dist/build";
import path from "path";
import { parse } from "url";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

console.log("PORT: " + PORT)

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>;
export type WebhookRequest = IncomingMessage & { rawBody: Buffer };

const start = async () => {
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebhookRequest, _, buffer) => {
      req.rawBody = buffer;
    },
  });

  app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler);

  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  // Define the /api/postex/cities route globally here
  app.get("/api/postex/cities", async (req, res) => {
    try {
      const response = await fetch(`https://api.postex.pk/services/integration/api/order/v2/get-operational-city?operationCityType=Delivery`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": process.env.NEXT_PUBLIC_POSTEX_API_TOKEN!, // Ensure the token is correct
        },
      });
  
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch operational cities: ${response.statusText}` });
      }
  
      const data = await response.json();
      return res.status(200).json(data); // Send the list of cities
    } catch (error) {
      console.error("Error fetching PostEx cities:", error);
      return res.status(500).json({ error: "Failed to fetch operational cities." });
    }
  });

  const cartRouter = express.Router();

  cartRouter.use(payload.authenticate);
  cartRouter.get("/", (req, res) => {
    const parsedUrl = parse(req.url, true);
    return nextApp.render(req, res, "/cart", parsedUrl.query);
  });

  app.use("/cart", cartRouter);
  
  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info("Next.js is building ESÜ store for production");

      // @ts-expect-error
      await nextBuild(path.join(__dirname, "../"));

      process.exit();
    });
    return;
  }

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started");

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
};

start();
