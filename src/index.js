var d3 = require("d3");
var $ = require("jquery");
var _ = require("underscore");

function showProject (project) {
    $.getJSON("gerbers/" + project, function(data) {
        for (var i = 0; i < data.length; i++) {
            d3.select("body").append("div").html(data[i]);
        }
    });
}

$.getJSON("projects", function (projects) {
    var project = projects[Math.floor(projects.length * Math.random())];
    showProject(project);
});
