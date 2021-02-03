namespace mission.Permissions {
  const Vars = mission.global.Variables;
  const Utils = mission.global.Utilities;

  export function updatePermissions() {
    Logger.log("Updating permissions...");
    const range = Vars.getPermissionsRange().getValues();
    const emailAddressColNum = Vars.getEmailAddressColNum() - 1;
    const emails = range
      .filter((row) => Utils.isMissionaryEmail(row[emailAddressColNum]))
      .map((row) => row[emailAddressColNum].toString().toLowerCase());

    updatePermissionsToMissionDatabase(emails);
    updateAccessFromRange(range);
    Logger.log("Finished updating permissions! Yay!");
  }

  function updatePermissionsToMissionDatabase(emails) {
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
      (e) => missionDrive.getAccess(e) == DriveApp.Permission.NONE
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

  function updateAccessFromRange(range) {
    const map = getAccessMap(range);
    const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());

    Utils.forEveryFolder(
      zoneDrives,
      (folder) => setAccessToFolder(folder, map),
      true
    );
  }

  function setAccessToFolder(folder, map) {
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
    let emails = editorAccess.map((email) => email.toLowerCase());

    const currentEmails = folder
      .getEditors()
      .map((user) => user.getEmail().toLowerCase());

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
      (e) =>
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

  function getAccessMap(range) {
    const map = new Map();
    for (let i = 0; i < range.length; i++) {
      const email = range[i][Vars.getEmailAddressColNum() - 1];
      const zone = range[i][Vars.getZoneColNum() - 1] + Vars.getZoneFolderSuffix();
      const district =
        range[i][Vars.getDistrictColNum() - 1] + Vars.getDistrictFolderSuffix();
      const area = range[i][Vars.getAreaColNum() - 1] + Vars.getAreaFolderSuffix();
      const accessLevel = range[i][Vars.getAccessLevelColNum() - 1];

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

  function getOrCreateFolderKey(map, folderName) {
    if (map.has(folderName)) return map.get(folderName);

    Logger.log("Creating key for %s", folderName);
    return map.set(folderName, []).get(folderName);
  }
}
