// packages/shared/src/index.ts — one schema, used by the server and the web
import { z } from "zod";

export const NewBuilding = z.object({
  city: z.string().trim().min(1, "City is required"),
  name: z.string().trim().min(1, "Name is required"),
});

export type NewBuilding = z.infer<typeof NewBuilding>;
export type Building = NewBuilding & { id: number };

export const NewEntrance = z.object({
  address: z.string().trim().min(1, "Address is required"),
  // a foreign key: the id of a row in buildings
  buildingId: z.number("Pick a building").int().positive("Pick a building"),
  floors: z
    .number("Floors must be a number")
    .int("Floors must be a whole number")
    .min(0, "Floors cannot be negative"),
  hasElevator: z.boolean("Say whether there is an elevator"),
});

// the type comes from the schema: change one, the other follows
export type NewEntrance = z.infer<typeof NewEntrance>;
// what the server answers: the row's id and its building's name (a JOIN)
export type Entrance = NewEntrance & { id: number; buildingName: string };

// a survey is one visit to one entrance
export const NewSurvey = z.object({
  entranceId: z.number("Pick an entrance").int().positive("Pick an entrance"),
  notes: z.string().trim().optional(),
  surveyedOn: z.iso.date("Use a date like 2026-10-28"),
  surveyor: z.string().trim().min(1, "Surveyor is required"),
});

export type NewSurvey = z.infer<typeof NewSurvey>;
export type Survey = NewSurvey & { id: number };

// { address?: string[], floors?: string[], … } — the shape both sides show
export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors;
}
