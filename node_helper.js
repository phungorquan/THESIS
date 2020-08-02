const NodeHelper = require('node_helper');
var process = require('child_process');
module.exports = NodeHelper.create({

	start: function () {
		console.log('[Xiu MMM-JoyStick] Starting node_helper');
	},

	socketNotificationReceived: function(notification, payload) {
        if (notification === "RUN_JOYSTICK")
        {   
            var getThisDirectory = __dirname;
            var combineCommand = "sudo python3 " + getThisDirectory + "/JoyStick.py";
        	process.exec(combineCommand,function (err,stdout,stderr) {
    		if (err) {
    		    console.log("\n"+stderr);
    		} 
			else {
    		    console.log("OK - JOYSTICK");
   			}
        	});
        }
    },		
});