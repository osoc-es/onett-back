#!/bin/sh -x
INPUT=$1$2.yaml
OUTPUT=$1$2.rml
pwd
yarrrml-parser -i $INPUT -o $OUTPUT
docker exec rdfizer /app/run.sh /app/mappings/config.ini


