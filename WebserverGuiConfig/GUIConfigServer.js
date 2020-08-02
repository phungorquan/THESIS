var fs = require('fs'); 
var express = require("express");
var app = express();
app.use(express.static("config"));
app.set('view engine', 'ejs');
app.set("views","./GUIConfigEJS");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(7777);


io.on("connection", function(socket)
{
	socket.on("GUICONFIG", function(msg) {
		fs.writeFile('./config/config.js', msg, function (err) 
    		{
  			if (err) throw err;
  		 		//console.log('Replaced!');
		});
	});
});

app.get('/guiconfig',function(req,res){
   var id = req.param('id');
   var pass = req.param('pass');
   if(id == "MMM" && pass == "1")
	res.render("guiconfigejs");
   else
	res.send("FAILED, PLEASE TRY AGAIN!!!");
});