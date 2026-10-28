// apps/server/src/db/surveys.ts — the SQL for surveys; routes call these functions
import type { NewSurvey, Survey } from "@office/shared";
import { db } from "../db";

// a row as SQLite gives it: snake_case, notes NULL when there are none
interface SurveyRow {
  entrance_id: number;
  id: number;
  notes: string | null;
  surveyed_on: string;
  surveyor: string;
}

const SELECT_SURVEYS =
  "SELECT id, entrance_id, surveyed_on, surveyor, notes FROM surveys";

// the row → the shared type: camelCase, NULL notes left out
function toSurvey(row: SurveyRow): Survey {
  return {
    entranceId: row.entrance_id,
    id: row.id,
    notes: row.notes ?? undefined,
    surveyedOn: row.surveyed_on,
    surveyor: row.surveyor,
  };
}

export function listSurveys(): Survey[] {
  return db
    .query<SurveyRow, []>(`${SELECT_SURVEYS} ORDER BY id`)
    .all()
    .map(toSurvey);
}

export function listSurveysForEntrance(entranceId: number): Survey[] {
  return db
    .query<SurveyRow, [number]>(
      `${SELECT_SURVEYS} WHERE entrance_id = ? ORDER BY id`
    )
    .all(entranceId)
    .map(toSurvey);
}

export function createSurvey(survey: NewSurvey): Survey {
  const row = db
    .query<SurveyRow, [number, string, string, string | null]>(
      `INSERT INTO surveys (entrance_id, surveyed_on, surveyor, notes)
       VALUES (?, ?, ?, ?) RETURNING *`
    )
    .get(
      survey.entranceId,
      survey.surveyedOn,
      survey.surveyor,
      survey.notes ?? null
    );
  if (!row) {
    throw new Error("INSERT … RETURNING gave no row");
  }
  return toSurvey(row);
}
