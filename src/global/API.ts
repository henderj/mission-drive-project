namespace mission.global.API {

  const Vars = mission.global.Variables;

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
  // getInterfaceSpreadsheet;
  function setUpFlushContentTrigger() {
    const date = Vars.getInterfaceSpreadsheet()
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
      .forSpreadsheet(Vars.getInterfaceSpreadsheet())
      .onEdit()
      .create();
  }
  
  function onSpreadsheetEdit(e) {
    // Logger.log("edited!")
    if (e.range.getGridId() == Vars.getPermissionsID()) {
      Logger.log(
        "Updating data validation for %s ...",
        e.range.getA1Notation()
      );
      DataValidation.updateDataValidation(e);
      Logger.log(
        "Finished upated data validation for %s.",
        e.range.getA1Notation()
      );
    }
  }
}
