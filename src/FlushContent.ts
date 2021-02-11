import { M_Utils } from "./common/Utils";
import { Variables } from "./common/Variables";
import { SheetLogger } from "./common/SheetLogger";

export { FlushContent };

namespace FlushContent {
  const Vars = Variables;
  const Utils = M_Utils;
  const sheetLogger = SheetLogger.SheetLogger;

  export function renameAllContentFolders(): void {
    const func = (folder: GoogleAppsScript.Drive.Folder) => {
      const name = folder.getName();
      if(!name.includes("Folder")) return;

      const newName = name.substring(0, name.indexOf("Folder")).trim();

      sheetLogger.Log(`removing " Folder" from ${name}. New name: ${newName}.`);
      folder.setName(newName);      
    };

    const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());
    Utils.forEveryContentFolder(
      zoneDrives,
      func,
      Vars.getContentFolderSuffixes()
    );
  }

  export function archiveContentFolders(): void {
    sheetLogger.Log("Getting Zone drives folder...");
    const zoneDrives = DriveApp.getFolderById(Vars.getZoneDrivesID());
    sheetLogger.Log("Found Zone drives folder!");

    sheetLogger.Log("Searching through zone drives folder...");
    Utils.forEveryContentFolder(
      zoneDrives,
      archiveContentFoldersIfAreaFolder,
      Vars.getContentFolderSuffixes()
    );
  }

  function archiveContentFoldersIfAreaFolder(
    folder: GoogleAppsScript.Drive.Folder
  ): void {
    sheetLogger.Log(`Searching through ${folder.getName()}...`);
    const name = folder.getName();
    if (name.toLowerCase().includes(Vars.getAreaFolderSuffix().toLowerCase())) {
      sheetLogger.Log(
        `Found Area Folder! (${name}) Archiving and/or creating content folders...`
      );
      const qualityFolder = Utils.getFolder(
        folder,
        Vars.getQualityFolderName()
      );
      const quickFolder = Utils.getFolder(folder, Vars.getQuickFolderName());
      const prefix = Utils.getFolderPrefix(name, Vars.getContentFolderSuffixes());
      const zoneFolder = Utils.findParentZoneFolder(
        folder,
        Vars.getZoneFolderSuffix()
      );

      if (zoneFolder == null) {
        sheetLogger.Log(
          `Error! Could not find a zone folder for ${name}. Returning...`
        );
        return;
      }

      if (qualityFolder != null)
        archiveFolder(qualityFolder, zoneFolder, prefix);
      if (quickFolder != null) archiveFolder(quickFolder, zoneFolder, prefix);

      sheetLogger.Log(
        `Creating new Quality and Quick content folders in ${name}...`
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
    sheetLogger.Log(`Archiving folder ${folderToArchive}.`);
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
