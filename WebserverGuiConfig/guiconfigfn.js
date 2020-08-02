// Thank to bitwiseman about beautiful library: https://github.com/beautify-web/js-beautify
var mySocketIO = io(); // Create my socket
var _Global_filter_t_r_n = ""; // Global variable to save content after filter /r /n ' '
var _Global_getConfigContent; // Global variable to save content of 'config.js' file
var _Global_guiWrapper = document.createElement("div"); // Create a <div> 
_Global_guiWrapper.id = "id_Global_guiWrapper"; // With this id

function DisplayModules()
{
    // Read all content from 'config.js' file
	_Global_getConfigContent = readConfig('config.js');
    
    var findModulePos = _Global_getConfigContent.indexOf("modules:"); // Find position of 'modules' in 'config.js'
    var findSemicolonPos = _Global_getConfigContent.indexOf(";"); // Find position of ';' in 'config.js'
    
    // Get content block inside the 'modules' and ';'
    // Mean get the modules[...] array
    // We will get from ('module' position) to (';' position minus by 'module' position)
    var getModuleContent = _Global_getConfigContent.substr(findModulePos,findSemicolonPos - findModulePos); 

    // From now on, the comment inside modules[] array MUST BE follow this rule: //~your comment here
    // You could not use /**/ or the other ways to comment. MUST BE: //~your comment here
    // Must be had a tilde '~' right after double slash //
    var filterCommentLine = getModuleContent.replace(/\/\/ ~.*|\/\/~.*/gm,""); // Filter all comment line by blank

    // i = 8 mean get the position from '[' right after 'modules:'
    // Pass this loop below, the content will be filtered '\n' '\t' and ' ', to avoid error when combine JSON
    // length minus 1 mean don't get the '}' before ';' , only content inside '[]' of 'modules'
    for( var i = 8; i < filterCommentLine.length - 1; i++)
        {
            if(filterCommentLine[i] == '\n'|| filterCommentLine[i] == '\t' || filterCommentLine[i] == ' '); 
            else _Global_filter_t_r_n += filterCommentLine[i]; 
        }   
    
    // Convert to JSON
    // ### NOTICE: this JSON include all your ENABLE modules in 'config.js' (modules uncommented)
    var myCurrentJSON = eval(_Global_filter_t_r_n);

    // Because we cut out the 'modules:' and save content into _Global_filter_t_r_n
    // We don't need to trace from position 8 anymore
    // Pass this loop below, the system will list all modules (ENABLE and DISABLE modules)
    var filterCmtBlock = "";
    //var checkFirstCommentBlock = 0;
    //var hascomment = false;
    for(var i = 0; i < _Global_filter_t_r_n.length; i++) 
        {
            // if(_Global_filter_t_r_n[i] == '/' && _Global_filter_t_r_n[i + 1] == '*')
            // {
            //     if(_Global_filter_t_r_n[i + 2] != '~')
            //     {
            //         i++;
            //     }
            //     // checkFirstCommentBlock++;
            //     // // == 1, mean this is the first '/*', this will avoid confuse with the other '/*' symbol
            //     // if(checkFirstCommentBlock == 1) 
            //     // {
            //     //     i++;
            //     // }
            //     else 
            //     {
            //         hascomment = true;
            //         i+2;
            //         filterCmtBlock += "/*~";
            //         //filterCmtBlock += _Global_filter_t_r_n[i]; 
            //     }
            // }
            // else if(_Global_filter_t_r_n[i] == '*' && _Global_filter_t_r_n[i + 1] == '/')
            // {
            //     if(hascomment == true)
            //     {
            //         filterCmtBlock += _Global_filter_t_r_n[i];
            //         hascomment = false;
            //     }
            //     // checkFirstCommentBlock--;
            //     // // == 0, mean this is the last '*/', this will avoid confuse with the other '*/' symbol
            //     // if(checkFirstCommentBlock == 0)
            //     // {
            //     //     i++;
            //     // }
            //     else
            //     {
            //         i++;
            //     } 
            //         //filterCmtBlock += _Global_filter_t_r_n[i];  
            // }
            // else filterCmtBlock += _Global_filter_t_r_n[i]; 

            if(_Global_filter_t_r_n[i] == '/' && _Global_filter_t_r_n[i + 1] == '*' 
            || _Global_filter_t_r_n[i] == '*' && _Global_filter_t_r_n[i + 1] == '/')
            {
                i++;
            } 
            else filterCmtBlock += _Global_filter_t_r_n[i]; 
        } 
    
    // Convert to JSON
    // ### NOTICE: this JSON include all your modules (ENABLE modules (uncomment) and DISABLE modules (comment))
    var myAllJSON = eval(filterCmtBlock);
    //console.log(myAllJSON.length);
    //var tableColumn = myAllJSON.length / 3;

    //var _Global_anotherWrapper = document.createElement("div"); // Create a <div> 
    //_Global_anotherWrapper.id = "id_Global_anotherWrapper"; // With this id
    var tableContain = document.createElement("table");
    tableContain.id = "idModuleTable";
    tableContain.className = "myTable";
    var row = tableContain.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cellArray = [cell1,cell2,cell3];
    // cell1.innerHTML = "test1";
    // cell2.innerHTML = "test2";
    // cell3.innerHTML = "test3";
    
    // Display one by one current JSON via DOM
    var indexColumn = -1;
    for (var i = 0; i < myAllJSON.length; i++)
    {   
        indexColumn++;
        if(indexColumn == 3)
            indexColumn = 0;
        // Check exist
        // If exist -> display ENABLE, else display DISABLE title
        var flagCheckExist = false;
        var moduleTitle = document.createElement("p");
        for(var j = 0; j < myCurrentJSON.length; j++)
        {
            if(myAllJSON[i].module == myCurrentJSON[j].module) // If exist
            {
                moduleTitle.id = "Moduletitle"+i; // Create unique id for each title
                var tmp = myAllJSON[i].module + "<br><span style=\"color:green; font-weight:bold;\">ENABLE</span>";
                moduleTitle.innerHTML = tmp.toUpperCase();
                //_Global_guiWrapper.appendChild(moduleTitle);
                cellArray[indexColumn].appendChild(moduleTitle);
                flagCheckExist = true;
                break;
            }
        }
        
        // If not exist
        if(flagCheckExist == false)
        {
            moduleTitle.id = "Moduletitle"+i; // Create unique id for each title
            var tmp = myAllJSON[i].module + "<br><span style=\"color:red; font-weight:bold;\">DISABLE</span>";
            moduleTitle.innerHTML = tmp.toUpperCase();
            //_Global_guiWrapper.appendChild(moduleTitle);
            cellArray[indexColumn].appendChild(moduleTitle);
        }
        
        // Create ON and OFF buttons
        var btnON = document.createElement("button");
        btnON.id = "BtnON-" + i; // Create unique id for each button
        btnON.innerHTML = "ON"; 
        btnON.className = "buttonOn"; // CSS style in ejs file 
        //_Global_guiWrapper.appendChild(btnON);
        cellArray[indexColumn].appendChild(btnON);


        var btnOFF = document.createElement("button");
        btnOFF.id = "BtnOFF-" + i;
        btnOFF.innerHTML = "OFF";
        btnOFF.className = "buttonOff"; // CSS style in ejs file
        //_Global_guiWrapper.appendChild(btnOFF);
        cellArray[indexColumn].appendChild(btnOFF);

        //var splitLine = document.createElement("hr");
        //splitLine.className = "splitStyle"; // CSS style in ejs file
        //_Global_guiWrapper.appendChild(splitLine);
        //cellArray[indexColumn].appendChild(splitLine);
    }

    // Procedures to setup onClick event, i found this tutorial on the internet :D 
    // The system will invoke buttonClick() function when user click buttons
    _Global_guiWrapper.addEventListener("click", buttonClick); 
    _Global_guiWrapper.appendChild(tableContain);
    document.body.appendChild(_Global_guiWrapper);

    //_Global_anotherWrapper.appendChild(tableContain);
   // document.body.appendChild(_Global_anotherWrapper);
    
}

