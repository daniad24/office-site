// apps/server/src/entrances.ts — the entrances API; the SQL lives in src/db/
import { fieldErrors, NewEntrance } from "@office/shared";
import { Hono } from "hono";
import {
  createEntrance,
  deleteEntrance,
  listEntrances,
  searchEntrances,
} from "./db/entrances";
import { isForeignKeyError } from "./db/errors";

export const entrancesApi = new Hono();

// GET /api/entrances?q=unirii searches the addresses; no q, the whole list
entrancesApi.get("/", (c) => {
  const q = c.req.query("q");
  return c.json(q ? searchEntrances(q) : listEntrances());
});

// DELETE /api/entrances/3: 204, 404 when there is no such entrance,
// 409 while surveys still point at it
entrancesApi.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "The id must be a whole number" }, 400);
  }
  try {
    return deleteEntrance(id)
      ? c.body(null, 204)
      : c.json({ error: "No such entrance" }, 404);
  } catch (error) {
    if (isForeignKeyError(error)) {
      return c.json({ error: "The entrance still has surveys" }, 409);
    }
    throw error;
  }
});

entrancesApi.post("/", async (c) => {
  const result = NewEntrance.safeParse(await c.req.json().catch(() => null));
  if (!result.success) {
    return c.json({ errors: fieldErrors(result.error) }, 400);
  }
  return c.json(createEntrance(result.data), 201);
});
