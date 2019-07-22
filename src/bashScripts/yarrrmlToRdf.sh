#!/bin/sh
INPUT=$1$2.yaml
#OUTPUT is the path of the rdfizzer directroy.
OUTPUT=~/Desktop/Rdfizzer/TIB-RDFizer
sed -i '1s/^\xEF\xBB\xBF//' /$OUTPUT/data/*.csv
wait 
yarrrml-parser -i $INPUT -o $OUTPUT/mappings/mapping.rml.ttl
wait
#while true; do
#       if test -e $OUTPUT; then
#	       echo salgo!!
#               break
#       fi

#done
#if test -e $OUTPUT; then
#	ls ~/Desktop/Rdfizzer/TIB-RDFizer/mappings/
#fi
docker exec rdfizer /app/run.sh /app/mappings/config.ini


