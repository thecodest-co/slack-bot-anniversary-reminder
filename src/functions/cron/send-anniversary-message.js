const stringSimilarity = require('string-similarity');
const anniversaryService = require('../../helpers/google-anniversary-spreadsheet-service');
const userService = require('../../helpers/user-service');

const SIMILARITY_THRESHOLD = 0.7;

exports.func = async () => {
    const anniversaryUsers = await anniversaryService.getValidAnniversaryUsers();
    const slackUsers = await userService.getSlackUsers();

    let offset = 0;
    for (let index = 0; index < anniversaryUsers.length; index += 1) {
        const user = anniversaryUsers[index];

        const slackUser = slackUsers.find(
            (item) => stringSimilarity.compareTwoStrings(user.name, item.real_name) > SIMILARITY_THRESHOLD,
        );

        if (slackUser) {
            await anniversaryService.scheduleAnniversaryMessageForUser(slackUser, offset).then((response) => {
                if (!response.ok) {
                    throw Error(`Message sending failed: ${JSON.stringify(response.data)}`);
                }
            });

            offset += 1;
        }
    }

    return 'success';
};
