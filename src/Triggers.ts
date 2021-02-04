import { FlushContent as _FlushContent } from "./FlushContent";
import { Permissions } from "./Permissions";
import { PDFSender } from "./PDFSender";

export { Triggers };

namespace Triggers {
  const FlushContent = _FlushContent;
  const Perms = Permissions;
  const pdfSender = PDFSender;

  export function getStartingDate() {
    return new Date(2021, 1, 23);
  }

  export function getNextTransferDate(
    now: Date,
    startingDate: Date = getStartingDate()
  ): Date {
    let nextDate = startingDate;
    while (nextDate.getTime() < now.getTime()) {
      nextDate.setDate(nextDate.getDate() + 7 * 6); // 7 days in a week, 6 weeks in a transfer. gets the date of the next transfer.
    }
    return nextDate;
  }

  function setUpRecurringTrigger(): void {
    ScriptApp.newTrigger("runTransferFunctions")
      .timeBased()
      .everyWeeks(6)
      .create();
    Logger.log(
      "set up trigger to run runTransferFunctions every 6 weeks at this time in the day, starting today."
    );
    Logger.log("running initial 'runTransferFunctions'");
    runTransferFunctions();
  }

  function runTransferFunctions(): void {
    Logger.log("running archiveContentFolders in FlushContent");
    FlushContent.archiveContentFolders();
    Logger.log("done");

    Logger.log("running updatePermissions in Permissions");
    Perms.updatePermissions();
    Logger.log("done");

    Logger.log("running createAndSendPDFs in PDFSender");
    pdfSender.createAndSendPDFs();
    Logger.log("done");
  }
}
