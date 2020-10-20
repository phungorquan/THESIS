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
            var getUser = req.param('user');
            var getNumOfUsers = req.param('quantity') - 1;
            if (getUser != currentUser) {
                currentUser = getUser;
                if (index < getNumOfUsers) {
                    // Save users into array
                    userArr[index] = currentUser;
                } else if (index == getNumOfUsers) {
                    userArr[index] = currentUser;
                    for (var i = 0; i < userArr.length; i++) {
                        result += userArr[i] + "-";
                    }
                    // Send to MMM-FaceNet.js to display
                    self.sendSocketNotification("FACENET_RESULT", result);
                    // Reset
                    result = "";
                    currentUser = "";
                }
                index++;
            }
            // 2 different persons with the same result
            else {
                if (index < getNumOfUsers) {
                    index++;
                }
            }
            if (index > getNumOfUsers) {
                index = 0;
                result = "";
                currentUser = "";
            }
            res.send("OK"); // Don't delete, because it will help Python can send another GET requests
        });
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification == "STARTUP");
    },
});