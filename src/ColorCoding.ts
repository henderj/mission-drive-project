import { Variables } from "./common/Variables";
import { M_Utils } from "./common/Utils";
import { Rainbow } from "./common/Rainbow";
import { SheetLogger } from "./common/SheetLogger";

namespace ColorCoding {
  const Vars = Variables;
  const Utils = M_Utils;
  const Rbow = Rainbow;
  const sheetLogger = SheetLogger.SheetLogger;

  interface NameMatchLevel {
    name: string;
    suffix: string;
    cell: GoogleAppsScript.Spreadsheet.Range;
    matchLevel: number;
    closestMatch: string;
  }

  const red = "#ea9999";
  const yellow = "#ffe599";
  const yellowgreen = "#cede84";
  const green = "#b6d7a8";
  const pink = "#d5a6bd";

  /*
    
    matchLevel:
    [0,0.9] (red)     There is no folder within the parent folder that matches the value
    [0.9,1] (yellow)  There is at least one folder that has at least a 90% similar name to the value
    1 (green)         There is exactly one folder that has a name that exactly matches the value
    2 (pink)          There is more than one folder that has a name that exactly matches the value

    */

  export function updateColorCodingForRange(
    range: GoogleAppsScript.Spreadsheet.Range,
    suffix: string
  ): void {
    const sheetID = range.getSheet().getSheetId().toString();
    if (
      sheetID != Vars.getZoneToDistrictMapID() &&
      sheetID != Vars.getDistrictToAreaMapID()
    ) {
      sheetLogger.Log("range is not in one of the map sheets. exiting...");
      return;
    }

    let cellsData: NameMatchLevel[] = [];
    Utils.forEachRangeCell(range, (data) => {
      cellsData.push({
        cell: data,
        name: data.getValue().toString(),
        suffix: suffix,
        matchLevel: 0,
        closestMatch: "",
      });
    });
    1;

    const zoneDrivesFolder = DriveApp.getFolderById(Vars.getZoneDrivesID());

    Utils.forEveryContentFolder(
      zoneDrivesFolder,
      (folder) => {
        cellsData = updateMatchLevelsForFolder(folder, cellsData);
      },
      Vars.getContentFolderSuffixes()
    );

    const gradient = new Rbow.Rainbow();
    gradient.setSpectrum(red, yellow).setNumberRange(0, 1);

    cellsData.forEach((data) => {
      if (data.name == "") return;

      const folderSuffix = Utils.getFolderSuffix(
        data.closestMatch,
        Vars.getContentFolderSuffixes()
      );

      if (data.suffix.toLowerCase() != folderSuffix.toLowerCase())
        data.matchLevel = 0;

      const cell = data.cell;
      const matchLevel = data.matchLevel;

      sheetLogger.Log(`setting color for cell at ${cell.getA1Notation()}`);
      sheetLogger.Log(
        `match: cell - ${cell.getA1Notation()}; looking for - ${
          data.name + data.suffix
        }; closest match - ${data.closestMatch}; match level ${matchLevel}`
      );

      if (matchLevel < 0.9) {
        sheetLogger.Log(
          `no match over 90% (${matchLevel}). setting color to red...`
        );
        cell.setBackground(red);
        return;
      }

      if (matchLevel >= 0.9 && matchLevel < 1) {
        sheetLogger.Log(
          `close match of at least 90% (${matchLevel}). setting color to yellow`
        );
        cell.setBackground(yellow);
        return;
      }

      if (matchLevel > 1) {
        sheetLogger.Log("more than one match. setting color to pink");
        cell.setBackground(pink);
        return;
      }

      sheetLogger.Log("perfect match. setting color to green.");
      cell.setBackground(green);
    });
  }

  function updateMatchLevelsForFolder(
    folder: GoogleAppsScript.Drive.Folder,
    cellsData: NameMatchLevel[]
  ): NameMatchLevel[] {
    // sheetLogger.Log("testing folder ${}", folder.getName());
    const folderName = folder.getName();

    cellsData.forEach((cell) => {
      if (cell.name == "") return;

      const fullName = cell.name + cell.suffix;

      if (folderName == fullName) {
        // sheetLogger.Log("perfect match! ${} => ${}", folderName, fullName);
        cell.matchLevel = cell.matchLevel < 1 ? 1 : 2;
        cell.closestMatch = folderName;
        return;
      }

      const newMatchLevel = Utils.stringSimilarity(folderName, fullName);
      if (newMatchLevel > cell.matchLevel) {
        cell.matchLevel = newMatchLevel;
        cell.closestMatch = folderName;
      }
    });

    return cellsData;
  }
}
