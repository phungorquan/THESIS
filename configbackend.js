var mySocketIO = io({transports: ['websocket'], upgrade: false});
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
        // Reset content, drop list
        var getContentArea = document.getElementById("modulesContent");
        getContentArea.value = "";
        var tableContain = document.getElementById("allModulesStatus");
        tableContain.innerHTML = "";
        var getAllModulesOption = document.getElementById("dropAllModules");
        while (getAllModulesOption.options.length > 0) {                
             getAllModulesOption.remove(0);
        }  
        mySocketIO.emit("GET_ALL_MODULES","DUMMY");
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
        // Reset content, drop list
        var getContentArea = document.getElementById("modulesContent");
        getContentArea.value = "";
        var tableContain = document.getElementById("allModulesStatus");
        tableContain.innerHTML = "";
        var getAllModulesOption = document.getElementById("dropAllModules");
        while (getAllModulesOption.options.length > 0) {                
             getAllModulesOption.remove(0);
        }  
        mySocketIO.emit("GET_ALL_MODULES","DUMMY");
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


function cmpType(obj)
{
    var objArr = {
    "maximumEntries": "number",
    "maximumNumberOfDays": "number",
    "showLocation": "boolean",
    "maxTitleLength": "number",
    "wrapEvents": "boolean",
    "maxTitleLines": "number",
    "fetchInterval": "number",
    "animationSpeed": "number",
    "displayButton": "boolean",
    "displayEndTime": "boolean",
    "displayLunarDate": "boolean",
    "displayPersonalEvents": "boolean",
    "dateEndFormat": "string",
    "defaultColor": "string",
    "lunarColor": "string",
    "colored": "boolean",
    "tableClass": "string",
    "displayLunarEvents": "boolean",
    "userName": "object",
    "ThayDuy":"string",
    "ThayDuong":"string",
    "Quan":"string",
    "Khanh":"string",
    "Bao":"string",
    "BuiPhungHuuDuc":"string",
    "ChauMinhDuc":"string",
    "Dat":"string",
    "Dung":"string",
    "Duy":"string",
    "Giang":"string",
    "Huy":"string",
    "LAnh":"string",
    "Nhu":"string",
    "Phong":"string",
    "Quoc":"string",
    "Tin":"string",
    "Van":"string",
    "calendars": "object",
    "url": "string",
    "color": "string",
    "name": "string",
    "personalDateEvent": "object",
    "day": "number",
    "month": "number",
    "title": "string"
};
    if(objArr.hasOwnProperty(obj))
    {
        return objArr[obj];
    }
    else return false;
}

// Display content of modules
mySocketIO.on("RES_MODULE_CONTENT",function(msg){ 
    var getContentArea = document.getElementById("modulesContent");
    getContentArea.value = "";
    getContentArea.value = msg;
});

// Show modules information when user click into information icon
mySocketIO.on("RES_MODULE_INFO",function(info){ 
    document.getElementById("informationContentWillBeShowedHere").innerHTML = info;
    document.getElementById("modulesInfo").style.display = "block";
});

function showModulesInfo()
{
    var selection = document.getElementById("dropONModules");
    var value = selection.options[selection.selectedIndex].value;
    if(value != ns_ConfigServer.OnDisableOption)
    {   
        // Emit to get module information
        mySocketIO.emit("GET_MODULE_INFO",value); 
    }
    else 
    {
        // Emit to get information of this Smart Mirror system and User manual
        mySocketIO.emit("GET_MODULE_INFO","thongtinchung"); 
    }
}

