  const multer = require('multer');	
	exports.test = function test(req, res){
		res.send("Ok");
		console.log("Works!");
	}
	exports.uploadFile = function uploadFile(req, res){
		console.log(req.body);
		let country  = req.body.country.toString();
		let city = req.body.city.toString();
		let agency = req.body.agency.toString();
		let date = Date.now();
     		res.status(200).send({'country':country, 'city':city, 'agency':agency, 'date':date});
	}

