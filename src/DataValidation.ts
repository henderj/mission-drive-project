namespace DataValidation {
  const Vars = Variables;
  const Utils = M_Utils;

  export function updateDataValidation(
    e: GoogleAppsScript.Events.SheetsOnEdit
  ): void {
    const range = e.range;
    const emailAddressColNum = Vars.getEmailAddressColNum();
    const zoneColNum = Vars.getZoneColNum();
    const districtColNum = Vars.getDistrictColNum();
    Utils.forEachRangeCell(range, (cell: GoogleAppsScript.Spreadsheet.Range) =>
      updateDataValidationForCell(
        cell,
        emailAddressColNum,
        zoneColNum,
        districtColNum
      )
    );
  }

  function updateDataValidationForCell(
    cell: GoogleAppsScript.Spreadsheet.Range,
    emailAddressColNum: number,
    zoneColNum: number,
    districtColNum: number
  ): void {
    const col = cell.getColumn();

    if (col == emailAddressColNum) {
      Logger.log("Email Address was changed! Updated data validation");
      updateValidationFromEmail(cell);
      return;
    }

    if (col == zoneColNum) {
      Logger.log("Zone was changed! Updated data validation");
      updateValidationFromZone(cell);
      return;
    }

    if (col == districtColNum) {
      Logger.log("District was changed! Updated data validation");
      updateValidationFromDistrict(cell);
      return;
    }
  }

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

  function updateValidationFromDistrict(range: GoogleAppsScript.Spreadsheet.Range): void {
    if (removeValidationIfEmpty(range, 1)) return;

    const areaRange = range.offset(0, 1);
    // clearCells(areaRange, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(Vars.getAreaRange(range.getValue()))
      .build();
    areaRange.setDataValidation(rule);
  }

  function removeValidationIfEmpty(range: GoogleAppsScript.Spreadsheet.Range, numCols: number): boolean {
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

  function clearCells(startingCell: GoogleAppsScript.Spreadsheet.Range, numCols: number): void {
    const rangeToClear = startingCell.offset(0, 0, 1, numCols);
    rangeToClear.clear({ contentsOnly: true });
  }
}
