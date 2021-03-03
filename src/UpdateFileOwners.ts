import { Variables } from "./common/Variables";
import { M_Utils } from "./common/Utils";
import { SheetLogger } from "./common/SheetLogger";

export { UpdateFileOwners };

namespace UpdateFileOwners {
  const Vars = Variables;
  const Utils = M_Utils;
  const sheetLogger = SheetLogger.SheetLogger;

  export function updateOwners(): void {
    const folderSuffixes = [
      Vars.getQuickFolderName(),
      Vars.getQualityFolderName(),
    ];

    Utils.forEveryContentFolder(
      DriveApp.getFolderById(Vars.getZoneDrivesID()),
      (folder) => {
        forEachFile(folder, (file) => changeOwnershipToAreaEmail(file, folder));
      },
      folderSuffixes
    );
  }

  function forEachFile(
    folder: GoogleAppsScript.Drive.Folder,
    func: (file: GoogleAppsScript.Drive.File) => any
  ): void {
    const fileIterator = folder.getFiles();
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      func(file);
    }
  }

  function changeOwnershipToAreaEmail(
    file: GoogleAppsScript.Drive.File,
    parentFolder: GoogleAppsScript.Drive.Folder
  ) {
    const areaEmail = parentFolder.getParents().next().getOwner();
    sheetLogger.Log(
      `setting owner of ${file.getName()} to area email: ${areaEmail.getName()}`
    );
    file.setOwner(areaEmail);
  }
}
