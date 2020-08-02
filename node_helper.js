const NodeHelper = require('node_helper');
var fs = require('fs');
// const Gpio = require('onoff').Gpio;
var process = require('child_process');

module.exports = NodeHelper.create({

	start: function () {
		console.log('[Xiu MMM-OnOffModules] Starting node_helper');
	},

	socketNotificationReceived: function(notification, payload) {
        if (notification === 'ON_GUICONFIGSERVER')
        {
        	process.exec('node GUIConfigServer.js',function (err,stdout,stderr) {
    		if (err) {
    		    console.log("\n"+stderr);
    		} 
			else {
    		    console.log("OK - OnOffModules");
   			}
        	});
        }

        else if(notification === "SAVE_CONFIG")
        {
        	fs.writeFile('./config/config.js', payload, function (err) 
    		{
  				if (err) throw err;
  		 			console.log('Saved new contents to config.js');
			});
        }

    },		
});