import { M_Utils } from "../../src/common/Utils";

describe("test isMissionaryEmail()", () => {
  it("j.h@missionary.org should be a missionary email", () => {
    expect(M_Utils.isMissionaryEmail("j.h@missionary.org")).toBe(true);
  });
  it("j is not a missionary email", () => {
    expect(M_Utils.isMissionaryEmail("j")).toBe(false);
  });
  it("j@gmail.com is not a missionary email", () => {
    expect(M_Utils.isMissionaryEmail("j@gmail.com")).toBe(false);
  });
});

describe("test stringSimilarity()", () => {
  it("given 'test' and 'test' should return 1", () => {
    expect(M_Utils.stringSimilarity("test", "test")).toBe(1);
  });
  it("given 'test' and 'no' should return 0", () => {
    expect(M_Utils.stringSimilarity("test", "no")).toBe(0);
  });
  it("given 'test' and 'tset' should return 0.5", () => {
    expect(M_Utils.stringSimilarity("test", "tset")).toBe(0.5);
  });
  it("given 'traverse city' and 'travesrs city' should return close to 0.8461538461538461", () => {
    expect(
      M_Utils.stringSimilarity("traverse city", "travesrs city")
    ).toBeCloseTo(0.8461538461538461);
  });
});

describe("test getFolderPrefix()", () => {
  it("given 'test Zone Folder' should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test Zone Folder")).toBe("test");
  });
  it("given 'test District Folder' should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test District Folder")).toBe("test");
  });
  it("given 'test Area Folder' should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test Area Folder")).toBe("test");
  });
  it("given 'test test Area Folder' should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test test Area Folder")).toBe("test test");
  });
});
