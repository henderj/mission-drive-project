import { M_Utils } from "./common/Utils";
import { Variables } from "./common/Variables";

export { DataCompletion };

namespace DataCompletion {
  const Vars = Variables;
  const Utils = M_Utils;

  export function updateDataCompletion(
    e: GoogleAppsScript.Events.SheetsOnEdit
  ): void {
    const range = e.range;
    Utils.forEachRangeCell(range, updateDataCompletionForCell);
  }

  function updateDataCompletionForCell(
    cell: GoogleAppsScript.Spreadsheet.Range
  ): void {
    if (cell == null) return;
    const col = cell.getColumn();
    const areaCol = Vars.getAreaColNum();
    const areaWithoutNum = Vars.getAreaWithoutNumCol();
    const districtCol = Vars.getDistrictColNum();
    let newCell = null;
    if (col == areaCol) {
      newCell = updateAreaWithoutNumCell(cell);
    }
    if (col == areaWithoutNum) {
      newCell = updateDistrictCell(cell);
    }
    if(col == districtCol){
      newCell = updateZoneCell(cell);
    }
    updateDataCompletionForCell(newCell);
  }

  function updateAreaWithoutNumCell(
    cell: GoogleAppsScript.Spreadsheet.Range
  ): GoogleAppsScript.Spreadsheet.Range {
    const sheet = cell.getSheet();
    const value: string = cell.getValue().toString();
    let areaName = value;
    if (Utils.hasNumber(value)) areaName = Utils.removeNumbers(value);
    const areaWithoutNumCol = Vars.getAreaWithoutNumCol();
    const areaWithouNumCell = sheet.getRange(cell.getRow(), areaWithoutNumCol);
    areaWithouNumCell.setValue(areaName.trim());
    return areaWithouNumCell;
  }

  function updateDistrictCell(
    cell: GoogleAppsScript.Spreadsheet.Range
  ): GoogleAppsScript.Spreadsheet.Range {
    if(cell.getValue() == '') return null;
    const sheet = cell.getSheet();
    const areaName: string = cell.getValue().toString();
    const areaRange = Vars.getCompleteAreaRange();
    const districtRange = areaRange.getSheet().getRange("A2:A");

    const areaCell = areaRange.createTextFinder(areaName).findNext();
    const areaCellRow = areaCell.getRow() - 1;
    const districtCell = districtRange.getCell(areaCellRow, 1);
    const district = districtCell.getValue();

    const districtCol = Vars.getDistrictColNum();
    const cellToSet = sheet.getRange(cell.getRow(), districtCol);

    cellToSet.setValue(district);
    return cellToSet;
  }

  function updateZoneCell(
    cell: GoogleAppsScript.Spreadsheet.Range
  ): GoogleAppsScript.Spreadsheet.Range {
    const sheet = cell.getSheet();
    const districtName: string = cell.getValue().toString();
    const districtRange = Vars.getCompleteDistrictRange();
    const zoneRange = Vars.getZoneRange();

    const districtCell = districtRange.createTextFinder(districtName).findNext();
    const districtCellRow = districtCell.getRow() - 1;
    const zoneCell = zoneRange.getCell(districtCellRow, 1);
    const zone = zoneCell.getValue();

    const zoneCol = Vars.getZoneColNum();
    const cellToSet = sheet.getRange(cell.getRow(), zoneCol);

    cellToSet.setValue(zone);
    return cellToSet;
  }
}
