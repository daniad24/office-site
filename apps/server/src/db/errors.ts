// apps/server/src/db/errors.ts — telling SQLite's errors apart

// a row cannot go (or come) while another row's foreign key points at it
export function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
  );
}
