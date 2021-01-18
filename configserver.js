var beautify = require('js-beautify');
var fs = require('fs'); 
var path = require('path');
var express = require("express");
var app = express();
const session = require('express-session');
app.use(express.static(path.join(__dirname, '../'))); // Set global folder is THESIS folder
app.use(session({secret: 'xiu',saveUninitialized: true,resave: true}));
// Parse URL-encoded bodies (as sent by HTML forms)
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
var server = require("http").Server(app);
var myProcess = require('child_process');

var io = require("socket.io")(server);
var clients = {};
var db = require(path.resolve("db.js")); // Include file db.js để dùng các function truy xuất db (library tự tạo)

server.listen(7717);
var configFilename = path.resolve("../config/config.js");
var genConfigFilename = path.resolve("../config/genConfig.js");
var jsonDir = path.resolve("../configserver/json") + "/";

var c = require(configFilename);
var allModules = [];

var globSessionArr = [];

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

io.sockets.on("connection", function(socket)
{ 
    console.log("New connection: ",socket.id);
    clients[socket.id] = socket;
  socket.on("disconnect",function(data){
    console.log("Close connection: ", socket.id);
    delete clients[socket.id];
  });

  // Response modules name + status
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
          socket.emit("ALERT_ERROR","EMPTY FILE");
        }
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",combineFileName);
        socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
      }
    }
    getModuleContent(); 
  });

  // Save module content to .js files
  socket.on("SAVE_MODULE_CONTENT", function(msg) {
    function saveModuleContent() {
      var getModuleFromJSON = JSON.parse(msg);
      var combineFileName = "";
      for(var index in allModules)
      {
        if(allModules[index].REALNAME == getModuleFromJSON.module)
          {
            combineFileName = 'json/' + allModules[index].NAME + '/' + allModules[index].NAME + '.js';
            break;
          }
      }
      //var getFileName = getModuleFromJSON.module.replace("-","").toLowerCase();
      //var combineFileName = 'json/' + getFileName + '/' + getFileName + '.js';
      if(fs.existsSync(combineFileName))
      {
        fs.writeFileSync(path.resolve(combineFileName), msg);
        io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",combineFileName);
        socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
      }
    }
    saveModuleContent(); 
  });

  // Combine all .js file to a dummy config file
  socket.on("GEN_MODULES_CONFIG", function() {
    c = require(configFilename);
    c.modules = [];
    function genNewModules(dir,index) {
      var checkOK = false;
      if(fs.existsSync(dir))
      {
        var getGenConfig = fs.readFileSync(path.join(dir),"utf8");
        if(getGenConfig.length > 0)
        {
          c.modules[index] = JSON.parse(getGenConfig);
          checkOK = true;
        }
        else
        {
          console.log("EMPTY FILE: ",getGenConfig);
          socket.emit("ALERT_ERROR","EMPTY FILE");
        }
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",combineFileName);
        socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
      }
      return checkOK;
    }

    var expectIndex = 0;
    for(var index in allModules)
    {
      if(allModules[index].STATUS == 1)
      {
        var combineFileName = 'json/' + allModules[index].NAME + '/' + allModules[index].NAME + '.js';
        if(genNewModules(combineFileName,expectIndex))
        {
          expectIndex++;  
        }        
      }
    }

    if(fs.existsSync(genConfigFilename))
    {
      // Write file after assign new config
      fs.writeFileSync(path.resolve(genConfigFilename), beautify(JSON.stringify(c), {brace_style: "expand" }));
      socket.emit("ALERT_OK","READY_TO_COMBINE_CONFIG_COMPONENTS");
    }
    else
    {
      console.log("NOT EXIST DIRECTORY: ",genConfigFilename);
      socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
    }
    
  });

  // Combine all the other component of .js file
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
        socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
      }
    }
    combineComponents(); 
  });

  socket.on("EXEC_COMMAND", function(msg) {
  // msg[0]: cmdIndex
  // msg[1]: name of json file
  console.log(msg);
  var result = "";
    switch(msg[0])
    {
      case 0: result = "pm2 restart mm"; break;
      case 1: result = "pm2 start ~/mm.sh"; break;
      case 2: result = "pm2 stop mm"; break;
      case 3: result = "echo '1' | sudo -S reboot now"; break;
      case 4: result = "echo '1' | sudo -S shutdown -h now"; break;
      // 5 is used for all
      // 6 is used for specific module
      case 5: result = "cp ~/MagicMirror/THESIS/config/Backupconfig.js ~/MagicMirror/THESIS/config/config.js && pm2 restart mm"; break;
      case 6: {

        var getFileBKName = jsonDir + msg[1] + '/' + msg[1] + 'BK.js';
        var getFileName = jsonDir + msg[1] + '/' + msg[1] + '.js';

        if(fs.existsSync(getFileBKName) && fs.existsSync(getFileName))
        {
          result = "cp " + getFileBKName + " " + getFileName + " && pm2 restart mm";
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
      myProcess.exec(result,function (err,stdout,stderr) {
        var execResult = "";
        if (err) {
          console.log("*** ERROR EXEC - " + msg[0] + " ***\n" + stderr);
        } 
        else {
          console.log("*** RUN " + msg[0] +" OK ***");
          if(msg[0] == 5)
          {
            // Backup all
            async function updateAllStatus() {
              result = await db.queryUpdateAllStatus(); 
              if(result != "queryUpdateAllStatus-ERROR")
              {
                getAllModulesStatus();
                io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
              }
              else 
                socket.emit("ALERT_ERROR","updateAllStatus");
            }
            updateAllStatus(); 
          }
          else if(msg[0] == 6)
          {
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
      // Get status of module [id-1]
      var status = !allModules[id].STATUS ? 1 : 0;
      result = await db.queryUpdateStatus(allModules[id].ID, status); 
      if(result != "queryUpdateStatus-ERROR")
        {
          getAllModulesStatus();
          io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
        }
      else 
        socket.emit("ALERT_ERROR","updateStatus");
    }
    updateStatus(); 
  });

  // Get modules information
  socket.on("GET_MODULE_INFO", function(infoFileName) {
    function getModuleInfo() {
      var getFileIFName = "";
      if(infoFileName != "thongtinchung")
      {
        getFileIFName = jsonDir + infoFileName + '/' + infoFileName + 'IF.txt';
      }
      else
      {
        getFileIFName = jsonDir + infoFileName + '.txt';
      }
      if(fs.existsSync(getFileIFName))
      {
        var getContent = fs.readFileSync(path.join(getFileIFName),"utf8");
        if(getContent.length > 0)
        {
          socket.emit("RES_MODULE_INFO",getContent);
        }
        else
        {
          console.log("EMPTY FILE: ",getFileIFName);
          socket.emit("ALERT_ERROR","EMPTY FILE");
        }
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ",getFileIFName);
        socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
      }
    }
    getModuleInfo(); 
  });

  socket.on("CHECKING_LOGIN", function(data){
  if(data[0] == "MMM" && data[1] == "1")
  {
    globSessionArr = [{
      id: data[0],
      pass: data[1],
    }];
    var destination = '/config';
    socket.emit("OK_CREDENTIAL",destination);
  } 
  else 
  {
    socket.emit("WRONG_CREDENTIAL");
  }
  });

});

app.get('/config',function(req,res){
  if(globSessionArr.length > 0){
      if(globSessionArr[0].id = "MMM" && globSessionArr[0].pass == "1")
      {
          req.session.User = {
            id: 'MMM',
            pass: '1',
          }
          globSessionArr = [];
      }
      console.log("CREATE USER SESSION: ", req.session.User);
  }
  else 
  {
    if(req.session.User){
      console.log("SESSION STILL ALIVE");
    }
    else {
      console.log("DIE SESSION");
      res.redirect('/MMM');
    }
  }

  if(req.session.User){
      if(req.session.User.id == "MMM" && req.session.User.pass == "1")
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

app.get("/MMM",function(req,res)
{
  if(req.session.User) 
  {
    res.redirect('/config');
  }
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