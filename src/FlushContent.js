function setUpTrigger(startingDate) {
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

function archiveContentFolders() {
  Logger.log("Getting Zone drives folder...");
  const zoneDrives = DriveApp.getFolderById(getZoneDrivesID());
  Logger.log("Found Zone drives folder!");

  Logger.log("Searching through zone drives folder...");
  forEveryFolder(zoneDrives, archiveContentFoldersIfAreaFolder, true);
}

function archiveContentFoldersIfAreaFolder(folder) {
  Logger.log("Searching through %s...", folder.getName());
  const name = folder.getName();
  if (name.toLowerCase().includes(getAreaFolderSuffix().toLowerCase())) {
    Logger.log(
      "Found Area Folder! (%s) Archiving and/or creating content folders...",
      name
    );
    const qualityFolder = getFolder(folder, getQualityFolderName());
    const quickFolder = getFolder(folder, getQuickFolderName());
    if (qualityFolder != null) archiveFolder(qualityFolder, folder);
    if (quickFolder != null) archiveFolder(quickFolder, folder);

    Logger.log("Creating new Quality and Quick content folders in %s...", name);
    folder.createFolder(getQualityFolderName());
    folder.createFolder(getQuickFolderName());
  }
}

function archiveFolder(folderToArchive, areaFolder) {
  Logger.log("Archiving folder %s.", folderToArchive);
  const archiveFolder = getFolder(
    areaFolder,
    getArchiveFolderName(areaFolder),
    true
  );

  const currentDateFolder = getFolder(
    archiveFolder,
    getTodayDateFormatted(),
    true
  );
  folderToArchive.moveTo(currentDateFolder);
}
