function GET_NEXT_TRANSFER_DATE() {
  const nextDate = M_Utils.getNextTransferDate(new Date());
  return nextDate;
}

// function GET_DISTRICT(area) {
//   return DataCompletion.getDistrict(area.toString());
// }

// function GET_ZONE(district) {
//   return DataCompletion.getZone(district.toString());
// }

// function WITHOUT_NUMBERS(str){
//   return DataCompletion.getWithoutNumbers(str);
// }

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Mission Drive Bot")
    .addSubMenu(
      ui
        .createMenu("Scan Folders")
        .addItem("Scan All Folders", "scanAllFolders")
        .addSeparator()
        .addItem("Scan Area Folders", "scanAreaFolders")
        .addItem("Scan District Folders", "scanDistrictFolders")
        .addItem("Scan Zone Folders", "scanZoneFolders")
    )
    .addSubMenu(
      ui
        .createMenu("Fill in Area Data")
        .addItem("Fill in for all areas", "updateDataCompletionAll")
        .addItem(
          "Fill in for current selection",
          "updateDataCompletionSelection"
        )
    )
    // .addItem("Scan")
    .addSeparator()
    .addItem("Archive Content", "flushContent")
    .addSubMenu(
        ui.createMenu("Update Folder Access")
        .addItem("For all users", "updateFolderPermissions")
        .addItem("For admins", "updateFolderPermissionsAdmins")
    )
    // .addItem("Update Folder Access", "updateFolderPermissions")
    // .addItem("Update Content File Owners", "updateFileOwner")
    // .addSeparator()
    // .addItem("Run Test", "test")
    .addToUi();
}

function updateDataCompletionAll() {
  DataCompletion.updateDataCompletionForAll();
}

function updateDataCompletionSelection() {
  DataCompletion.updateDataCompletionForSelection();
}

function updateFileOwner() {
  SheetLogger.SheetLogger.Log("Updating file owners...");
  UpdateFileOwners.updateOwners();
  SheetLogger.SheetLogger.Log("Done updating file owners!");
}

function scanAllFolders() {
  SheetLogger.SheetLogger.Log("Scanning All Folders...");
  scanAreaFolders();
  scanDistrictFolders();
  scanZoneFolders();
  SheetLogger.SheetLogger.Log("Done Scanning All Folders!");
}

function scanAreaFolders() {
  SheetLogger.SheetLogger.Log("Scanning Area Folders...");
  const range = Variables.getCompleteAreaRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getAreaFolderSuffix());
  SheetLogger.SheetLogger.Log("Done Scanning Area Folders!");
}

function scanDistrictFolders() {
  SheetLogger.SheetLogger.Log("Scanning District Folders...");
  const range = Variables.getCompleteDistrictRange();
  ColorCoding.updateColorCodingForRange(
    range,
    Variables.getDistrictFolderSuffix()
  );
  SheetLogger.SheetLogger.Log("Done Scanning District Folders!");
}

function scanZoneFolders() {
  SheetLogger.SheetLogger.Log("Scanning Zone Folders...");
  const range = Variables.getZoneRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getZoneFolderSuffix());
  SheetLogger.SheetLogger.Log("Done Scanning Zone Folders!");
}

function test() {
  Permissions.test();
}

function flushContent() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Continue?",
    `You are about to archive all Social Media content! Are you sure you want to continue? 
    
    (Content will not be deleted, but it will be archived.)`,
    ui.ButtonSet.YES_NO
  );

  if (result != ui.Button.YES) return;

  SheetLogger.SheetLogger.Log("Archiving Content...");
  FlushContent.archiveContentFolders();
  SheetLogger.SheetLogger.Log("Done Archiving Content!");
}

function updateFolderPermissions() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Continue?",
    `You are about to add and remove viewers and editors for the zone drives based on the Access sheet. Do you want to continue?`,
    ui.ButtonSet.YES_NO
  );

  if (result != ui.Button.YES) return;

  SheetLogger.SheetLogger.Log("Updating Access...");
  Permissions.updatePermissions();
  SheetLogger.SheetLogger.Log("Done Updating Access!");
}

function updateFolderPermissionsAdmins() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Continue?",
    `You are about to add editors for the zone drives based on the Admins sheet. Do you want to continue?`,
    ui.ButtonSet.YES_NO
  );

  if (result != ui.Button.YES) return;

  SheetLogger.SheetLogger.Log("Updating Admin Access...");
  Permissions.updateAdminPermissions();
  SheetLogger.SheetLogger.Log("Done Updating Admin Access!");
}

function setUpFlushContentTrigger() {
  const date = Variables.getInterfaceSpreadsheet()
    .getSheets()[0]
    .getRange(1, 1)
    .getValue()
    .getTime();
  const dateObject = new Date(date);
  FlushContent.setUpTrigger(dateObject);
  // set trigger on date and then have that trigger set up a reoccuring trigger for every six weeks.
}

function setUpOnEditTrigger() {
  ScriptApp.newTrigger("onSpreadsheetEdit")
    .forSpreadsheet(Variables.getInterfaceSpreadsheet())
    .onEdit()
    .create();
}

function onSpreadsheetEdit(e) {
  // Logger.log("edited!")
  if (e.range.getGridId() == Variables.getPermissionsID()) {
    Logger.log("Updating data completion for %s ...", e.range.getA1Notation());
    DataCompletion.updateDataCompletion(e);
    Logger.log(
      "Finished upated data completion for %s.",
      e.range.getA1Notation()
    );
  }
}
