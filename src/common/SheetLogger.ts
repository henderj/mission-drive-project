import { Variables } from "./Variables";
import { M_Utils } from "./Utils";

export { SheetLogger };

namespace SheetLogger {
  const Vars = Variables;
  const Utils = M_Utils;
  export class SheetLogger {
    public static _instance: SheetLogger | null = null;

    public static getInstance() {
      if (SheetLogger._instance == null) {
        SheetLogger._instance = new SheetLogger();
      }
      return SheetLogger._instance;
    }

    readonly logRange: GoogleAppsScript.Spreadsheet.Range;
    readonly numLogs: number = 3;
    private currentLogs: string[];

    constructor() {
      this.logRange = Vars.getLogRange();
    }

    public static Log(message: string) {
      SheetLogger.getInstance()._log(message);
    }

    public _log(message: string) {
      Logger.log(message);
      this.currentLogs.unshift(message);
      this.currentLogs = this.currentLogs.slice(0, this.numLogs);
      for (let i = this.logRange.getNumRows(); i > 0; i--) {
        this.logRange.getCell(i, 1).setValue(this.currentLogs[i - 1]);
      }
    }
  }
}
