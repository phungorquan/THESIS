var mySocketIO = io({transports: ['websocket'], upgrade: false}); // Procedure

// Self-definition namespace
var ns_ConfigServer = {
    ON: 1,
    OFF: 0,
    OnDisableOption:"Chọn mô-đun" ,
    numOfModules:0,
    facenetMaskName:"Xử lý ảnh",
    jsonChecking: {}
};

// Alert ERR function
mySocketIO.on("ALERT_ERROR",function(msg){ 
    alert("LỖI - " + msg);
    console.log(msg);
});

// Alert OK function
mySocketIO.on("ALERT_OK",function(msg){ 
    if(msg == "UPDATE_MODULES_OK")
    {
        // Reset content, drop lists to be empty
        var getContentArea = document.getElementById("modulesContent");
        getContentArea.value = "";
        var tableContain = document.getElementById("allModulesStatus");
        tableContain.innerHTML = "";
        var getAllModulesOption = document.getElementById("dropAllModules");
        while (getAllModulesOption.options.length > 0) {                
             getAllModulesOption.remove(0);
        }  
        // Get all data of modules again
        mySocketIO.emit("GET_ALL_MODULES","DUMMY");
    }
    else if(msg == "READY_TO_COMBINE_CONFIG_COMPONENTS")
    {
        // After GEN_MODULES_CONFIG file below, server will send to backend in order to receive inform one more. Then apply support file into config.js
        // This is a procedure
        mySocketIO.emit("COMBINE_CONFIG_COMPONENTS");
    }
    // This is only a solution in order to help system ready for reset after load file
    else if(msg == "READY_TO_RESET")
    {   
        // To reset we will send as same we click RESET Button
        var arrTmp = [];
        arrTmp[0] = 0;
        mySocketIO.emit("EXEC_COMMAND",arrTmp);

        // Reset content, drop lists to be empty
        var getContentArea = document.getElementById("modulesContent");
        getContentArea.value = "";
        var tableContain = document.getElementById("allModulesStatus");
        tableContain.innerHTML = "";
        var getAllModulesOption = document.getElementById("dropAllModules");
        while (getAllModulesOption.options.length > 0) {                
             getAllModulesOption.remove(0);
        }  
        // Get all data of modules again
        mySocketIO.emit("GET_ALL_MODULES","DUMMY");
    }
    else if (msg == "REQUEST_GEN_JSON_ALL_DEVICES")
    {
        // Gen all modules config and save to a support config file
        mySocketIO.emit("GEN_MODULES_CONFIG");
    }
    else
    {
        alert("OK");
    }
});

mySocketIO.emit("GET_JSON_CHECKING","DUMMY");
// Get checking JSON
mySocketIO.on("RES_JSON_CHECKING",function(msg){ 
    // Checking JSON are correct or not
    try {
        ns_ConfigServer.jsonChecking = JSON.parse(msg);
    } catch (e) {
        alert("Các điều kiện kiểm tra JSON rỗng, LỖI HỆ THỐNG!!!");
        return;
    }

    if(ns_ConfigServer.jsonChecking.hasOwnProperty("position"));
    else 
    {
        alert("Các điều kiện kiểm tra JSON rỗng, LỖI HỆ THỐNG!!!"); 
    }
});

// Display content of modules
mySocketIO.on("RES_MODULE_CONTENT",function(msg){ 
    var getContentArea = document.getElementById("modulesContent");
    getContentArea.value = ""; // Reset previous content
    getContentArea.value = msg;
});

// Receive information content and display
mySocketIO.on("RES_MODULE_INFO",function(info){ 
    document.getElementById("informationContentWillBeShowedHere").innerHTML = info;
    document.getElementById("modulesInfo").style.display = "block";
});

// Add to ON drop list all ON modules, and display ON/OFF modules status table
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

// When user click into information icon
function showModulesInfo()
{
    var selection = document.getElementById("dropONModules");
    var value = selection.options[selection.selectedIndex].value;

    // Check if user select a specific module
    if(value != ns_ConfigServer.OnDisableOption)
    {   
        // Emit to get that module information
        mySocketIO.emit("GET_MODULE_INFO",value); 
    }
    // If user didn't select any module -> Display full information about author, system, how to use,...
    else 
    {
        mySocketIO.emit("GET_MODULE_INFO","thongtinchung");
    }
}

