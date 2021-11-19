const Jira = require('./helpers/jira-rest');
const Github = require('./helpers/github-rest');
const utils = require('./helpers/utils');
const slack = require('./helpers/slack');

const kickOffAction = async () => {

  //gather pull request details
  const githubClient = new Github();
  let commits = {};
  let prDetails = {};
  let reviewers = {};
  try {
    prDetails = await githubClient.getPullRequest();
    reviewers = await githubClient.getReviewers();
    commits = await githubClient.getCommits();
  } catch (exception) {

    console.log("Unable to get details about the pull request;");
    throw new Error(exception);
  }

  //parse the commits response object to a list of [author] - [commit message]
  const commitMessages = utils.getCommitMessages(commits);

  const jiraClient = new Jira();
  
  //create a release jira issue
  const releaseTicket = await jiraClient.createIssue(prDetails);

  //parse commits to get issue keys 
  const relatedIssues = utils.findIssueKeys(commitMessages);

  if (releaseTicket) {
    await jiraClient.updateIssueDescription(releaseTicket, prDetails, reviewers, commitMessages);
    relatedIssues.forEach(issue => jiraClient.linkIssues(issue, releaseTicket));

    slack.sendNotification(releaseTicket, prDetails, reviewers, relatedIssues);
  } else {

    //send failed notification lmao
    slack.sendFailedNotification(prDetails);
  }


};

(async () => {
  await kickOffAction();
})();
