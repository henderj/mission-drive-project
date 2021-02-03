namespace mission.FlushContent {
  const Vars = mission.global.Variables;
  const Utils = mission.global.Utilities;

  export function setUpTrigger(startingDate) {
    startingDate.setHours(2);
    ScriptApp.newTrigger("setUpRecurringTrigger")
      .timeBased()
      .at(startingDate)
      .create();
  }

  function setUpRecurringTrigger() {
    ScriptApp.newTrigger("archiveContentFolders")
      .timeBased()
      .everyWeeks(6)
      // .everyDays(3) <- for testing recurring trigger
      .create();
  }

  export function archiveContentFolders() {
    Logger.log("Getting Zone drives folder...");
    const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());
    Logger.log("Found Zone drives folder!");

    Logger.log("Searching through zone drives folder...");
    Utils.forEveryFolder(zoneDrives, archiveContentFoldersIfAreaFolder, true);
  }

  function archiveContentFoldersIfAreaFolder(folder) {
    Logger.log("Searching through %s...", folder.getName());
    const name = folder.getName();
    if (name.toLowerCase().includes(Vars.getAreaFolderSuffix().toLowerCase())) {
      Logger.log(
        "Found Area Folder! (%s) Archiving and/or creating content folders...",
        name
      );
      const qualityFolder = Utils.getFolder(folder, Vars.getQualityFolderName());
      const quickFolder = Utils.getFolder(folder, Vars.getQuickFolderName());
      if (qualityFolder != null) archiveFolder(qualityFolder, folder);
      if (quickFolder != null) archiveFolder(quickFolder, folder);

      Logger.log(
        "Creating new Quality and Quick content folders in %s...",
        name
      );
      folder.createFolder(Vars.getQualityFolderName());
      folder.createFolder(Vars.getQuickFolderName());
    }
  }

  function archiveFolder(folderToArchive, areaFolder) {
    Logger.log("Archiving folder %s.", folderToArchive);
    const archiveFolder = Utils.getFolder(
      areaFolder,
      Utils.getArchiveFolderName(areaFolder),
      true
    );

    const currentDateFolder = Utils.getFolder(
      archiveFolder,
      Utils.getTodayDateFormatted(),
      true
    );
    folderToArchive.moveTo(currentDateFolder);
  }
}
