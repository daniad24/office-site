// apps/server/src/buildings.ts — the buildings API; the SQL lives in src/db/
import { fieldErrors, NewBuilding } from "@office/shared";
import { Hono } from "hono";
import { createBuilding, deleteBuilding, listBuildings } from "./db/buildings";
import { isForeignKeyError } from "./db/errors";

export const buildingsApi = new Hono();

buildingsApi.get("/", (c) => c.json(listBuildings()));

// DELETE /api/buildings/2: 204, 404 when there is no such building,
// 409 while entrances still belong to it
buildingsApi.delete("/:id", (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) {
    return c.json({ error: "The id must be a whole number" }, 400);
  }
  try {
    return deleteBuilding(id)
      ? c.body(null, 204)
      : c.json({ error: "No such building" }, 404);
  } catch (error) {
    if (isForeignKeyError(error)) {
      return c.json({ error: "The building still has entrances" }, 409);
    }
    throw error;
  }
});

buildingsApi.post("/", async (c) => {
  const result = NewBuilding.safeParse(await c.req.json().catch(() => null));
  if (!result.success) {
    return c.json({ errors: fieldErrors(result.error) }, 400);
  }
  return c.json(createBuilding(result.data), 201);
});
