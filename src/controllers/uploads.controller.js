	const unzipper = require('unzipper')
	const fs = require('fs');
	const gtfsToRdf = require('../middlewares/gtfsFilesVerifier');
        function unzip(inputPath, outputPath){
                fs.createReadStream(inputPath)
                .pipe(unzipper.Extract({path:outputPath}));
        }
        function makeDir(dirName){
                dirName = './uploads/' + dirName;
                if(!fs.existsSync(dirName)){
                        fs.mkdirSync(dirName);
                }
        }
        function mvFile(oldPath, newPath){
                fs.rename(oldPath, newPath, function (err) {
                        if (err) {
                                return(err);
                        }
                });
                return;
        }

        async function gtfsVerifier(zipname){
                let filename = zipname.substring(0, zipname.length-4);
                makeDir(filename);
                unzip(`./uploads/${zipname}`, `./uploads/${filename}/`);
		gtfsToRdf(`./uploads/${filename}`, filename);
        }
        exports.test = function test(req, res){
                res.send("Ok");
                console.log("Works!");
        }
        exports.uploadFile = async function uploadFile(req, res){
                console.log(req.body);
                let country  = req.body.country.toString();
                let city = req.body.city.toString();
                let agency = req.body.agency.toString();
                let date = Date.now();
                let filename = req.body.filename.toString();
                res.status(200).send({'country':country, 'city':city, 'agency':agency, 'date':date, 'filename':filename});
                await gtfsVerifier(filename);

        }

