import { Variables } from "./common/Variables";
import { M_Utils } from "./common/Utils";
import { Rainbow } from "./common/Rainbow";

namespace ColorCoding {
  const Vars = Variables;
  const Utils = M_Utils;
  const Rbow = Rainbow;

  interface NameMatchLevel {
    name: string;
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
    range: GoogleAppsScript.Spreadsheet.Range
  ): void {
    const sheetID = range.getSheet().getSheetId().toString();
    if (
      sheetID != Vars.getZoneToDistrictMapID() &&
      sheetID != Vars.getDistrictToAreaMapID()
    ) {
      Logger.log("range is not in one of the map sheets. exiting...");
      return;
    }

    const rangeValues = range.getValues();
    let mappedValues = rangeValues.flat().map((value) => {
      return { name: value.toString(), matchLevel: 0 } as NameMatchLevel;
    });

    const zoneDrivesFolder = DriveApp.getFolderById(Vars.getZoneDrivesID());

    Utils.forEveryFolder(
      zoneDrivesFolder,
      (folder) => {
        mappedValues = updateMatchLevelsForFolder(folder, mappedValues);
      },
      true
    );

    const gradient = new Rbow.Rainbow();
    gradient.setSpectrum(red, yellow, green).setNumberRange(0, 1);

    const rows = range.getNumRows();
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < range.getNumColumns(); j++) {
        const index = i * rows + j;
        const matchLevel = mappedValues[index].matchLevel;
        const cell = range.getCell(i + 1, j + 1);

        if (matchLevel < 1) {
          cell.setBackground(gradient.colorAt(matchLevel));
          continue;
        }

        if (matchLevel > 1) {
          cell.setBackground(pink);
          return;
        }

        cell.setBackground(green);
      }
    }
  }

  function updateMatchLevelsForFolder(
    folder: GoogleAppsScript.Drive.Folder,
    values: NameMatchLevel[]
  ): NameMatchLevel[] {
    values.forEach((value) => {
      const folderName = folder.getName();
      const prefix = Utils.getFolderPrefix(folderName);

      if (prefix == value.name) {
        value.matchLevel = value.matchLevel < 1 ? 1 : 2;
        return;
      }

      const newMatchLevel = Utils.stringSimilarity(prefix, value.name);
      if (newMatchLevel > value.matchLevel) value.matchLevel = newMatchLevel;
    });

    return values;
  }
}
