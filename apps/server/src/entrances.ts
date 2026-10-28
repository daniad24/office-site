// apps/server/src/entrances.ts — the entrances API; the SQL lives in src/db/
import { fieldErrors, NewEntrance } from "@office/shared";
import { Hono } from "hono";
import { createEntrance, listEntrances, searchEntrances } from "./db/entrances";

export const entrancesApi = new Hono();

// GET /api/entrances?q=unirii searches the addresses; no q, the whole list
entrancesApi.get("/", (c) => {
  const q = c.req.query("q");
  return c.json(q ? searchEntrances(q) : listEntrances());
});

entrancesApi.post("/", async (c) => {
  const result = NewEntrance.safeParse(await c.req.json().catch(() => null));
  if (!result.success) {
    return c.json({ errors: fieldErrors(result.error) }, 400);
  }
  try {
    return c.json(createEntrance(result.data), 201);
  } catch (error) {
    // zod cannot know which buildings exist; the foreign key does
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
    ) {
      return c.json(
        { errors: { buildingId: ["Building does not exist"] } },
        400
      );
    }
    throw error;
  }
});
