# pradiator
Shows open pull requests from multiple Github repositories.

# Configuration
First create a Github access token for this application at
https://github.com/settings/tokens/new. Check `repo` scope if you want to
access private repositories' pull requests.  Then create a new JSON file to
`./config.json` and fill in the access token and repositories you want
to see pull requests from.

Example config file:
```
{
  "accessToken": "YOUR_ACCESS_TOKEN_HERE",
  "repositories": ["jjuutila/pradiator"],
  "maxUpdatedAgeInHours": 1440
}
```

The above would show all open PRs for the "jjuutila/pradiator" that have been updated within the last 60 days.

# Environment variables

 - `MAX_UPDATED_AGE_IN_HOURS` can be used to override the max age specified in the config file.
 - `ADDITIONAL_REPOSITORIES` can be used to _supplement_ the list of repositories specified in the config file. The value should be a comma-delimited string of repository names.

# Running
`$ node server.js`
