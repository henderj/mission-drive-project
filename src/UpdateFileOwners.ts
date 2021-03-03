import { Variables } from "./common/Variables";
import { M_Utils } from "./common/Utils";
import { SheetLogger } from "./common/SheetLogger";

export { UpdateFileOwners };

namespace UpdateFileOwners {
  const Vars = Variables;
  const Utils = M_Utils;
  const sheetLogger = SheetLogger.SheetLogger;

  export function updateOwners(): void {
    const folderNames = [
      Vars.getQuickFolderName(),
      Vars.getQualityFolderName(),
    ];

    sheetLogger.Log(`searching folders...`);
    Utils.forEveryFolder(
      DriveApp.getFolderById(Vars.getZoneDrivesID()),
      (folder) => {
        const name = folder.getName();
        sheetLogger.Log(`searching folder: ${name}...`);
        if (!folderNames.includes(name)) return;
        forEachFile(folder, (file) => changeOwnershipToAreaEmail(file, folder));
      },
      true
    );
  }

  function forEachFile(
    folder: GoogleAppsScript.Drive.Folder,
    func: (file: GoogleAppsScript.Drive.File) => any
  ): void {
    const fileIterator = folder.getFiles();
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      sheetLogger.Log(`found file: ${file.getName()}`);
      func(file);
    }
  }

  function changeOwnershipToAreaEmail(
    file: GoogleAppsScript.Drive.File,
    parentFolder: GoogleAppsScript.Drive.Folder
  ) {
    const areaEmail = parentFolder.getParents().next().getOwner();
    if (file.getOwner().getEmail() == areaEmail.getEmail()) {
      sheetLogger.Log(
        `file ${file.getName()} is already owned by area email. skipping...`
      );
      return;
    }
    sheetLogger.Log(
      `setting owner of ${file.getName()} to area email: ${areaEmail.getName()}`
    );
    file.setOwner(areaEmail);
  }
}
