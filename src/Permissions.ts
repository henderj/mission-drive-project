import { M_Utils } from "./common/Utils";
import { Variables } from "./common/Variables";
import { SheetLogger } from "./common/SheetLogger";

export { Permissions };

namespace Permissions {
    const Vars = Variables;
    const Utils = M_Utils;
    const sheetLogger = SheetLogger.SheetLogger;

    export function updatePermissions(): void {
        sheetLogger.Log(`Updating permissions...`);
        const rangeValues = Vars.getPermissionsRange().getValues();
        const emailAddressColNum = Vars.getEmailAddressColNum() - 1;
        const emails: string[] = rangeValues
            .filter((row) => Utils.isMissionaryEmail(row[emailAddressColNum]))
            .map((row) => row[emailAddressColNum].toString().toLowerCase());
        const admins: string[] = Vars.getAdminRange().getValues()
            .map((row) => row[0].toString().toLowerCase())
            .filter(e => Utils.isMissionaryEmail(e));

        updatePermissionsToMissionDatabase(emails, false);
        updatePermissionsToMissionDatabase(admins, true);
        updateAccessFromRange(rangeValues, admins);
        sheetLogger.Log(`Finished updating permissions! Yay!`);
    }

    export function updateAdminPermissions(): void {
        sheetLogger.Log("Updating admin permissions...");
        const admins: string[] = Vars.getAdminRange().getValues()
            .map((row) => row[0].toString().toLowerCase())
            .filter(e => Utils.isMissionaryEmail(e));

        updatePermissionsToMissionDatabase(admins, true);
        updateAccessFromRange([[]], admins);
        sheetLogger.Log("Finished updating admin permissions! Yay!");
    }

    function updatePermissionsToMissionDatabase(emails: string[], admin: boolean): void {
        try {
            const effectiveUserEmail = Session.getEffectiveUser().getEmail();

            const missionDrive = DriveApp.getFolderById(Vars.getMissionDatabaseID());
            const currentEmails = (admin ? missionDrive.getEditors() : missionDrive.getViewers())
                .map((user) => user.getEmail().toLowerCase());

            for (let i = 0; i < currentEmails.length; i++) {
                if (emails.includes(currentEmails[i])) {
                    const index = emails.indexOf(currentEmails[i]);
                    emails.splice(index, 1);
                    sheetLogger.Log(
                        `${
                        currentEmails[i]
                        } is already an ${admin ? "editor" : "viewer"} for the ${missionDrive.getName()} folder. Continuing to next email...`
                    );
                    continue;
                }
                sheetLogger.Log(
                    `${
                    currentEmails[i]
                    } is no longer supposed to be an ${admin ? "editor" : "viewer"} for the ${missionDrive.getName()} folder. Revoking access...`
                );
                if (currentEmails[i] == effectiveUserEmail) {
                    sheetLogger.Log(
                        `PSYCH!! ${currentEmails[i]} is the email running this script. It would be very bad if I removed access from myself... Continuing to next email :)`
                    );
                    continue;
                }
                if (admin) {
                    missionDrive.removeEditor(currentEmails[i])
                } else {
                    missionDrive.removeViewer(currentEmails[i]);
                }
            }

            // sheetLogger.Log(`Filtering emails to only give access to emails who have NONE access...`);
            emails = emails.filter(
                (e: string) => missionDrive.getAccess(e) == DriveApp.Permission.NONE
            );

            if (emails.length <= 0) {
                sheetLogger.Log(
                    `No emails to give ${admin ? "editor" : "viewer"} access to. Continuing to next folder.`
                );
                return;
            }

            sheetLogger.Log(
                `Giving the following emails ${admin ? "editor" : "viewer"} access to the ${missionDrive.getName()} folder:\n${emails.join(
                    `\n`
                )}`
            );
            if (admin) {
                missionDrive.addEditors(emails);
            } else {
                missionDrive.addViewers(emails);
            }
        } catch (e) {
            sheetLogger.Log(`ERROR - error occurred while adding ${admin ? "editor" : "viewer"}s to the MLM database. skipping...
      Error Message: ${e.toString()}`);
        }
    }

