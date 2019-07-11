const fs  = require('fs');
const YAML = require('yaml')
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
	console.log(requiredFiles);
	console.log(dirFiles)
	return i == requiredFiles.length;
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
		let filledFields = readFirstLine(path + finalFiles[i] + '.csv', requiredFields)
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

	fields = line.toString('ascii')
	console.log(fields);
	fields = fields.replace("\r", ""); 
	fields = fields.replace("\n", "");
	fields = fields.split(',');
	console.log(fields)
	if(values = liner.next()){
		values = values.toString('ascii').substring(0, values.length - 1)
		values = values.replace("\n", "");
		values = values.replace("\r", "");
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
function mappingGenerator(jsonFile, outputFileName, path, extension){
	let filenames = Object.keys(jsonFile);
	let jsonToYaml= {};
	let subjectHead = gtfsToRdf["subjectHead"];
	let outputFile = outputFileName + '.yaml';
	let prefixArray = Object.keys(gtfsToRdf["prefixs"]);//PENSAR COMO HACER DISPLAY DE VARIOS PREFIJOS.
	let prefixsStr = '';
	jsonToYaml["prefixes"] = {};
	prefixArray.forEach(prefix => {
		jsonToYaml["prefixes"][prefix] = gtfsToRdf["prefixs"][prefix];
	})
	jsonToYaml["mappings"] = {}
//GENERAMOS EL EQUIVALENTE EN YARML DE CADA UNO DE LOS ARCHIVOS VERIFICADOS QUE HEMOS DESCOMPRIMIDO.
	filenames.forEach((file) => {
		jsonToYaml["mappings"][file] = {};
		let source = `[${path}${file}.${extension}~${extension}]`;
		let type = gtfsToRdf["data"][file]["type"];
		let typePrefix = gtfsToRdf["data"][file]["typePrefix"];
		let s  = `${subjectHead}PAIS/CIUDAD/TTRANSPORT/${gtfsToRdf["data"][file]["link"]}$(${gtfsToRdf["data"][file]["id"]})`;
		let fieldsElements = Object.keys(gtfsToRdf["data"][file]["fields"]);
		let joinsFields = gtfsToRdf["data"][file]["joins"]["fields"];
		let pType = `[a, ${typePrefix}:${type}]`; 
		let joinsElements = '';

		jsonToYaml["mappings"][file]["sources"] = [source];
		jsonToYaml["mappings"][file]["s"] = s;
		jsonToYaml["mappings"][file]["po"] = [];
		if(type != "")
			jsonToYaml["mappings"][file]["po"].push(pType);
		//USAMOS EL JSON gtfsToRdf PARA SELECCIONAR QUE REGLAS DEL MAPPING VA A USAR EL ENGINE DE YARML TO RDF
		jsonFile[file].forEach((field) => {
			if(fieldsElements.includes(field)){
				console.log("field: " + field);
				let prefix = gtfsToRdf["data"][file]["fields"][field]["prefix"];
				let rdfValue = `${gtfsToRdf["data"][file]["fields"][field]["rdf"]}`;
				if(rdfValue != "")
					jsonToYaml["mappings"][file]["po"].push(`[${prefix}:${rdfValue}, $(${field})]`);
			}
		});
		jsonFile[file].forEach((field) => {
			if(joinsFields != undefined && joinsFields.includes(field)){
				let pObject = {};
				let pName = Object.keys(gtfsToRdf["data"][file]["joins"]["p"])[joinsFields.indexOf(field)];
				let pPrefix = gtfsToRdf["data"][file]["joins"]["p"][pName]["prefix"];
				let mappings = gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"];
				pObject["p"] = pPrefix +":" +pName;
				pObject["o"] = [];
				for (mapping in mappings){
					let mapObject = {};
					mapObject["mapping"] = mapping;
					mapObject["condition"] = {};
					mapObject["condition"]["function"] = gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["function"];
					mapObject["condition"]["parameters"] = [];
					for (parameter in gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["parameters"]){
						mapObject["condition"]["parameters"].push(`[${parameter}, $(${gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["parameters"][parameter]["value"]})]`);
					}
					pObject["o"].push(mapObject);
				}
				jsonToYaml["mappings"][file]["po"].push(pObject);
			}
		});
	});
	let Yaml = YAML.stringify(jsonToYaml, options={'anchorPrefix':'a0'});
	let sanitizedYaml = '';
	for(i in Yaml){
		if(Yaml[i] != '\"')
			sanitizedYaml += Yaml[i];
	}
	console.log(sanitizedYaml);
	fs.writeFile(outputFile, sanitizedYaml, (err) =>{
		if(err)
			console.log(err);
	})
}
async function dynamicRdfMapGenerator(path, outputFileName){
	let finalYarrrml = null;
	await jsonFileCounter();
	await dirFileCounter(path);
	if(requiredFilesChecker()){
		await	optionalFileChecker();
		await	sanitizeVerifiedFiles();
		let finalJson = fieldChecker(path);
		finalYarrrml = await mappingGenerator(finalJson, outputFileName, path, 'csv');
	}else{
	console.log("Algo salio mal...");
	}
	return finalYarrrml;
}
dynamicRdfMapGenerator('/home/w0xter/Desktop/gtfs/gtfs2/', 'works'), 
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
