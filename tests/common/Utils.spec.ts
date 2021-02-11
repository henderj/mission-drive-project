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
  let suffixes = [];
  beforeAll(() => {
    suffixes = [" Zone", " District", " Area"];
  });
  it("given 'test Zone' and [' Zone', ' District', ' Area'] should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test Zone", suffixes)).toBe("test");
  });
  it("given 'test District' and [' Zone', ' District', ' Area'] should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test District", suffixes)).toBe("test");
  });
  it("given 'test Area' and [' Zone', ' District', ' Area'] should return 'test'", () => {
    expect(M_Utils.getFolderPrefix("test Area", suffixes)).toBe("test");
  });
  it("given 'test test Area' and [' Zone', ' District', ' Area'] should return 'test test'", () => {
    expect(M_Utils.getFolderPrefix("test test Area", suffixes)).toBe("test test");
  });
});

describe("test getFolderSuffix()", () => {
  let suffixes = [];
  beforeAll(() => {
    suffixes = [" Zone", " District", " Area"];
  });

  it("given 'test Zone' and [' Zone', ' District', ' Area'] should return ' Zone'", () => {
    expect(M_Utils.getFolderSuffix("test Zone", suffixes)).toBe(" Zone");
  });
  it("given 'test District' and [' Zone', ' District', ' Area'] should return ' District'", () => {
    expect(M_Utils.getFolderSuffix("test District", suffixes)).toBe(" District");
  });
  it("given 'test Area' and [' Zone', ' District', ' Area'] should return ' Area'", () => {
    expect(M_Utils.getFolderSuffix("test Area", suffixes)).toBe(" Area");
  });
  it("given 'test test' and [' Zone', ' District', ' Area'] should return ''", () => {
    expect(M_Utils.getFolderSuffix("test test", suffixes)).toBe("");
  });
});

describe("test hasNumber()", () => {
  it("given 'test' should return false", () => {
    expect(M_Utils.hasNumber('test')).toBe(false);
  })
  it("given '123' should return true", () => {
    expect(M_Utils.hasNumber('123')).toBe(true);
  })
  it("given 'test123' should return true", () => {
    expect(M_Utils.hasNumber('test123')).toBe(true);
  })
})

describe("test removeNumbers()", () => {
  it("given 'test' should return 'test'", () => {
    expect(M_Utils.removeNumbers('test')).toBe('test');
  })
  it("given '123' should return ''", () => {
    expect(M_Utils.removeNumbers('123')).toBe('');
  })
  it("given 'test123' should return 'test'", () => {
    expect(M_Utils.removeNumbers('test123')).toBe('test');
  })
  it("given 'test 123' should return 'test '", () => {
    expect(M_Utils.removeNumbers('test 123')).toBe('test ');
  })
  it("given 't1e2s3t' should return 'test'", () => {
    expect(M_Utils.removeNumbers('t1e2s3t')).toBe('test');
  })
})