const fs  = require('fs');
const lineByLine = require('n-readlines');
const gtfsFieldChecker = require('../../mapping/gtfsFieldChecker.json');
const gtfsToRdf = require('../../mapping/gtfsToRdf.json');
const requiredFiles = [];
const optionalFiles = [];
const dirFiles = [];
const dirOptionalFiles = [];
let finalFiles;
function jsonFileCounter(){
	for (file in gtfsFieldChecker){
		if(gtfsFieldChecker[file]["type"] == "required")
			requiredFiles.push(file);
		else
			optionalFiles.push(file);
	}
}
function dirFileCounter(path){
	fs.readdirSync(path).forEach((file) => {
		let nameFile = file.split('.');
		dirFiles.push(nameFile[0]);
	});
}
function requiredFilesChecker(){
	let i = 0;
	while(i < requiredFiles.length && dirFiles.includes(requiredFiles[i])){
		i++;
	}
	return i == 0;
}
function optionalFileChecker(){
	optionalFiles.forEach(file => {
		if(dirFiles.includes(file))
			dirOptionalFiles.push(file);
	});
}
function sanitizeVerifiedFiles(){
	finalFiles = requiredFiles.concat(dirOptionalFiles);
}
function fieldChecker(path){
	let finalJson = {};
	let i = 0;
	let j = 0;
	let error = false
	while( i < finalFiles.length && !error){
		let requiredFields = getRequiredFields(finalFiles[i]);
		let filledFields = readFirstLine(path + finalFiles[i] + '.txt', requiredFields)
		error = filledFields.error && requiredFiles.includes(finalFiles[i]);
		if(filledFields.optionals.length > 0)
			finalJson[finalFiles[i]] = filledFields.optionals
		i++
	}
	if(error)
		return null;	
	return finalJson;

}
function getRequiredFields(file){
	let fields = gtfsFieldChecker[file]["fields"];
	let reqFields = [] //CARGAR LOS CAMPOS OBLIGATORIOS
	for(field in fields) {
		if(fields[field]["type"] == "required")
			reqFields.push(field);
	}
	return reqFields;
}
function readFirstLine(file, requiredFields){
	//CARGAR CAMPOS RELLENADOS Y COMPROBAR QUE FILE.FIELDS-INCLUDES(REQUIREDFILES)
	let liner = new lineByLine(file);
	let values= null;
	let line = liner.next();
	let filledFields = {
		'error':true,
		'optionals':[]
	}
	let i = 0;

	fields = line.toString('ascii').substring(3,line.length -1)
	fields = fields.split(',');
	if(values = liner.next()){
		values = values.toString('ascii').substring(0, values.length - 1)
		values  = values.split(',');
		//Borramos los campos vacios
		while(i < fields.length){
			if(values[i] != '' && values[i] != ' ')
				filledFields.optionals.push(fields[i]);
			i++;
		}
		i = 0;
		//Comprobamos que estan todos los campos obligatorios
		while(i < requiredFields.length && filledFields.optionals.includes(requiredFields[i])){
			i++;
		}
		if(i == requiredFields.length)
			filledFields.error = false;
		
	}
	return filledFields;
}
function mappingGenerator(jsonFile){
	//let filenames = Object.keys(jsonFile);
	let filenames = ['agency', 'trips', 'stops'];
	let subjectHead = gtfsToRdf["subjectHead"];
	let outputFile = 'remove.yarml';
	let prefix = Object.keys(gtfsToRdf["prefixs"])[0];
	let header  = `
prefixes:
  ${prefix} : ${gtfsToRdf["prefixs"][prefix]}
mappings:\n`
	fs.appendFile(outputFile, header, (err) => {
		if(err) console.log(err);
	});

	filenames.forEach(file => {
		console.log('file: ' + file);
		let source = `-[${file}.txt~txt]\n`;
		let type = gtfsToRdf["data"][file]["type"];
		let s  = `s: ${subjectHead}PAIS/CIUDAD/TTRANSPORT/${gtfsToRdf["data"][file]["link"]}\n`;
		let po = [];
		let poElement = `
  ${file}:
    sources:
     ${source}
    ${s}
    po:
      - [a, ${prefix}:${type}]\n`;
		fs.appendFile(outputFile, poElement, (err) =>{
			if(err) console.log(err);
		})
		jsonFile[file].forEach((field) => {
			if(field != gtfsToRdf["data"][file]["id"]){
			console.log("field: " + field);
			poElement = `      - [${prefix}:${gtfsToRdf["data"][file]["fields"][field]["rdf"]},$(${field})]\n`
			fs.appendFile(outputFile, poElement, (err) =>{
				if(err)
					console.log(err);
			});
			}
			//po.push(poElement);
		});
	});
}
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
let finalYarml = mappingGenerator(finalJson);
