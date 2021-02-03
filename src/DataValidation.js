function updateDataValidation(e) {
  const range = e.range;
  const emailAddressColNum = getEmailAddressColNum();
  const zoneColNum = getZoneColNum();
  const districtColNum = getDistrictColNum();
  forEachRangeCell(range, (cell) =>
    updateDataValidationForCell(
      cell,
      emailAddressColNum,
      zoneColNum,
      districtColNum
    )
  );
}

function updateDataValidationForCell(
  cell,
  emailAddressColNum,
  zoneColNum,
  districtColNum
) {
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

function updateValidationFromEmail(range) {
  if (removeValidationIfEmpty(range, 4)) return;

  const zoneRange = range.offset(0, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(getZoneRange())
    .build();
  zoneRange.setDataValidation(rule);

  const accessRange = zoneRange.offset(0, 3);
  const rule2 = SpreadsheetApp.newDataValidation()
    .requireValueInRange(getAccessLevelRange())
    .build();
  accessRange.setDataValidation(rule2);
}

function updateValidationFromZone(range) {
  if (removeValidationIfEmpty(range, 2)) return;

  const districtRange = range.offset(0, 1);
  // clearCells(districtRange, 2);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(getDistrictRange(range.getValue()))
    .build();
  districtRange.setDataValidation(rule);
}

function updateValidationFromDistrict(range) {
  if (removeValidationIfEmpty(range, 1)) return;

  const areaRange = range.offset(0, 1);
  // clearCells(areaRange, 1);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(getAreaRange(range.getValue()))
    .build();
  areaRange.setDataValidation(rule);
}

function removeValidationIfEmpty(range, numCols) {
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

function clearCells(startingCell, numCols) {
  const rangeToClear = startingCell.offset(0, 0, 1, numCols);
  rangeToClear.clear({ contentsOnly: true });
}

function getZoneRange() {
  return getZoneToDistrictMapSheet().getRange("A2:A");
}

function getDistrictRange(zone) {
  const zoneCell = getZoneRange().createTextFinder(zone).findNext();
  return zoneCell.offset(0, 1).offset(0, 0, 1, 6);
}

function getAreaRange(district) {
  const districtCell = getDistrictToAreaMapSheet()
    .getRange("A2:A")
    .createTextFinder(district)
    .findNext();
  return districtCell.offset(0, 1).offset(0, 0, 1, 9);
}

function getAccessLevelRange() {
  return getAccessLevelSheet().getRange("A1:A");
}
