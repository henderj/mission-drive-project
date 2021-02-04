import { FlushContent } from "../src/FlushContent";

describe("test getNextFlushDate() with starting date of 2/23/2021", () => {
  let startingDate: Date;

  beforeAll(() => {
    startingDate = FlushContent.getStartingDate();
  });

  it("given 2/4/2021 returns 2/23/2021", () => {
    const now = new Date(2021, 1, 4);

    const expected = new Date(2021, 1, 23).toDateString();
    const actual = FlushContent.getNextFlushDate(
      now,
      startingDate
    ).toDateString();

    expect(actual).toBe(expected);
  });

  it("given 2/24/2021 returns 4/6/2021", () => {
    const now = new Date(2021, 1, 24);

    const expected = new Date(2021, 3, 6).toDateString();
    const actual = FlushContent.getNextFlushDate(
      now,
      startingDate
    ).toDateString();

    expect(actual).toBe(expected);
  });

  it("given 2/23/2021 returns 4/6/2021", () => {
    const now = new Date(2021, 1, 23);

    const expected = new Date(2021, 3, 6).toDateString();
    const actual = FlushContent.getNextFlushDate(
      now,
      startingDate
    ).toDateString();

    expect(actual).toBe(expected);
  });

  it("given 5/13/2021 returns 5/18/2021", () => {
    const now = new Date(2021, 4, 13);

    const expected = new Date(2021, 4, 18).toDateString();
    const actual = FlushContent.getNextFlushDate(
      now,
      startingDate
    ).toDateString();

    expect(actual).toBe(expected);
  });
});
