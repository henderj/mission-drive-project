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
    0 (red)     There is no folder within the parent folder that matches the value
    (0,1) (color between red - green) There is at least one folder that has a similar name to the value
    1 (green)   There is exactly one folder that has a name that exactly matches the value
    2 (pink)  There is more than one folder that has a name that exactly matches the value

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

    const zoneDrivesFolder = DriveApp.getFolderById(Vars.getZoneDrivesID());

    Utils.forEveryContentFolder(
      zoneDrivesFolder,
      (folder) => {
        cellsData = updateMatchLevelsForFolder(folder, cellsData);
      },
      Vars.getContentFolderSuffixes()
    );

    const gradient = new Rbow.Rainbow();
    gradient.setSpectrum(red, yellow, yellowgreen).setNumberRange(0, 1);

    cellsData.forEach((data) => {
      if (data.name == "") return;

      const cell = data.cell;
      const matchLevel = data.matchLevel;

      sheetLogger.Log(`setting color for cell at ${cell.getA1Notation()}`);
      sheetLogger.Log(
        `match: cell - ${cell.getA1Notation()}; looking for - ${
          data.name + data.suffix
        }; closest match - ${data.closestMatch}; match level ${matchLevel}`
      );

      if (matchLevel < 1) {
        const color = "#" + gradient.colorAt(matchLevel);
        sheetLogger.Log(
          `no or close match (${matchLevel}). setting color to ${color}...`
        );
        cell.setBackground(color);
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
    const folderSuffix = Utils.getFolderSuffix(
      folderName,
      Vars.getContentFolderSuffixes()
    );

    cellsData.forEach((cell) => {
      if (cell.name == "") return;
      if (cell.suffix.toLowerCase() != folderSuffix.toLowerCase()) return;

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
