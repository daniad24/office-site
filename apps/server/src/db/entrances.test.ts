// apps/server/src/db/entrances.test.ts — the repository on a throwaway database
import { beforeAll, describe, expect, test } from "bun:test";

// the connection opens when db.ts is first imported, so set this before
process.env.OFFICE_DB = ":memory:";

const { migrate } = await import("../../scripts/migrate");
const { createBuilding } = await import("./buildings");
const { createEntrance, getEntrance, listEntrances, searchEntrances } =
  await import("./entrances");

let buildingId = 0;

beforeAll(() => {
  migrate();
  buildingId = createBuilding({ city: "București", name: "Bloc Test" }).id;
});

describe("entrances repository", () => {
  test("starts empty after the migrations", () => {
    expect(listEntrances()).toEqual([]);
  });

  test("inserts an entrance and reads it back, mapped to the shared type", () => {
    const created = createEntrance({
      address: "Str. Test 1",
      buildingId,
      floors: 4,
      hasElevator: true,
    });

    expect(created).toEqual({
      address: "Str. Test 1",
      buildingId,
      buildingName: "Bloc Test",
      floors: 4,
      hasElevator: true,
      id: created.id,
    });
    expect(getEntrance(created.id)).toEqual(created);
    expect(listEntrances()).toContainEqual(created);
  });

  test("refuses a building that does not exist", () => {
    expect(() =>
      createEntrance({
        address: "Nowhere",
        buildingId: 999,
        floors: 1,
        hasElevator: false,
      })
    ).toThrow("FOREIGN KEY");
  });

  test("searches with a bound parameter: an injection finds nothing", () => {
    expect(searchEntrances("Test")).toHaveLength(1);
    expect(searchEntrances("x' OR 1=1 --")).toEqual([]);
  });
});
