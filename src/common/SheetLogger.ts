import { Variables } from "./Variables";

export { SheetLogger };

namespace SheetLogger {
  const Vars = Variables;
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
    private currentLogs: string[] = [];

    constructor() {
      this.logRange = Vars.getLogRange();
    }

    public static Log(message: string) {
      SheetLogger.getInstance()._log(message);
    }

    public _log(message: string) {
      Logger.log(message);
      this.currentLogs.unshift(this.getPrefix() + message);
      this.currentLogs = this.currentLogs.slice(0, this.numLogs);
      if (this.logRange == null) return;
      for (let i = this.logRange.getNumRows(); i > 0; i--) {
        this.logRange.getCell(i, 1).setValue(this.currentLogs[i - 1]);
      }
    }

    private getPrefix(): string {
      const now = new Date();
      return "[" + now.toISOString() + "] ";
    }
  }
}
