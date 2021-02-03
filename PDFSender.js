function createAndSendPDFs() {
  const zones = getZoneRange()
    .getValues()
    .map((row) => row[0].toString())
    .filter((zone) => zone != "");
  zones.forEach((zone) => {
    createAndSendPDFsForZoneOrDistrict(zone, true);

    const districts = getDistrictRange(zone).getValues()[0];
    districts = districts
      .map((col) => col.toString())
      .filter((district) => district != "");
    districts.forEach((district) =>
      createAndSendPDFsForZoneOrDistrict(district, false)
    );
  });
}

function createAndSendPDFsForZoneOrDistrict(name, isZone) {
  const leaderEmails = getLeaderEmailsForZoneOrDistrict(name, isZone);

  copyFilteredDataToSheet(
    getEmailsInZoneOrDistrict(name, isZone),
    getTalentFilteredDataSheet()
  );

  const fullInfoSheet = getTalentTemplateSheet();
  const fullInfoSheetID = fullInfoSheet.getSheetId();
  const fullInfoRange = fullInfoSheet.getDataRange();
  const fullInfoPDFName = `${name} ${
    isZone ? "Zone" : "District"
  } Missionary Talents`;

  const quickInfoSheet = getTalentQuickInfoSheet();
  const quickInfoSheetID = quickInfoSheet.getSheetId();
  const quickInfoPDFName = `${name} ${isZone ? "Zone" : "District"} Quick Info`;

  const subject = `Autogenerated PDFs - ${fullInfoPDFName}, ${quickInfoPDFName}`;
  var body = `Here are two autogenerated pdf files that contain the talents of the missionaries in your ${
    isZone ? "zone" : "district"
  }! :)`;

  // \/ \/ \/ \/ \/ \/ //
  const reroute = "joshua.hendershot@missionary.org";
  // /\ /\ /\ /\ /\ /\ //

  fullInfoSheet.showSheet();
  const fullInfoPDF = getSpreadsheetAsPDF(
    getTalentSpreadsheetID(),
    fullInfoSheetID,
    fullInfoPDFName,
    fullInfoRange
  );
  fullInfoSheet.hideSheet();

  quickInfoSheet.showSheet();
  const quickInfoPDF = getSpreadsheetAsPDF(
    getTalentSpreadsheetID(),
    quickInfoSheetID,
    quickInfoPDFName,
    null,
    "A4"
  );
  quickInfoSheet.hideSheet();

  const pdfs = [];

  if (fullInfoPDF == null) {
    Logger.log("full info pdf was null, moving on to next one...");
    body += `\n\n There was an error while creating the ${fullInfoPDFName} pdf. Please contact the tech specialist if you would like this pdf.`;
  } else {
    pdfs.push(fullInfoPDF);
  }

  if (quickInfoPDF == null) {
    Logger.log("quick info pdf was null, moving on to next one...");
    body += `\n\n There was an error while creating the ${quickInfoPDFName} pdf. Please contact the tech specialist if you would like this pdf.`;
  } else {
    pdfs.push(quickInfoPDF);
  }

  leaderEmails.forEach((email) => {
    Logger.log(
      "***DEBUGGING NOTICE*** Would be sending email to %s. Rerouting to %s for testing reasons...",
      email,
      reroute
    );
    // emailPDFs(pdfs, email, subject, body);
    // ^^^^^ Uncomment when ready to send to actual emails.
  });

  emailPDFs(pdfs, reroute, subject, body); // comment this line when you no longer want to reroute emails.
}

function getEmailsInZoneOrDistrict(name, isZone) {
  const dataRange = getPermissionsRange().getValues();
  const zoneOrDistrictCol =
    (isZone ? getZoneColNum() : getDistrictColNum()) - 1;
  const emailCol = getEmailAddressColNum() - 1;
  const filtered = dataRange
    .filter(
      (row) =>
        row[zoneOrDistrictCol].toString().toLowerCase() == name.toLowerCase()
    )
    .map((row) => row[emailCol].toString().toLowerCase().trim());
  Logger.log(
    `emails in ${name} ${isZone ? "zone" : "district"}:\n${filtered.join("\n")}`
  );
  return filtered;
}

