function GET_NEXT_TRANSFER_DATE() {
  const nextDate = Triggers.getNextTransferDate(new Date());
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
    // .addItem("Scan")
    .addSeparator()
    .addItem("Archive Content", "flushContent")
    .addItem("Update Folder Access", "updateFolderPermissions")
    .addSeparator()
    .addItem("Run Test", "test")
    .addToUi();
}

function scanAllFolders(){
  SheetLogger.SheetLogger.Log("Scanning All Folders...");
  scanAreaFolders();
  scanDistrictFolders();
  scanZoneFolders();
  SheetLogger.SheetLogger.Log("Done Scanning All Folders!");
}

function scanAreaFolders(){
  SheetLogger.SheetLogger.Log("Scanning Area Folders...");
  const range = Variables.getCompleteAreaRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getAreaFolderSuffix());
  SheetLogger.SheetLogger.Log("Done Scanning Area Folders!");
}

function scanDistrictFolders(){
  SheetLogger.SheetLogger.Log("Scanning District Folders...");
  const range = Variables.getCompleteDistrictRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getDistrictFolderSuffix());
  SheetLogger.SheetLogger.Log("Done Scanning District Folders!");
}

function scanZoneFolders(){
  SheetLogger.SheetLogger.Log("Scanning Zone Folders...");
  const range = Variables.getZoneRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getZoneFolderSuffix());
  SheetLogger.SheetLogger.Log("Done Scanning Zone Folders!");
}

function test() {
  PDFSender.createAndSendPDFsForZoneOrDistrict("Lansing", true);
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
    `You are about to add and remove viewers and editors for the zone drives based on the Permissions sheet. Do you want to continue?`,
    ui.ButtonSet.YES_NO
  );

  if (result != ui.Button.YES) return;

  SheetLogger.SheetLogger.Log("Updating Access...");
  Permissions.updatePermissions();
  SheetLogger.SheetLogger.Log("Done Updating Access!");
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
