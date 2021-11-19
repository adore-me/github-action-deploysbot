
const getUniqueApprovers = (reviewers) => {
  let reviewersFound = reviewers
    .filter(function (review) {
      return review.state === "APPROVED";
    }).map(function (review) {
      return review.user.login;
    });

  return [...new Set(reviewersFound)];
};

const getCommitMessages = (commits) => {
  return commits
    .filter(function (element) { 
      return !element.commit.message.includes("Merge branch")
    })
    .map(function (element) {
      let user = (element?.author?.login) 
        || (element?.commit?.author?.commit?.name)
        || "user-undefined"; 

      return `${user} - ${element.commit.message}`;
    });
};

const findIssueKeys = (commitMessages) => {
  const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;
  const matches = commitMessages.join(" ").match(issueIdRegEx);

  return [...new Set(matches || [])];
}

const isNotSuccessful = (statusCode) => {
  return !(statusCode >= 200 && statusCode < 300);
}

module.exports = {
  getUniqueApprovers,
  getCommitMessages,
  isNotSuccessful,
  findIssueKeys
};
