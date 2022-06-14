const core = require('@actions/core');

const JIRA_CONFIG = {
  JIRA_USER: process.env.JIRA_USER || core.getInput('JIRA_USER'),
  JIRA_PASSWORD: process.env.JIRA_PASSWORD || core.getInput('JIRA_PASSWORD'),
  JIRA_PROJECT: process.env.JIRA_PROJECT || core.getInput('JIRA_PROJECT'),
  JIRA_URI: process.env.JIRA_URI || core.getInput('JIRA_URI'),
  ISSUE_TYPE: process.env.ISSUE_TYPE || core.getInput('ISSUE_TYPE'),

  JIRA_ISSUE_CREATION_ENDPOINT: 'rest/api/2/issue',
  JIRA_UPDATE_ISSUE_DESCRIPTION_ENDPOINT: 'rest/api/2/issue/',
  JIRA_LINK_ISSUES_ENDPOINT: 'rest/api/2/issueLink',

  HEADER: process.env.DEPLOYSBOT_HEADER || core.getInput('DEPLOYSBOT_HEADER'),
  HEADER_VALUE: process.env.DEPLOYSBOT_HEADER_VALUE || core.getInput('DEPLOYSBOT_HEADER_VALUE')
};

const GITHUB_CONFIG = {
  GH_TOKEN: process.env.GH_TOKEN || core.getInput('GH_TOKEN'),
  GH_TAG: process.env.GH_TAG || core.getInput('GH_TAG'),
  GH_PR_NUMBER: process.env.GH_PR_NUMBER || core.getInput('GH_PR_NUMBER')
};

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || core.getInput('SLACK_WEBHOOK');
const AUTH_TOKEN = Buffer.from(JIRA_CONFIG.JIRA_USER + ":" + JIRA_CONFIG.JIRA_PASSWORD).toString('base64');

module.exports = {
  AUTH_TOKEN,
  GITHUB_CONFIG,
  JIRA_CONFIG,
  SLACK_WEBHOOK
};