    function updateAccessFromRange(rangeValues: any[][], admins: string[]): void {
        try {
            const map = getAccessMap(rangeValues);
            const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());

            Utils.forEveryFolder(
                zoneDrives,
                (folder: GoogleAppsScript.Drive.Folder) =>
                    setAccessToFolder(folder, map, admins),
                true
            );
        } catch (e) {
            sheetLogger.Log(`ERROR - error occurred while updating access from range. skipping...
      Error Message: ${e.toString()}`);
        }
    }

    function setAccessToFolder(
        folder: GoogleAppsScript.Drive.Folder,
        map: Map<string, string[]>,
        admins: string[]
    ) {
        try {
            const effectiveUserEmail = Session.getEffectiveUser().getEmail();

            const folderName = folder.getName();
            if (!map.has(folderName)) {
                sheetLogger.Log(
                    `Access map does not have a value for folder named ${folderName}. Giving admin access and continuing...`
                );
                const currentEditors = folder.getEditors().map(user => user.getEmail());
                const adminsToAdd = [];
                admins.forEach(email => {
                    if (!currentEditors.includes(email)) adminsToAdd.push(email);
                })
                if (adminsToAdd.length >= 1) {
                    folder.addEditors(adminsToAdd);
                }
                return;
            }

            const editorAccess = map.get(folderName);
            let emails = editorAccess.map((email: string) => email.toLowerCase());
            emails = Utils.arrayUnique(emails.concat(admins));

            const currentEmails = folder
                .getEditors()
                .map((user: { getEmail: () => string }) =>
                    user.getEmail().toLowerCase()
                );

            for (let i = 0; i < currentEmails.length; i++) {
                if (emails.includes(currentEmails[i])) {
                    const index = emails.indexOf(currentEmails[i]);
                    emails.splice(index, 1);
                    sheetLogger.Log(
                        `${
                        currentEmails[i]
                        } is already an editor for the ${folder.getName()} folder. Continuing to next email...`
                    );
                    continue;
                }
                sheetLogger.Log(
                    `${
                    currentEmails[i]
                    } is no longer supposed to be an editor for the ${folder.getName()} folder. Revoking access...`
                );
                if (currentEmails[i] == effectiveUserEmail) {
                    sheetLogger.Log(
                        `PSYCH!! ${currentEmails[i]} is the email running this script. It would be very bad if I removed access from myself... Continuing to next email :)`
                    );
                    continue;
                }
                folder.removeEditor(currentEmails[i]);
            }

            emails = emails.filter(
                (e: string) =>
                    folder.getAccess(e) == DriveApp.Permission.NONE ||
                    folder.getAccess(e) == DriveApp.Permission.VIEW
            );

            if (emails.length <= 0) {
                sheetLogger.Log(
                    `No emails to give editor access to. Continuing to next folder.`
                );
                return;
            }

            sheetLogger.Log(
                `Giving the following emails access to the ${folder.getName()} folder:\n${emails.join(
                    `\n`
                )}`
            );
            folder.addEditors(emails);
        } catch (e) {
            sheetLogger.Log(`ERROR - error occurred while setting access to folder ${folder.getName()}. skipping...
      Error Message: ${e.toString()}`);
        }
    }

    function getAccessMap(rangeValues: any[][]) {
        try {
            const map: Map<string, string[]> = new Map();
            for (let i = 0; i < rangeValues.length; i++) {
                const email: string = rangeValues[i][
                    Vars.getEmailAddressColNum() - 1
                ].toString();
                const zone =
                    rangeValues[i][Vars.getZoneColNum() - 1] + Vars.getZoneFolderSuffix();
                const district =
                    rangeValues[i][Vars.getDistrictColNum() - 1] +
                    Vars.getDistrictFolderSuffix();
                const area =
                    rangeValues[i][Vars.getAreaColNum() - 1] + Vars.getAreaFolderSuffix();
                const accessLevel: string = rangeValues[i][
                    Vars.getAccessLevelColNum() - 1
                ].toString();

                if (email == ``) {
                    sheetLogger.Log(
                        `No email in row ${i.toFixed(0)}. Continuing to next row...`
                    );
                    continue;
                }
                if (!Utils.isMissionaryEmail(email)) {
                    sheetLogger.Log(
                        `${email} is not a missionary email. Continuing to next row...`
                    );
                    continue;
                }

                if (
                    accessLevel == `ZL` ||
                    accessLevel == `STL` ||
                    accessLevel == `SMS`
                ) {
                    sheetLogger.Log(`Adding ${email} to ${zone} access queue`);
                    getOrCreateFolderKey(map, zone).push(email);
                }

                if (accessLevel == `DL`) {
                    sheetLogger.Log(`Adding ${email} to ${district} access queue`);
                    getOrCreateFolderKey(map, district).push(email);
                }

                sheetLogger.Log(`Adding ${email} to ${area} access queue`);
                getOrCreateFolderKey(map, area).push(email);
            }
            return map;
        } catch (e) {
            sheetLogger.Log(`ERROR - error occurred while creating access map. skipping...
      Error Message: ${e.toString()}`);
            return null;
        }
    }

    function getOrCreateFolderKey(
        map: Map<string, string[]>,
        folderName: string
    ): string[] {
        try {
            if (map.has(folderName)) return map.get(folderName);

            sheetLogger.Log(`Creating key for ${folderName}`);
            return map.set(folderName, []).get(folderName);
        } catch (e) {
            sheetLogger.Log(`ERROR - error occurred while getting or creating folder key for ${folderName}. skipping...
      Error Message: ${e.toString()}`);
            return [];
        }
    }
}
