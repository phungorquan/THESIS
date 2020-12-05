var beautify = require('js-beautify');
var fs = require('fs'); 
var path = require('path');
var express = require("express");
var app = express();
app.use(express.static(path.join(__dirname, '../'))); // Set global folder is THESIS folder
var server = require("http").Server(app);
var myProcess = require('child_process');

var io = require("socket.io")(server);
var db = require(path.resolve("db.js")); // Include file db.js để dùng các function truy xuất db (library tự tạo)

server.listen(7777);
var configFilename = path.resolve("../config/config.js");
var c = require(configFilename);
var allModules = [];

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

io.on("connection", function(socket)
{ 
  // Response modules name + status
  socket.on("GET_ALL_MODULES", function(msg) {
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
      var getFileName = getModuleFromJSON.module.replace("-","").toLowerCase();
      var combineFileName = 'json/' + getFileName + '/' + getFileName + '.js';
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
  socket.on("GEN_MODULES_CONFIG", function(msg) {
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

    if(fs.existsSync("../config/genConfig.js"))
    {
      // Write file after assign new config
      fs.writeFileSync(path.resolve("../config/genConfig.js"), beautify(JSON.stringify(c), {brace_style: "expand" }));
      socket.emit("ALERT_OK","READY_TO_COMBINE_CONFIG_COMPONENTS");
    }
    else
    {
      console.log("NOT EXIST DIRECTORY: ../config/genConfig.js");
      socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
    }
    
  });

  // Combine all the other component of .js file
  socket.on("COMBINE_CONFIG_COMPONENTS", function(id) {
    function combineComponents() {
      if(fs.existsSync("../config/genConfig.js"))
      {
        var getGenConfig = fs.readFileSync(path.join('../config/genConfig.js'),"utf8");
        fs.writeFileSync(path.resolve("../config/config.js"), "var config =");
        fs.appendFileSync(path.resolve("../config/config.js"), getGenConfig);
        fs.appendFileSync(path.resolve("../config/config.js"), ";if (typeof module !== 'undefined') module.exports = config;");
        socket.emit("ALERT_OK","READY_TO_RESET");
      }
      else
      {
        console.log("NOT EXIST DIRECTORY: ../config/genConfig.js");
        socket.emit("ALERT_ERROR","NOT EXIST DIRECTORY");
      }
    }
    combineComponents(); 
  });

  socket.on("EXEC_COMMAND", function(msg) {
  var result = "";
    switch(msg)
    {
      case 0: result = "pm2 restart mm"; break;
      case 1: result = "pm2 start ~/mm.sh"; break;
      case 2: result = "pm2 stop mm"; break;
      case 3: result = "echo '1' | sudo -S reboot now"; break;
      case 4: result = "echo '1' | sudo -S shutdown -h now"; break;
      case 5: result = "cp ~/MagicMirror/THESIS/config/Backupconfig.js ~/MagicMirror/THESIS/config/config.js && pm2 restart mm"; break;
      //case 5: result = "curl -X POST 'http://localhost:5000/face-recognition?include_predictions=false' -H 'accept: application/json' -H 'Content-Type: multipart/form-data' -F 'image=@/home/xiu/Desktop/therock.jpg'";break;//'image=@/home/xiu/Facenet/face-recognition/test.jpg'"; break;
      
      default: result = "ERROR"; break;
    }
    if(result != "ERROR"){
      myProcess.exec(result,function (err,stdout,stderr) {
        var execResult = "";
        if (err) {
          console.log("*** ERROR EXEC - " + msg + " ***\n" + stderr);
        } 
        else {
          console.log("*** RUN " + msg +" OK ***");
          if(msg == 5)
          {
            io.sockets.emit("REFRESH_ALL_DEVICES");
          }
          if(stdout)
            console.log(stdout);
        }
      });
    }
    else socket.emit("ALERT_ERROR","ERROR - " + msg);
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

});




app.get('/config',function(req,res){

  var id = req.param('id');
  var pass = req.param('pass');
  if(id == "MMM" && pass == "1")
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
});