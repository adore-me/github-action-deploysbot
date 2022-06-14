const got = require('got');
const config = require('../config/config');
const utils = require('./utils');

class Jira {
  constructor() {
    this.client = got.extend({
      headers: {
        'Authorization': `Basic ${config.AUTH_TOKEN}`,
        [`${config.JIRA_CONFIG.DEPLOYS_BOT_HEADER}`]: config.JIRA_CONFIG.DEPLOYS_BOT_HEADER_VALUE
      },

      prefixUrl: config.JIRA_CONFIG.JIRA_URI,
      responseType: 'json'
    });
  }

  async createIssue(prDetails) {
    const summaryField = `Release: [ ${prDetails.head.repo.name.toUpperCase()} | PR-${prDetails.number}: ${prDetails.title} ]`

    let createIssuePayload = {
      fields: {
        project: {
          key: config.JIRA_CONFIG.JIRA_PROJECT
        },
        summary: summaryField,
        description: "to be updated",
        customfield_10508: {
          value: "Unassigned"
        },
        issuetype: {
          name: config.JIRA_CONFIG.ISSUE_TYPE
        }
      }
    };

    try {
      const { body, statusCode } = await this.client.post(
        config.JIRA_CONFIG.JIRA_ISSUE_CREATION_ENDPOINT,
        {
          json: createIssuePayload
        }
      );
      
      console.log("Created jira issue: " + body.key);
      return body.key;

    } catch (error) {
      console.log("Something went wrong creating the jiraIssue");
      return null;
    }
  }


  async updateIssueDescription(releaseTicket, prDetails, reviewers, commits) {
    let approvers = utils.getUniqueApprovers(reviewers);
    const gitTag = config.GITHUB_CONFIG.GH_TAG;

    let updateIssueDescriptionPayload = {
      fields: {
        description:
          `\r\nRepository [${prDetails.head.repo.name.toUpperCase()}|https://github.com/adore-me/${prDetails.head.repo.name}]` +
          `\r\nNew version: [PR-${prDetails.number}: ${prDetails.title}|https://github.com/adore-me/${prDetails.head.repo.name}/pull/${prDetails.number}]` +
          `\r\nTag: [${gitTag}|https://github.com/adore-me/${prDetails.head.repo.name}/releases/tag/${gitTag}]` +
          `\r\nQuay image: prod-${gitTag}` +
          `\r\n\n\n` +
          `\r\nUser info: ` +
          `\r\n- Opened by: ${prDetails.user.login}` +
          `\r\n- Approved by:  ${approvers.join(", ")}` +
          `\r\n- Merged by: ${prDetails.merged_by.login}` +
          `\r\n\n\n` +
          `\r\nPR info: ` +
          `\r\n- number of changed files: ${prDetails.changed_files}` +
          `\r\n- number of commits: ${prDetails.commits}` +
          `\r\n- additions: {color:#8eb021}+${prDetails.additions}{color}` +
          `\r\n- deletions: {color:#de350b}-${prDetails.deletions}{color}` +
          `\r\n\n\nCommits:` +
          `{code:java}` +
          `\r\n${commits.join("\r\n")}` +
          `{code}`
      }
    };


    try {
      const { body, statusCode } = await this.client.put(
        config.JIRA_CONFIG.JIRA_UPDATE_ISSUE_DESCRIPTION_ENDPOINT + releaseTicket,
        {
          json: updateIssueDescriptionPayload
        }
      );

      console.log(`Successfully updated description of ${releaseTicket}`);
      
    } catch (error) {
      console.log(`Unable to update description of ${releaseTicket}`);
      console.log(error.message);
    }
  };


  async linkIssues(foundIssueInCommit, releaseTicket) {
    let linkIssuePayload = {
      type: {
        name: "Relates"
      },
      inwardIssue: {
        key: foundIssueInCommit
      },
      outwardIssue: {
        key: releaseTicket
      }
    };

    try {
      const { body, statusCode } = await this.client.post(config.JIRA_CONFIG.JIRA_LINK_ISSUES_ENDPOINT,
        {
          json: linkIssuePayload
        }
      );

      console.log(`Linking: ${releaseTicket} with found issue: ${foundIssueInCommit} `);
    } catch (error) {
      console.log(`Maybe ${foundIssueInCommit} is not a valid jira issue.`);
    }
  };
};


module.exports = Jira;
