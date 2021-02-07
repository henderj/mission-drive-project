import { Variables } from "./Variables";

export { M_Utils };

namespace M_Utils {
  export function getFolder(
    parentFolder: GoogleAppsScript.Drive.Folder,
    folderName: string,
    createIfNone: boolean = false
  ): GoogleAppsScript.Drive.Folder | null {
    const iterator = parentFolder.getFoldersByName(folderName);
    if (iterator.hasNext()) return iterator.next();

    Logger.log(
      "No folder named '%s' found in %s.",
      folderName,
      parentFolder.getName()
    );
    if (!createIfNone) return null;

    Logger.log(
      "Creating folder named '%s' in %s...",
      folderName,
      parentFolder.getName()
    );
    return parentFolder.createFolder(folderName);
  }

  export function forEveryFolder(
    parentFolder: GoogleAppsScript.Drive.Folder,
    func: (folder: GoogleAppsScript.Drive.Folder) => any,
    recursive: boolean = false
  ): void {
    const iterator = parentFolder.getFolders();
    while (iterator.hasNext()) {
      const folder = iterator.next();
      func(folder);
      if (recursive) forEveryFolder(folder, func, true);
    }
  }

  export function getTodayDateFormatted(): string {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();

    return mm + "/" + dd + "/" + yyyy;
  }

  export function getSheetByID(
    spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    gid: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    const sheets = spreadsheet.getSheets();
    const sheet = sheets.find((s) => s.getSheetId().toString() == gid);
    return sheet;
  }

  export function forEachRangeCell(
    range: GoogleAppsScript.Spreadsheet.Range,
    func: (range: GoogleAppsScript.Spreadsheet.Range) => any
  ): void {
    const numRows = range.getNumRows();
    const numCols = range.getNumColumns();

    for (let i = 1; i <= numCols; i++) {
      for (let j = 1; j <= numRows; j++) {
        const cell = range.getCell(j, i);

        func(cell);
      }
    }
  }

  export function isMissionaryEmail(email: string): boolean {
    const regExp = /^\w+\.?\w+@missionary\.org$/i;
    return regExp.test(email);
  }

  export function stringSimilarity(s1: string, s2: string): number {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (
      (longerLength - editDistance(longer, shorter)) / (longerLength + 0.0)
    );
  }

  function editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0) costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  export function getFolderPrefix(folderName: string): string {
    const split = folderName.split(" ");
    if (split[split.length - 1].toLowerCase() != "folder") return "";
    const suffix = split[split.length - 2] + " " + split[split.length - 1];
    const prefix = folderName.substring(0, folderName.indexOf(suffix)).trim();
    return prefix;
  }

  export function getFolderSuffix(folderName: string, possibleSuffixes: string[]): string {
    let returnValue = "";
    possibleSuffixes.forEach(suffix => {
      if(folderName.toLowerCase().indexOf(suffix.toLowerCase()) >= 0) returnValue = suffix;
    });
    return returnValue;
  }
}
