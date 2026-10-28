// apps/server/src/surveys.ts — the surveys API; the SQL lives in src/db/
import { fieldErrors, NewSurvey } from "@office/shared";
import { Hono } from "hono";
import {
  createSurvey,
  listSurveys,
  listSurveysForEntrance,
} from "./db/surveys";

export const surveysApi = new Hono();

// GET /api/surveys?entranceId=2 lists one entrance's surveys; no filter, all
surveysApi.get("/", (c) => {
  const raw = c.req.query("entranceId");
  if (raw === undefined) {
    return c.json(listSurveys());
  }
  const entranceId = Number(raw);
  if (!Number.isInteger(entranceId)) {
    return c.json({ errors: { entranceId: ["Must be a whole number"] } }, 400);
  }
  return c.json(listSurveysForEntrance(entranceId));
});

surveysApi.post("/", async (c) => {
  const result = NewSurvey.safeParse(await c.req.json().catch(() => null));
  if (!result.success) {
    return c.json({ errors: fieldErrors(result.error) }, 400);
  }
  try {
    return c.json(createSurvey(result.data), 201);
  } catch (error) {
    // zod cannot know which entrances exist; the foreign key does
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
    ) {
      return c.json(
        { errors: { entranceId: ["Entrance does not exist"] } },
        400
      );
    }
    throw error;
  }
});
