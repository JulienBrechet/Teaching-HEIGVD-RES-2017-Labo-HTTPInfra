var Chance = require('chance');
var chance = new Chance();
var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send( generateAnimals() )
});

app.get('/test', function (req, res) {
  res.send('Hello RES - test is working')
});

app.listen(5970, function () {
  console.log('Accepting HTTP requests on port 5970.')
});

function generateAnimals() {
	var nbAnimalsInZoo = chance.natural({
		min: 1,
		max: 20
	});
	var animals = [];	
	
	for(var i = 0; i < nbAnimalsInZoo; ++i) {
		var gender = chance.gender();
		var animalRand = chance.natural({
			min: 0,
			max: 6
		});	
		var animalType;
		var color;
		var longevity;
		var weightMin;
		var weightMax;
		
		switch (animalRand) {
		case 0:
			animalType = "tiger";
			color = "orange and black";
			weightMin = 50;
			weightMax = 390;
			longevity = 26;
			break;
		case 1:
			animalType = "lion";
			color = "brown";
			weightMin = 46;
			weightMax = 280;
			longevity = 14;
			break;
		case 2:
			animalType = "penguin";
			color = "black and white";
			weightMin = 6;
			weightMax = 38;
			longevity = 24;
			break;
		case 3:
			animalType = "giraffe";
			color = "brown and white";
			weightMin = 120;
			weightMax = 1930;
			longevity = 36;
			break;
		case 4:
			animalType = "zebra";
			color = "white and black";
			weightMin = 80;
			weightMax = 340;
			longevity = 30;
			break;
		case 5:
			animalType = "snake";
			color = "green";
			weightMin = 1;
			weightMax = 4;
			longevity = 8;
			break;	
		case 6:
			animalType = "turtle";
			color = "green and brown"
			weightMin = 3;
			weightMax = 1000;
			longevity = 200;
		}
		
		animals.push({
			name: chance.first({
				gender: gender
			}),
			animal: animalType,
			gender: gender,
			color: color,
			weight: chance.natural({
				min: weightMin,
				max: weightMax
			}),
			age: chance.natural({
				min: 0,
				max: longevity
			})
		});
	};
	return animals;
}