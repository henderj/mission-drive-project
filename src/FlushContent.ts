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
      if (!name.includes("Folder")) return;

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

  export function createAllArchiveFolders(): void {
    const func = (folder: GoogleAppsScript.Drive.Folder) => {
      const name = folder.getName();
      if (!isAreaFolder(name)) return;
      sheetLogger.Log(`creating archive folder for ${name}...`);
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
      getOrCreateArchiveFolder(zoneFolder, name);
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
    if (isAreaFolder(name)) {
      sheetLogger.Log(
        `Found Area Folder! (${name}) Archiving and/or creating content folders...`
      );
      const quailtyFolderName = Vars.getQualityFolderName();
      const quickFolderName = Vars.getQuickFolderName();

      const qualityFolder = Utils.getFolder(folder, quailtyFolderName);
      const quickFolder = Utils.getFolder(folder, quickFolderName);

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

      if (qualityFolder != null) archiveFolder(qualityFolder, zoneFolder, quailtyFolderName);
      if (quickFolder != null) archiveFolder(quickFolder, zoneFolder, quickFolderName);

      // sheetLogger.Log(
      //   `Creating new Quality and Quick content folders in ${name}...`
      // );
      // folder.createFolder(Vars.getQualityFolderName());
      // folder.createFolder(Vars.getQuickFolderName());
    }
  }

  function isAreaFolder(name: string) {
    return name
      .toLowerCase()
      .includes(Vars.getAreaFolderSuffix().toLowerCase());
  }

  function archiveFolder(
    folderToArchive: GoogleAppsScript.Drive.Folder,
    zoneFolder: GoogleAppsScript.Drive.Folder,
    contentTypeName: string
  ): void {
    sheetLogger.Log(`Archiving folder ${folderToArchive}.`);

    const archiveFolder = getOrCreateArchiveFolder(zoneFolder, contentTypeName);

    const fileIterator = folderToArchive.getFiles();
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      // file.moveTo(archiveFolder);
      (file as any).moveTo(archiveFolder);
    }

    // folderToArchive.setTrashed(true);

    // folderToArchive.moveTo(currentDateFolder);
    // (folderToArchive as any).moveTo(archiveFolder);
  }

  function getOrCreateArchiveFolder(
    zoneFolder: GoogleAppsScript.Drive.Folder,
    contentTypeName: string
  ): GoogleAppsScript.Drive.Folder {
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

    const contentTypeFolder = Utils.getFolder(
      currentDateFolder,
      contentTypeName,
      true
    );

    return contentTypeFolder;
  }
}
