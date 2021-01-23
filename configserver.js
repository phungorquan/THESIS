var beautify = require('js-beautify');
var fs = require('fs'); 
var path = require('path');
var express = require("express");
var app = express();

app.use(express.static(path.join(__dirname, '../'))); // Set global folder is THESIS folder

 // Procedure to set session with self authorization
const session = require('express-session');
app.use(session({secret: 'xiu',saveUninitialized: true,resave: true}));

// Parse URL-encoded bodies (as sent by HTML forms)
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

// Create server
var server = require("http").Server(app);
server.listen(7717); // Server listen client at this port
var io = require("socket.io")(server);
var clients = {};

// Create a process to execute script command
var myProcess = require('child_process');

 // Include file to use db queries command
var db = require(path.resolve("db.js"));

// Some directories
var backupConfigFilename = path.resolve("../config/Backupconfig.js");
var configFilename = path.resolve("../config/config.js");
var genConfigFilename = path.resolve("../config/genConfig.js");
var jsonDir = path.resolve("../configserver/json") + "/";
var jsonCheckingFile = path.resolve("../configserver/json/jsonChecking.js");
var googlePhotoCache = path.resolve("../modules/MMM-GoogleDriveSlideShow/.cache");
var userId = "MMM";
var userPass = "1";

// Save all modules data, this will be containe obj are columns respectively from database
var allModules = [];

// Save sessions data
var globSessionArr = [];

// Save JSON checking 
var allJSONChecking = "";

// Get all modules name + config
async function getAllModulesStatus() {
  result = await db.queryGetAllModulesStatus();
  if(result != "queryGetAllModulesStatus-ERROR")
    allModules = result;
  else 
    allModules = [];
}
  // Get all modules name + config , when first run server
  getAllModulesStatus(); 

// Get JSON checking types and objs
async function getJSONChecking() {
  if(fs.existsSync(jsonCheckingFile))
  {
    var getContent = fs.readFileSync(path.join(jsonCheckingFile),"utf8");
    if(getContent.length > 0)
    {
      allJSONChecking = getContent;
    }
    else
    {
      console.log("EMPTY FILE: ",jsonCheckingFile);
      socket.emit("ALERT_ERROR","Các điều kiện kiểm tra JSON rỗng");
    }
  }
  else
  {
    console.log("NOT EXIST DIRECTORY: ",jsonCheckingFile);
    socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của các điều kiện kiểm tra JSON");
  }
}
  getJSONChecking(); 

