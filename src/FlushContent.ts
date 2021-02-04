import { M_Utils } from "./common/Utils";
import { Variables } from "./common/Variables";

export { FlushContent };

namespace FlushContent {
  const Vars = Variables;
  const Utils = M_Utils;

  export function archiveContentFolders(): void {
    Logger.log("Getting Zone drives folder...");
    const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());
    Logger.log("Found Zone drives folder!");

    Logger.log("Searching through zone drives folder...");
    Utils.forEveryFolder(zoneDrives, archiveContentFoldersIfAreaFolder, true);
  }

  function archiveContentFoldersIfAreaFolder(
    folder: GoogleAppsScript.Drive.Folder
  ): void {
    Logger.log("Searching through %s...", folder.getName());
    const name = folder.getName();
    if (name.toLowerCase().includes(Vars.getAreaFolderSuffix().toLowerCase())) {
      Logger.log(
        "Found Area Folder! (%s) Archiving and/or creating content folders...",
        name
      );
      const qualityFolder = Utils.getFolder(
        folder,
        Vars.getQualityFolderName()
      );
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

  function archiveFolder(
    folderToArchive: GoogleAppsScript.Drive.Folder,
    areaFolder: GoogleAppsScript.Drive.Folder
  ): void {
    Logger.log("Archiving folder %s.", folderToArchive);
    const archiveFolder = Utils.getFolder(
      areaFolder,
      Vars.getArchiveFolderName(areaFolder),
      true
    );

    const currentDateFolder = Utils.getFolder(
      archiveFolder,
      Utils.getTodayDateFormatted(),
      true
    );
    // folderToArchive.moveTo(currentDateFolder);
    (folderToArchive as any).moveTo(currentDateFolder);
  }
}
