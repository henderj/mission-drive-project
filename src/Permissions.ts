import { M_Utils } from "./common/Utils";

namespace Permissions {
  const Vars = Variables;
  const Utils = M_Utils;

  export function updatePermissions(): void {
    Logger.log("Updating permissions...");
    const rangeValues = Vars.getPermissionsRange().getValues();
    const emailAddressColNum = Vars.getEmailAddressColNum() - 1;
    const emails: string[] = rangeValues
      .filter((row) => Utils.isMissionaryEmail(row[emailAddressColNum]))
      .map((row) => row[emailAddressColNum].toString().toLowerCase());

    updatePermissionsToMissionDatabase(emails);
    updateAccessFromRange(rangeValues);
    Logger.log("Finished updating permissions! Yay!");
  }

  function updatePermissionsToMissionDatabase(emails: string[]): void {
    const effectiveUserEmail = Session.getEffectiveUser().getEmail();

    const missionDrive = DriveApp.getFolderById(Vars.getMissionDatabaseID());
    const currentEmails = missionDrive
      .getViewers()
      .map((user) => user.getEmail().toLowerCase());

    for (let i = 0; i < currentEmails.length; i++) {
      if (emails.includes(currentEmails[i])) {
        const index = emails.indexOf(currentEmails[i]);
        emails.splice(index, 1);
        Logger.log(
          "%s is already an viewer for the %s folder. Continuing to next email...",
          currentEmails[i],
          missionDrive.getName()
        );
        continue;
      }
      Logger.log(
        "%s is no longer supposed to be an viewer for the %s folder. Revoking access...",
        currentEmails[i],
        missionDrive.getName()
      );
      if (currentEmails[i] == effectiveUserEmail) {
        Logger.log(
          "PSYCH!! %s is the email running this script. It would be very bad if I removed access from myself... Continuing to next email :)",
          currentEmails[i]
        );
        continue;
      }
      missionDrive.removeViewer(currentEmails[i]);
    }

    // Logger.log("Filtering emails to only give access to emails who have NONE access...");
    emails = emails.filter(
      (e: string) => missionDrive.getAccess(e) == DriveApp.Permission.NONE
    );

    if (emails.length <= 0) {
      Logger.log(
        "No emails to give viewer access to. Continuing to next folder."
      );
      return;
    }

    Logger.log(
      "Giving the following emails access to the %s folder:\n%s",
      missionDrive.getName(),
      emails.join("\n")
    );
    missionDrive.addViewers(emails);
  }

  function updateAccessFromRange(rangeValues: any[][]): void {
    const map = getAccessMap(rangeValues);
    const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());

    Utils.forEveryFolder(
      zoneDrives,
      (folder: GoogleAppsScript.Drive.Folder) => setAccessToFolder(folder, map),
      true
    );
  }

  function setAccessToFolder(
    folder: GoogleAppsScript.Drive.Folder,
    map: Map<string, string[]>
  ) {
    const effectiveUserEmail = Session.getEffectiveUser().getEmail();

    const folderName = folder.getName();
    if (!map.has(folderName)) {
      Logger.log(
        "Access map does not have a value for folder named %s. Continuing...",
        folderName
      );
      return;
    }

    const editorAccess = map.get(folderName);
    let emails = editorAccess.map((email: string) => email.toLowerCase());

    const currentEmails = folder
      .getEditors()
      .map((user: { getEmail: () => string }) => user.getEmail().toLowerCase());

    for (let i = 0; i < currentEmails.length; i++) {
      if (emails.includes(currentEmails[i])) {
        const index = emails.indexOf(currentEmails[i]);
        emails.splice(index, 1);
        Logger.log(
          "%s is already an editor for the %s folder. Continuing to next email...",
          currentEmails[i],
          folder.getName()
        );
        continue;
      }
      Logger.log(
        "%s is no longer supposed to be an editor for the %s folder. Revoking access...",
        currentEmails[i],
        folder.getName()
      );
      if (currentEmails[i] == effectiveUserEmail) {
        Logger.log(
          "PSYCH!! %s is the email running this script. It would be very bad if I removed access from myself... Continuing to next email :)",
          currentEmails[i]
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
      Logger.log(
        "No emails to give editor access to. Continuing to next folder."
      );
      return;
    }

    Logger.log(
      "Giving the following emails access to the %s folder:\n%s",
      folder.getName(),
      emails.join("\n")
    );
    folder.addEditors(emails);
  }

  function getAccessMap(rangeValues: any[][]) {
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

      if (email == "") {
        Logger.log(
          "No email in row %s. Continuing to next row...",
          i.toFixed(0)
        );
        continue;
      }
      if (!Utils.isMissionaryEmail(email)) {
        Logger.log(
          "%s is not a missionary email. Continuing to next row...",
          email
        );
        continue;
      }

      if (accessLevel == "ZL" || accessLevel == "STL" || accessLevel == "SMS") {
        Logger.log("Adding %s to %s access queue", email, zone);
        getOrCreateFolderKey(map, zone).push(email);
      }

      if (accessLevel == "DL") {
        Logger.log("Adding %s to %s access queue", email, district);
        getOrCreateFolderKey(map, district).push(email);
      }

      Logger.log("Adding %s to %s access queue", email, area);
      getOrCreateFolderKey(map, area).push(email);
    }
    return map;
  }

  function getOrCreateFolderKey(
    map: Map<string, string[]>,
    folderName: string
  ): string[] {
    if (map.has(folderName)) return map.get(folderName);

    Logger.log("Creating key for %s", folderName);
    return map.set(folderName, []).get(folderName);
  }
}