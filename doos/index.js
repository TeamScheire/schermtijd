//setup
var express = require("express");// importing express library
var app = express();// setup express
var fs = require("fs");// import the filesystem for JSON db

var mustacheExpress = require('mustache-express');// import library for transfering data to the html page!, mustache
app.use(express.static('views'))
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

//server
app.get("/", function(req, res){
	var raw_json = fs.readFileSync("db.json");// getting stringified json db
	var json = JSON.stringify(JSON.parse(raw_json));//converting to JSON object and stringifying
	res.render("index.mustache", {db: json});// transfer page + data to device
})

//addpoints api
app.get("/addpoints/", function(req, res){
	var raw_json = fs.readFileSync("db.json");// getting stringified json db
	var json = JSON.parse(raw_json);//converting to JSON object
		
	for (i = 0; i < json.names.length; i++) {
		if(json.names[i].name == req.query.user){
		json.names[i].points = parseInt(json.names[i].points) + parseInt(req.query.points);
		// res.send(json);
		fs.writeFileSync("db.json" , JSON.stringify(json));
		res.sendStatus(200);
		}
	}
})

// scoreboard
app.listen("8080")// starting server
