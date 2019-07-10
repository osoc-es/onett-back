const fs  = require('fs');
const YAML = require('json2yaml')
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
function mappingGenerator(jsonFile, outputFileName){
	//let filenames = Object.keys(jsonFile);
	let jsonToYaml= {};
	let filenames = ['trips'];
	let subjectHead = gtfsToRdf["subjectHead"];
	let outputFile = outputFileName + '.yarml';
	let prefixArray = Object.keys(gtfsToRdf["prefixs"]);//PENSAR COMO HACER DISPLAY DE VARIOS PREFIJOS.
	let prefixsStr = '';
	jsonToYaml["prefixes"] = {};
	prefixArray.forEach(prefix => {
		console.log(prefix);
		jsonToYaml["prefixes"][prefix] = gtfsToRdf["prefixs"][prefix];
		prefisxsStr = ` ${prefix} : ${gtfsToRdf["prefixs"][prefix]}\n`
	})
	jsonToYaml["mappings"] = {}
/*	
	let header  = `
prefixes:
  ${prefixsStr}
mappings:\n`
*/
	/*
	fs.appendFile(outputFile, header, (err) => {
		if(err) console.log(err);
	});*/
//GENERAMOS EL EQUIVALENTE EN YARML DE CADA UNO DE LOS ARCHIVOS VERIFICADOS QUE HEMOS DESCOMPRIMIDO.
	filenames.forEach((file) => {
		console.log('file: ' + file);
		jsonToYaml["mappings"][file] = {};
		let source = `[${file}.txt~txt]`;
		let type = gtfsToRdf["data"][file]["type"];
		let typePrefix = gtfsToRdf["data"][file]["typePrefix"];
		let s  = `${subjectHead}PAIS/CIUDAD/TTRANSPORT/${gtfsToRdf["data"][file]["link"]}$(${gtfsToRdf["data"][file]["id"]})`;
		let fieldsElements = Object.keys(gtfsToRdf["data"][file]["fields"]);
		let joinsFields = gtfsToRdf["data"][file]["joins"]["fields"];
		let pType = ["a",`${typePrefix}:${type}`]; 
		let joinsElements = '';
		console.log(joinsFields)
		if(type == "")
			pType = "";
/*		
		let poElement = `
  ${file}:
    sources:
     ${source}
    ${s}
    po:
${pType}`;
*/		
		jsonToYaml["mappings"][file]["sources"] = [[source]];
		jsonToYaml["mappings"][file]["s"] = s;
		jsonToYaml["mappings"][file]["po"] = [];
		//USAMOS EL JSON gtfsToRdf PARA SELECCIONAR QUE REGLAS DEL MAPPING VA A USAR EL ENGINE DE YARML TO RDF
		jsonFile[file].forEach((field) => {
			if(fieldsElements.includes(field)){
				console.log("field: " + field);
				let prefix = gtfsToRdf["data"][file]["fields"][field]["prefix"];
				//poElement += `      - [${prefix}:${gtfsToRdf["data"][file]["fields"][field]["rdf"]},$(${field})]\n`
				jsonToYaml["mappings"][file]["po"].push(`[${prefix}:${gtfsToRdf["data"][file]["fields"][field]["rdf"]},$(${field})]`);
			}if(joinsFields.includes(field)){
				let pObject = {};
				console.log("ENtro");
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
						mapObject["condition"]["parameters"].push([parameter,`$(${gtfsToRdf["data"][file]["joins"]["p"][pName]["o"]["mapping"][mapping]["parameters"][parameter]["value"]})`]);
					}
					pObject["o"].push(mapObject);
				}
				jsonToYaml["mappings"][file]["po"].push(pObject);
				/*
				let params = mapping["parameters"].forEach((param) => {
						let paramStr = `- [${param}, ${mapping["parameter"][param]}]`
						return paramStr;
					});
				joinsElement += `- p: ${prefix} : pName\n` + 
						`  o:\n`+
						`    - mapping: ${}`
				*/
			}
		});
	});
	let Yaml = YAML.stringify(jsonToYaml);
	console.log(Yaml);
	fs.appendFile(outputFile, Yaml, (err) =>{
		if(err)
			console.log(err);
	})
}
/*
module.exports = {
	jsonFileCounter, 
	dirFileCounter,
	requiredFilesChecker,
	optionalFileChecker,
	sanitizeVerifiedFiles,
	fieldChecker,
	mappingGenerator
}
*/

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
