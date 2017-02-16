'use strict';

const request = require('request');
const fs = require('fs')

// Load Configuration Variables
let configVars = require('../config/configVars.json');

let apiController = {

	// Submit OAuth credentials and obtain token
	auth : function (req, res, next) {

		// Build oauth URL path
		let authURL = configVars.oauthHost + configVars.oauthURL + "?client_id=" + configVars.apiKey + "&client_secret=" + configVars.apiSecret + "&grant_type=client_credentials";
	
		if (req.body.accessKey == configVars.accessKey) {

			request.post(authURL, function (err, resp, data) {

				let token = JSON.parse(data).access_token;

				if (err) throw err;
				
				// Add returned oath token to request body
				req.body.token = token;

				next();
			});
		}
		else {

			console.log('REQUEST DECLINED ');
			console.log(req.body);
			console.log(req.headers);
			res.sendStatus(401);
		}
	},
	query : function (req, res, next) {

		// Create variable that will hold the URI encoded string for submission to the API
		let lookupValue = '';

		// Preferred search is name & email address
		if (req.body.firstName && req.body.lastName && req.body.email) {
			
			let name = req.body.firstName + ' ' + req.body.lastName;
			let email = req.body.email;
		
			lookupValue = encodeURIComponent(name.toLowerCase() + ' ' + email.toLowerCase());
		
		}
		// If email is missing, search by name and address
		else if (req.body.firstName && req.body.lastName && req.body.address && req.body.city && req.body.state && req.body.zip) {

			let name = req.body.firstName + ' ' + req.body.lastName;
			let address = req.body.address + ' ' + req.body.city + ' ' + req.body.state;
			let zip = req.body.zip;
		
			lookupValue = encodeURIComponent(name.toLowerCase() + ' ' + address.toLowerCase().replace(/[. ]+/g, ' ').trim() + ' ' + zip);
		
		}
		// If name is missing search by email address only
		else lookupValue = encodeURIComponent(req.body.email);

		// Submit token to retrieve marketing data
		request({
			url: configVars.apiHost + configVars.endpoint + lookupValue + configVars.params,
			headers: {'Authorization':'Bearer ' + req.body.token},
			method: 'GET'
		}, function (err, resp, body) {

			// console.log(JSON.parse(body).group.people);

			if (JSON.parse(body).error) {

				// If error, add error message to request body
				req.body.error = JSON.parse(body).error.message;

				next();
			}
			else {

				let cluster = JSON.parse(body).group.people[0].person.personicxLifestage.lifestageCluster;
				let group = JSON.parse(body).group.people[0].person.personicxLifestage.lifestageGroup;

				// Else add Lifestage data to request body
				req.body.lifestageCluster = cluster;
				req.body.lifestageGroup = group;

				req.body.lookupValue = lookupValue;
				
				next();
			}
		});
	},
	update : function (req, res) {

		// Return retrieved data for matching and updating
		request({
			url: configVars.updateURL,
			headers: {'Content-type':'application/json'},
			method: 'POST',
			body: JSON.stringify(req.body)
		}, function (err, resp, body) {

			let fileName = './data/' + req.body.contactId + '.json';
			
			// Write submitted data to file 
			fs.writeFile(fileName, JSON.stringify(req.body), (err) => {
				if (err) throw err;
			});

			// If POST request is accepted, update status.log file
			if (resp.statusCode == 200) {
				
				// If an error is returned, log error
				if (req.body.error) {
				
					fs.appendFile('./data/status.log', 'Contact ' + req.body.contactId + ' returned the error - ' + req.body.error + '\n');
				
				}
				else {
					
					fs.appendFile('./data/status.log', fileName + ' updated successfully!' + '\n');

				}
			}
			else {
				
				// Else, update status.log with failure information
				fs.appendFile('.data/status.log', 'Error updating file ' + filename + ' ' + err + '\n' );
			
			}

			res.sendStatus(200);

		});
	}
}

module.exports = apiController;