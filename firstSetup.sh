#!/bin/bash

# This file will create module.js files from BK.js files when first clone this server or remove them

# Add all find result into an array
fileArr=()
while IFS=  read -r -d $'\0'; do
    fileArr+=("$REPLY")
done < <(find . -name *BK.js -print0)

# Get length of array
len=${#fileArr[@]}

if [ "$1" != "" ]; then
	if [ "$1" == "rmjs" ]; then
		# Remove all .js files
		for (( i=0; i<$len; i++ ))
		do 
			backupFile=${fileArr[$i]}
			blank=""
			# Replace BK by a blank
			FILE=${backupFile/BK/$blank}
		
			# Check exist 
			if [ -f "$FILE" ]; then
			    rm $FILE
			    echo "remove $FILE"
			fi
		done
	elif [ "$1" == "cpjs" ]; then
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
			    cp ${fileArr[$i]} $FILE
			    echo "Create new $FILE"
			fi
		done
	fi
else 
	echo "Put first parameter is"
	echo "rmjs to remove all .js file"
	echo "cpjs to copy backup.js files to .js files"
fi