function closeInfo()
{
    document.getElementById("modulesInfo").style.display = "none";
    document.getElementById("informationContentWillBeShowedHere").innerHTML = "";
}

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

    var configJSON = JSON.parse(getContentArea.value).config;
    var isConfigOK = true;
    for(index in configJSON)
    {
        if(cmpType(index) == typeof(configJSON[index]))
        {
            if(cmpType(index) == "object")
            {
                if(Array.isArray(configJSON[index]))
                {
                    for(subIndex in configJSON[index])
                    {
                        for(lastIndex in configJSON[index][subIndex])
                        {
                            if(cmpType(lastIndex) != typeof(configJSON[index][subIndex][lastIndex]))
                            {
                                isConfigOK = false;
                                console.log("ERROR: ",lastIndex);
                                console.log("EXPECT ", cmpType(lastIndex));
                                console.log("ACTUALLY: ", typeof(configJSON[index][subIndex][lastIndex]));
                                var alertStr = ("Sai cấu hình \nLỗi tại: " + lastIndex + "\nGiá trị đúng phải là dạng: " + cmpType(lastIndex) + " nhưng giá trị điền vào ở dạng: " + typeof(configJSON[index][subIndex][lastIndex]));
                                alert(alertStr);
                                break;
                            }
                            
                        }
                        if(isConfigOK == false)
                        {
                            break;
                        }
                    }
                }
                else
                {
                    for(subIndex in configJSON[index])
                    {
                        if(cmpType(subIndex) != typeof(configJSON[index][subIndex]))
                        {
                            isConfigOK = false;
                            console.log("ERROR: ", subIndex);
                            console.log("EXPECT ", cmpType(subIndex));
                            console.log("ACTUALLY: ", typeof(configJSON[index][subIndex]));
                            var alertStr = ("Sai cấu hình \nLỗi tại: " + subIndex + "\nGiá trị đúng phải là dạng: " + cmpType(subIndex) + " nhưng giá trị điền vào ở dạng: " + typeof(configJSON[index][subIndex]));
                            alert(alertStr);
                            break;
                        }
                    }
                }
            }
        }
        else 
        {
            isConfigOK = false;
            console.log("ERROR: ", index);
            console.log("EXPECT ", cmpType(index));
            console.log("EXPECT: ", typeof(configJSON[index]));
            var alertStr = ("Sai cấu hình \nLỗi tại: " + index + "\nGiá trị đúng phải là dạng: " + cmpType(index) + " nhưng giá trị điền vào ở dạng: " + typeof(configJSON[index]));
            alert(alertStr);
            break;
        }
    }   

    if(isConfigOK)
    {
        // Check JSON available or not
        try {
            JSON.parse(getContentArea.value);
            mySocketIO.emit("SAVE_MODULE_CONTENT",getContentArea.value);
        } catch (e) {
            alert("Vui lòng kiểm tra lại, sai định dạng JSON (Kiểm tra lại các dấu ngoặc, hai chấm, phẩy,...)");
        }
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

// Update status of modules (ON/OFF)
function updateStatus()
{
    var selection = document.getElementById("dropAllModules");
    var value = selection.options[selection.selectedIndex].value;
    mySocketIO.emit("UPDATE_MODULES_STATUS",value);
}

// 

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
            cmdArr[1] = value;
        } 
    }    

    // Get confirm from user before execute a command
    var getConfirmStr = "";
    switch(cmdArr[0])
    {
        case 0: getConfirmStr = "Bạn muốn khởi động lại động Gương thông minh hông?"; break;
        case 1: getConfirmStr = "Bạn muốn khởi động Gương thông minh hông?"; break;
        case 2: getConfirmStr = "Bạn muốn dừng Gương thông minh hông?"; break;
        case 3: getConfirmStr = "Bạn muốn khởi động lại Raspberry hông?"; break;
        case 4: getConfirmStr = "Bạn muốn tắt Raspberry hông?"; break;
        case 5: getConfirmStr = "Bạn muốn cập nhật lại toàn bộ module về trạng thái mặc định hông?"; break;
        case 6: getConfirmStr = "Bạn muốn cập nhật lại module " + value + " về trạng thái mặc định hông?"; break;
        default: break;
    }
 
    if(getConfirmStr != "CONFIRM_ERROR")
    {
        var isConfirmed = confirm(getConfirmStr);
        if(isConfirmed)
        {
            // Send command
            mySocketIO.emit("EXEC_COMMAND",cmdArr);
        }
    }
    else{
        alert("COMMAND_ERROR");
    }
}