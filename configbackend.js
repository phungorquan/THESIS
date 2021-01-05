var mySocketIO = io(); // Create my socket
var ns_ConfigServer = {
    ON: 1,
    OFF: 0,
    OnDisableOption:"Chọn mô-đun" ,
    numOfModules:0
};

// Alert ERR
mySocketIO.on("ALERT_ERROR",function(msg){ 
    alert("ERROR - " + msg);
    console.log(msg);
});

// Alert OK
mySocketIO.on("ALERT_OK",function(msg){ 
    if(msg == "UPDATE_MODULES_OK")
    {
        var getContentArea = document.getElementById("modulesContent");
        getContentArea.innerHTML = "";
        location.reload();
    }
    else if(msg == "READY_TO_COMBINE_CONFIG_COMPONENTS")
    {
        mySocketIO.emit("COMBINE_CONFIG_COMPONENTS");
    }
    else if(msg == "READY_TO_RESET")
    {
        var arrTmp = [];
        arrTmp[0] = 0;
        mySocketIO.emit("EXEC_COMMAND",arrTmp);
    }
    else if (msg == "REQUEST_GEN_JSON_ALL_DEVICES")
    {
        mySocketIO.emit("GEN_MODULES_CONFIG");
    }
    else
    {
        alert("OK");
    }
});

mySocketIO.on("REFRESH_ALL_DEVICES",function(){ 
    location.reload();
});

// Display content of modules
mySocketIO.on("RES_MODULE_CONTENT",function(msg){ 
    var getContentArea = document.getElementById("modulesContent");
    getContentArea.innerHTML = msg;
});

// Get all modules name when select ON option
function dropONModules(){
    var selection = document.getElementById("dropONModules");
    var value = selection.options[selection.selectedIndex].value;
    if(value != ns_ConfigServer.OnDisableOption)
    {   // Emit to get module content
        mySocketIO.emit("GET_MODULE_CONTENT",value); 
    }
    else 
    {
        alert("Please select modules!");
    }
}

// Save content 
function saveModuleContent(){
    var getContentArea = document.getElementById("modulesContent");
    // Check JSON available or not
    try {
        JSON.parse(getContentArea.value);
        mySocketIO.emit("SAVE_MODULE_CONTENT",getContentArea.value);
    } catch (e) {
        alert("PLEASE CHECK JSON AGAIN");
    }
}

// Gen all .js file to genConfig
function genModuleContent(){
    mySocketIO.emit("GEN_MODULES_CONFIG");
}

// Add to ON option all ON modules, and display ON/OFF modules status table
mySocketIO.emit("GET_ALL_MODULES","DUMMY"); 
mySocketIO.on("RES_ALL_MODULES",function(msg){ 

    var getAllModulesOption = document.getElementById("dropAllModules");

    // Display all ON modules in FIRST option
    var getONOption = document.getElementById("dropONModules");
    // Reset all options
    while (getONOption.options.length > 0) {                
         getONOption.remove(0);
    }  
    // Disable first index
    var option = document.createElement("option");
    option.selected = true;
    option.disabled = true;
    option.text = ns_ConfigServer.OnDisableOption;
    getONOption.add(option);

    
    var tableContain = document.getElementById("allModulesStatus");
    ns_ConfigServer.numOfModules = msg.length;
    for(var index in msg)
    {    
        // Only add ON modules to option
        if(msg[index].STATUS == ns_ConfigServer.ON)
        {
            var option = document.createElement("option");
            option.value = msg[index].NAME;
            option.text = msg[index].REALNAME;
            getONOption.add(option);
        }
        
        // Display all modules (Name + status ON/OFF)
        var row = tableContain.insertRow(index);
        var cell = row.insertCell(0);
        cell.innerHTML = msg[index].STATUS ? 
        "<span style = 'color:green'>"+ msg[index].MASKNAME +"</span>" : 
        "<span style = 'color:red'>"+ msg[index].MASKNAME +"</span>";

        // Add to all modules option
        var optionAllModules = document.createElement("option");
        optionAllModules.value = parseInt(index);
        optionAllModules.text = msg[index].MASKNAME;
        getAllModulesOption.add(optionAllModules);
    }
});

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 

// Update status of modules (ON/OFF)
function updateStatus()
{
    var selection = document.getElementById("dropAllModules");
    var value = selection.options[selection.selectedIndex].value;
    mySocketIO.emit("UPDATE_MODULES_STATUS",value);
}

function cmdButton(cmdIndex)
{
    // 0: RESET_SMARTMIRROR
    // 1: START_SMARTMIRROR
    // 2: STOP_SMARTMIRROR
    // 3: REBOOT_RASPBERRY
    // 4: SHUTDOWN_RASPBERRY
    // 5: BACKUP_CONFIG_FILE
    // 6: BACKUP_A_MODULE_JSON
    
    var selection = document.getElementById("dropONModules");
    var value = selection.options[selection.selectedIndex].value;
    var cmdArr = [];
    cmdArr[0] = cmdIndex;

    if(value != ns_ConfigServer.OnDisableOption && cmdArr[0] == 5)
    {       
        if(typeof cmdIndex == 'number')
        {
            cmdArr[0] = 6;
            // Get name to trace to backup file to backup that module
            cmdArr[1] = value.replace("-","").toLowerCase();
            mySocketIO.emit("EXEC_COMMAND",cmdArr);
        } 
    }    
    else
    {
        // Execute normal commands
        mySocketIO.emit("EXEC_COMMAND",cmdArr);
    }
 
}