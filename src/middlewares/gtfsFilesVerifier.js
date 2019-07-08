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
	console.log("Requireds: \n");
	console.log(requiredFiles);
	console.log("Optional:\n");
	console.log(optionalFiles);
}
function dirFileCounter(path){
	fs.readdirSync(path).forEach((file) => {
		let nameFile = file.split('.');
		dirFiles.push(nameFile[0]);
	});
	console.log("Dir Files");
	console.log(dirFiles);
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
	console.log("Dir Optional Files");
	console.log(dirOptionalFiles);
}
function sanitizeVerifiedFiles(){
	finalFiles = requiredFiles.concat(dirOptionalFiles);
	console.log("Final Files");
	console.log(finalFiles)
}
function fieldChecker(path){
	let finalJson = {};
	let i = 0;
	let j = 0;
	let error = false
	let line = null;
	while( i < finalFiles.length && !error){
		requiredFiles = getRequiredFiles(finalFiles[i]);
		line = readFirstLine(path + finalFiles[i] + '.txt')
		//error = line.error;
		//finalJson.finalFiles[i] = line.optFields;
		i++
	}
	return error;

}
function getRequiredFiles(file){
	let fields = gtfsFieldChecker[file][fields];
	let reqFields = '' //CARGAR LOS CAMPOS OBLIGATORIOS
	return reqFiles;
}
function readFirstLine(file, requiredFields){
	//CARGAR CAMPOS RELLENADOS Y COMPROBAR QUE FILE.FIELDS-INCLUDES(REQUIREDFILES)
	let liner = new lineByLine(file);
	console.log(file);
	console.log("Fields");
	let line = liner.next();
	fields = line.toString('ascii').substring(3,line.length -1)
	fields.split(',');

	console.log(fields);
	let values 
	if(values = liner.next()){
		values = values.toString('ascii').split(',');
		console.log("Values");
		console.log(values);
	}
	/*
	while(i < 2){
		line = liner.next();
		line.toString('ascii').substring(3, line.length - 1);
		i++;
	}*/
	return line;
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
