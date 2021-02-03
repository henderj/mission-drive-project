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
    func: Function,
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
    func: Function
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
}
