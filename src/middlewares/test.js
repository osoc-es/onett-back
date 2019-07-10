//const YAML = require('json2yaml');
const YAML = require('yaml');
jFile  = {
  "prefixes" : {
    "prefixName":"prefixValue"
    },
  "mappings": {
    "fileName": {
      "sources": ["fileSource~FileExtension"],
      "s": "GlobalLink/TYPE/$(ID)",
      "po": [
          "[PREFIX:RDF_EQUIVALENT, $(GTFS_FIELD_NAME)]",
        {
          "p": "PREFIX:pNAME",
          "o": [
            {
              "mapping": "MAPPING[i]",
              "condition": {
                "function": "FUNCTION_VALUE",
                "parameters": [
                    "[PARAMETERS[i],$(PARAMETERS[i].VALUE)]"
                ]
              }
            }
          ]
        }
      ]
    }
  }
};
//console.log(jFile);
let yaml = YAML.stringify(jFile);
let sanitizedYaml = "";
for(i in yaml) {
	if(yaml[i] != '\"')
		sanitizedYaml += yaml[i];
}
console.log(sanitizedYaml);

