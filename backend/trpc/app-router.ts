import { createTRPCRouter } from "./create-context";
import { ordersRouter } from "./routes/orders";
import { merchRouter } from "./routes/merch";
import { heroesRouter } from "./routes/heroes";
import { settingsRouter } from "./routes/settings";

export const appRouter = createTRPCRouter({
  orders: ordersRouter,
  merch: merchRouter,
  heroes: heroesRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
