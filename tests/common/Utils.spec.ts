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
