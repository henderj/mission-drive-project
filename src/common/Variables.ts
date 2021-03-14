import { M_Utils } from "./Utils";

export { Variables };

namespace Variables {
    const Utils = M_Utils;

    const SettingsSpreadsheetID = "1meH_THNN87D7UAr1l_ynIZmeVXxA_rguliOODXig8QA";
    const SettingsSheetName = "Settings";

    const cache = new Map<string, any>();

    function getOrSetCachedVariable<T>(key: string, funcToRetrieveVar: () => T): T {
        if (!cache.has(key)) {
            cache.set(key, funcToRetrieveVar());
        }
        const value = cache.get(key) as T;
        return value;
    }

    export function getInterfaceSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
        const key = "InterfaceSpreadsheet";
        const func = () => SpreadsheetApp.openById(SettingsSpreadsheetID);
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Spreadsheet>(key, func);
    }

    export function getSettingsSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "SettingsSheet";
        const func = () => getInterfaceSpreadsheet().getSheetByName(SettingsSheetName);
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getInterfaceSheetByID(
        gid: string
    ): GoogleAppsScript.Spreadsheet.Sheet {
        return Utils.getSheetByID(getInterfaceSpreadsheet(), gid);
    }

    export function getValueOfSetting(settingName: string): string {
        const key = "Setting:" + settingName;
        const func = () => getSettingsSheet()
            .createTextFinder(settingName)
            .findNext()
            .offset(0, 1)
            .getValue()
            .toString();
        return getOrSetCachedVariable<string>(key, func);
    }

    export function getTalentSpreadsheetID(): string {
        return getValueOfSetting("MLMTalentSpreadsheetID");
    }

    export function getTalentSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
        const key = "TalentSpreadsheet";
        const func = () => SpreadsheetApp.openById(getTalentSpreadsheetID());
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Spreadsheet>(key, func);
    }

    export function getTalentResponsesSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "TalentResponsesSheet";
        const func = () => Utils.getSheetByID(
            getTalentSpreadsheet(),
            getValueOfSetting("MLMTalentResponsesSheetID")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getTalentTemplateSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "TalentTemplateSheet";
        const func = () => Utils.getSheetByID(
            getTalentSpreadsheet(),
            getValueOfSetting("MLMTalentTemplateSheetID")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getTalentFilteredDataSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "TalentFilteredDataSheet";
        const func = () => Utils.getSheetByID(
            getTalentSpreadsheet(),
            getValueOfSetting("MLMTalentFilteredDataSheetID")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getTalentQuickInfoSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "TalentQuickInfoSheet";
        const func = () => Utils.getSheetByID(
            getTalentSpreadsheet(),
            getValueOfSetting("MLMTalentQuickInfoSheetID")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
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
        const key = "ZoneToDistrictMapSheet";
        const func = () => {
            const id: string = getZoneToDistrictMapID();
            return getInterfaceSheetByID(id);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getDistrictToAreaMapSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "DistrictToAreaMapSheet";
        const func = () => {
            const id: string = getDistrictToAreaMapID();
            return getInterfaceSheetByID(id);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getAccessLevelSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "AccessLevelSheet";
        const func = () => {
            const id: string = getValueOfSetting("AccessLevelSheetID");
            return getInterfaceSheetByID(id);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getPermissionsSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "PermissionsSheet";
        const func = () => {
            const id: string = getValueOfSetting("PermissionsID");
            return getInterfaceSheetByID(id);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
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
        const key = "ZoneRange";
        const func = () => getInterfaceSpreadsheet().getRangeByName(
            getValueOfSetting("CompleteZoneRange")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getCompleteDistrictRange(): GoogleAppsScript.Spreadsheet.Range {
        const key = "CompleteDistrictRange";
        const func = () => getInterfaceSpreadsheet().getRangeByName(
            getValueOfSetting("CompleteDistrictRange")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getDistrictRange(
        zone: string
    ): GoogleAppsScript.Spreadsheet.Range {
        const key = "DistrictRange:" + zone;
        const func = () => {
            const zoneCell: GoogleAppsScript.Spreadsheet.Range = getZoneRange()
                .createTextFinder(zone)
                .findNext();
            if(zoneCell == null){
                Logger.log(`could not find ${zone} zone in zone to district map. returning null...`);
                return null;
            }
            return zoneCell.offset(0, 1).offset(0, 0, 1, 6);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getAreaRange(
        district: string
    ): GoogleAppsScript.Spreadsheet.Range {
        const key = "AreaRange:" + district;
        const func = () => {
            const districtCell: GoogleAppsScript.Spreadsheet.Range = getDistrictToAreaMapSheet()
                .getRange("A2:A")
                .createTextFinder(district)
                .findNext();
            return districtCell.offset(0, 1).offset(0, 0, 1, 9);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getCompleteAreaRange(): GoogleAppsScript.Spreadsheet.Range {
        const key = "CompleteAreaRange";
        const func = () => getInterfaceSpreadsheet().getRangeByName(
            getValueOfSetting("CompleteAreaRange")
        );
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getAccessLevelRange(): GoogleAppsScript.Spreadsheet.Range {
        const key = "AccessLevelRange";
        const func = () => getAccessLevelSheet().getDataRange();
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getPermissionsRange(): GoogleAppsScript.Spreadsheet.Range {
        const key = "PermissionsRange";
        const func = () => {
            const spreadsheet = getInterfaceSpreadsheet();
            const name = getValueOfSetting("PermissionsRangeName");
            return spreadsheet.getRangeByName(name);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getArchiveFolderName(
        folder: GoogleAppsScript.Drive.Folder
    ): string {
        const folderName: string = folder.getName();
        const prefix = Utils.getFolderPrefix(
            folderName,
            getContentFolderSuffixes()
        );
        Logger.log("folder prefix: %s.", prefix);

        return prefix + getArchiveFolderSuffix();
    }

    export function getContentFolderSuffixes(): string[] {
        const key = "ContentFolderSuffixes";
        const func = () => [
            getAreaFolderSuffix(),
            getDistrictFolderSuffix(),
            getZoneFolderSuffix(),
        ];
        return getOrSetCachedVariable<string[]>(key, func);
    }

    export function getLogRange(): GoogleAppsScript.Spreadsheet.Range {
        const key = "LogRange";
        const func = () => {
            const name = getValueOfSetting("LogRangeName");
            const spreadsheet = getInterfaceSpreadsheet();
            return spreadsheet.getRangeByName(name);
        }
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }

    export function getAreaWithoutNumCol(): number {
        return parseInt(getValueOfSetting("PermissionsAreaWithoutNumCol"));
    }

    export function getReroutePDFs(): boolean {
        const value = getValueOfSetting("ReroutePDFs").toLowerCase().trim();
        const possibleYes = ["y", "yes", "t", "true"];
        return possibleYes.includes(value);
    }

    export function getRerouteEmailAddress(): string {
        return getValueOfSetting("RerouteEmailAddress");
    }

    export function getTransferFunctions(): string {
        return getValueOfSetting("TransferFunctions");
    }

    export function getInterfaceSheet(): GoogleAppsScript.Spreadsheet.Sheet {
        const key = "InterfaceSheet";
        const func = () => getInterfaceSheetByID(getValueOfSetting("InterfaceSheetID"));
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Sheet>(key, func);
    }

    export function getAdminRange(): GoogleAppsScript.Spreadsheet.Range {
        const key = "AdminRange";
        const func = () => getInterfaceSpreadsheet().getRangeByName(getValueOfSetting("AdminRangeName"));
        return getOrSetCachedVariable<GoogleAppsScript.Spreadsheet.Range>(key, func);
    }
}
