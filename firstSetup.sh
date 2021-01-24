#!/bin/bash

# This file will create module .js file from BK.js files when first clone this server 

# Add all find result into an array
fileArr=()
while IFS=  read -r -d $'\0'; do
    fileArr+=("$REPLY")
done < <(find . -name *BK.js -print0)

# Get length of array
len=${#fileArr[@]}

# Copy one by one BK.js files to .js files
for (( i=0; i<$len; i++ ))
do 
	backupFile=${fileArr[$i]}
	blank=""
	# Replace BK by a blank
	FILE=${backupFile/BK/$blank}

	# Check exist 
	if [ -f "$FILE" ]; then
	    echo "$FILE exists."
	else 
	    cp ${fileArr[$i]} ${backupFile/BK/$blank}
	    echo "Create new $FILE"
	fi
done