function getLeaderEmailsForZoneOrDistrict(name, isZone) {
  const dataRange = getPermissionsRange().getValues();
  const zoneOrDistrictCol =
    (isZone ? getZoneColNum() : getDistrictColNum()) - 1;
  const emailCol = getEmailAddressColNum() - 1;
  const accessLevelCol = getAccessLevelColNum() - 1;
  const filtered = dataRange
    .filter(
      (row) =>
        row[zoneOrDistrictCol].toString().toLowerCase() == name.toLowerCase()
    )
    .filter((row) => {
      const access = row[accessLevelCol].toString();
      return isZone
        ? access == "ZL" || access == "STL" || access == "SMS"
        : access == "DL";
    })
    .map((row) => row[emailCol].toString().toLowerCase().trim());
  Logger.log(
    `leader emails in ${name} ${isZone ? "zone" : "district"}:\n${filtered.join(
      "\n"
    )}`
  );
  return filtered;
}

function copyFilteredDataToSheet(emails, sheetToPasteIn) {
  const emailCol = 4;
  const nameCol = 2;

  const responsesSheet = getTalentResponsesSheet();
  const responsesDataRange = responsesSheet.getDataRange();
  sheetToPasteIn
    .getRange(2, 1, sheetToPasteIn.getMaxRows(), sheetToPasteIn.getMaxColumns())
    .clear();

  const numColsToCopy = responsesSheet.getMaxColumns();
  let nextRowToPasteIn = 2;

  for (let i = 2; i < responsesDataRange.getNumRows(); i++) {
    const emailCell = responsesDataRange.getCell(i, emailCol);
    const email = emailCell.getValue().toString().toLowerCase().trim();
    if (!emails.includes(email)) {
      continue;
    }

    const rowToCopy = responsesSheet.getRange(i, 1, 1, numColsToCopy); // get the entire row of the matching email
    const rangeToPasteIn = sheetToPasteIn.getRange(nextRowToPasteIn, 1);
    rowToCopy.copyTo(rangeToPasteIn, { contentsOnly: true });
    nextRowToPasteIn += 1;
  }

  sheetToPasteIn.sort(nameCol);

  return sheetToPasteIn;
}

function getSpreadsheetAsPDF(
  spreadsheetID,
  sheetID,
  pdfName,
  range = null,
  size = "A3",
  portrait = true
) {
  const ss = SpreadsheetApp.openById(spreadsheetID);
  const url = "https://docs.google.com/spreadsheets/d/SS_ID/export?".replace(
    "SS_ID",
    ss.getId()
  );
  let exportOptions =
    "exportFormat=pdf&format=pdf" + // export as pdf / csv / xls / xlsx
    "&size=" +
    size + // paper size legal / letter / A4
    "&portrait=" +
    portrait + // orientation, false for landscape
    "&fitw=false&source=labnol" + // fit to page width, false for actual size
    "&sheetnames=false&printtitle=false" + // hide optional headers and footers
    "&pagenumbers=false&gridlines=false" + // hide page numbers and gridlines
    "&fzr=true&fzc=true" + // do repeat row headers (frozen rows) on each page
    "&horizontal_alignment=LEFT" +
    "&top_margin=0.0" +
    "&bottom_margin=0.0" +
    "&left_margin=0.0" +
    "&right_margin=0.0" +
    "&gid=" +
    sheetID; // the sheet's Id

  if (range != null) {
    exportOptions +=
      "&ir=false" + // seems to be always false
      "&ic=false" + // same as ir
      "&r1=0" + // Start Row number - 1 (row 1 would be 0 , row 15 wold be 14)
      "&c1=0" + // Start Column number - 1 (column 1 would be 0, column 8 would be 7)
      "&r2=" +
      range.getLastRow() + // End Row number
      "&c2=" +
      range.getLastColumn(); // End Column number
  }

  const token = ScriptApp.getOAuthToken();
  const fullURL = url + exportOptions;

  Logger.log(fullURL);

  try {
    const response = UrlFetchApp.fetch(fullURL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      muteHttpExceptions: true,
    });

    const blob = response.getBlob().setName(`${pdfName}.pdf`);
    return blob;
  } catch (err) {
    Logger.log("exporting spreadsheet as pdf threw an error: %s", err);
    return null;
  }
}

function emailPDFs(pdfs, email, subject, body) {
  // If allowed to send emails, send the email with the PDF attachment
  if (MailApp.getRemainingDailyQuota() > 0)
    GmailApp.sendEmail(email, subject, body, {
      htmlBody: body,
      attachments: pdfs,
    });
}
