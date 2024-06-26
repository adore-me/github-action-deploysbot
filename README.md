# github-action-deploysbot
Whenever a pull request is closed, a jira issue is created, updated with pr details, then a slack notification will be fired;


example usage: 
```
   - name: do voodoo
      uses: ./.github/actions/deploysbot
      if: "${{ steps.pr_id.outputs.result > 0 }}"
      with:
        JIRA_USER: ${{ secrets.JIRA_USER_EMAIL }}
        JIRA_PASSWORD: ${{ secrets.JIRA_API_TOKEN }}
        JIRA_PROJECT: "DEPLOY"
        JIRA_URI: ${{ secrets.JIRA_BASE_URL }}
        ISSUE_TYPE: "Task (Capex)"
        PULL_REQUEST: ${{ steps.pr_id.outputs.result }}
        GIT_TAG: "123"
        SLACK_WEBHOOK: "hello"
```
