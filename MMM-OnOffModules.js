var myNameSpace = {
	getSelf:null,
	strFilteredSpecChars:"",
	strConfigData:"",
};

Module.register("MMM-OnOffModules",{
	requiresVersion: "2.1.0",

	// Default module config.
	defaults: {
		ignoreModules:[
            {
                name: "MMM-OnOffModules"
            },
            {
                name: "MMM-OnScreenMenu"
            }
        ]
	},	

    start: function() {
        console.log("Starting module: " + this.name);
        this.sendSocketNotification("ON_GUICONFIGSERVER","DUMMY_DATA");
        myNameSpace.getSelf = this;
    },
 
	notificationReceived: function(notification, payload, sender) {
		if (notification === "TOGGLE_ONOFFMODULES") {
			var getCurrentState = document.getElementById('idMyMenuOnOff').style.display;
			if(getCurrentState == 'block')
			{
                document.getElementById('idMyMenuOnOff').className  = 'modal animateOut';
                setTimeout(function() {
                    document.getElementById('idMyMenuOnOff').style.display = 'none';
                }, 500);
                
            }
			else 
			{
                document.getElementById('idMyMenuOnOff').className  = 'modal animateIn';
                document.getElementById('idMyMenuOnOff').style.display = 'block';
            }
        }
	},	

	getScripts: function() {
        return [this.file('beautyLib/beautify.js')];
	},


	getStyles: function() {
        return ['MMM-OnOffModules.css'];
    },

    // Override dom generator.
    getDom: function() {
        
        var wrapper = document.createElement("div");
        wrapper.setAttribute("id","idMyMenuOnOff");
        wrapper.className = "modal animateIn";

        var subDiv = document.createElement("div");
        subDiv.className = "modal-content";
        subDiv.appendChild(this.showModulesMenu());

        wrapper.appendChild(subDiv);
        return wrapper;
    },

    showModulesMenu: function()
    {
        var wrapper = document.createElement("div");
        wrapper.id = "idwrapper";
        myNameSpace.strConfigData = this.getConfigFileContent('config/config.js');
    
        var findModulePos = myNameSpace.strConfigData.indexOf("modules:"); // Find position of 'modules' in 'config.js'
        var findSemicolonPos = myNameSpace.strConfigData.indexOf(";"); // Find position of ';' in 'config.js'
    
        // Get content block inside the 'modules' and ';'
        // Mean get the modules[...] array
        // We will get from ('module' position) to (';' position minus by 'module' position)
        var getModuleContent = myNameSpace.strConfigData.substr(findModulePos,findSemicolonPos - findModulePos); 

        // From now on, the comment inside modules[] array MUST BE follow this rule: //~your comment here
        // You could not use /**/ or the other ways to comment. MUST BE: //~your comment here
        // Must be had a tilde '~' right after double slash //
        var filterCommentLine = getModuleContent; //.replace(/\/\/ ~.*|\/\/~.*/gm,""); // Filter all comment line by blank (this function will erase comment)

        // i = 8 mean get the position from '[' right after 'modules:'
        // Pass this loop below, the content will be filtered '\n' '\t' and ' ', to avoid error when combine JSON
        // length minus 1 mean don't get the '}' before ';' , only content inside '[]' of 'modules'
        for( var i = 8; i < filterCommentLine.length - 1; i++)
        {
            if(filterCommentLine[i] == '\n'|| filterCommentLine[i] == '\t' || filterCommentLine[i] == ' '); 
            else myNameSpace.strFilteredSpecChars += filterCommentLine[i]; 
        }   
    
        // Convert to JSON
        // ### NOTICE: this JSON include all your ENABLE modules in 'config.js' (modules uncommented)
        var myCurrentJSON = eval(myNameSpace.strFilteredSpecChars);

        // Because we cut out the 'modules:' and save content into myNameSpace.strFilteredSpecChars
        // We don't need to trace from position 8 anymore
        // Pass this loop below, the system will list all modules (ENABLE and DISABLE modules)
        var filterCmtBlock = "";
        //var checkFirstCommentBlock = 0;
        //var hascomment = false;
        var getGlobalFilterTRN_length = myNameSpace.strFilteredSpecChars.length;
        for(var i = 0; i < getGlobalFilterTRN_length; i++) 
        {
            if(myNameSpace.strFilteredSpecChars[i] == '/' && myNameSpace.strFilteredSpecChars[i + 1] == '*' 
            || myNameSpace.strFilteredSpecChars[i] == '*' && myNameSpace.strFilteredSpecChars[i + 1] == '/')
            {
                i++;
            } 
            else filterCmtBlock += myNameSpace.strFilteredSpecChars[i]; 
        } 
    
        // Convert to JSON
        // ### NOTICE: this JSON include all your modules (ENABLE modules (uncomment) and DISABLE modules (comment))
        var myAllJSON = eval(filterCmtBlock);
    
        var tableContain = document.createElement("table");
        tableContain.id = "idModuleTable";
        tableContain.className = "myTable";

        var row = tableContain.insertRow(0);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cellArray = [cell1,cell2,cell3,cell4];
    
        // Display one by one current JSON via DOM
        var indexColumn = -1; // 3 Columns
        var indexRow = 0; // Row will increase base on your number of modules 
        var getAllJSON_length = myAllJSON.length;
        var getCurrentJSON_length = myCurrentJSON.length;
        for (var i = 0; i < getAllJSON_length; i++)
        {   
            indexColumn++;
            if(indexColumn == 4)
            {
                indexColumn = 0; // Reset colum to 0, to insert to new row
                indexRow++; // increase row
                row = tableContain.insertRow(indexRow); // insert new row
                cell1 = row.insertCell(0); // insert new cell0 into new row
                cell2 = row.insertCell(1); // insert new cell1 into new row
                cell3 = row.insertCell(2); // insert new cell2 into new row
                cell4 = row.insertCell(3); // insert new cell2 into new row
                cellArray = [cell1,cell2,cell3,cell4];    
            }

            var checkEnable = false;
            var moduleTitle = document.createElement("p");
            var tmp = myAllJSON[i].module;
            tmp = tmp.toUpperCase();
            moduleTitle.innerHTML = tmp; // Display title in UPPER CASE letters
            cellArray[indexColumn].appendChild(moduleTitle);

            for(var j = 0; j < getCurrentJSON_length; j++)
            {
                // Check whether module is enabled or not to display switch
                if(myAllJSON[i].module == myCurrentJSON[j].module) 
                {
                    checkEnable = true; 
                    break;
                }
            }

            // Ignore module will avoid user turn ON/OFF this module
            var getArrIgnoreModulesLength = this.config.ignoreModules.length;
            var ignoreThisModule = false;
            for(var k = 0; k < getArrIgnoreModulesLength; k++)
            {
                // Check whether module is ignored or not
                if(this.config.ignoreModules[k].name.toUpperCase() ==  tmp)
                    ignoreThisModule = true;
            }

            // Besides, we need to disable this module, MMM-OnScreenMenu, MMM-Cursor and MMM-JoyStick
            if(tmp == this.name.toUpperCase() || tmp == "MMM-OnScreenMenu".toUpperCase() || tmp == "MMM-Cursor".toUpperCase() || tmp == "MMM-JoyStick".toUpperCase())
                ignoreThisModule = true;

            if(ignoreThisModule)
            {
                var ignoreImg = document.createElement("IMG");
                ignoreImg.setAttribute("src", "/modules/MyExtraResources/WarningNoTap.png");
                ignoreImg.setAttribute("width", "60");
                ignoreImg.setAttribute("height", "60");
                cellArray[indexColumn].appendChild(ignoreImg); 
            }
            else
            {

                // These are procedures to create a slider (switch), i found on the internet :D
                var inputContain = document.createElement("input");
                inputContain.id = "Check-" + i; // PLEASE DON'T ERASE THIS ID
                inputContain.setAttribute("type", "checkbox");

                // Display slide ON/OFF base on checkEnable
                if(checkEnable == true)
                    inputContain.checked = true;
                else inputContain.checked = false;

                var switchElement = document.createElement("span");
                switchElement.id = "Span-"+i;
                switchElement.className = "sliderOnOff round";

                var labelElement = document.createElement("label");
                labelElement.id = "Label-"+i;
                labelElement.className = "switch";

                labelElement.appendChild(inputContain);
                labelElement.appendChild(switchElement);
                cellArray[indexColumn].appendChild(labelElement);
            }  
        }

        // Assign onclick event to each switch
        wrapper.onclick = myNameSpace.getSelf.doClickEvent;
        wrapper.appendChild(tableContain);
        return wrapper;
    },

    doClickEvent: function()
    {
        if (event.target.tagName.toLowerCase() == "span")
        {
            var btn = event.target; // Procedures to get button information, i found this tutorial on the internet :D 
            var getBtnIndex = btn.id.substr(btn.id.indexOf('-')+1); // Get index after 'id' field 'Check-0...'
            var getBtnType =  document.getElementById("Check-"+getBtnIndex).checked;
            var checkClickOK = false; // Avoid emit too much time when click a button too much        
            var combineContent = ""; // Save all my content
        
            // If switch is OFF
            if(getBtnType == false) 
            {   
                // Next two variables will check bracket and count number of modules (ALL your modules)
                var checkBracketToCountModule = 0; // Trace, if match '{' -> checkBracketToCountModule++ until match '}' -> checkBracketToCountModule--
                var numOfModules = 0; // If checkBracketToCountModule back to 0 -> Exit out of a module -> numOfModules++
                var checkFirstOpenBracket = false; // It will execute '/*' before '*/' -> SHOULD NOT uncomment this line
                checkClickOK = true;

                // Because we cut out the 'modules:' and save content into myNameSpace.strFilteredSpecChars
                // We don't need to trace from position 8 anymore
                // Pass this loop below, the system will ENABLE the module 
                var getGlobalFilterTRN_length = myNameSpace.strFilteredSpecChars.length;
                for(var i = 0; i < getGlobalFilterTRN_length; i++) 
                {
                    // If match the position of button which you clicked
                    // It won't assign '/**/' symbol of comment block to combineContent (mean ENABLE that module)
                    if(numOfModules == getBtnIndex)  
                    {
                        if(myNameSpace.strFilteredSpecChars[i] == '/' && myNameSpace.strFilteredSpecChars[i + 1] == '*' && checkFirstOpenBracket == false)
                        {
                            checkFirstOpenBracket = true;
                            i++;
                        }
                        else if (myNameSpace.strFilteredSpecChars[i] == '*' && myNameSpace.strFilteredSpecChars[i + 1] == '/' && checkFirstOpenBracket == true)
                        {
                            i++;
                            numOfModules++; // After ENABLE, increase this to escape out of If condition
                        }
                        else combineContent += myNameSpace.strFilteredSpecChars[i]; 
                    }

                    // The system will save all content until match the position of button which you clicked
                    // When matched, the system will execute If condition
                    else
                    {
                        // I explained above, this else condition will trace to the position of button which you clicked 
                        if(myNameSpace.strFilteredSpecChars[i] == '{')
                        {
                            checkBracketToCountModule++; 
                        }
                        else if (myNameSpace.strFilteredSpecChars[i] == '}')
                        {
                            checkBracketToCountModule--;
                            if(checkBracketToCountModule == 0)
                                numOfModules++;
                        }
                        // Save to combineContent, because we still keep the other modules 
                        combineContent += myNameSpace.strFilteredSpecChars[i]; 
                    }
                }    
            }

            // If switch is ON
            else if(getBtnType == true)
            {
                // Next two variables will check bracket and count number of modules (ALL your modules)
                var checkBracketToCountModule = 0; // Trace, if match '{' -> checkBracketToCountModule++ until match '}' -> checkBracketToCountModule--
                var numOfModules = 0; // If checkBracketToCountModule back to 0 -> Exit out of a module -> numOfModules++
                var checkFirstOpenBracket = 0; // Check first and last bracket
                checkClickOK = true;

                // Because we cut out the 'modules:' and save content into myNameSpace.strFilteredSpecChars
                // We don't need to trace from position 8 anymore
                // Pass this loop below, the system will DISABLE the module
                var getGlobalFilterTRN_length = myNameSpace.strFilteredSpecChars.length;
                for(var i = 0; i < getGlobalFilterTRN_length; i++)
                {
                    // If match the position of button which you clicked
                    // It assign '/* */' symbol of comment block to combineContent (mean DISABLE that module)
                    if(numOfModules == getBtnIndex)
                    {
                        if(myNameSpace.strFilteredSpecChars[i] == '{')
                        {
                            checkFirstOpenBracket++;
                            // == 1, mean this is the first '{', this will avoid confuse with the other '{' symbol
                            if(checkFirstOpenBracket == 1) 
                            {
                                combineContent += "/*{";
                                i++;
                            }
                            combineContent += myNameSpace.strFilteredSpecChars[i]; 
                        }
                        else if(myNameSpace.strFilteredSpecChars[i] == '}')
                        {
                            checkFirstOpenBracket--;
                            // == 0, mean this is the last '}', this will avoid confuse with the other '}' symbol
                            if(checkFirstOpenBracket == 0)
                            {
                                combineContent += "},*/";
                                i+=2; // ignore 3 next characters, you can use console.log to debug :D
                                numOfModules++; // After DISABLE, increase this to escape out of If condition
                            }
                            combineContent += myNameSpace.strFilteredSpecChars[i]; 
                        }
                        else combineContent += myNameSpace.strFilteredSpecChars[i]; 
                    }

                    // The system will save all content until match the position of button which you clicked
                    // When matched, the system will execute If condition
                    else
                    {
                        // I explained above, this else condition will trace to the position of button which you clicked 
                        if(myNameSpace.strFilteredSpecChars[i] == '{')
                        {
                            checkBracketToCountModule++;
                        }
                        else if (myNameSpace.strFilteredSpecChars[i] == '}')
                        {
                            checkBracketToCountModule--;
                            if(checkBracketToCountModule == 0)
                                numOfModules++;
                        }
                        // Save to combineContent, because we still keep the other modules 
                        combineContent += myNameSpace.strFilteredSpecChars[i];
                    }
                }
            }
        
            // If user's click was successful
            if(checkClickOK == true)
            {   
                // Get content of 'config.js' file from the beginning until match first '[' symbol
                var getFirstBlockContent = myNameSpace.strConfigData.substr(0,myNameSpace.strConfigData.indexOf("modules:")+8);

                // Get content of 'config.js' file from ';' symbol until the end
                var getLastBlockContent = myNameSpace.strConfigData.substr(myNameSpace.strConfigData.indexOf(";")-1);

                // Combine default beginning content + DIS/ENABLE content + end content
                var combineAll = getFirstBlockContent + combineContent + getLastBlockContent;

                // Beautiful code for ready to emit 
                var beautyAll = js_beautify(combineAll, {brace_style: "expand" });

                // Emit to 'nodehelper' to save to 'config.js' file
                myNameSpace.getSelf.sendSocketNotification("SAVE_CONFIG", beautyAll);

                // And then, this function below will run after 1sec to wait system save the changes
                // This will delay 1sec for each changes, please don't turn ON/OFF too fast
                setTimeout(function(){ 

                    // Reset global data
                    myNameSpace.strFilteredSpecChars = "";
                    myNameSpace.strConfigData = "";

                    // Reload new data 
                    myNameSpace.strConfigData = myNameSpace.getSelf.getConfigFileContent('config/config.js');
    
                    var findModulePos = myNameSpace.strConfigData.indexOf("modules:"); // Find position of 'modules' in 'config.js'
                    var findSemicolonPos = myNameSpace.strConfigData.indexOf(";"); // Find position of ';' in 'config.js'
    
                    // Get content block inside the 'modules' and ';'
                    // Mean get the modules[...] array
                    // We will get from ('module' position) to (';' position minus by 'module' position)
                    var getModuleContent = myNameSpace.strConfigData.substr(findModulePos,findSemicolonPos - findModulePos); 

                    // From now on, the comment inside modules[] array MUST BE follow this rule: //~your comment here
                    // You could not use /**/ or the other ways to comment. MUST BE: //~your comment here
                    // Must be had a tilde '~' right after double slash //
                    var filterCommentLine = getModuleContent; //.replace(/\/\/ ~.*|\/\/~.*/gm,""); // Filter all comment line by blank (this function will erase comment)

                    // i = 8 mean get the position from '[' right after 'modules:'
                    // Pass this loop below, the content will be filtered '\n' '\t' and ' ', to avoid error when combine JSON
                    // length minus 1 mean don't get the '}' before ';' , only content inside '[]' of 'modules'
                    for( var i = 8; i < filterCommentLine.length - 1; i++)
                    {
                        if(filterCommentLine[i] == '\n'|| filterCommentLine[i] == '\t' || filterCommentLine[i] == ' '); 
                        else myNameSpace.strFilteredSpecChars += filterCommentLine[i]; 
                    } 
                }, 1000);       
            }
        }
    },


    // I found this procedure to read file on the internet
	getConfigFileContent: function(file)
	{
    	var content = "";
    	var rawFile = new XMLHttpRequest();
    	rawFile.open("GET", file, false);
    	rawFile.onreadystatechange = function ()
    	{
    	    if(rawFile.readyState === 4)
    	    {
    	        if(rawFile.status === 200 || rawFile.status == 0)
    	        {
    	            content = rawFile.responseText; 
   	         	}
    	    }
    	}
    	rawFile.send(null);
    	return content;
	},
});