// Close information window when user click CLOSE button
function closeInfo()
{
    document.getElementById("modulesInfo").style.display = "none";
    document.getElementById("informationContentWillBeShowedHere").innerHTML = "";
}

// Get all modules name when select ON drop list
function dropONModules(){
    var selection = document.getElementById("dropONModules");
    var value = selection.options[selection.selectedIndex].value;
    if(value != ns_ConfigServer.OnDisableOption)
    {   // Emit to get module content
        mySocketIO.emit("GET_MODULE_CONTENT",value); 
    }
    // If user don't select module
    else 
    {
        alert("Vui lòng chọn một mô-đun!");
    }
}

function JSONCheckingType(obj)
{
    // Checking empty jsonChecking or not
    if(ns_ConfigServer.jsonChecking.hasOwnProperty("position"))
    {
        // Check if obj is exist (it means user edit wrong obj)
        if(ns_ConfigServer.jsonChecking.hasOwnProperty(obj))
        {
            return ns_ConfigServer.jsonChecking[obj].dataType; // return type of that object
        }
        else return false;
    }
    else 
    {
        alert("Các điều kiện kiểm tra JSON rỗng"); 
        return;
    }

}

function JSONCheckingData(obj)
{
    // Checking empty jsonChecking or not
    if(ns_ConfigServer.jsonChecking.hasOwnProperty("position"))
    {
        // Check if obj is exist (it means user edit wrong obj)
        if(ns_ConfigServer.jsonChecking.hasOwnProperty(obj))
        {
            if(ns_ConfigServer.jsonChecking[obj].hasOwnProperty("dataAllow"))
            {
                return ns_ConfigServer.jsonChecking[obj].dataAllow; // return all allow data of that object
            }
            else
            {
                return true;
            }
        }
        else return false;
    }
    else 
    {
        alert("Các điều kiện kiểm tra JSON rỗng"); 
        return;
    }
}

// Display alert
function displayJSONErr(arr)
{
    var alertStr = "";
    if(arr.expectType == false)
    {
        alertStr = "Không tồn tại cấu hình, hoặc dữ liệu phù hợp cho cấu hình này: " + arr.objName;
    }
    else
    {   
        alertStr = ("Sai cấu hình \nLỗi tại: " + arr.objName + "\nGiá trị đúng phải là dạng: " + arr.expectType + " nhưng giá trị điền vào ở dạng: " + arr.errType);
    }
    console.log(alertStr);
    alert(alertStr);
}

