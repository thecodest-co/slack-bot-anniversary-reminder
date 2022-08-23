const { botApp } = require('./aws-slack-bot');

async function getSlackUsers() {
    const result = await botApp.client.users.list();
    return result.members.filter((u) => isNotBot(u))
        .filter((u) => isNotGuest(u))
        .filter((u) => !u.deleted)
        .map((u) => mapToUserDTO(u));
}

function isNotBot(user) {
    const defaultSlackbotId = 'USLACKBOT';
    return !user.is_bot
        // default Slackbot added by Slack has set is_bot as false, so it has to be filtered out by id
        && user.id !== defaultSlackbotId;
}

function isNotGuest(user) {
    return !user.is_restricted
        && !user.is_ultra_restricted;
}

function mapToUserDTO(member) {
    return {
        id: member.id,
        teamId: member.team_id,
        name: member.name,
        real_name: member.real_name,
    };
}

module.exports = {
    getSlackUsers,
};
