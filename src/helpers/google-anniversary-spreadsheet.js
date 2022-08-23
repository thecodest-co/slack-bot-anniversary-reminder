const { GoogleSpreadsheet: GoogleAnniversarySpreadsheet } = require('google-spreadsheet');

// Initialize the sheet
const googleSpreadsheet = new GoogleAnniversarySpreadsheet(
    process.env.ANNIVERSARY_SPREADSHEET_ID,
);

module.exports = {
    googleSpreadsheet,
};
