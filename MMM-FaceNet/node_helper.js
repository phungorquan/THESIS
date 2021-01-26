const NodeHelper = require('node_helper');
module.exports = NodeHelper.create({
    start: function() {
        this.threshold = 0;
        var self = this;
        console.log('[Xiu MMM-FACENET] Starting node_helper');
        
        // Create server to receive data via GET method
        this.expressApp.get('/facenetroute', function(req, res) {
            var getData = req.param('data');
            var splitSpecificUser = getData.split('/');
            var strCombine = "";
            if(getData != "CAMERA_ERROR")
            {
                for(index in splitSpecificUser)
                {
                    var splitNameAndRate = splitSpecificUser[index].split(',');
                    
                    // Change user namespace
                    var getName = splitNameAndRate[0];
                    if(parseFloat(splitNameAndRate[1]) > self.threshold)
                    {
                        strCombine += getName + "/";
                    }
                    else 
                    {
                        strCombine += "người lạ" + "/";
                    }
                }
                self.sendSocketNotification("FACENET_RESULT", strCombine);
            }
            else 
            {
                self.sendSocketNotification("CAMERA_STATUS", getData);
            }
            res.send("OK"); // Don't delete, because it will help Python can send another GET requests
        });
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification == "STARTUP");
        else if (notification == "CONFIG")
        {
            this.threshold = payload;
        }
    },
});
