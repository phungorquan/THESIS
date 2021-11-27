const NodeHelper = require('node_helper');
var process = require('child_process');

var getThisDirectory = __dirname;
var combineCommand = "sudo python3 " + getThisDirectory + "/WS2812B.py";


module.exports = NodeHelper.create({

	start: function () {
		console.log('[Xiu MMM-WS2812] Starting node_helper');
	},

	socketNotificationReceived: function(notification, payload) {
        var cmd = "";
        switch (notification)
        {
            case "WS-ON": cmd = " ON"; break;
            case "WS-OFF": cmd = " OFF"; break;
            case "WS-THEATER": cmd = " THEATER"; break;
            case "WS-BLINK": cmd = " BLINK"; break;
            case "WS-BREATHING": cmd = " BREATHING"; break;
            case "WS-RAINBOW": cmd = " RAINBOW"; break;
            case "WS-COLORFUL": cmd = " COLORFUL"; break;
            default: cmd + " OFF"; break;
        }
        process.exec(combineCommand + cmd ,function (err,stdout,stderr) {
            if (err) {
                console.log("\n"+stderr);
            } 
            // else {
            //     console.log("OK - WS2812");
            // }
        });
        
    },		
});