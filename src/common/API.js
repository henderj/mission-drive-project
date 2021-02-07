function GET_NEXT_TRANSFER_DATE() {
  const nextDate = Triggers.getNextTransferDate(new Date());
  return nextDate;
}

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
    .addItem("Run Test", "test")
    .addToUi();
}

function scanAllFolders(){
  scanAreaFolders();
  scanDistrictFolders();
  scanZoneFolders();
}

function scanAreaFolders(){
  const range = Variables.getCompleteAreaRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getAreaFolderSuffix());
}

function scanDistrictFolders(){
  const range = Variables.getCompleteDistrictRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getDistrictFolderSuffix());
}

function scanZoneFolders(){
  const range = Variables.getZoneRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getZoneFolderSuffix());
}


function test() {
  const range = SpreadsheetApp.getSelection().getActiveRange();
  ColorCoding.updateColorCodingForRange(range, Variables.getAreaFolderSuffix());
}

function flushContent() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Continue?",
    `You are about to completely flush out the Social Media content! Are you sure you want to continue? 
    
    (Content will not be deleted, but it will be archived.)`,
    ui.ButtonSet.YES_NO
  );

  if (result != ui.Button.YES) return;

  FlushContent.archiveContentFolders();
}

function updateFolderPermissions() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "Continue?",
    `You are about to add and remove viewers and editors for the zone drives based on the Permissions sheet. Do you want to continue?`,
    ui.ButtonSet.YES_NO
  );

  if (result != ui.Button.YES) return;

  Permissions.updatePermissions();
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
    Logger.log("Updating data validation for %s ...", e.range.getA1Notation());
    DataValidation.updateDataValidation(e);
    Logger.log(
      "Finished upated data validation for %s.",
      e.range.getA1Notation()
    );
  }
}
