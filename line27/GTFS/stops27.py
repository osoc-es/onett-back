# 	STOPS27 IS A SIMPLE PRGRAM IN PYTHON TO OBTAIN THE STOPS WANTED IN AN ENLESS GTFS FILE
#	KEEP IN MIND THAT THIS PROGRAM IS REUSABLE TO GO AND BACK LINE, FEEL FREE TO MODIFY THE CODE AS YOU WANT
#	THE LINE IS THE 27 OF THE BUS SERVICE IN THE CITY OF MADRID, SPAIN

import re

file=open("stops.txt", "r")
#file=open("stops_go.txt", "r")
file_to_write=open("stops_back.txt" , "w")

stops_to_back=[",5602,", ",28,", ",32,", ",34,",",36,", ",38,", ",41,", ",46,", ",48,", ",49,", ",51,", ",53,", ",4337,", ",57,", ",59,", ",61,",",63,",",5626,",",68,", ",73,", ",76,", ",77,", ",79,", ",81,", ",83,",",84,", ",86,"]

# stops_to_go=[",86,", ",85,", ",87,", ",88,", ",89,", ",82,", ",5511,", ",78,", ",5443,", ",72,", ",65,", ",66,", ",62,", ",60,", ",5333,", ",56,", ",54,", ",52,", ",50,", ",47,", ",42,", ",44,", ",39,", ",37,", ",35,", ",33,", ",29,", ",5602,"]

for line in file:
	for stop in stops_to_back:
		search=re.search(stop, line)
		if search != None:
			file_to_write.write(line)#write the correct stop in the new file
			stops_to_back.pop(stops_to_back.index(stop))#this is just to make sure that any number appears twice

## WARNING:  use this configuration with a big input can cause a combinatorial explosion (this means long time to find the stops)


# 	THIS CODE HAS BEEN DEVELOPED BY P4B5 UNDER THE OPEN SUMMER OF CODE PROGRAMME '19
