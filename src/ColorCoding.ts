import { Variables } from "./common/Variables";
import { M_Utils } from "./common/Utils";
import { Rainbow } from "./common/Rainbow";
import { DataValidation } from "./DataValidation";

namespace ColorCoding {
  const Vars = Variables;
  const Utils = M_Utils;
  const Rbow = Rainbow;

  interface NameMatchLevel {
    name: string;
    suffix: string;
    cell: GoogleAppsScript.Spreadsheet.Range;
    matchLevel: number;
  }

  const red = "#ea9999";
  const yellow = "#ffe599";
  const green = "#b6d7a8";
  const pink = "#d5a6bd";

  /*
    
    matchLevel:
    0 (red)     There is no folder within the parent folder that matches the value
    1 (yellow)  There is at least one folder that has a similar name to the value
    (0,1) 
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
      Logger.log("range is not in one of the map sheets. exiting...");
      return;
    }

    let cellsData: NameMatchLevel[] = [];
    Utils.forEachRangeCell(range, (data) => {
      cellsData.push({
        cell: data,
        name: data.getValue().toString(),
        suffix: suffix,
        matchLevel: 0,
      });
    });

    // const rangeValues = range.getValues();
    // let mappedValues = rangeValues.flat().map((value) => {
    //   return { name: value.toString(), matchLevel: 0 } as NameMatchLevel;
    // });

    const zoneDrivesFolder = DriveApp.getFolderById(Vars.getZoneDrivesID());

    Utils.forEveryFolder(
      zoneDrivesFolder,
      (folder) => {
        cellsData = updateMatchLevelsForFolder(folder, cellsData);
      },
      true
    );

    const gradient = new Rbow.Rainbow();
    gradient.setSpectrum(red, yellow, green).setNumberRange(0, 1);

    cellsData.forEach((data) => {
      if(data.name == "") return;

      const cell = data.cell;
      const matchLevel = data.matchLevel;

      Logger.log("setting color for cell at %s", cell.getA1Notation());

      if (matchLevel < 1) {
        const color = gradient.colorAt(matchLevel);
        Logger.log(
          "no or close match (%s). setting color to %s...",
          matchLevel,
          color
        );
        cell.setBackground(color);
        return;
      }

      if (matchLevel > 1) {
        Logger.log("more than one match. setting color to pink");
        cell.setBackground(pink);
        return;
      }

      Logger.log("perfect match. setting color to green.");
      cell.setBackground(green);
    });

    // const rows = range.getNumRows();
    // for (let i = 0; i < rows; i++) {
    //   for (let j = 0; j < range.getNumColumns(); j++) {
    //     const index = i * rows + j;
    //     const matchLevel = mappedValues[index].matchLevel;
    //     const cell = range.getCell(i + 1, j + 1);

    //     Logger.log("setting color for cell at %s", cell.getA1Notation());

    //     if (matchLevel < 1) {
    //       const color = gradient.colorAt(matchLevel);
    //       Logger.log(
    //         "no or close match (%s). setting color to %s...",
    //         matchLevel,
    //         color
    //       );
    //       cell.setBackground(color);
    //       continue;
    //     }

    //     if (matchLevel > 1) {
    //       Logger.log("more than one match. setting color to pink");
    //       cell.setBackground(pink);
    //       return;
    //     }

    //     Logger.log("perfect match. setting color to green.");
    //     cell.setBackground(green);
    //   }
    // }
  }

  function updateMatchLevelsForFolder(
    folder: GoogleAppsScript.Drive.Folder,
    cellsData: NameMatchLevel[]
  ): NameMatchLevel[] {
    Logger.log("testing folder %s", folder.getName());
    const folderName = folder.getName();

    cellsData.forEach((cell) => {
      if (cell.name == "") return;

      const fullName = cell.name + cell.suffix;

      if (folderName == fullName) {
        Logger.log("perfect match! %s => %s", folderName, fullName);
        cell.matchLevel = cell.matchLevel < 1 ? 1 : 2;
        return;
      }

      const newMatchLevel = Utils.stringSimilarity(folderName, fullName);
      if (newMatchLevel > cell.matchLevel) {
        Logger.log(
          "better match: %s => %s, level: %s",
          folderName,
          fullName,
          newMatchLevel
        );
        cell.matchLevel = newMatchLevel;
      }
    });

    return cellsData;
  }
}
