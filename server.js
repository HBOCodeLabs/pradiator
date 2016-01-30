var express = require('express')
var https = require('https');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var PORT = 8888;

var app = express();

// serve static files from the "public" dir
app.use(express.static('public'));

// read in the config file
var config = require('./config.json');

if ((!config.accessToken) || (config.accessToken === '')) {
    throw new Error("No 'accessToken' supplied in config.json!");
}

// this env var overrides the value in the config file
var age = process.env.MAX_UPDATED_AGE_IN_HOURS;
if (age && Number(age)) {
    config.maxUpdatedAgeInHours = Number(age);
}

// this env var supplements the value in the config file
if (process.env.ADDITIONAL_REPOSITORIES) {
    config.repositories = config.repositories.concat(_.map(process.env.ADDITIONAL_REPOSITORIES.split(','), String.trim));
}

// gets the configured list of repositories
//
// Example: GET /repositories =>
//   [ "foo/bar", "hello/world"]
app.get('/repositories', function(req, res) {
    res.status(200).json(config.repositories);
});

// Retrieves open pull request data from the github API and proxy the github response back to
// the caller.
//
// Example: GET /prs/HBOCodeLabs/Hurley-Bespin =>
//    [
//      { url: "...", id: "...", ...},
//      ...
//    ]
app.get('/prs/:owner/:repo', function(req, res) {

    var repository = [req.params.owner, req.params.repo].join('/');

    var opts = {
        host: 'api.github.com',
        method: 'GET',
        path: '/repos/' + repository + '/pulls',
        headers: {
            'Authorization': 'token ' +  config.accessToken,
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
            'Accept': 'application/vnd.github.v3+json'
        }
    }

    function cb(response) {
        var str = '';

        response.on('data', function(chunk) { str += chunk; });

        response.on('error', function(e) {
            res.sendStatus(500);
        });
        response.on('end', function() {
            try {
                // parse the data, filter it by the "last updated timestamp",
                // then turn around and send it back in the response
                var prs = JSON.parse(str);
                prs = _.filter(prs, function(pr) {
                    var msDiff = new Date().getTime() - new Date(pr.updated_at).getTime();
                    return (diff <= config.maxUpdatedAgeInHours * 60 * 60 * 1000);
                });

                res.status(200).json(prs);
            } catch(e) {
                res.sendStatus(500);
            }
        });
    }

    https.request(opts, cb).end();
});

app.listen(PORT, function() {
    console.log('pradiator server started at http://localhost:' + PORT + '/');
});

