const fs  = require('fs');
const { execFile } = require('child_process');const YAML = require('yaml')
const yarrrml = require('@rmlio/yarrrml-parser/lib/yarrrml2rml');
const lineByLine = require('n-readlines');
const gtfsFieldChecker = require('../../mapping/gtfsFieldChecker.json');
const gtfsToRdf = require('../../mapping/gtfsToRdf.json');
const y2r = new yarrrml();
let requiredFiles = null;
let optionalFiles = null;
let dirFiles = null;
let dirOptionalFiles = null;
let filesExtensions = null;
let finalFiles = null;
let warning = "";
const RdfizzerPath = "/home/w0xter/Desktop/Rdfizzer/TIB-RDFizer";

function jsonFileCounter(){
	try{
		let promise =  new Promise((resolve, reject) => {
			if(Object.keys(gtfsFieldChecker).length > 0){
				for (file in gtfsFieldChecker){
					if(gtfsFieldChecker[file]["type"] == "required"){
						requiredFiles.push(file);
					}
					else{
						optionalFiles.push(file);
					}
				}
				console.log("required Files: " + requiredFiles.toString());
				console.log("OptionalFiles " + optionalFiles.toString());
				resolve ("GtfsFieldChecker loaded");
			}else{
				console.log("Falla jsonFileCounter");
				reject ("Falla jsonFileCounter");
			}
		});
		return promise;
	}catch(error){
		console.log(error);
		console.log("Falla jsonFileCounter");
		return error;

	}
		
}
function dirFileCounter(path){
	try{
		let promise =  new Promise((resolve, reject) => {
			let files = fs.readdirSync(path);
			if(files != null && files.length > 0){
			files.forEach((file) =>{
				let lower = file.toLocaleLowerCase().substring(0, file.length - 4) + '.csv';
				fs.rename(path+file, path+lower, function(err) {
					if ( err ) console.log('ERROR: ' + err);
				});
				let nameFile = lower.split('.');
				filesExtensions.push('csv');
				dirFiles.push(nameFile[0]);
			});
				console.log("Dir files: " + dirFiles.toString());
				resolve (filesExtensions[0]);
			}else{
				console.log("Falla dirFileCounter");
				reject ("Falla dirFileCounter");
				
			}
		});
		return promise;
	}catch(error){
		console.log("Falla jsonFileCounter");
		console.log(error);
		return error;

	}
		
}
function requiredFilesChecker(){
	try{
		let promise =  new Promise((resolve, reject) => {
			let i = 0;
			while(i < requiredFiles.length && dirFiles.includes(requiredFiles[i])){
				i++;
			}
			//console.log(requiredFiles);
			//console.log(dirFiles)
			if(i == requiredFiles.length)
				resolve ("All the required Files are include");
			else{
				console.log("Falla requiredFilesChecker falta " + requiredFiles[i]);
				reject ("Falla requiredFilesChecker falta " + requiredFiles[i]);
		}
	});
		return promise;
	}catch(error){
		console.log("Falla requiredFilesChecker");
		console.log(error);
		return error;

	}
}
function optionalFileChecker(){
	try{
		let promise =  new Promise((resolve, reject) => {
			optionalFiles.forEach(file => {
				if(dirFiles.includes(file))
					dirOptionalFiles.push(file);
			});
			if(optionalFiles.length > 0)
				resolve ("The optionals files are checked");
			else{
				console.log("Falla optionalFileChecker");
				reject("Falla optionalFileChecker");
			}
		});
		return promise;
	}catch(error){
		console.log(error);
		console.log("Catch: Falla optionalFileChecker");
		return error;
	}
}
function sanitizeVerifiedFiles(){
	try{
		let promise =  new Promise((resolve, reject) => {
		if(requiredFiles.length > 0){
			finalFiles = requiredFiles.concat(dirOptionalFiles);
			resolve ("Dir files Sanitized");
		}else{
			console.log("Falla sanitizeVerifiedFiles");
			reject ("Falla sanitizeVerifiedFiles");
		}
	});
	return promise;
	}catch(error){
		console.log("Falla sanitizeVerifiedFiles");
		console.log(error);
		return error;

	}
}

