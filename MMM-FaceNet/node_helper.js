const NodeHelper = require('node_helper');
var currentUser = "";
var result = "";
var index = 0;
var userArr = Array();
module.exports = NodeHelper.create({
    start: function() {
        var self = this;
        console.log('[Xiu MMM-FACENET] Starting node_helper');
        // Create server to receive data via GET method
        this.expressApp.get('/facenetroute', function(req, res) {
            var getData = req.param('data');
            if(getData != "CAMERA_ERROR")
                self.sendSocketNotification("FACENET_RESULT", getData);
            else 
                self.sendSocketNotification("CAMERA_STATUS", getData);
            res.send("OK"); // Don't delete, because it will help Python can send another GET requests
        });
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification == "STARTUP");
    },
});