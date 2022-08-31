const {
    format, isToday, isWeekend, nextMonday,
} = require('date-fns');
const { googleSpreadsheet } = require('./google-anniversary-spreadsheet');
const { getAnniversaryMessageForUser } = require('../config/messages');
const { botApp } = require('./aws-slack-bot');

function mapToUserObj(row) {
    const date = new Date(row.date.replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'));

    const todayDate = new Date(date);
    todayDate.setFullYear((new Date()).getFullYear());

    return {
        name: row.name,
        date: format(date, 'dd-MM-yyyy'),
        valid: !isToday(date) && isToday(todayDate),
    };
}

function getScheduleDate(offset = 0) {
    let today = new Date();
    today.setMilliseconds(0);
    today.setSeconds(0);
    today.setMinutes(process.env.ANNIVERSARY_MESSAGE_MINUTES || 0);
    today.setHours(process.env.ANNIVERSARY_MESSAGE_HOURS || 12);

    // Set date for the next monday if needed
    today = isWeekend(today) ? nextMonday(today) : today;

    // Add delay in seconds for the next user
    const delay = process.env.ANNIVERSARY_MESSAGE_DELAY_IN_SECONDS * offset;
    return new Date(today.getTime() + (1000 * delay));
}

async function getGoogleSpreadsheet() {
    // Initialize Auth
    await googleSpreadsheet.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await googleSpreadsheet.loadInfo();

    return googleSpreadsheet.sheetsByIndex[0];
}

async function getAllAnniversaryUsers() {
    const sheet = await getGoogleSpreadsheet();
    const rows = await sheet.getRows();

    return rows.map((row) => mapToUserObj(row));
}

async function getValidAnniversaryUsers() {
    const users = await getAllAnniversaryUsers();

    return users.filter((u) => u.valid);
}

async function scheduleAnniversaryMessageForUser(user, offset) {
    const message = getAnniversaryMessageForUser(user.id);
    // scheduleMessage requires integer of unix epoch in seconds
    const roundedScheduleDateInUnixEpoch = Math.round(getScheduleDate(offset).getTime() / 1000);

    return botApp.client.chat.scheduleMessage({
        channel: process.env.ANNIVERSARY_MESSAGE_CHANNEL,
        text: message,
        post_at: roundedScheduleDateInUnixEpoch,
    });
}

module.exports = {
    getValidAnniversaryUsers,
    scheduleAnniversaryMessageForUser,
};
