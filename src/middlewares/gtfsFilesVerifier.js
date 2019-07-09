const fs  = require('fs');
const lineByLine = require('n-readlines');

const gtfsFieldChecker = require('../../mapping/gtfsFieldChecker.json');
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
		let optionalFields = readFirstLine(path + finalFiles[i] + '.txt', requiredFields)
		error = optionalFields.error && requiredFiles.includes(finalFiles[i]);
		finalJson[finalFiles[i]] = optionalFields.optionals;
		i++
	}
	console.log(finalJson);
	return error;

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
	let optionalFields = {
		'error':false,
		'optionals':[]
	}
	let i = 0;

	fields = line.toString('ascii').substring(3,line.length -1)
	fields = fields.split(',');
	if(values = liner.next()){
		values = values.toString('ascii').split(',');
		//Borramos los campos vacios
		while(i < fields.length){
			if(values[i] != '')
				optionalFields.optionals.push(fields[i]);
			i++;
		}
		i = 0;
		//Comprobamos que estan todos los campos obligatorios
		while(i < requiredFields.length && optionalFields.optionals.includes(requiredFields[i])){
			i++;
		}
		if(i == requiredFields.length){
			//Borramos los campos obligatorios si esta todo correcto.
			requiredFields.forEach((field) => {
				optionalFields.optionals.splice(optionalFields.optionals.indexOf(field), 1);
			});
		}else{
			optionalFields.error = true;
		}
		
	}
	return optionalFields;
}
function yarmlGenerator(jsonFile){
	
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
fieldChecker('uploads/CTRM_Madird_Spain_862019153/');
