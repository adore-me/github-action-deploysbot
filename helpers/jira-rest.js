const got = require('got');
const config = require('../config/config');
const utils = require('./utils');

class Jira {
  constructor() {
    this.client = got.extend({
      headers: {
        'Authorization': `Basic ${config.AUTH_TOKEN}`
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
        description: {
          "content": [
            {
              "content": [
                {
                  "text": "to be updated",
                  "type": "text"
                }
              ],
              "type": "paragraph"
            }
          ],
          "type": "doc",
          "version": 1
        },
        customfield_10035: {
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
    let approvers = [...new Set(utils.getUniqueApprovers(reviewers) || [])];
    const gitTag = config.GITHUB_CONFIG.GH_TAG;

    let updateIssueDescriptionPayload = {
      fields: {
        "description": {
          "version": 1,
          "type": "doc",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Repository "
                },
                {
                  "type": "text",
                  "text": prDetails.head.repo.name.toUpperCase(),
                  "marks": [
                    {
                      "type": "link",
                      "attrs": {
                        "href": `https://github.com/adore-me/${prDetails.head.repo.name}`
                      }
                    }
                  ]
                },
                {
                  "type": "hardBreak"
                },
                {
                  "type": "text",
                  "text": "New version: "
                },
                {
                  "type": "text",
                  "text": `PR-${prDetails.number}: ${prDetails.title}`,
                  "marks": [
                    {
                      "type": "link",
                      "attrs": {
                        "href": `https://github.com/adore-me/${prDetails.head.repo.name}/pull/${prDetails.number}`
                      }
                    }
                  ]
                },
                {
                  "type": "hardBreak"
                },
                {
                  "type": "text",
                  "text": "Tag: "
                },
                {
                  "type": "text",
                  "text": gitTag,
                  "marks": [
                    {
                      "type": "link",
                      "attrs": {
                        "href": `https://github.com/adore-me/${prDetails.head.repo.name}/releases/tag/${gitTag}`
                      }
                    }
                  ]
                },
                {
                  "type": "hardBreak"
                },
                {
                  "type": "text",
                  "text": `Quay image: ${gitTag}`
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "User info: "
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": `Opened by: ${prDetails.user.login}`
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": `Approved by: ${approvers.join(", ")}`
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": `Merged by: ${prDetails.merged_by.login}`
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "PR info: "
                }
              ]
            },
            {
              "type": "bulletList",
              "content": [
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": `number of changed files: ${prDetails.changed_files}`
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": `number of commits: ${prDetails.commits}`
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "additions: "
                        },
                        {
                          "type": "text",
                          "text": `+ ${prDetails.additions}`,
                          "marks": [
                            {
                              "type": "textColor",
                              "attrs": {
                                "color": "#8eb021"
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "listItem",
                  "content": [
                    {
                      "type": "paragraph",
                      "content": [
                        {
                          "type": "text",
                          "text": "deletions: "
                        },
                        {
                          "type": "text",
                          "text": `- ${prDetails.deletions}`,
                          "marks": [
                            {
                              "type": "textColor",
                              "attrs": {
                                "color": "#de350b"
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Commits:"
                }
              ]
            },
            {
              "type": "codeBlock",
              "attrs": {
                "language": "java"
              },
              "content": [
                {
                  "type": "text",
                  "text": commits.join("\r\n")
                }
              ]
            }
          ]
        },
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
