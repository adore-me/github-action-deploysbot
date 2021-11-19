const github = require("@actions/github");
const core = require("@actions/core");
const config = require("../config/config");
const utils = require("./utils");

class Github {
  constructor() {
    const token = config.GITHUB_CONFIG.GH_TOKEN
    this.pull_request_number = config.GITHUB_CONFIG.GH_PR_NUMBER

    if (!token) {
      throw new Error("Missing GitHub token input");
    }

    this.octokit = github.getOctokit(token);
  }

  async getPullRequest() {
    console.log(this.pull_request_number);
    const { data, status } = await this.octokit.rest.pulls.get({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      pull_number: this.pull_request_number
    });

    if (utils.isNotSuccessful(status)) {
      throw new Error("Something went wrong fetching PR details;");
    }

    console.log("Received pr details");
    return data;
  }

  async getReviewers() {
    const { data, status } = await this.octokit.rest.pulls.listReviews({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      pull_number: this.pull_request_number
    })

    if (utils.isNotSuccessful(status)) {
      throw new Error("Something went wrong fetching reviewers from PR");
    }

    console.log("Received reviewers details");
    return data;
  }

  async getCommits() {
    const { data, status } = await this.octokit.rest.pulls.listCommits({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      pull_number: this.pull_request_number
    })

    if (utils.isNotSuccessful(status)) {
      throw new Error("Something went wrong fetching commits from PR");
    }

    console.log("Received commits");
    return data;
  }

}

module.exports = Github;
