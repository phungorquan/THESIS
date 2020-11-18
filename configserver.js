var beautify = require('js-beautify');
var fs = require('fs'); 
var path = require('path');
var express = require("express");
var app = express();
app.use(express.static(path.join(__dirname, '../'))); // Set global folder is THESIS folder
var server = require("http").Server(app);

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
      var getContent = fs.readFileSync(path.join(combineFileName),"utf8");
      socket.emit("RES_MODULE_CONTENT",getContent);
    }
    getModuleContent(); 
  });

  // Save module content to .js files
  socket.on("SAVE_MODULE_CONTENT", function(msg) {
    function saveModuleContent() {
      var getModuleFromJSON = JSON.parse(msg);
      var getFileName = getModuleFromJSON.module.replace("-","").toLowerCase();
      var combineFileName = 'json/' + getFileName + '/' + getFileName + '.js';
      fs.writeFileSync(path.resolve(combineFileName), msg);
      io.sockets.emit("ALERT_OK","UPDATE_MODULES_OK");
    }
    saveModuleContent(); 
  });

  // Combine all .js file to a dummy config file
  socket.on("GEN_MODULES_CONFIG", function(msg) {
    c = require(configFilename);
    function genNewModules(url,index) {
        var getGenConfig = fs.readFileSync(path.join(url),"utf8");
        c.modules[index] = JSON.parse(getGenConfig);
        fs.writeFileSync(path.resolve("../config/genConfig.js"), beautify(JSON.stringify(c), {brace_style: "expand" }));
    }

    for(var index in allModules)
    {
      if(allModules[index].STATUS == 1)
      {
        var combineFileName = 'json/' + allModules[index].NAME + '/' + allModules[index].NAME + '.js';
        genNewModules(combineFileName,index);
      }
    }
    socket.emit("ALERT_OK","READY_TO_RESET");
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

  socket.on("RESET_MMM", function(id) {
    function resetMMM() {
      var getGenConfig = fs.readFileSync(path.join('../config/genConfig.js'),"utf8");
      fs.writeFileSync(path.resolve("../config/config.js"), "var config =");
      fs.appendFileSync(path.resolve("../config/config.js"), getGenConfig);
      fs.appendFileSync(path.resolve("../config/config.js"), ";if (typeof module !== 'undefined') module.exports = config;");
      socket.emit("ALERT_OK","DUMMY");
    }
    resetMMM(); 
  });
});

app.get('/config',function(req,res){

    fs.readFile('view/configserver.html', null, function (error, data) {
      if (error) {
          res.writeHead(404);
          res.write('Whoops! Something was error');
      } else {
          res.write(data);
      }
      res.end();
    });
});