#!/bin/sh
INPUT=$1$2.yaml
OUTPUT=/home/w0xter/Desktop/Rdfizzer/TIB-RDFizer/mappings/mapping.rml.ttl
sed -i '1s/^\xEF\xBB\xBF//' /home/w0xter/Desktop/Rdfizzer/TIB-RDFizer/data/*.csv
yarrrml-parser -i $INPUT -o $OUTPUT
while true; do
       if test -e $OUTPUT; then
	       echo salgo!!
               break
       fi

done
#if test -e $OUTPUT; then
#	ls ~/Desktop/Rdfizzer/TIB-RDFizer/mappings/
#fi
docker exec rdfizer /app/run.sh /app/mappings/config.ini


