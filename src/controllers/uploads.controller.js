	const unzipper = require('unzipper')
	const fs = require('fs');
	const gtfsToRdf = require('../middlewares/gtfsFilesVerifier');
        function unzip(inputPath, outputPath){
                let promise = new Promise((resolve, reject) => {
                        fs.createReadStream(inputPath)
                        .pipe(unzipper.Extract({path:outputPath}))
                        .promise().then(() => resolve('unzziped'));
                })
                return promise;
        }
        function makeDir(dirName){
                let promise = new Promise((resolve, reject) => {
                        let filename = './uploads/' + dirName;       
                        if(fs.existsSync(filename)){
                                dirName = dirName + Date.now().toString();
                        }
                        filename = './uploads/' + dirName;                        
                        fs.mkdirSync(filename);
                        resolve(dirName);

                });
                return promise;

        }
        function mvFile(oldPath, newPath){
                fs.rename(oldPath, newPath, function (err) {
                        if (err) {
                                return(err);
                        }
                });
                return;
        }

        function gtfsVerifier(zipname, country, transport, city, agency){
                let yarrrmlFile = null;
                let filename = zipname.substring(0, zipname.length-4);

                return makeDir(filename).then((data) => {
                        filename = data.toString();
                        console.log(data);
                        return unzip(`./uploads/${zipname}`, `./uploads/${filename}/`)
                }).then((data) => {
                        console.log(data);
                        console.log(filename)
                        return gtfsToRdf(`./uploads/${filename}/`, filename, country, city, transport);
                }).catch((error) => {
                        console.log(error)
                });
        }
        exports.test = function test(req, res){
                res.send("Ok");
                console.log("Works!");
        }
        exports.uploadFile = function uploadFile(req, res){
                console.log(req.body);
                let country  = req.body.country.toString();
		let transport = req.body.transport.toString();	
                let city = req.body.city.toString();
                let agency = req.body.agency.toString();
                let date = Date.now();
                let filename = req.body.filename.toString();
                gtfsVerifier(filename, country, transport, city, agency).then((data) =>{
                        console.log('Data: ' + data)
                        if(data.rdfizzer != null && data.rdfizzer != undefined){
                                console.log('Descargamos')
                                res.download(`${data.rdfizzer}/results/result-1.nt`, `${country}_${city}_${agency}_${transport}.nt`);
                        }
                }).catch((error) =>{
                        console.log(error);
                        return res.status(500).send({"result":error});
                }); 
        }

