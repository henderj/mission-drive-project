namespace Variables {
  const Utils = M_Utils;

  const SettingsSpreadsheetID = "1meH_THNN87D7UAr1l_ynIZmeVXxA_rguliOODXig8QA";
  const SettingsSheetName = "Settings";

  export function getInterfaceSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    return SpreadsheetApp.openById(SettingsSpreadsheetID);
  }

  export function getSettingsSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return getInterfaceSpreadsheet().getSheetByName(SettingsSheetName);
  }

  export function getInterfaceSheetByID(
    gid: string
  ): GoogleAppsScript.Spreadsheet.Sheet {
    return Utils.getSheetByID(getInterfaceSpreadsheet(), gid);
  }

  export function getValueOfSetting(settingName: string): string {
    return getSettingsSheet()
      .createTextFinder(settingName)
      .findNext()
      .offset(0, 1)
      .getValue()
      .toString();
  }

  export function getTalentSpreadsheetID(): string {
    return getValueOfSetting("MLMTalentSpreadsheetID");
  }

  export function getTalentSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    return SpreadsheetApp.openById(getTalentSpreadsheetID());
  }

  export function getTalentResponsesSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentResponsesSheetID")
    );
  }

  export function getTalentTemplateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentTemplateSheetID")
    );
  }

  export function getTalentFilteredDataSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentFilteredDataSheetID")
    );
  }

  export function getTalentQuickInfoSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentQuickInfoSheetID")
    );
  }

  export function getZoneToDistrictMapID(): string {
    return getValueOfSetting("ZoneToDistrictMapID");
  }

  export function getDistrictToAreaMapID(): string {
    return getValueOfSetting("DistrictToAreaMapID");
  }

  export function getPermissionsID(): string {
    return getValueOfSetting("PermissionsID");
  }

  export function getEmailAddressColNum(): number {
    return parseInt(getValueOfSetting("PermissionsEmailAddressCol"));
  }

  export function getZoneColNum(): number {
    return parseInt(getValueOfSetting("PermissionsZoneCol"));
  }

  export function getDistrictColNum(): number {
    return parseInt(getValueOfSetting("PermissionsDistrictCol"));
  }

  export function getAreaColNum(): number {
    return parseInt(getValueOfSetting("PermissionsAreaCol"));
  }

  export function getAccessLevelColNum(): number {
    return parseInt(getValueOfSetting("PermissionsAccessLevelCol"));
  }

  export function getPermissionsRangeA1Notation(): string {
    return getValueOfSetting("PermissionsRange");
  }

  export function getZoneToDistrictMapSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const id: string = getZoneToDistrictMapID();
    return getInterfaceSheetByID(id);
  }

  export function getDistrictToAreaMapSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const id: string = getDistrictToAreaMapID();
    return getInterfaceSheetByID(id);
  }

  export function getAccessLevelSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const id: string = getValueOfSetting("AccessLevelSheetID");
    return getInterfaceSheetByID(id);
  }

  export function getPermissionsSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const id: string = getValueOfSetting("PermissionsID");
    return getInterfaceSheetByID(id);
  }

  export function getMissionDatabaseID(): string {
    return getValueOfSetting("MissionDatabaseID");
  }

  export function getMissionDriveID(): string {
    return getValueOfSetting("MissionDriveID");
  }

  export function getZoneDrivesID(): string {
    return getValueOfSetting("ZoneDrivesID");
  }

  export function getZoneFolderSuffix(): string {
    return " " + getValueOfSetting("ZoneFolderSuffix");
  }

  export function getDistrictFolderSuffix(): string {
    return " " + getValueOfSetting("DistrictFolderSuffix");
  }

  export function getAreaFolderSuffix(): string {
    return " " + getValueOfSetting("AreaFolderSuffix");
  }

  export function getArchiveFolderSuffix(): string {
    return " " + getValueOfSetting("ArchiveFolderSuffix");
  }

  export function getSMSShortcutsFolderName(): string {
    return getValueOfSetting("SMSShortcutsFolderName");
  }

  export function getQualityFolderName(): string {
    return getValueOfSetting("QualityFolderName");
  }

  export function getQuickFolderName(): string {
    return getValueOfSetting("QuickFolderName");
  }

  export function getZoneRange(): GoogleAppsScript.Spreadsheet.Range {
    return getZoneToDistrictMapSheet().getRange("A2:A");
  }

  export function getDistrictRange(
    zone: string
  ): GoogleAppsScript.Spreadsheet.Range {
    const zoneCell: GoogleAppsScript.Spreadsheet.Range = getZoneRange()
      .createTextFinder(zone)
      .findNext();
    return zoneCell.offset(0, 1).offset(0, 0, 1, 6);
  }

  export function getAreaRange(
    district: string
  ): GoogleAppsScript.Spreadsheet.Range {
    const districtCell: GoogleAppsScript.Spreadsheet.Range = getDistrictToAreaMapSheet()
      .getRange("A2:A")
      .createTextFinder(district)
      .findNext();
    return districtCell.offset(0, 1).offset(0, 0, 1, 9);
  }

  export function getAccessLevelRange(): GoogleAppsScript.Spreadsheet.Range {
    return getAccessLevelSheet().getRange("A1:A");
  }

  export function getPermissionsRange(): GoogleAppsScript.Spreadsheet.Range {
    return getPermissionsSheet().getDataRange();
  }

  export function getArchiveFolderName(
    areaFolder: GoogleAppsScript.Drive.Folder
  ): string {
    const areaFolderName: string = areaFolder.getName();
    const suffixIndex: number = areaFolderName
      .toLowerCase()
      .indexOf(getAreaFolderSuffix().toLowerCase());
    const areaName: string = areaFolderName.substring(0, suffixIndex).trim();
    Logger.log("area name: %s.", areaName);
    return areaName + getArchiveFolderSuffix();
  }
}
