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

  // export function getWithoutNumbers(str: string):string{
  //   return Utils.removeNumbers(str).trim();
  // }

  // export function getDistrict(area: string): string {
  //   if(area == null || area == '') return '';
  //   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
  //     "District To Area Map"
  //   );
  //   const areaRange = sheet.getRange("B2:K");
  //   const districtRange = sheet.getRange("A2:A");
  //   const areaCell = areaRange.createTextFinder(area).findNext();
  //   const areaCellRow = areaCell.getRow() - 1;
  //   const districtCell = districtRange.getCell(areaCellRow, 1);
  //   return districtCell.getValue().toString();
  // }

  // export function getZone(district: string): string {
  //   if(district == null || district == '') return '';
  //   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
  //     "Zone To District Map"
  //   );
  //   const districtRange = sheet.getRange("B2:H");
  //   const zoneRange = sheet.getRange("A2:A");
  //   const districtCell = districtRange.createTextFinder(district).findNext();
  //   const districtCellRow = districtCell.getRow() - 1;
  //   const zoneCell = zoneRange.getCell(districtCellRow, 1);
  //   return zoneCell.getValue().toString();
  // }

  function updateValidationFromEmail(
    range: GoogleAppsScript.Spreadsheet.Range
  ): void {
    if (removeValidationIfEmpty(range, 4)) return;

    const zoneRange = range.offset(0, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(Vars.getZoneRange())
      .build();
    zoneRange.setDataValidation(rule);

    const accessRange = zoneRange.offset(0, 3);
    const rule2 = SpreadsheetApp.newDataValidation()
      .requireValueInRange(Vars.getAccessLevelRange())
      .build();
    accessRange.setDataValidation(rule2);
  }

  function updateValidationFromZone(
    range: GoogleAppsScript.Spreadsheet.Range
  ): void {
    if (removeValidationIfEmpty(range, 2)) return;

    const districtRange = range.offset(0, 1);
    // clearCells(districtRange, 2);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(Vars.getDistrictRange(range.getValue()))
      .build();
    districtRange.setDataValidation(rule);
  }

  function updateValidationFromDistrict(
    range: GoogleAppsScript.Spreadsheet.Range
  ): void {
    if (removeValidationIfEmpty(range, 1)) return;

    const areaRange = range.offset(0, 1);
    // clearCells(areaRange, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(Vars.getAreaRange(range.getValue()))
      .build();
    areaRange.setDataValidation(rule);
  }

  function removeValidationIfEmpty(
    range: GoogleAppsScript.Spreadsheet.Range,
    numCols: number
  ): boolean {
    if (range.getValue() == "") {
      Logger.log(
        "Range %s was empty, removing data validations in %s cells...",
        range.getA1Notation(),
        numCols
      );
      const rangeToClear = range.offset(0, 1, 1, numCols);
      rangeToClear.clearDataValidations();
      rangeToClear.clear({ contentsOnly: true });
      return true;
    }
    return false;
  }

  function clearCells(
    startingCell: GoogleAppsScript.Spreadsheet.Range,
    numCols: number
  ): void {
    const rangeToClear = startingCell.offset(0, 0, 1, numCols);
    rangeToClear.clear({ contentsOnly: true });
  }
}