// Display alert
function displayJSONDataErr(arr)
{
    var alertStr = "";
    if(arr.arrData == false)
    {
        alertStr = "Không tồn tại cấu hình này: " + arr.objName;
    }
    else{
        alertStr = ("Sai cấu hình \nLỗi tại: " + arr.objName + "\nGiá trị điền vào là: " + arr.errData +" không tồn tại trong mảng này: " + arr.arrData);
    }
    console.log(alertStr);
    alert(alertStr);
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

function validColor(strColor){
  strColor = strColor.toLowerCase();
  var s = new Option().style;
  s.color = strColor;
  return s.color == strColor;
}

// Process checking JSON Data
function processJSONDataChecking(index,configJSON)
{
    var getDataAllowArr = JSONCheckingData(index);
    var isDataAllow = false;
    if(Array.isArray(getDataAllowArr))
    {
        for(dataArrCheckingIdx in getDataAllowArr)
        {
            // Check number is positive or not
            if(getDataAllowArr.length == 1 && getDataAllowArr[dataArrCheckingIdx] == "checkPositive")
            {
                if(configJSON >= 0)
                {
                    isDataAllow = true;
                    break;
                }
                else{
                    alertStr = ("Sai cấu hình \nLỗi tại: " + index + "\nGiá trị điền vào là: " + configJSON +", phải là một số dương >= 0");
                    alert(alertStr);
                    return false;
                }
            }

            // Check url is valid or not
            else if(getDataAllowArr.length == 1 && getDataAllowArr[dataArrCheckingIdx] == "checkURL")
            {
                if(validURL(configJSON))
                {
                    isDataAllow = true;
                    break;
                }
                else{
                    alertStr = ("Sai định dạng URL của " + index);
                    alert(alertStr);
                    return false;
                }
            }

            // Check color is positive or not
            else if(getDataAllowArr.length == 1 && getDataAllowArr[dataArrCheckingIdx] == "checkColor")
            {
                var RegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
                if(validColor(configJSON) || RegExp.test(configJSON))
                {
                    isDataAllow = true;
                    break;
                }
                else{
                    alertStr = ("Sai định dạng màu của " + index);
                    alert(alertStr);
                    return false;
                }
            }
            else
            {
                if(getDataAllowArr[dataArrCheckingIdx] == configJSON)
                {
                    isDataAllow = true;
                    break;
                }
            }
        }
    }
    else 
    {
        isDataAllow = getDataAllowArr;
    }

    if(isDataAllow == false)
    {
        var objErr = new Object;
        objErr["objName"] = index;
        objErr["errData"] = configJSON;
        objErr["arrData"] = getDataAllowArr;
        console.log("false at, ",index);
        displayJSONDataErr(objErr);
    }

    return isDataAllow;
}

// Save content 
function saveModuleContent(){

    var selection = document.getElementById("dropONModules");
    var value = selection.options[selection.selectedIndex].value;
    if(value == ns_ConfigServer.OnDisableOption)
    {   
        alert("Vui lòng chọn một mô-đun!");
        return; 
    }

    var getContentArea = document.getElementById("modulesContent");

    var fullConfigJSON = "";
    var jsonOK = true;
    // Check JSON available or not
    try {
        fullConfigJSON = JSON.parse(getContentArea.value);
    } catch (e) {
        jsonOK = false;
        alert("Vui lòng kiểm tra lại, sai định dạng JSON)");
        return;
    }

    var isConfigOK = true;
    var alertStr = "";
    var isDataAllow = true;

    // Check some objects before check obj in config ("position","header","module","config" or the other ones in the future)
    for(index in fullConfigJSON)
    {
        var getType = JSONCheckingType(index);
        if(getType != typeof(fullConfigJSON[index]))
        {
            isConfigOK = false;
            var objErr = new Object;
            objErr["objName"] = index;
            objErr["expectType"] = getType;
            objErr["errType"] = typeof(fullConfigJSON[index]);
            displayJSONErr(objErr);
            return;
        }

        // Checking data is available or not
        if(!processJSONDataChecking(index,fullConfigJSON[index]))
            return;
    }


    // Check objects in config JSON
    var configJSON = fullConfigJSON.config;
    // Check one by one obj
    for(index in configJSON)
    {
        // If obj is OK (string, number, object)
        var getType = JSONCheckingType(index);
        if(getType == typeof(configJSON[index]))
        {
            //console.log(getType);
            //console.log(index);
            // If obj is an object (that is a subObject with {[]})
            if(getType == "object")
            {
                // If inside subObject is Array 
                if(Array.isArray(configJSON[index]))
                {
                    // Get inside and get one by one element in Array
                    for(subIndex in configJSON[index])
                    {
                        // Get obj in an element
                        for(lastIndex in configJSON[index][subIndex])
                        {
                            // If that is only array without json obj
                            if(!isNaN(lastIndex))
                            {
                                // Only an array, not has array inside
                                if(typeof(configJSON[index][subIndex]) == "string")
                                {
                                    var getData = configJSON[index][subIndex];
                                    var getType = JSONCheckingType(getData);
                                    if(getType != typeof(configJSON[index][subIndex]))
                                    {
                                        isConfigOK = false;
                                        var objErr = new Object;
                                        objErr["objName"] = getData;
                                        objErr["expectType"] = getType;
                                        objErr["errType"] = typeof(configJSON[index][subIndex]);
                                        console.log("false at, ", getData);
                                        displayJSONErr(objErr);
                                        break;
                                    }
                                    // Checking data is available or not
                                    isDataAllow = processJSONDataChecking(index,getData);
                                }
                                else
                                {
                                     // Go through one by one element to check
                                    for(eleArrInx in configJSON[index][subIndex])
                                    {
                                        var getData = configJSON[index][subIndex][eleArrInx];
                                        var getType = JSONCheckingType(getData);
                                        if(getType != typeof(configJSON[index][subIndex][eleArrInx]))
                                        {
                                            isConfigOK = false;
                                            var objErr = new Object;
                                            objErr["objName"] = getData;
                                            objErr["expectType"] = getType;
                                            objErr["errType"] = typeof(getData);
                                            console.log("false at, ", getData);
                                            displayJSONErr(objErr);
                                            break;
                                        }
                                        // Checking data is available or not
                                        isDataAllow = processJSONDataChecking(index,getData);
                                    }
                                }       
                            }
                            // Inside array are the other json obj
                            else
                            {
                                // If that obj is !OK - > ready to alert
                                var getType = JSONCheckingType(lastIndex);
                                if(getType != typeof(configJSON[index][subIndex][lastIndex]))
                                {
                                    isConfigOK = false;
                                    var objErr = new Object;
                                    objErr["objName"] = lastIndex;
                                    objErr["expectType"] = getType;
                                    objErr["errType"] = typeof(configJSON[index][subIndex][lastIndex]);
                                    console.log("false at, ", lastIndex);
                                    displayJSONErr(objErr);
                                    break;
                                }
                                // Checking data is available or not
                                isDataAllow = processJSONDataChecking(lastIndex,configJSON[index][subIndex][lastIndex]);
                            }
                            // Out one more for loop when false
                            if(isConfigOK == false || isDataAllow == false)
                            {
                                break;
                            }
                        }
                        // Out one more for loop when false
                        if(isConfigOK == false || isDataAllow == false)
                        {
                            break;
                        }
                    }
                }
                // If inside subObject only has data without Array
                else
                {
                    // Check one by one obj
                    for(subIndex in configJSON[index])
                    {
                        // If that obj is !OK -> ready to alert
                        var getType = JSONCheckingType(subIndex);
                        if(getType != typeof(configJSON[index][subIndex]))
                        {
                            isConfigOK = false;
                            var objErr = new Object;
                            objErr["objName"] = subIndex;
                            objErr["expectType"] = getType;
                            objErr["errType"] = typeof(configJSON[index][subIndex]);
                            console.log("false at, ", subIndex);
                            displayJSONErr(objErr);
                            break;
                        }
                        // Checking data is available or not
                        isDataAllow = processJSONDataChecking(subIndex,configJSON[index][subIndex]);
                    }
                }
            }
            else
            {
                // Checking data is available or not
                isDataAllow = processJSONDataChecking(index,configJSON[index]);
            }
            // Out one more for loop when false
            if(isConfigOK == false || isDataAllow == false)
            {
                break;
            }
        }
        // If that obj is !OK -> ready to alert
        else 
        {
            isConfigOK = false;
            var objErr = new Object;
            objErr["objName"] = index;
            objErr["expectType"] = getType;
            objErr["errType"] = typeof(configJSON[index]);
            console.log("false at, ", index);
            displayJSONErr(objErr);
            break;
        }
        if(isConfigOK == false || isDataAllow == false)
        {
            console.log("false");
            break;
        }
    }       
    if(isConfigOK && isDataAllow)
    {
        var isConfirmed = confirm("Bạn có chắc chắn muốn lưu lại cấu hình hông?");
        if(isConfirmed)
        {
            mySocketIO.emit("SAVE_MODULE_CONTENT",getContentArea.value);
        }
    }
}

// Gen all .js file to genConfig
function genModuleContent(){
    var isConfirmed = confirm("Bạn có chắc chắn muốn áp dụng những thay đổi về trạng thái hoặc cấu hình vừa lưu và khởi động lại hệ thống hông?");
    if(isConfirmed)
    {
        mySocketIO.emit("GEN_MODULES_CONFIG");
    }
}

// Update status of modules (ON/OFF)
function updateStatus()
{
    var selection = document.getElementById("dropAllModules");
    var value = selection.options[selection.selectedIndex].value;
    if(selection.options[selection.selectedIndex].text == ns_ConfigServer.facenetMaskName)
    {
        alert("!!! CẢNH BÁO !!!\nKhi thay đổi trạng thái của module này sẽ ảnh hưởng trực tiếp đến camera. Khi thực hiện đổi trạng thái nên đợi từ 5-10s đến khi đèn đỏ trên camera tắt đi hoặc bật lại thì hãy tiếp tục thực hiện tiếp những điều khiển khác!!!")
    }
    mySocketIO.emit("UPDATE_MODULES_STATUS",value);
}

// 

// All button execute command
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
    cmdArr[0] = cmdIndex; // Get command

    // If user click BACKUP but select a specific module -> only BACKUP that module
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
        case 5: getConfirmStr = "Bạn muốn CHỈ cập nhật lại file config chính về trạng thái mặc định và bật hết các module lên hông??"; break;
        case 6: getConfirmStr = "Bạn muốn CHỈ cập nhật lại module " + value + " về trạng thái mặc định hông?"; break;
        default: getConfirmStr = "CONFIRM_ERROR"; break;
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
        alert("Lỗi thực thi");
    }
}