io.sockets.on("connection", function(socket)
{ 

  // Procedure to inform new and close connection with client for smarter (Refer somewhere on Internet)
  console.log("New connection: ",socket.id);
  clients[socket.id] = socket;
  
  socket.on("disconnect",function(data){
    console.log("Close connection: ", socket.id);
    delete clients[socket.id];
  });

  // Response all modules data
  socket.on("GET_ALL_MODULES", function(msg) {
    getAllModulesStatus(); 
    socket.emit("RES_ALL_MODULES",allModules);
  });

  // Get module content from .js files
  socket.on("GET_MODULE_CONTENT", function(file) {
    function getModuleContent() {
      var combineFileName = 'json/' + file + '/' + file + '.js';
      if(fs.existsSync(combineFileName))
      {
        var getContent = fs.readFileSync(path.join(combineFileName),"utf8");
        if(getContent.length > 0)
        {
          socket.emit("RES_MODULE_CONTENT",getContent);
        }
        else
        {
          console.log("EMPTY FILE: ",file);
          socket.emit("ALERT_ERROR","Cấu hình của module này rỗng");
        }
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",combineFileName);
        socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của module này");
      }
    }
    getModuleContent(); 
  });

  // Save module content to .js files
  socket.on("SAVE_MODULE_CONTENT", function(msg) {
    function saveModuleContent() {
      var getModuleFromJSON = JSON.parse(msg);
      var combineFileName = "";

      // Get dir of json file of that module
      for(var index in allModules)
      {
        if(allModules[index].REALNAME == getModuleFromJSON.module)
          {
            combineFileName = 'json/' + allModules[index].NAME + '/' + allModules[index].NAME + '.js';
            break;
          }
      }

      if(fs.existsSync(combineFileName))
      {
        // Save new content into json file
        fs.writeFileSync(path.resolve(combineFileName), msg);

        // Reload all clients
        io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",combineFileName);
        socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của module này");
      }
    }
    saveModuleContent(); 
  });

  // Combine all .js file to a support config.js file
  socket.on("GEN_MODULES_CONFIG", function() {
    // Get format JSON from config in support config.js file
    var configJSON = require(configFilename);
    // Make empty in order to ready to assign new one
    configJSON.modules = [];

    // dir of a specific module, index is element will be added into support config.js
    function genNewModules(dir,index) {
      var checkOK = false;
      if(fs.existsSync(dir))
      {
        var getGenConfig = fs.readFileSync(path.join(dir),"utf8");
        if(getGenConfig.length > 0)
        {
          configJSON.modules[index] = JSON.parse(getGenConfig);
          checkOK = true;
        }
        else
        {
          console.log("EMPTY FILE: ",getGenConfig);
          socket.emit("ALERT_ERROR","Cấu hình của module này rỗng");
        }
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",dir);
        socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của module này");
      }
      return checkOK;
    }

    // expectIndex is a element of object in config.js JSON, it means 0 is first object, then 1 ,2 ,3 ,4. Stack INCREASE
    var expectIndex = 0;
    for(var index in allModules)
    {
      // If status of a module is ON -> add module JSON into support config.js
      if(allModules[index].STATUS == 1)
      {
        var combineFileName = 'json/' + allModules[index].NAME + '/' + allModules[index].NAME + '.js';
        if(genNewModules(combineFileName,expectIndex))
        {
          // Next element if add successfully
          expectIndex++;  
        }        
      }
    }

    if(fs.existsSync(genConfigFilename))
    {
      // Write into support config.js file new configs
      fs.writeFileSync(path.resolve(genConfigFilename), beautify(JSON.stringify(c), {brace_style: "expand" }));
      socket.emit("ALERT_OK","READY_TO_COMBINE_CONFIG_COMPONENTS");
    }
    else
    {
      console.log("NOT EXIST DIRECTORY: ",genConfigFilename);
      socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của module này");
    }
    
  });

  // Combine all the other components of .js file
  socket.on("COMBINE_CONFIG_COMPONENTS", function(id) {
    function combineComponents() {
      if(fs.existsSync(genConfigFilename))
      {
        var getGenConfig = fs.readFileSync(path.join(genConfigFilename),"utf8");
        fs.writeFileSync(path.resolve(configFilename), "var config =");
        fs.appendFileSync(path.resolve(configFilename), getGenConfig);
        fs.appendFileSync(path.resolve(configFilename), ";if (typeof module !== 'undefined') module.exports = config;");
        socket.emit("ALERT_OK","READY_TO_RESET");
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ", genConfigFilename);
        socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của module này");
      }
    }
    combineComponents(); 
  });

  // msg[0]: cmdIndex
  // msg[1]: name of json file
  socket.on("EXEC_COMMAND", function(msg) {
    console.log(msg);
    var result = "";
    switch(msg[0])
    {
      case 0: result = "pm2 restart pm2_mm"; 
      // Reset google drive cache to ready for get new image
      if(fs.existsSync(googlePhotoCache))
      {
        var cmdStr = "rm -rf " + googlePhotoCache;
        myProcess.exec(cmdStr); 
      }
      else{
        console.log(".cache photoGoogle not exist");
      }
      break;
      case 1: result = "pm2 start ~/pm2_mm.sh"; break;
      case 2: result = "pm2 stop pm2_mm"; break;
      case 3: result = "echo '1' | sudo -S reboot now"; break;
      case 4: result = "echo '1' | sudo -S shutdown -h now"; break;
      // 5 is used for all
      // 6 is used for specific module
      case 5: result = "cp " + result + " " + configFilename + " && pm2 restart pm2_mm"; break;
      case 6: {
        // Replace backup config.js file into config.js file
        var getFileBKName = jsonDir + msg[1] + '/' + msg[1] + 'BK.js';
        var getFileName = jsonDir + msg[1] + '/' + msg[1] + '.js';

        if(fs.existsSync(getFileBKName) && fs.existsSync(getFileName))
        {
          result = "cp " + getFileBKName + " " + getFileName + " && pm2 restart pm2_mm";
        }
        else
        {
          console.log("NOT EXIST DIRECTORY: " + getFileBKName + " OR " + getFileName);
          result = "ERROR";
        }
        break;
      }
      
      default: result = "ERROR"; break;
    }
    if(result != "ERROR"){
      // Execute command
      myProcess.exec(result,function (err,stdout,stderr) {
        var execResult = "";
        if (err) {
          console.log("*** ERROR EXEC - " + msg[0] + " ***\n" + stderr);
        } 
        else {
          console.log("*** RUN " + msg[0] +" OK ***");
          if(msg[0] == 5)
          {
            // Set all module status is ON due to backup config.js is ON all modules
            async function updateAllStatus() {
              result = await db.queryUpdateAllStatus(); 
              if(result != "queryUpdateAllStatus-ERROR")
              {
                getAllModulesStatus(); // Get modules data again
                io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
              }
              else 
                socket.emit("ALERT_ERROR","Không thể bật tất cả module!");
            }
            updateAllStatus(); 
          }
          else if(msg[0] == 6)
          {
            // Backup a module
            io.sockets.emit("ALERT_OK","REQUEST_GEN_JSON_ALL_DEVICES");   
          }
          if(stdout)
            console.log(stdout);
        }
      });
    }
    else {
      console.log("ERROR COMMAND: .", msg[0]);
      socket.emit("ALERT_ERROR", msg[0]);
    }
  });

  // Update modules status
  socket.on("UPDATE_MODULES_STATUS", function(id) {
    async function updateStatus() {

      // If user turn ON/OFF, system will turn off pm2_PS3 and kill motion OR restart pm2_PS3
      if(allModules[id].NAME == "mmmfacenet")
      {
        if(allModules[id].STATUS)
          {
            myProcess.exec("pm2 stop pm2_PS3 && killall motion", function (err,stdout,stderr) {
              if(err)
              {
                console.log ("ERROR STOP PM2 AND KILL MOTION")
                socket.emit("ALERT_ERROR","Không thể bật tất cả module!");
              }
            });
          }
        else 
        {
          myProcess.exec("pm2 restart pm2_PS3", function (err,stdout,stderr) {
            if(err)
            {
              console.log ("ERROR RESTART PM2")
              socket.emit("ALERT_ERROR","Không thể bật camera!");
            }
          });
        }
      }

      // Get status of module [id-1] then toggle the status to change status
      var status = !allModules[id].STATUS ? 1 : 0;
      result = await db.queryUpdateStatus(allModules[id].ID, status); 
      if(result != "queryUpdateStatus-ERROR")
        {
          getAllModulesStatus();
          io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
        }
      else 
        socket.emit("ALERT_ERROR","Không thể cập nhật trạng thái cho module");
    }
    updateStatus(); 
  });

  // Send module info or full info to clients
  socket.on("GET_MODULE_INFO", function(infoFileName) {
    function getModuleInfo() {
      var getFileIFName = "";
      // Prepare info directory
      // If request full info
      if(infoFileName != "thongtinchung")
      {
        getFileIFName = jsonDir + infoFileName + '/' + infoFileName + 'IF.txt';
      }
      // If request a specific module info
      else
      {
        getFileIFName = jsonDir + infoFileName + '.txt';
      }

      if(fs.existsSync(getFileIFName))
      {
        var getContent = fs.readFileSync(path.join(getFileIFName),"utf8");
        // Send info data
        if(getContent.length > 0)
        {
          socket.emit("RES_MODULE_INFO",getContent);
        }
        else
        {
          console.log("EMPTY FILE: ",getFileIFName);
          socket.emit("ALERT_ERROR","Thông tin của module này rỗng");
        }
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",getFileIFName);
        socket.emit("ALERT_ERROR","Không tìm thấy đường dẫn của module này");
      }
    }
    getModuleInfo(); 
  });

  // Send object checking JSON
  socket.on("GET_JSON_CHECKING", function() {
    function getObjects() {
      if(allJSONChecking.length > 0)
      {
        socket.emit("RES_JSON_CHECKING",allJSONChecking);
      }
      else 
      {
        console.log("EMPTY FILE: ",jsonCheckingFile);
        socket.emit("ALERT_ERROR","Các điều kiện kiểm tra JSON rỗng");
      }
    }
    getObjects(); 
  });


  // Check login Id and pass
  socket.on("CHECKING_LOGIN", function(data){
  if(data[0] == userId && data[1] == userPass)
  {
    // Then save to global session variable
    globSessionArr = [{
      id: data[0],
      pass: data[1],
    }];

    // Then re-direct user to /config url
    var destination = '/config';
    socket.emit("OK_CREDENTIAL",destination);
  } 
  else 
  {
    socket.emit("WRONG_CREDENTIAL");
  }
  });

});