async function fieldChecker(path, extension){
	try{
		let promise =  await new Promise(async (resolve, reject) => {
	try{
		let finalJson = {};
		let error = false
			for( let i = 0; i < finalFiles.length; i++){
				let file =  finalFiles[i];
				getRequiredFields(finalFiles[i]).then((data) => {
					return readFirstLine(path, file, data, extension);
				}).then(async (data) => {
					try{
					if(data.length > 0){
						console.log(file + ":" + data.toString())
						finalJson[file] = await data;
					}else{
						console.log("Algo salio mal con: " + file + " ha devuelto" + data.toString())
						error = true;
					}
					/*
					else if(optionalFiles.includes(file)  && data.length == 0){
						finalFiles.splice(indexOf(file),1);
						console.log("Borramos " + file);
						warning += "El formato de " + file + " no era correcto por lo que se ha usado para generar el RDF.\n";
					}*/
					}catch(error){
						console.log("Falla fieldChecker 1");
						return(error)
					}
				})
				.catch((err) => {
					console.log(err);
					error = true;
					return err;
				});
				if(error)
					break;
			}
		if(error){
			console.log("Falla fieldChecker");
			reject ("Falla fieldChecker");
		}
		else{
			console.log(warning)
			resolve (finalJson);
		}
	}catch(error){
		reject(error);
	}
	});
		return promise;
	}catch(err){
		console.log("Catch: Falla fieldChecker");
		console.log(err);
		return err;
	}
}
function getRequiredFields(file){
	try{
		let promise = new Promise((resolve, reject) => {
			let fields = gtfsFieldChecker[file]["fields"];
			let reqFields = [] //CARGAR LOS CAMPOS OBLIGATORIOS
			for(field in fields) {
				if(fields[field]["type"] == "required")
					reqFields.push(field);
			}
			resolve(reqFields);
		});
		return promise;
	}catch(error){
		console.log("Falla get requiredFields");
		console.log(error);
		return error;
	}
}
function readFirstLine(path, filename, requiredFields, extension){
	try{
		let promise = new Promise((resolve, reject) => {
			let file = path  + filename;
			//CARGAR CAMPOS RELLENADOS Y COMPROBAR QUE FILE.FIELDS-INCLUDES(REQUIREDFILES)
			let liner = new lineByLine(file + "." + extension);
			let values= null;
			let line = liner.next();
			let filledFields = [];		
			fields = line.toString('ascii').replace("\r", "").replace("\n", "");
			
			if(fields.startsWith('o;?')){
				fields = fields.substring(3,fields.length);
			}
			fields = fields.split(',');
			if(values = liner.next()){
				values = values.toString('ascii').replace("\n", "").replace("\r", "").split(',');
				//Borramos los campos vacios
				for(i in fields){
					if(values[i] != '' && values[i] != ' ' && Object.keys(gtfsFieldChecker[filename]["fields"]).includes(fields[i])){
						filledFields.push(fields[i]);
					}
				}
				//Comprobamos que estan todos los campos obligatorios
				let j = 0;
				while(j < requiredFields.length && filledFields.includes(requiredFields[j])){
					j++;
				}
				if(j != requiredFields.length){
					/*if(optionalFiles.includes(filename)){
						console.log("Falta un campo obligatorio en " + filename + ": " +  requiredFields[j])
						requiredFields = [];
						resolve(requiredFields);
					}else{
						reject("The required Fields of " + filename + " are not included")
					} */
					reject("The required Fields of " + filename + " are not included")

				}else{
					resolve(filledFields);
				}
			}else if (requiredFields.includes(filename)){
				console.log("Falla readFirstLine");
				reject("The Values are empty.")
			}
		});
		return promise;

	}catch(error){
		console.log("Catch: Falla readFirstLine")
		console.log(error);
		return error;
	}
}
async function mappingGenerator(jsonFile, outputFileName, path, extension, country, city, transport){
	try{
		let promise  = await new Promise(async (resolve, reject) => {
			try{
			let filenames = Object.keys(jsonFile).toString();
			filenames = filenames.replace(" ", "").split(",");
			console.log("Generating mapping with " + filenames.toString() + ": " + filenames.length);
			let jsonToYaml= {};
			let subjectHead = gtfsToRdf["subjectHead"];
			let outputFile = outputFileName + '.yaml';
			let prefixArray = Object.keys(gtfsToRdf["prefixs"]);//PENSAR COMO HACER DISPLAY DE VARIOS PREFIJOS.
			jsonToYaml["prefixes"] = {};
			await prefixArray.forEach(prefix => {
				jsonToYaml["prefixes"][prefix] = gtfsToRdf["prefixs"][prefix];
			})
			jsonToYaml["mappings"] = {}
		//GENERAMOS EL EQUIVALENTE EN YARML DE CADA UNO DE LOS ARCHIVOS VERIFICADOS QUE HEMOS DESCOMPRIMIDO.
			 for ( let i = 0; i < filenames.length; i++){
				let file = await filenames[i];
				if(file != undefined && file != null){
				console.log("Generating: " + file)
				jsonToYaml["mappings"][file] = {};
				let source = await `[/app/data/${file}.${extension}~csv]`;
				let type = await gtfsToRdf["data"][file]["type"];
				let typePrefix = await gtfsToRdf["data"][file]["typePrefix"];
				let s  = await `${subjectHead}${country}/${city}/${transport}/${gtfsToRdf["data"][file]["link"]}$(${gtfsToRdf["data"][file]["id"]})`;
				let fieldsElements = await Object.keys(gtfsToRdf["data"][file]["fields"]);
				let joinsFields = await gtfsToRdf["data"][file]["joins"]["fields"];
				let pType = await `[a, ${typePrefix}:${type}]`; 
	
				jsonToYaml["mappings"][file]["sources"] = await [source];
				jsonToYaml["mappings"][file]["s"] = await s;
				jsonToYaml["mappings"][file]["po"] = await [];
				if(type != "")
					jsonToYaml["mappings"][file]["po"].push(pType);
				//USAMOS EL JSON gtfsToRdf PARA SELECCIONAR QUE REGLAS DEL MAPPING VA A USAR EL ENGINE DE YARML TO RDF
				 await jsonFile[file].forEach((field) => {
					if(fieldsElements.includes(field)){
						//console.log("field: " + field);
						let prefix = gtfsToRdf["data"][file]["fields"][field]["prefix"];
						let rdfValue = `${gtfsToRdf["data"][file]["fields"][field]["rdf"]}`;
						if(rdfValue != "")
							  jsonToYaml["mappings"][file]["po"].push(`[${prefix}:${rdfValue}, $(${field})]`);
					}
				});
				 jsonFile[file].forEach(async (field) => {
					try{
					if(Object.keys(gtfsToRdf["data"][file]["joins"]).length > 0 && joinsFields.includes(field)){
						let pObject =  {};
						let pName = await  Object.keys(gtfsToRdf["data"][file]["joins"]["p"])[joinsFields.indexOf(field)];
						let pPrefix = await gtfsToRdf["data"][file]["joins"]["p"][pName]["prefix"];
						let mappings = await gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"];
						pObject["p"] = await pPrefix + ":" + pName;
						pObject["o"] = await   [];
						for (let i = 0; i < Object.keys(mappings).length;i++){
							let mapping = await Object.keys(mappings)[i];
							let mapObject = await {};
							mapObject["mapping"] = await mapping;
							mapObject["condition"] = await {};
							mapObject["condition"]["function"] = await gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["function"];
							mapObject["condition"]["parameters"] = await [];
							for (parameter in gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["parameters"]){
								await mapObject["condition"]["parameters"].push(`[${parameter}, $(${gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["parameters"][parameter]["value"]})]`);
							}
							await pObject["o"].push(mapObject);
						}
						await jsonToYaml["mappings"][file]["po"].push(pObject);
					}
				 }catch(error){
					 console.log('Catch: Fallo en mapping generator 2 ' + file + ":" +  field );
					reject(error)
				 }
				});
			}
			}
			let Yaml = YAML.stringify(jsonToYaml);
			let sanitizedYaml = "";
			let result = {
				"warning":"",
				"yarrrml":"",
				"error":"",
				"path":"",
				"file":""
			};
			result.path = path;
			result.file = outputFileName;
			for (chr in Yaml){
				if(Yaml[chr] != "\"" && Yaml[chr] != "\'")
					sanitizedYaml +=   Yaml[chr];
			}
			result.warning = warning;
			result.yarrrml = sanitizedYaml;
			fs.writeFile(path + outputFile, sanitizedYaml, (err) =>{
				if(err){
					console.log(err);
					result.error = err;
					reject(result);
				}
			});
			resolve(result);
		}catch(error){
			console.log('Catch: Fallo en mapping generator 1');
			reject(error);
		}
		});
		return promise;
	}catch(error){
		console.log(error);
	}
}
function yarrrmlToRml(data){
	try{
		let promise = new Promise(async (resolve, reject) => {
			try{
			if(data.path != undefined && data.path != null && data.file != undefined && data.file != null)
			execFile('./bashScripts/yarrrmlToRdf.sh', [data.path, data.file, RdfizzerPath], (error, stdout, stderr) => {
				if (error) {
					console.log(error);
				  reject(error);
				}
				console.log(stdout);
				data.rdfizzer = RdfizzerPath;
				resolve(data);
			  });
			}catch(error){
				console.log("Catch: Falla yarrrmlToRdf 1");
				reject(error);
			}
			});
		return promise;
	}catch(error){
		console.log("Catch: Falla yarrrmlToRdf")
		console.log(error);
		return error;

	}

}
function mvFileToRdfizzer(path, data){
	try{
		let promise = new Promise(async (resolve, reject) => {
			try{
			console.log(finalFiles)
			await finalFiles.forEach(async (file) => {
				try{
					let actualPath = path + file + '.' + filesExtensions[0];
					let newPath = `${RdfizzerPath}/data/${file}.${filesExtensions[0]}`
					await fs.copyFile(actualPath, newPath, function (err) {
						if (err) {
								reject(err);
						}
					});	
					resolve(data);
				}catch(error){
					console.log("Catch: falla mvFile 2");
					reject(error);
				}
			});
		}catch(error){
			console.log("Catch: falla mvFile 1");
			reject(error);
		}
		});
		return promise;
	}catch(error){
		console.log("Catch: falla mvFile");
		console.log(error);
		return error;
	}
}
async function dynamicRdfMapGenerator(path, outputFileName, country, city, transport){
	try{
		requiredFiles = [];
		optionalFiles = [];
		dirFiles = [];
		dirOptionalFiles = [];
		filesExtensions = [];
		finalFiles = [];
		return jsonFileCounter().then((data) => {
			console.log(data);
			return dirFileCounter(path);
		}).then((data) => {
			console.log(data);
			return  requiredFilesChecker();
		}).then((data) => {
			console.log(data);
			return optionalFileChecker();
		}).then((data) => {
			console.log(data);
			return sanitizeVerifiedFiles();
		}).then((data) => {
			console.log(data);
			return fieldChecker(path, filesExtensions[0]);
		}).then((data) => {
			console.log("Saves in " + outputFileName)
			console.log(data)
			return  mappingGenerator(data, outputFileName, path, filesExtensions[0], country, city, transport);
		}).then((data) => {
			return mvFileToRdfizzer(path, data);
		}).then((data) => {
			return yarrrmlToRml(data);
		}).catch((error) => {
			console.log("Fallo la promesa: " + error);
			return error;
		});

}catch (error){
	console.log("Fallo la promesa: " + error);
}
}
//dynamicRdfMapGenerator('/home/w0xter/Desktop/gtfs/gtfs2/', 'works'), 
module.exports = dynamicRdfMapGenerator;
/*
jsonFileCounter();
dirFileCounter('uploads/CTRM_Madird_Spain_862019153/');
if(requiredFilesChecker){
	console.log("Todos los archivos obligatorios bien");
}else{
	console.log("Error, faltan archivos obligatorios");
}

optionalFileChecker();
sanitizeVerifiedFiles();
let finalJson = fieldChecker('uploads/CTRM_Madird_Spain_862019153/');
let finalYarml = mappingGenerator(finalJson, "works");
*/
