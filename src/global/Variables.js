const SettingsSpreadsheetID = "1meH_THNN87D7UAr1l_ynIZmeVXxA_rguliOODXig8QA";
const SettingsSheetName = "Settings";

function getInterfaceSpreadsheet() {
  return SpreadsheetApp.openById(SettingsSpreadsheetID);
}

function getSettingsSheet() {
  return getInterfaceSpreadsheet().getSheetByName(SettingsSheetName);
}

function getInterfaceSheetByID(gid) {
  return getSheetByID(getInterfaceSpreadsheet(), gid);
}

function getValueOfSetting(settingName) {
  return getSettingsSheet()
    .createTextFinder(settingName)
    .findNext()
    .offset(0, 1)
    .getValue()
    .toString();
}

function getTalentSpreadsheetID() {
  return getValueOfSetting("MLMTalentSpreadsheetID");
}

function getTalentSpreadsheet() {
  return SpreadsheetApp.openById(getTalentSpreadsheetID());
}

function getTalentResponsesSheet() {
  return getSheetByID(
    getTalentSpreadsheet(),
    getValueOfSetting("MLMTalentResponsesSheetID")
  );
}

function getTalentTemplateSheet() {
  return getSheetByID(
    getTalentSpreadsheet(),
    getValueOfSetting("MLMTalentTemplateSheetID")
  );
}

function getTalentFilteredDataSheet() {
  return getSheetByID(
    getTalentSpreadsheet(),
    getValueOfSetting("MLMTalentFilteredDataSheetID")
  );
}

function getTalentQuickInfoSheet() {
  return getSheetByID(
    getTalentSpreadsheet(),
    getValueOfSetting("MLMTalentQuickInfoSheetID")
  );
}

function getZoneToDistrictMapID() {
  return getValueOfSetting("ZoneToDistrictMapID");
}

function getDistrictToAreaMapID() {
  return getValueOfSetting("DistrictToAreaMapID");
}

function getPermissionsID() {
  return getValueOfSetting("PermissionsID");
}

function getEmailAddressColNum() {
  return parseInt(getValueOfSetting("PermissionsEmailAddressCol"));
}

function getZoneColNum() {
  return parseInt(getValueOfSetting("PermissionsZoneCol"));
}

function getDistrictColNum() {
  return parseInt(getValueOfSetting("PermissionsDistrictCol"));
}

function getAreaColNum() {
  return parseInt(getValueOfSetting("PermissionsAreaCol"));
}

function getAccessLevelColNum() {
  return parseInt(getValueOfSetting("PermissionsAccessLevelCol"));
}

function getPermissionsRangeA1Notation() {
  return getValueOfSetting("PermissionsRange");
}

function getZoneToDistrictMapSheet() {
  const id = getZoneToDistrictMapID();
  return getInterfaceSheetByID(id);
}

function getDistrictToAreaMapSheet() {
  const id = getDistrictToAreaMapID();
  return getInterfaceSheetByID(id);
}

function getAccessLevelSheet() {
  const id = getValueOfSetting("AccessLevelSheetID");
  return getInterfaceSheetByID(id);
}

function getPermissionsSheet() {
  const id = getValueOfSetting("PermissionsID");
  return getInterfaceSheetByID(id);
}

function getMissionDatabaseID() {
  return getValueOfSetting("MissionDatabaseID");
}

function getMissionDriveID() {
  return getValueOfSetting("MissionDriveID");
}

function getZoneDrivesID() {
  return getValueOfSetting("ZoneDrivesID");
}

function getZoneFolderSuffix() {
  return " " + getValueOfSetting("ZoneFolderSuffix");
}

function getDistrictFolderSuffix() {
  return " " + getValueOfSetting("DistrictFolderSuffix");
}

function getAreaFolderSuffix() {
  return " " + getValueOfSetting("AreaFolderSuffix");
}

function getArchiveFolderSuffix() {
  return " " + getValueOfSetting("ArchiveFolderSuffix");
}

function getSMSShortcutsFolderName() {
  return getValueOfSetting("SMSShortcutsFolderName");
}

function getQualityFolderName() {
  return getValueOfSetting("QualityFolderName");
}

function getQuickFolderName() {
  return getValueOfSetting("QuickFolderName");
}
