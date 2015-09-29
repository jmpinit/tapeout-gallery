var express = require("express");
var fs = require("fs");
var path = require("path");
var mustache = require("mustache");
var _ = require("underscore");
var async = require("async");
var gerberToSvg = require('gerber-to-svg');

var app = express();
app.use(express.static('./public'));

var config = JSON.parse(fs.readFileSync("config.json"));

function findGerbers (dir, cb) {
    var extensions = [".gbl", ".gbs", ".gko", ".gpi", ".gtl", ".gto", ".gts"];

    function contains (list, val) {
        return undefined !== _.find(list, function (item) {
            return item === val;
        });
    }

    fs.readdir(dir, function (err, files) {
        var files = _.map(files, function (filename) {
            return filename.toLowerCase();
        });

        if (err) {
            cb(err);
        } else {
            var gerbers = _.filter(files, function (filename) {
                return contains(extensions, path.extname(filename));
            });

            var gerberPaths = _.map(gerbers, function (filename) {
                return path.join(dir, filename);
            });

            cb(null, gerberPaths);
        }
    });
}

app.get('/', function (req, res) {
    fs.readFile('templates/index.mustache', 'utf8', function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(err);
        } else {
            console.log("rendering");
            res.send(mustache.render(data, {project: "test"}));
        }
    });
});

app.get('/projects', function (req, res) {
    fs.readdir(config["project-dir"], function (err, files) {
        res.send(JSON.stringify(files));
    });
});

app.get('/gerbers/:name', function (req, res) {
    var projectPath = path.join(config["project-dir"], req.params.name);

    findGerbers(projectPath, function (err, gerbers) {
        async.map(gerbers, fs.readFile,
            function(err, results) {
                var svgs = _.map(results, function (gerber) {
                    try {
                        return gerberToSvg(gerber.toString());
                    } catch (e) {
                        return null;
                    }
                });

                res.send(JSON.stringify(svgs));
            }
        );
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('app listening at http://%s:%s', host, port);
});
