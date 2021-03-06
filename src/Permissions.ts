import { M_Utils } from "./common/Utils";
import { Variables } from "./common/Variables";
import { SheetLogger } from "./common/SheetLogger";

export { Permissions };

namespace Permissions {
    const Vars = Variables;
    const Utils = M_Utils;
    const sheetLogger = SheetLogger.SheetLogger;

    function getAdmins(): string[] {
        const admins: string[] = Vars.getAdminRange().getValues()
            .map((row) => row[0].toString().toLowerCase())
            .filter(e => Utils.isMissionaryEmail(e));
        return admins;
    }

    function getEmails(): string[] {
        const rangeValues = Vars.getPermissionsRange().getValues();
        const emailAddressColNum = Vars.getEmailAddressColNum() - 1;
        const emails: string[] = rangeValues
            .filter((row) => Utils.isMissionaryEmail(row[emailAddressColNum]))
            .map((row) => row[emailAddressColNum].toString().toLowerCase());
        return emails;
    }

    export function updatePermissions(): void {
        sheetLogger.Log(`Updating permissions...`);
        const rangeValues = Vars.getPermissionsRange().getValues();
        const emails: string[] = getEmails();
        const admins: string[] = getAdmins();

        updatePermissionsToMissionDatabase(emails, false);
        updatePermissionsToMissionDatabase(admins, true);
        updateAccessFromRange(rangeValues, admins);
        sheetLogger.Log(`Finished updating permissions! Yay!`);
    }

    export function updateAdminPermissions(): void {
        sheetLogger.Log("Updating admin permissions...");
        const admins: string[] = getAdmins();

        updatePermissionsToMissionDatabase(admins, true);
        updateAccessFromRange([], admins);
        sheetLogger.Log("Finished updating admin permissions! Yay!");
    }

    export function test() {

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
            if (map == null) {
                sheetLogger.Log(`There was an error while generating the access map. terminating...`);
                return;
            }
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
                if (!Utils.isContentFolder(folderName, Vars.getContentFolderSuffixes())) {
                    sheetLogger.Log(`${folderName} is not a content folder. Skipping...`);
                    return;
                }
                sheetLogger.Log(
                    `Access map does not have a value for folder named ${folderName}. Giving admin access and continuing...`
                );
                const currentEditors = folder.getEditors().map(user => user.getEmail());
                const adminsToAdd = [];
                admins.forEach(email => {
                    if (!currentEditors.includes(email)) adminsToAdd.push(email);
                });

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
                .map((user) =>
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
                const folderViewers = folder.getViewers().map(u => u.getEmail().toLowerCase());
                if (!folderViewers.includes(currentEmails[i])) {
                    sheetLogger.Log(`${currentEmails[i]} was accidentally removed from the viewers list for ${folder.getName()}. Re-adding as viewer...`);
                    folder.addViewer(currentEmails[i]);
                }

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
                    `; `
                )}`
            );
            folder.addEditors(emails);
        } catch (e) {
            sheetLogger.Log(`ERROR - error occurred while setting access to folder ${folder.getName()}. skipping...
      Error Message: ${e.toString()}`);
        }
    }

    function getAccessMap(rangeValues: any[][]) {
        const map: Map<string, string[]> = new Map();
        try {
            for (let i = 0; i < rangeValues.length; i++) {
                const email: string = rangeValues[i][
                    Vars.getEmailAddressColNum() - 1
                ].toString();
                const zone = rangeValues[i][Vars.getZoneColNum() - 1];
                const zoneFolderName = zone + Vars.getZoneFolderSuffix();
                const district = rangeValues[i][Vars.getDistrictColNum() - 1];
                const districtFolderName = district + Vars.getDistrictFolderSuffix();
                const area = rangeValues[i][Vars.getAreaWithoutNumCol() - 1];
                const areaFolderName = area + Vars.getAreaFolderSuffix();
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
                    sheetLogger.Log(`Giving ${email} zone level access...`);
                    sheetLogger.Log(`Adding ${email} to ${zoneFolderName} access queue`);
                    getOrCreateFolderKey(map, zoneFolderName).push(email);

                    sheetLogger.Log(`Finding districts for ${zone} zone...`);
                    let districts = Vars.getDistrictRange(zone)
                        .getValues()
                        .flat()
                        .filter(d => d != null && d != "");
                    sheetLogger.Log(`found districts: ${districts.join("; ")}`);
                    sheetLogger.Log(`finding areas in ${zone} zone...`)
                    let areas = districts.flatMap(d => Vars.getAreaRange(d)
                        .getValues()
                        .flat()
                        .filter(a => a != null && a != ""));
                    sheetLogger.Log(`found areas: ${areas.join(";")}`);

                    districts = districts.map(d => d + Vars.getDistrictFolderSuffix());
                    districts.forEach(d => {
                        sheetLogger.Log(`Adding ${email} to ${d} access queue`);
                        getOrCreateFolderKey(map, d).push(email);
                    })

                    areas = areas.map(a => a + Vars.getAreaFolderSuffix())
                    areas.forEach(a => {
                        sheetLogger.Log(`Adding ${email} to ${a} access queue`);
                        getOrCreateFolderKey(map, a).push(email);
                    })
                }

                if (accessLevel == `DL`) {
                    sheetLogger.Log(`Giving ${email} district level access...`)
                    sheetLogger.Log(`Adding ${email} to ${districtFolderName} access queue`);
                    getOrCreateFolderKey(map, districtFolderName).push(email);


                    const areas = Vars.getAreaRange(district)
                        .getValues()
                        .flat()
                        .filter(a => a != null && a != "")
                        .map(a => a + Vars.getAreaFolderSuffix());

                    areas.forEach(a => {
                        sheetLogger.Log(`Adding ${email} to ${a} access queue`);
                        getOrCreateFolderKey(map, a).push(email);
                    })
                }

                sheetLogger.Log(`Adding ${email} to ${areaFolderName} access queue`);
                getOrCreateFolderKey(map, areaFolderName).push(email);
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