function buttonClick(e)
{

    if (e.target.tagName.toLowerCase() == "button") 
    {
        var btn = e.target; // Procedures to get button id, i found this tutorial on the internet :D 

        // Get button 'id', then split out 'type' and 'index' which are identified by '-'
        var getBtnType = btn.id.substr(0,btn.id.indexOf('-')); 
        var getBtnIndex = btn.id.substr(btn.id.indexOf('-')+1);
        var checkClickOK = false; // Avoid emit too much time when click a button too much        
        var combineContent = ""; // Save all my content
        
        // If user press 'ON' buttons
        if(getBtnType == "BtnON")
        {   
            // Next two variables will check bracket and count number of modules (ALL your modules)
            var checkBracketToCountModule = 0; // Trace, if match '{' -> checkBracketToCountModule++ until match '}' -> checkBracketToCountModule--
            var numOfModules = 0; // If checkBracketToCountModule back to 0 -> Exit out of a module -> numOfModules++
            var checkFirstOpenBracket = false; // It will execute '/*' before '*/' -> SHOULD NOT uncomment this line

            // If the button has already been 'ON' -> the title was being displayed 'ENABLE' -> index of 'ENABLE' != -1
            // The if condition below will avoid error when you click 'ON' while the module has already been 'ENABLE'
            if(document.getElementById("Moduletitle"+getBtnIndex).innerHTML.indexOf("ENABLE") == -1)
            {
                checkClickOK = true;
                // Because we cut out the 'modules:' and save content into _Global_filter_t_r_n
                // We don't need to trace from position 8 anymore
                // Pass this loop below, the system will ENABLE the module which you clicked 'ON'
                for(var i = 0; i < _Global_filter_t_r_n.length; i++) 
                {
                    // If match the position of button which you clicked
                    // It won't assign '/**/' symbol of comment block to combineContent (mean ENABLE that module)
                    if(numOfModules == getBtnIndex)  
                    {
                        if(_Global_filter_t_r_n[i] == '/' && _Global_filter_t_r_n[i + 1] == '*' && checkFirstOpenBracket == false)
                        {
                            checkFirstOpenBracket = true;
                            i++;
                        }
                        else if (_Global_filter_t_r_n[i] == '*' && _Global_filter_t_r_n[i + 1] == '/' && checkFirstOpenBracket == true)
                        {
                            i++;
                            numOfModules++; // After ENABLE, increase this to escape out of If condition
                        }
                        else combineContent += _Global_filter_t_r_n[i]; 
                    }

                    // The system will save all content until match the position of button which you clicked
                    // When matched, the system will execute If condition
                    else
                    {
                        // I explained above, this else condition will trace to the position of button which you clicked 
                        if(_Global_filter_t_r_n[i] == '{')
                        {
                            checkBracketToCountModule++; 
                        }
                        else if (_Global_filter_t_r_n[i] == '}')
                        {
                            checkBracketToCountModule--;
                            if(checkBracketToCountModule == 0)
                                numOfModules++;
                        }
                        // Save to combineContent, because we still keep the other modules 
                        combineContent += _Global_filter_t_r_n[i]; 
                    }
                }    
            }           
            // var tmp = "<br><span style=\"color:green; font-weight:bold;\">ENABLE</span>";
           // moduleTitle.innerHTML = tmp.toUpperCase();
           // document.getElementById("Moduletitle"+getBtnIndex).innerHTML = tmp.toUpperCase(); 
        }

        // If user press 'OFF' buttons
        else if(getBtnType == "BtnOFF")
        {
            // Next two variables will check bracket and count number of modules (ALL your modules)
            var checkBracketToCountModule = 0; // Trace, if match '{' -> checkBracketToCountModule++ until match '}' -> checkBracketToCountModule--
            var numOfModules = 0; // If checkBracketToCountModule back to 0 -> Exit out of a module -> numOfModules++
            var checkFirstOpenBracket = 0; // Check first and last bracket

            // If the button has already been 'OFF' -> the title was being displayed 'DISABLE' -> index of 'DISABLE' != -1
            // The if condition below will avoid error when you click 'OFF' while the module has already been 'DISABLE'
            if(document.getElementById("Moduletitle"+getBtnIndex).innerHTML.indexOf("DISABLE") == -1)
            {
                checkClickOK = true;
                // Because we cut out the 'modules:' and save content into _Global_filter_t_r_n
                // We don't need to trace from position 8 anymore
                // Pass this loop below, the system will DISABLE the module which you clicked 'OFF'
                for(var i = 0; i < _Global_filter_t_r_n.length; i++)
                {
                    // If match the position of button which you clicked
                    // It assign '/* */' symbol of comment block to combineContent (mean DISABLE that module)
                    if(numOfModules == getBtnIndex)
                    {
                        if(_Global_filter_t_r_n[i] == '{')
                        {
                            checkFirstOpenBracket++;
                            // == 1, mean this is the first '{', this will avoid confuse with the other '{' symbol
                            if(checkFirstOpenBracket == 1) 
                            {
                                combineContent += "/*{";
                                i++;
                            }
                            combineContent += _Global_filter_t_r_n[i]; 
                        }
                        else if(_Global_filter_t_r_n[i] == '}')
                        {
                            checkFirstOpenBracket--;
                            // == 0, mean this is the last '}', this will avoid confuse with the other '}' symbol
                            if(checkFirstOpenBracket == 0)
                            {
                                combineContent += "},*/";
                                i+=2; // ignore 3 next characters, you can use console.log to debug :D
                                numOfModules++; // After DISABLE, increase this to escape out of If condition
                            }
                            combineContent += _Global_filter_t_r_n[i]; 
                        }
                        else combineContent += _Global_filter_t_r_n[i]; 
                    }

                    // The system will save all content until match the position of button which you clicked
                    // When matched, the system will execute If condition
                    else
                    {
                        // I explained above, this else condition will trace to the position of button which you clicked 
                        if(_Global_filter_t_r_n[i] == '{')
                        {
                            checkBracketToCountModule++;
                        }
                        else if (_Global_filter_t_r_n[i] == '}')
                        {
                            checkBracketToCountModule--;
                            if(checkBracketToCountModule == 0)
                                numOfModules++;
                        }
                        // Save to combineContent, because we still keep the other modules 
                        combineContent += _Global_filter_t_r_n[i];
                    }
                }
            }
           
           // var tmp = "<br><span style=\"color:red; font-weight:bold;\">DISABLE</span>";
           // moduleTitle.innerHTML = tmp.toUpperCase();
           // document.getElementById("Moduletitle"+getBtnIndex).innerHTML = tmp.toUpperCase();
        }
        
        // If user's click was successful
        if(checkClickOK == true)
        {   
            // Get content of 'config.js' file from the beginning until match first '[' symbol
            var getFirstBlockContent = _Global_getConfigContent.substr(0,_Global_getConfigContent.indexOf("modules:")+8);

            // Get content of 'config.js' file from ';' symbol until the end
            var getLastBlockContent = _Global_getConfigContent.substr(_Global_getConfigContent.indexOf(";")-1);

            // Combine default beginning content + DIS/ENABLE content + end content
            var combineAll = getFirstBlockContent + combineContent + getLastBlockContent;

            // Beautiful code for ready to emit 
            var beautyAll = js_beautify(combineAll, {brace_style: "expand" });

            // Emit to server to save to 'config.js' file
            mySocketIO.emit("GUICONFIG",beautyAll);
            //mySocketIO.emit("testbeautyonserver",combineAll);
            //console.log("EMIT");
            // Delete all DOM contents instead of reload page
            var listDOMElements = document.getElementById("id_Global_guiWrapper");

            while (listDOMElements.hasChildNodes()) {  
                listDOMElements.removeChild(listDOMElements.firstChild);
            }   
            //listDOMElements.removeChild(document.getElementById("Moduletitle"+getBtnIndex));

            //_Global_getConfigContent = readConfig('config.js');
            _Global_filter_t_r_n = "";
            _Global_getConfigContent = "";

            //Re-display all modules information
            DisplayModules();
        }
    }
}

// Procedures to read file, i found this tutorial on the Internet :D
function readConfig(file)
{   
    var content;
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
}

// Display all modules information when access
DisplayModules();