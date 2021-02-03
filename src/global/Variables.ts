namespace mission.global.Variables {
  const Utils = mission.global.Utilities;

  const SettingsSpreadsheetID = "1meH_THNN87D7UAr1l_ynIZmeVXxA_rguliOODXig8QA";
  const SettingsSheetName = "Settings";

  export function getInterfaceSpreadsheet() {
    return SpreadsheetApp.openById(SettingsSpreadsheetID);
  }

  export function getSettingsSheet() {
    return getInterfaceSpreadsheet().getSheetByName(SettingsSheetName);
  }

  export function getInterfaceSheetByID(gid) {
    return Utils.getSheetByID(getInterfaceSpreadsheet(), gid);
  }

  export function getValueOfSetting(settingName) {
    return getSettingsSheet()
      .createTextFinder(settingName)
      .findNext()
      .offset(0, 1)
      .getValue()
      .toString();
  }

  export function getTalentSpreadsheetID() {
    return getValueOfSetting("MLMTalentSpreadsheetID");
  }

  export function getTalentSpreadsheet() {
    return SpreadsheetApp.openById(getTalentSpreadsheetID());
  }

  export function getTalentResponsesSheet() {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentResponsesSheetID")
    );
  }

  export function getTalentTemplateSheet() {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentTemplateSheetID")
    );
  }

  export function getTalentFilteredDataSheet() {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentFilteredDataSheetID")
    );
  }

  export function getTalentQuickInfoSheet() {
    return Utils.getSheetByID(
      getTalentSpreadsheet(),
      getValueOfSetting("MLMTalentQuickInfoSheetID")
    );
  }

  export function getZoneToDistrictMapID() {
    return getValueOfSetting("ZoneToDistrictMapID");
  }

  export function getDistrictToAreaMapID() {
    return getValueOfSetting("DistrictToAreaMapID");
  }

  export function getPermissionsID() {
    return getValueOfSetting("PermissionsID");
  }

  export function getEmailAddressColNum() {
    return parseInt(getValueOfSetting("PermissionsEmailAddressCol"));
  }

  export function getZoneColNum() {
    return parseInt(getValueOfSetting("PermissionsZoneCol"));
  }

  export function getDistrictColNum() {
    return parseInt(getValueOfSetting("PermissionsDistrictCol"));
  }

  export function getAreaColNum() {
    return parseInt(getValueOfSetting("PermissionsAreaCol"));
  }

  export function getAccessLevelColNum() {
    return parseInt(getValueOfSetting("PermissionsAccessLevelCol"));
  }

  export function getPermissionsRangeA1Notation() {
    return getValueOfSetting("PermissionsRange");
  }

  export function getZoneToDistrictMapSheet() {
    const id = getZoneToDistrictMapID();
    return getInterfaceSheetByID(id);
  }

  export function getDistrictToAreaMapSheet() {
    const id = getDistrictToAreaMapID();
    return getInterfaceSheetByID(id);
  }

  export function getAccessLevelSheet() {
    const id = getValueOfSetting("AccessLevelSheetID");
    return getInterfaceSheetByID(id);
  }

  export function getPermissionsSheet() {
    const id = getValueOfSetting("PermissionsID");
    return getInterfaceSheetByID(id);
  }

  export function getMissionDatabaseID() {
    return getValueOfSetting("MissionDatabaseID");
  }

  export function getMissionDriveID() {
    return getValueOfSetting("MissionDriveID");
  }

  export function getZoneDrivesID() {
    return getValueOfSetting("ZoneDrivesID");
  }

  export function getZoneFolderSuffix() {
    return " " + getValueOfSetting("ZoneFolderSuffix");
  }

  export function getDistrictFolderSuffix() {
    return " " + getValueOfSetting("DistrictFolderSuffix");
  }

  export function getAreaFolderSuffix() {
    return " " + getValueOfSetting("AreaFolderSuffix");
  }

  export function getArchiveFolderSuffix() {
    return " " + getValueOfSetting("ArchiveFolderSuffix");
  }

  export function getSMSShortcutsFolderName() {
    return getValueOfSetting("SMSShortcutsFolderName");
  }

  export function getQualityFolderName() {
    return getValueOfSetting("QualityFolderName");
  }

  export function getQuickFolderName() {
    return getValueOfSetting("QuickFolderName");
  }

  export function getZoneRange() {
    return getZoneToDistrictMapSheet().getRange("A2:A");
  }

  export function getDistrictRange(zone) {
    const zoneCell = getZoneRange().createTextFinder(zone).findNext();
    return zoneCell.offset(0, 1).offset(0, 0, 1, 6);
  }

  export function getAreaRange(district) {
    const districtCell = getDistrictToAreaMapSheet()
      .getRange("A2:A")
      .createTextFinder(district)
      .findNext();
    return districtCell.offset(0, 1).offset(0, 0, 1, 9);
  }

  export function getAccessLevelRange() {
    return getAccessLevelSheet().getRange("A1:A");
  }

  export function getPermissionsRange() {
    return getPermissionsSheet().getDataRange();
  }
}
