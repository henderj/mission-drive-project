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
        // Utils.forEachRangeCell(range, updateDataCompletionForCell);
        updateDataCompletionForRange(range);
    }

    export function updateDataCompletionForRange(
        range: GoogleAppsScript.Spreadsheet.Range
    ) {
        Utils.forEachRangeCell(range, updateDataCompletionForCell);
    }

    export function updateDataCompletionForAll() {
        const range = Vars.getPermissionsRange();
        updateDataCompletionForRange(range);
    }

    export function updateDataCompletionForSelection() {
        const range = SpreadsheetApp.getSelection().getActiveRange();
        updateDataCompletionForRange(range);
    }

    function updateDataCompletionForCell(
        cell: GoogleAppsScript.Spreadsheet.Range
    ): void {
        if (cell == null) return;
        const col = cell.getColumn();
        const areaCol = Vars.getAreaColNum();
        if (col == areaCol) {
            const sheet = cell.getSheet();
            const row = sheet.getRange(cell.getRow(), 1, 1, sheet.getMaxColumns());
            Logger.log("row: %s", row.getA1Notation());
            updateAreaWithoutNumCell(row);
            updateDistrictCell(row);
            updateZoneCell(row);
            updateAccessLevelCell(row);
        }
    }

    function updateAreaWithoutNumCell(
        row: GoogleAppsScript.Spreadsheet.Range
    ): GoogleAppsScript.Spreadsheet.Range {
        const sheet = row.getSheet();
        Logger.log(Vars.getAreaColNum());
        const areaCell = row.getCell(1, Vars.getAreaColNum());
        const value: string = areaCell.getValue().toString();
        let areaName = value;

        const areaWithoutNumCol = Vars.getAreaWithoutNumCol();
        const areaWithouNumCell = sheet.getRange(
            areaCell.getRow(),
            areaWithoutNumCol
        );
        if (areaCell.isBlank()) {
            areaWithouNumCell.setValue("");
            return;
        }
        if (Utils.hasNumber(value)) areaName = Utils.removeNumbers(value);

        areaWithouNumCell.setValue(areaName.trim());
        return areaWithouNumCell;
    }

    function updateDistrictCell(row: GoogleAppsScript.Spreadsheet.Range): void {
        const areaWithoutNumCell = row.getCell(1, Vars.getAreaWithoutNumCol());
        const sheet = areaWithoutNumCell.getSheet();
        const districtCol = Vars.getDistrictColNum();
        const cellToSet = sheet.getRange(areaWithoutNumCell.getRow(), districtCol);

        if (areaWithoutNumCell.isBlank()) {
            cellToSet.setValue("");
            return;
        }

        const areaName: string = areaWithoutNumCell.getValue().toString();
        const areaRange = Vars.getCompleteAreaRange();
        const districtRange = areaRange.getSheet().getRange("A2:A");


        const areaCell = areaRange.createTextFinder(areaName).findNext();

        if (areaCell == null) {
            cellToSet.setValue("");
            return;
        }

        const areaCellRow = areaCell.getRow() - 1;
        const districtCell = districtRange.getCell(areaCellRow, 1);
        const district = districtCell.getValue();


        cellToSet.setValue(district);
    }

    function updateZoneCell(row: GoogleAppsScript.Spreadsheet.Range): void {
        const cell = row.getCell(1, Vars.getDistrictColNum());
        const sheet = cell.getSheet();
        const districtName: string = cell.getValue().toString();
        const districtRange = Vars.getCompleteDistrictRange();
        const zoneRange = Vars.getZoneRange();

        const zoneCol = Vars.getZoneColNum();
        const cellToSet = sheet.getRange(cell.getRow(), zoneCol);

        if(cell.isBlank()){
            cellToSet.setValue("");
            return;
        }

        const districtCell = districtRange
            .createTextFinder(districtName)
            .findNext();
        if (districtCell == null) {
            Logger.log("couldn't find district: " + districtName);
            cellToSet.setValue("");
            return;
        }
        const districtCellRow = districtCell.getRow() - 1;
        const zoneCell = zoneRange.getCell(districtCellRow, 1);
        const zone = zoneCell.getValue();


        cellToSet.setValue(zone);
    }

    function updateAccessLevelCell(
        row: GoogleAppsScript.Spreadsheet.Range
    ): void {
        const areaWithNumCell = row.getCell(1, Vars.getAreaColNum());
        if (areaWithNumCell == null || areaWithNumCell.getValue() == "") return;

        const sheet = areaWithNumCell.getSheet();

        const cellToSet = sheet.getRange(
            areaWithNumCell.getRow(),
            Vars.getAccessLevelColNum()
        );

        if(areaWithNumCell.isBlank()){
            cellToSet.setValue("");
            return;
        }

        const areaName: string = areaWithNumCell.getValue().toString();

        const accessLevelMap = Vars.getAccessLevelRange();

        const areaAccessLevelCell = accessLevelMap
            .createTextFinder(areaName)
            .findNext();

        if (areaAccessLevelCell == null) {
            cellToSet.setValue("");
            return;
        }

        const accessLevelCol = areaAccessLevelCell.getColumn();
        const accessLevel = accessLevelMap.getCell(1, accessLevelCol).getValue();

        cellToSet.setValue(accessLevel);
    }
}
