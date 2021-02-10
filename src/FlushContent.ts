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
    Utils.forEveryContentFolder(zoneDrives, archiveContentFoldersIfAreaFolder, Vars.getContentFolderSuffixes());
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
      const prefix = Utils.getFolderPrefix(name);
      const zoneFolder = Utils.findParentZoneFolder(
        folder,
        Vars.getZoneFolderSuffix()
      );

      if (zoneFolder == null) {
        Logger.log(
          `Error! Could not find a zone folder for ${name}. Returning...`
        );
        return;
      }

      if (qualityFolder != null)
        archiveFolder(qualityFolder, zoneFolder, prefix);
      if (quickFolder != null) archiveFolder(quickFolder, zoneFolder, prefix);

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
    zoneFolder: GoogleAppsScript.Drive.Folder,
    areaName: string
  ): void {
    Logger.log("Archiving folder %s.", folderToArchive);
    const archiveFolder = Utils.getFolder(
      zoneFolder,
      Vars.getArchiveFolderName(zoneFolder),
      true
    );

    const currentDateFolder = Utils.getFolder(
      archiveFolder,
      Utils.getTodayDateFormatted(),
      true
    );

    const areaArchiveFolder = Utils.getFolder(
      currentDateFolder,
      areaName + " Area",
      true
    );
    // folderToArchive.moveTo(currentDateFolder);
    (folderToArchive as any).moveTo(areaArchiveFolder);
  }
}
