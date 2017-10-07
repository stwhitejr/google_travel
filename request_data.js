const request = require('request');
// const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const locationList = [
	{
		'id': 'br1',
		'name': '166 Walnut St Braintree, MA 02184'
	},
	{
		'id': 'home',
		'name': '127 Webster St Rockland, MA 02370'
	}
]
const destination = 'Copley Place';
const departure_time = 'now';

// Time Formatting
const d = new Date();
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const hour = d.getHours();
const minute = d.getMinutes();
const date = d.getDate();
const monthFormatted = months[d.getMonth()];
const timeFormatted = hour + ':' + minute;
const dayFormatted = days[d.getDay()];
const fullFilePath = 'data.json';
let i = 0;

function getTravelData() {
	const currentLocationName = locationList[i].name;
	const currentLocationId = locationList[i].id;

	request('https://maps.googleapis.com/maps/api/directions/json?origin=' + currentLocationName + '&destination=' + destination + '&departure_time=' + departure_time + '&key=AIzaSyAk0W6XjXzBByQ2-LeusrZWVFXygWDxMzw', function (error, response, body) {

		// Convert response to json
		const responseBody = JSON.parse(body);

		// Grab only what I need
		const recordings = {
			'time': timeFormatted,
			'date': monthFormatted + ' ' + dayFormatted + ' ' + date,
			'start_address': responseBody.routes[0].legs[0].start_address.toString(),
			'end_address': responseBody.routes[0].legs[0].end_address.toString(),
			'duration': responseBody.routes[0].legs[0].duration.text.toString(),
			'duration_in_traffic': responseBody.routes[0].legs[0].duration_in_traffic.text.toString(),
			'via': responseBody.routes[0].summary.toString()
		};

		// Read the file first if it exists
		fs.readFile(fullFilePath, 'utf8', (err, previousData) => {
			if (!err) {
				// Check to make sure it's not the first time we're writing to this
				let locations;
				let hasPreviousData;
				if (previousData != '') {
					locations = JSON.parse(previousData);
					hasPreviousData = true;
				} else {
					locations = [];
				}

				// If we have previous data check to see if this location is new
				let previousLocationIds = [];
				if (hasPreviousData) {
					for (var x = 0; locations.length > x; x++) {
						let locationId = locations[x].id;
						previousLocationIds.push(locationId);
					};
				};

				// Either add new location + recording or add to previous location
				// Check if the current location we're inserting is already in our file
				//TODO Add a new object of recording_times - check to see if we already have it and add to it add new
				const currentLocationsIndex = previousLocationIds.indexOf(currentLocationId);
				if (currentLocationsIndex === -1) {
					const newLocationData = {
						'id': currentLocationId,
						'name': currentLocationName,
						'recordings': [recordings]
					};
					locations.push(newLocationData);
				} else {
					locations[currentLocationsIndex]['recordings'].push(recordings);
				}

				// Convert JSON to string
				dataString = JSON.stringify(locations);

				// Rewrite JSON data file
			  fs.writeFile(fullFilePath, dataString, (err, fd) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Sucessfully Saved:' + fullFilePath);
						i++;
						if (i != locationList.length) {
							getTravelData();
						};
					}
				});
			} else {
				console.log(err);
			}
		});

	});
}

getTravelData();