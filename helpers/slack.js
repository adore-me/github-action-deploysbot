const got = require('got');
const config = require('../config/config')
const utils = require('./utils');

const sendNotification = async function (releaseTicket, prDetails, reviewers, issues) {
    let approvers = [...new Set(utils.getUniqueApprovers(reviewers) || [])];
    let approved_by = approvers.length ? `*Approved by:* ${approvers.join(', ')}`: '';

    let foundIssues = '';
    if(issues.length) {
        let formattedIssues = issues.map(function (element){
            return `<https://adoreme.atlassian.net/browse/${element}|${element}>`;
        });
        foundIssues = `\nRelated tickets: *${formattedIssues.join(", ")}*`;
    }

    const payload = {
        blocks: [
            {
                text: {
                    text: 
                        `*<https://github.com/adore-me/${prDetails.head.repo.name}|${prDetails.head.repo.name.toUpperCase()}>* :_loader::_loader: ` +
                        `*<https://github.com/adore-me/${prDetails.head.repo.name}/pull/${prDetails.number}|PR-${prDetails.number}: ${prDetails.title}>* \n\n` +
                        `See release details: <https://adoreme.atlassian.net/browse/${releaseTicket}|${releaseTicket}>`,
                    type: "mrkdwn"
                },
                type: "section"
            },
            {
                elements: [
                    {
                        text: `*Merged by:* ${prDetails.merged_by.login} ${approved_by} ${foundIssues}`,
                        type: "mrkdwn"
                    }
                ],
                type: "context"
            },
            {
                type: "divider"
            }
        ]
    };

    const response = await got.post(config.SLACK_WEBHOOK, {
        json: payload
    });
}

const sendFailedNotification = async function (prDetails) {
    const payload = {
        blocks: [
            {
                text: {
                    text: 
                        `Unable to create release ticket for: *<https://github.com/adore-me/${prDetails.head.repo.name}|${prDetails.head.repo.name.toUpperCase()}>* ` +
                        `*<https://github.com/adore-me/${prDetails.head.repo.name}/pull/${prDetails.number}|PR-${prDetails.number}: ${prDetails.title}>* :qoobee_sad:`,
                    type: "mrkdwn"
                },
                type: "section"
            },
            {
                type: "divider"
            }
        ]
    };

    const response = await got.post(config.SLACK_WEBHOOK, {
        json: payload
    });
}

module.exports = {
    sendNotification,
    sendFailedNotification
};