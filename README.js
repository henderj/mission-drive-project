/*

CREATED BY: Elder Joshua Hendershot

joshua.hendershot@missionary.org
hendershotjoshr@gmail.com

Feel free to contact me with any questions! :)



**********************
/////// INFO /////////
**********************

This code is uploaded to Google Apps Script using "clasp".
I am developing this code locally in Typescript using VSCode.
This code is available on a github repository: https://github.com/henderj/mission-drive-project.git


Every transfer day, starting on 2/23/2021, three functions run around 2AM.
1. FlushContent.archiveContentFolders();
2. Permissions.updatePermissions();
3. PDFSender.createAndSendPDFs();


1. FlushContent.archiveContentFolders();
  - This archives social media content from the last transfer and provides
    a "clean slate" to start fresh.

  - It recursively searches through the Zone Drives folder for
    folders with the area suffix (ie. "____ Area Folder"). If there are 
    Quality and Quick Content folders in the area folder, it moves them into
    a folder named with the current date within the area archive folder (which
    is created if there is none). It then creates new Quality and Quick Content
    folders.

  - Settings
      -- ZoneDrivesID
      -- AreaFolderSuffix
      -- ArchiveFolderSuffix
      -- QualityFolderName
      -- QuickFolderName

2. Permissions.updatePermissions();
  - This gives each missionary access permissions to the folders in the 
    Zone Drives folder based on the area they are currently in.

  - It goes down through the Permissions sheet on the Mission Drive 
    Bot spreadsheet and gives each email viewer access to the Mission Database
    folder (if they do not yet have access). It then goes through again and gives
    each email editor access to their area folder (if there is one). If the email
    has the DL access level, it is given editor access to their district folder
    (if there is one). If the email has either the ZL, STL, or SMS access level,
    it is given editor access to their zone folder.

  - Settings
      -- MissionDatabaseID
      -- ZoneDrivesID
      -- ZoneFolderSuffix
      -- DistrictFolderSuffix
      -- AreaFolderSuffix
      -- ZoneToDistrictMapID
      -- DistrictToAreaMapID
      -- PermissionsID
      -- PermissionsEmailAddressCol
      -- PermissionsZoneCol
      -- PermissionsDistrictCol
      -- PermissionsAreaCol
      -- PermissionsAccessLevelCol

3. PDFSender.createAndSendPDFs();
  - This function goes through each zone and district and sends the ZLs, STLs, SMSs,
    and DLs a pdf with information on the missionaries in their zone/district.

  - It's complicated.

  - Settings
      -- MLMTalentSpreadsheetID
      -- MLMTalentResponsesSheetID
      -- MLMTalentTemplateSheetID
      -- MLMTalentFilteredDataSheetID
      -- MLMTalentQuickInfoSheetID
      -- PermissionsID
      -- PermissionsEmailAddressCol
      -- PermissionsZoneCol
      -- PermissionsDistrictCol
      -- PermissionsAccessLevelCol



**********************
/////// TODO /////////
**********************

Figure out closing/opening up areas

Create interface

Delete super old content

*/
