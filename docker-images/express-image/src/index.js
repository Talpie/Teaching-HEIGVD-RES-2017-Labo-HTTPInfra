var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req,res) {
	res.send(generateRandomStuff());
});

app.listen(3000, function () {
console.log("Accepting HTTP requests on port 3000 ");
});

function generateRandomStuff() {
	var numberOfBeers = chance.integer({
	min: 0,
	max: 100});
	var beers = [];
	for(var i = 0; i < numberOfBeers; i++) {
		var brewdYear = chance.year({
		min:1995,
		max: 1996});
		var type =  chance.pickone(['Lagers', 'Ales', 'Stouts ', 'Porters', 'Malts']);
		beers.push({
		brewdYear : brewdYear,
		type : type,
		name : chance.word()
		});
	}
	
	console.log(beers);
	return beers;
}