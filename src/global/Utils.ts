namespace M_Utils {
  const Vars = Variables;


  export function getFolder(parentFolder, folderName, createIfNone = false) {
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

  export function forEveryFolder(parentFolder, func, recursive = false) {
    const iterator = parentFolder.getFolders();
    while (iterator.hasNext()) {
      const folder = iterator.next();
      func(folder);
      if (recursive) forEveryFolder(folder, func, true);
    }
  }

  export function getTodayDateFormatted() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();

    return mm + "/" + dd + "/" + yyyy;
  }

  export function getArchiveFolderName(areaFolder) {
    const areaFolderName = areaFolder.getName();
    const suffixIndex = areaFolderName
      .toLowerCase()
      .indexOf(Vars.getAreaFolderSuffix().toLowerCase());
    const areaName = areaFolderName.substring(0, suffixIndex).trim();
    Logger.log("area name: %s.", areaName);
    return areaName + Vars.getArchiveFolderSuffix();
  }

  export function getSheetByID(spreadsheet, gid) {
    const sheets = spreadsheet.getSheets();
    const sheet = sheets.find((s) => s.getSheetId() == gid);
    return sheet;
  }

  export function forEachRangeCell(range, func) {
    const numRows = range.getNumRows();
    const numCols = range.getNumColumns();

    for (let i = 1; i <= numCols; i++) {
      for (let j = 1; j <= numRows; j++) {
        const cell = range.getCell(j, i);

        func(cell);
      }
    }
  }

  export function isMissionaryEmail(email) {
    const regExp = /^\w+\.?\w+@missionary\.org$/i;
    return regExp.test(email);
  }
}
