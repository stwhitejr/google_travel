const request = require('request');
const fs = require('fs');
const path = require('path');
const locationList = [
	{
		'id': 'home',
		'name': '127 Webster St Rockland, MA 02370'
	},
	{
		'id': 'bra1',
		'name': '166 Walnut St Braintree, MA 02184'
	},
	{
		'id': 'bra2',
		'name': '74 Bellevue Rd Braintree, MA'
	},
	{
		'id': 'bra3',
		'name': '91 Franklin St Braintree, MA'
	},
	{
		'id': 'holb1',
		'name': '153 Belcher St Holbrook, MA'
	},
	{
		'id': 'holb2',
		'name': '177 Pond St Holbrook, MA'
	},
	{
		'id': 'wey1',
		'name': '39 Hawthorne St Weymouth, MA'
	},
	{
		'id': 'wey2',
		'name': '70 Century Rd Weymouth, MA'
	},
	{
		'id': 'wey3',
		'name': '4 Edward Cody Ln Weymouth, MA'
	},
	{
		'id': 'wey4',
		'name': '224 Pond St Weymouth, MA'
	},
	{
		'id': 'nat1',
		'name': '11 Ingleside Rd Natick, MA'
	},
	{
		'id': 'sher1',
		'name': '34 S Main St Sherborn, MA'
	},
	{
		'id': 'shar1',
		'name': '36 Harold St Sharon, MA'
	},
	{
		'id': 'stou1',
		'name': '701 Park St Stoughton, MA'
	},
	{
		'id': 'cant1',
		'name': '1661 Washington St Canton, MA'
	},
	{
		'id': 'hing1',
		'name': '92 Fort Hill St Hingham, MA'
	},
	{
		'id': 'nor1',
		'name': '104 Grove St Norwell, MA'
	}
]
const destination = 'Copley Place';
const departure_time = 'now';

// Time Formatting
const d = new Date();
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const hour = d.getHours();
let minutes = d.getMinutes();
if (minutes < 10) {
	minutes = '0' + minutes;
}
const date = d.getDate();
const monthFormatted = months[d.getMonth()];
const timeFormatted = hour + ':' + minutes;
const dayFormatted = days[d.getDay()];
let i = 0;

function getTravelData() {
	let currentLocationName = locationList[i].name;
	let currentLocationId = locationList[i].id;
	// Switch file paths and request url depending on AM/PM
	let fullFilePath = 'web/am_data.json';
	let requestUrl = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + currentLocationName + '&destination=' + destination + '&departure_time=' + departure_time + '&key=AIzaSyAk0W6XjXzBByQ2-LeusrZWVFXygWDxMzw';
	if (hour > 12) {
		fullFilePath = 'web/pm_data.json';
		requestUrl = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + destination + '&destination=' + currentLocationName + '&departure_time=' + departure_time + '&key=AIzaSyAk0W6XjXzBByQ2-LeusrZWVFXygWDxMzw';
	}

	request(requestUrl, function (error, response, body) {

		// Convert response to json
		const responseBody = JSON.parse(body);

		// Grab only what I need
		let recordings = {
			'date': dayFormatted + ' ' + monthFormatted + ' ' + date,
			'start_address': responseBody.routes[0].legs[0].start_address.toString(),
			'end_address': responseBody.routes[0].legs[0].end_address.toString(),
			'duration': responseBody.routes[0].legs[0].duration.text.toString(),
			'duration_in_traffic': responseBody.routes[0].legs[0].duration_in_traffic.text.toString(),
			'distance': responseBody.routes[0].legs[0].distance.text.toString(),
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
				const currentLocationsIndex = previousLocationIds.indexOf(currentLocationId);
				if (currentLocationsIndex === -1) {
					let newLocationData = {
						'id': currentLocationId,
						'name': currentLocationName,
						'recording_times': [{
							'departure_time': timeFormatted,
							'index': 0,
							'recordings': [recordings]
						}]
					};
					if (currentLocationId === 'home') {
						newLocationData['is_control'] = true
					}
					locations.push(newLocationData);
				} else {
					// We also need to check if the recording time slot already exists
					const previousRecordingTimes = locations[currentLocationsIndex]['recording_times'];
					let currentRecordingTimesIndex = '';
					let totalRecordingTimesIndex = '';
					for (var x = 0; previousRecordingTimes.length > x; x++) {
						if (previousRecordingTimes[x]['departure_time'] == timeFormatted) {
							currentRecordingTimesIndex = x;
							break;
						}
					}
					// If we didn't find a previous time slot then restructure our recordings object to include the new time
					if (currentRecordingTimesIndex === '') {
						recordings = {
							'departure_time': timeFormatted,
							'index': parseInt(previousRecordingTimes[previousRecordingTimes.length - 1]['index']) + 1,
							'recordings': [recordings]
						}
						locations[currentLocationsIndex]['recording_times'].push(recordings);
					} else {
						locations[currentLocationsIndex]['recording_times'][currentRecordingTimesIndex]['recordings'].push(recordings);
					}
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

console.log('waiting for pc to boot up');
setTimeout(function() {
	getTravelData();
}, 10000);