// If user or re-direct to url /config
app.get('/config',function(req,res){
  // If user has pass login portal
  if(globSessionArr.length > 0){
    // Check one more if id and pass is correct
    if(globSessionArr[0].id = userId && globSessionArr[0].pass == userPass)
    {
      // Save to site session
      req.session.User = {
        id: userId,
        pass: userPass,
      }
      // Reset because no need it :V
      globSessionArr = [];
    }
    console.log("CREATE USER SESSION: ", req.session.User);
  }
  else 
  {
    // When user press F5 or re-login, system will check site session still alive or not 
    if(req.session.User){
      console.log("SESSION STILL ALIVE");
    }
    else {
      console.log("DIE SESSION");
      // redirec login form it not exist login session
      res.redirect('/MMM');
    }
  }

  // If pass checking login -> display config content file
  if(req.session.User){
    // Check login one more
    if(req.session.User.id == userId && req.session.User.pass == userPass)
    {
      fs.readFile('view/configserver.html', null, function (error, data) {
        if (error) {
          res.writeHead(404);
          res.write('Whoops! Something was error');
        } else {
          res.write(data);
        }
        res.end();
      });
    }
  }
});

// Display login form when access /MMM
app.get("/MMM",function(req,res)
{
  // If user logon before -> re-direct to /config immediately without input user and pass again
  if(req.session.User) 
  {
    // Check login one more
    if(req.session.User.id == userId && req.session.User.pass == userPass)
    {
      res.redirect('/config');
    }
  }

  // Else -> display login form
  else 
  { 
    fs.readFile('view/login.html', null, function (error, data) {
      if (error) {
          res.writeHead(404);
          res.write('Whoops! Something was error');
      } else {
          res.write(data);
      }
      res.end();
    });
  }
});